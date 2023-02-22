# Leonardo Donelli - Creativi Quadrati
# © 2016 Alessio Gerace - Agile Business Group
# © 2018-2020 Lorenzo Battistini
# © 2019-2020 Roberto Fichera - Level Prime Srl
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    "name": "ITA - Driver per stampanti fiscali compatibili ePOS-Print XML",
    "version": "16.0.1.0.0",
    "category": "Point Of Sale",
    "summary": "ePOS-Print XML Fiscal Printer Driver - Stampanti Epson compatibili: "
    "FP81II, FP90III",
    "author": (
        "Odoo Community Association (OCA), Agile Business Group, "
        "Leonardo Donelli, TAKOBI, Level Prime Srl"
    ),
    "license": "AGPL-3",
    "website": "https://github.com/OCA/l10n-italy",
    "maintainers": ["eLBati"],
    "depends": [
        "point_of_sale",
        # TODO is this necessary?
        # 'pos_order_mgmt'
    ],
    "data": [
        "views/account.xml",
        "views/point_of_sale.xml",
    ],
    "assets": {
        "point_of_sale.assets": [
            "fiscal_epos_print/static/lib/pikaday/pikaday.min.css",
            "fiscal_epos_print/static/src/css/pos.css",
            "fiscal_epos_print/static/lib/fiscalprint/fiscalprint.js",
            "fiscal_epos_print/static/lib/pikaday/pikaday.min.js",
            "fiscal_epos_print/static/src/js/epson_epos_print.js",
            "fiscal_epos_print/static/src/js/models.js",
            # TODO is this necessary?
            # "fiscal_epos_print/static/src/js/popups.js",
            # "fiscal_epos_print/static/src/js/pos_order_mgmt.js",
            # ChromeWidgets
            "fiscal_epos_print/static/src/js/ChromeWidgets/EpsonEPOSButton.js",
            "fiscal_epos_print/static/src/js/ChromeWidgets/EpsonFP81IIComponent.js",
            # TODO Unstable components that must be checked
            # NOTE: New components SetLottery and SetRefund
            # "fiscal_epos_print/static/src/js/ChromeWidgets/SetLotteryCodeButton.js",
            "fiscal_epos_print/static/src/js/ChromeWidgets/SetRefundInfoButton.js",
            # Popups
            "fiscal_epos_print/static/src/js/Popups/RefundInfoPopup.js",
            # Screens
            "fiscal_epos_print/static/src/js/Screens/PaymentScreen/PaymentScreen.js",
            "fiscal_epos_print/static/src/js/Screens/ReceiptScreen/ReceiptScreen.js",
            # Popups
            "fiscal_epos_print/static/src/xml/Popups/RefundInfoPopup.xml",
            # Others
            "fiscal_epos_print/static/src/xml/Chrome.xml",
            "fiscal_epos_print/static/src/xml/ChromeWidgets/EpsonEPOSButton.xml",
            "fiscal_epos_print/static/src/xml/ChromeWidgets/EpsonFP81IIComponent.xml",
            "fiscal_epos_print/static/src/xml/ChromeWidgets/SetLotteryCodeButton.xml",
            "fiscal_epos_print/static/src/xml/ChromeWidgets/SetRefundInfoButton.xml",
            # TODO To be converted with new components system
            # "fiscal_epos_print/static/src/xml/pos.xml",
            # "fiscal_epos_print/static/src/xml/lottery.xml",
        ],
    },
    "installable": True,
    "auto_install": False,
}
