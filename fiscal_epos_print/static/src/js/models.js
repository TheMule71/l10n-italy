odoo.define("fiscal_epos_print.models", function (require) {
    "use strict";

    var {PosGlobalState, Order, Orderline, Payment} = require("point_of_sale.models");
    const {Gui} = require("point_of_sale.Gui");
    var core = require("web.core");
    var _t = core._t;
    const Registries = require("point_of_sale.Registries");

    const FiscalEposPrintPosGlobalState = (PosGlobalState) =>
        class FiscalEposPrintPosGlobalState extends PosGlobalState {
            set_refund_data(
                refund_date,
                refund_report,
                refund_doc_num,
                refund_cash_fiscal_serial
            ) {
                const selectedOrder = this.get_order();
                selectedOrder.refund_date = refund_date;
                selectedOrder.refund_report = refund_report;
                selectedOrder.refund_doc_num = refund_doc_num;
                selectedOrder.refund_cash_fiscal_serial = refund_cash_fiscal_serial;
            }

            set_lottery_code_data(lottery_code) {
                const selectedOrder = this.get_order();
                selectedOrder.lottery_code = lottery_code;
            }
        };
    Registries.Model.extend(PosGlobalState, FiscalEposPrintPosGlobalState);

    const FiscalEposPrintOrder = (Order) =>
        class FiscalEposPrintOrder extends Order {
            constructor() {
                super(...arguments);
                this.lottery_code = null;
                this.refund_report = null;
                this.refund_date = null;
                this.refund_doc_num = null;
                this.refund_cash_fiscal_serial = null;
                this.has_refund = false;
                this.fiscal_receipt_number = null;
                this.fiscal_receipt_amount = null;
                this.fiscal_receipt_date = null;
                this.fiscal_z_rep_number = null;
                this.fiscal_printer_serial =
                    this.pos.config.fiscal_printer_serial || null;
                this.fiscal_printer_debug_info = null;
            }

            // Manages the case in which after printing an invoice
            // you pass a barcode in the mask of the registered invoice
            add_product(product, options) {
                if (this._printed || this.finalized === true) {
                    this.destroy();
                    return this.pos.get_order().add_product(product, options);
                }
                return super.add_product(...arguments);
            }

            check_order_has_refund() {
                var order = this.pos.get_order();
                if (order) {
                    var lines = order.orderlines;
                    order.has_refund =
                        lines.find(function (line) {
                            return line.quantity < 0.0;
                        }) !== undefined;
                    if (order.has_refund) {
                        order.refund_report = this.name.substr(-4);
                        order.refund_doc_num = this.name.substr(-4);
                        order.refund_date = new Date();
                        order.refund_cash_fiscal_serial =
                            this.pos.config.fiscal_printer_serial;
                    }
                }
            }

            init_from_JSON(json) {
                super.init_from_JSON(...arguments);
                this.check_order_has_refund();
                this.lottery_code = json.lottery_code;
                this.refund_report = json.refund_report;
                this.refund_date = json.refund_date;
                this.refund_doc_num = json.refund_doc_num;
                this.refund_cash_fiscal_serial = json.refund_cash_fiscal_serial;
                this.fiscal_receipt_number = json.fiscal_receipt_number;
                this.fiscal_receipt_amount = json.fiscal_receipt_amount;
                this.fiscal_receipt_date = json.fiscal_receipt_date;
                this.fiscal_z_rep_number = json.fiscal_z_rep_number;
                this.fiscal_printer_serial = this.pos.config.fiscal_printer_serial;
                this.fiscal_printer_debug_info = json.fiscal_printer_debug_info;
            }

            export_as_JSON() {
                const json = super.export_as_JSON(...arguments);
                this.check_order_has_refund();
                json.lottery_code = this.lottery_code;
                json.refund_report = this.refund_report;
                json.refund_date = this.refund_date;
                json.refund_doc_num = this.refund_doc_num;
                json.refund_cash_fiscal_serial = this.refund_cash_fiscal_serial;
                json.fiscal_receipt_number = this.fiscal_receipt_number;
                json.fiscal_receipt_amount = this.fiscal_receipt_amount;
                // Parsed by backend
                json.fiscal_receipt_date = this.fiscal_receipt_date;
                json.fiscal_z_rep_number = this.fiscal_z_rep_number;
                json.fiscal_printer_serial = this.fiscal_printer_serial || null;
                json.fiscal_printer_debug_info = this.fiscal_printer_debug_info;
                return json;
            }

            export_for_printing() {
                var json = super.export_for_printing(...arguments);
                json.lottery_code = this.lottery_code;
                json.refund_date = this.refund_date;
                json.refund_report = this.refund_report;
                json.refund_doc_num = this.refund_doc_num;
                json.refund_cash_fiscal_serial = this.refund_cash_fiscal_serial;
                json.fiscal_receipt_number = this.fiscal_receipt_number;
                json.fiscal_receipt_amount = this.fiscal_receipt_amount;
                json.fiscal_receipt_date = this.fiscal_receipt_date;
                json.fiscal_z_rep_number = this.fiscal_z_rep_number;
                json.fiscal_printer_serial = this.fiscal_printer_serial;
                json.fiscal_printer_debug_info = this.fiscal_printer_debug_info;
                return json;
            }

            getPrinterOptions() {
                var protocol = this.pos.config.use_https ? "https://" : "http://";
                var printer_url =
                    protocol + this.pos.config.printer_ip + "/cgi-bin/fpmate.cgi";
                return {url: printer_url};
            }
        };
    Registries.Model.extend(Order, FiscalEposPrintOrder);

    const FiscalEposPrintOrderline = (Orderline) =>
        class FiscalEposPrintOrderline extends Orderline {
            export_for_printing() {
                var receipt = super.export_for_printing(...arguments);

                receipt.tax_department = this.get_tax_details_r();
                if (!receipt.tax_department) {
                    Gui.showPopup("ErrorPopup", {
                        title: _t("Network error"),
                        body: _t("Manca iva su prodotto"),
                    });
                }
                if (receipt.tax_department) {
                    if (receipt.tax_department.included_in_price === true) {
                        receipt.full_price = this.price;
                    } else {
                        receipt.full_price =
                            this.price * (1 + receipt.tax_department.tax_amount / 100);
                    }
                }

                return receipt;
            }

            get_tax_details_r() {
                var detail = this.get_all_prices().taxDetails;
                for (var i in detail) {
                    return {
                        code: this.pos.taxes_by_id[i].fpdeptax,
                        taxname: this.pos.taxes_by_id[i].name,
                        included_in_price: this.pos.taxes_by_id[i].price_include,
                        tax_amount: this.pos.taxes_by_id[i].amount,
                    };
                }
                // TODO is this correct?
                Gui.showPopup("ErrorPopup", {
                    title: _t("Error"),
                    body: _t("No taxes found"),
                });
            }

            set_quantity(quantity) {
                if (quantity === "0") {
                    // Epson FP doesn't allow lines with quantity 0
                    quantity = "remove";
                }
                return super.set_quantity(...arguments);
            }

            // TODO CONTROLLARE SE SERVE
            //        compute_all(taxes, price_unit, quantity, currency_rounding, handle_price_include=true) {
            //            var res = super.compute_all(...arguments);
            //            var self = this;
            //
            //            var total_excluded = round_pr(price_unit * quantity, currency_rounding);
            //            var total_included = total_excluded;
            //            var base = total_excluded;
            //            var list_taxes = res.taxes;
            // Amount_type 'group' not handled (used only for purchases, in Italy)
            // _(taxes).each(function(tax) {
            //            _(taxes).each(function (tax, index) {
            //                if (!no_map_tax) {
            //                    tax = self._map_tax_fiscal_position(tax);
            //                }
            //                if (!tax) {
            //                    return;
            //                }
            //                var tax_amount = self._compute_all(tax[0], base, quantity);
            //                tax_amount = round_pr(tax_amount, currency_rounding);
            //                if (!tax_amount) {
            //                    // Intervene here: also add taxes with 0 amount
            //                    if (tax[0].price_include) {
            //                        total_excluded -= tax_amount;
            //                        base -= tax_amount;
            //                    } else {
            //                        total_included += tax_amount;
            //                    }
            //                    if (tax[0].include_base_amount) {
            //                        base += tax_amount;
            //                    }
            //                    var data = {
            //                        id: tax[0].id,
            //                        amount: tax_amount,
            //                        name: tax[0].name,
            //                    };
            //                    list_taxes.push(data);
            //                }
            //            });
            //            res.taxes = list_taxes;
            //
            //            return res;
            //        }
        };
    Registries.Model.extend(Orderline, FiscalEposPrintOrderline);

    /*
    Overwrite Payment.export_for_printing() in order
    to make it export the payment type that must be passed
    to the fiscal printer.
    */
    const FiscalEposPrintPayment = (Payment) =>
        class FiscalEposPrintPayment extends Payment {
            constructor() {
                super(...arguments);
                this.type = this.payment_method.fiscalprinter_payment_type || null;
                this.type_index =
                    this.payment_method.fiscalprinter_payment_index || null;
            }
            export_as_JSON() {
                const json = super.export_as_JSON(...arguments);
                json.type = this.payment_method.fiscalprinter_payment_type;
                json.type_index = this.payment_method.fiscalprinter_payment_index;
                return json;
            }
            init_from_JSON(json) {
                super.init_from_JSON(...arguments);
                this.type = json.type;
                this.type_index = json.type_index;
            }
            setFiscalprinterType(value) {
                this.type = value;
            }
            setFiscalprinterIdex(value) {
                this.type_index = value;
            }
            export_for_printing() {
                const res = super.export_for_printing(...arguments);
                res.type = this.type;
                res.type_index = this.type_index;
                return res;
            }
        };
    Registries.Model.extend(Payment, FiscalEposPrintPayment);

    //    Class FiscalEposPrintPosModel extends PosModel {
    //        constructor(obj, options) {
    //            super(...arguments);
    //            var tax_model = _.find(this.models, function (model) {
    //                return model.model === "account.tax";
    //            });
    //            tax_model.fields.push("fpdeptax");
    //        }
    //    }
    //    Registries.Model.add(FiscalEposPrintPosModel);
});
