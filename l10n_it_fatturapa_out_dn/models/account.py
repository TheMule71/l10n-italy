# Copyright 2020 Marco Colombo
# Copyright 2022 Simone Rubino - TAKOBI
# Copyright 2023 Giuseppe Borruso - Dinamiche Aziendali srl
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import models


class AccountMoveInherit(models.Model):
    _inherit = "account.move"

    def update_delivery_note_lines(self):
        result = super(AccountMoveInherit, self).update_delivery_note_lines()
        line_ref = 0
        for line in self.mapped("invoice_line_ids").sorted(
            key=lambda l: (-l.sequence, l.date, l.move_name, -l.id), reverse=True
        ):
            line_ref += 1
            if line.display_type or line.related_documents.filtered(
                lambda l: l.type == "dn_data"
            ):
                continue
            sale_line_delivery_note_ids = line.mapped(
                "sale_line_ids.delivery_note_line_ids.delivery_note_id"
            )
            invoice_delivery_note_ids = line.mapped("move_id.delivery_note_ids")
            for delivery_note_id in (
                sale_line_delivery_note_ids & invoice_delivery_note_ids
            ):
                related_document_type_id = self.env[
                    "fatturapa.related_document_type"
                ].create(
                    {
                        "type": "dn_data",
                        "name": delivery_note_id.display_name,
                        "date": delivery_note_id.date,
                        "invoice_line_id": line.id,
                    }
                )
                related_document_type_id.lineRef = line_ref
        return result

    def write(self, vals):
        result = super(AccountMoveInherit, self).write(vals)
        line_ref = 0
        for line in self.mapped("invoice_line_ids").sorted(
            key=lambda l: (-l.sequence, l.date, l.move_name, -l.id), reverse=True
        ):
            line_ref += 1
            if line.display_type:
                continue
            if line.related_documents:
                line.related_documents.lineRef = line_ref
        return result
