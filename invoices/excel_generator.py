import io
import os
import re
import openpyxl

from openpyxl.styles import Font
from datetime import datetime
from openpyxl.utils import get_column_letter
from django.core.files.base import ContentFile


# ==========================================================
# 🧾 SAFE WRITER
# ==========================================================

from openpyxl.styles import Font

def _safe_write(ws, cell, value, bold=False):
    try:
        # Convert string cell to actual cell object
        target_cell = ws[cell]

        # If it's part of a merged range, find top-left cell
        for merged_range in ws.merged_cells.ranges:
            if target_cell.coordinate in merged_range:
                target_cell = ws[merged_range.start_cell.coordinate]
                break

        target_cell.value = value

        if bold:
            target_cell.font = Font(bold=True)

    except Exception:
        # absolute fallback (rare edge case)
        row = ws[cell].row
        col = ws[cell].column
        ws.cell(row=row, column=col, value=value)

# ==========================================================
# 📊 MAIN INVOICE EXCEL GENERATOR
# ==========================================================

def generate_invoice_excel(invoice, template_path):
    """
    Converts Invoice model → Excel file (BytesIO)
    """

    wb = openpyxl.load_workbook(template_path)
    ws = wb["Invoice"]
    ws_remit = wb["Remit"] if "Remit" in wb.sheetnames else None

    GBP_FMT = '"£"#,##0.00'

    # ======================================================
    # HEADER
    # ======================================================
    _safe_write(ws, "A7", invoice.landlord.LLName, bold=True)
    _safe_write(ws, "N10", invoice.invoice_number, bold=True)
    _safe_write(ws, "N11", invoice.created_at.strftime("%d-%m-%Y"))
    _safe_write(ws, "N12", invoice.due_date.strftime("%d-%m-%Y") if invoice.due_date else "")

    _safe_write(ws, "A9", getattr(invoice.landlord, "address", ""))

    # ======================================================
    # MAIN FINANCIALS (FROM DB — NO RECALCULATION)
    # ======================================================
    _safe_write(ws, "M15", invoice.management_fee)
    _safe_write(ws, "Q16", invoice.vat)
    _safe_write(ws, "S16", invoice.management_fee + invoice.vat)

    ws["M15"].number_format = GBP_FMT
    ws["Q16"].number_format = GBP_FMT
    ws["S16"].number_format = GBP_FMT

    # ======================================================
    # RENT INFO
    # ======================================================
    _safe_write(ws, "D15", f"Property Management Fee for {invoice.property.name}")

    # ======================================================
    # EXTRAS
    # ======================================================
    start_row = 23
    extras = invoice.extras.all()

    for idx, extra in enumerate(extras):
        r = start_row + idx

        ws[f"D{r}"] = extra.name
        ws[f"M{r}"] = extra.amount
        ws[f"M{r}"].number_format = GBP_FMT

    # ======================================================
    # REMITTANCE SHEET
    # ======================================================
    if ws_remit:
        _safe_write(ws_remit, "A7", invoice.landlord.LLName, bold=True)
        _safe_write(ws_remit, "A9", getattr(invoice.landlord, "address", ""))

        _safe_write(ws_remit, "N10", invoice.created_at.strftime("%d-%m-%Y"))
        _safe_write(ws_remit, "N11", invoice.property.name)
        _safe_write(ws_remit, "N12", getattr(invoice.property, "address", ""))

        _safe_write(ws_remit, "O16", invoice.rent_amount)
        ws_remit["O16"].number_format = GBP_FMT

        _safe_write(ws_remit, "S15", 0)  # replace with landlord account later

    # ======================================================
    # FORCE RECALC (SAFE)
    # ======================================================
    try:
        wb.calculation_properties.fullCalcOnLoad = True
    except Exception:
        pass

    # ======================================================
    # RETURN FILE
    # ======================================================
    output = io.BytesIO()
    wb.save(output)
    output.seek(0)

    return output