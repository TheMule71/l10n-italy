# Copyright 2020 Marco Colombo
# Copyright 2022 Simone Rubino - TAKOBI
# Copyright 2023 Giuseppe Borruso - Dinamiche Aziendali srl
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields, models


class FatturapaRelatedDocumentTypeInherit(models.Model):
    _inherit = "fatturapa.related_document_type"

    type = fields.Selection(
        selection_add=[("dn_data", "DN Data")], ondelete={"dn_data": "cascade"}
    )
