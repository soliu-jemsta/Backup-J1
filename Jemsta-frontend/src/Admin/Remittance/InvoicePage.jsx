import { useAuth } from '../../context/AuthContext';
import { BASE_URL } from '../../config';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import PageHeader from '../shared/PageHeader';
import AdminTable, { AdminTr, AdminTd } from '../shared/AdminTable';
import Modal from '../shared/Modal';
import { FormSelect, FormInput, ModalActions } from '../shared/FormFields';
import { useToast } from '../shared/ToastProvider';
import JemLogo from '../../assets/imgs/jemstalogoblack.png';

// ─────────────────────────────────────────────────────────────────────────────
// Rebuilt against Jemsta_Projects_Invoices_API_Guide.docx.
//
// What changed from the old version, and why:
//   • Invoices are NOT created from this page anymore. Per the guide, the only
//     write operations on /invoices/ are POST /invoices/{id}/revise/ — direct
//     create/update/delete return 405, invoices are immutable once made.
//     (The old "Generate Invoice" flow computed rent/fees client-side and
//     never actually called a backend endpoint — it wasn't wired to the real
//     API at all, and also referenced `authFetch` without importing `useAuth`.)
//     If invoices are meant to be generated from a completed Project (there's
//     a `has_invoice` / `account_settled` field on Project that hints at
//     this), that trigger isn't documented here — confirm with the backend
//     before adding a "create" action back.
//   • The invoice document (and the Statement view) is now rendered from the
//     invoice's own stored fields and nested `items`, not recomputed in the
//     browser. The numbers on screen are exactly what the backend calculated.
//   • Per the guide, once locked (which is immediate) only `status`, `file`,
//     and `due_date` may still change — so editing here is limited to those.
// ─────────────────────────────────────────────────────────────────────────────

const PLAN_LABELS = {
  full_management: 'Full Management',
  let_only: 'Let Only',
  rent_collection: 'Rent Collection',
};

// ── Formatting ────────────────────────────────────────────────────────────────

const fmtGBP = (n) => `£${parseFloat(n || 0).toFixed(2)}`;
const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};
const fmtDateLong = (d) => {
  if (!d) return new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
};

// ── Shared document styles (injected into both HTML documents) ────────────────

const SHARED_STYLES = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; color: #333; background: #f5f5f5; padding: 20px; font-size: 13px; }
  .doc-container {
    max-width: 210mm; width: 100%; margin: 0 auto; background: #fff;
    padding: 16mm 20mm 20mm; box-shadow: 0 0 10px rgba(0,0,0,.1); min-height: 297mm;
  }
  .doc-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
  .doc-header .logo img { height: 70px; }
  .doc-header .logo svg  { height: 70px; }
  .agency-info { text-align: center; flex: 1; margin: 0 16px; }
  .agency-info h1 { font-size: 16px; margin-bottom: 4px; }
  .agency-info p, .contact-info p { margin: 2px 0; font-size: 11px; }
  .contact-info { text-align: right; min-width: 140px; }
  .doc-title { font-size: 28px; font-weight: 300; text-align: center; margin: 18px 0 22px; color: #222; }
  .logo img {  height: 100px; }
  .meta-block { display: flex; justify-content: space-between; margin-bottom: 20px; gap: 10%; }
  .meta-left  { font-size: 13px; }
  .meta-left strong { display: block; margin-bottom: 2px; }
  .meta-right { text-align: right; font-size: 13px; }
  .meta-right .meta-row { display: flex; justify-content: flex-start; gap: 10px; margin-bottom: 3px; }
  .meta-right .meta-label { font-weight: bold; }
  .ledger-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
  .ledger-table th {
    padding: 8px 6px; text-align: left; font-style: italic; font-weight: bold;
    border-bottom: 1.5px solid #333; border-top: none; border-left: none; border-right: none;
  }
  .ledger-table th.right, .ledger-table td.right { text-align: right; }
  .ledger-table td { padding: 7px 6px; border: none; vertical-align: top; }
  .ledger-table tr.bold td { font-weight: bold; }
  .ledger-table tr.italic-bold td { font-weight: bold; font-style: italic; }
  .ledger-table tr.section-gap td { padding-top: 14px; }
  .summary-block { margin-left: auto; width: 55%; font-size: 12px; }
  .summary-block .row { display: flex; justify-content: space-between; padding: 4px 0; }
  .summary-block .row.total { font-weight: bold; border-top: 1.5px solid #333; margin-top: 4px; padding-top: 6px; font-size: 13px; }
  .notes { margin-top: 28px; font-size: 11.5px; line-height: 1.7; }
  .notes p { margin: 6px 0; }
  .signature { color: #1a3fa8; font-family: 'Comic Sans MS', cursive; margin-top: 22px; font-size: 16px; }
  .company-footer { text-align: center; margin-top: 30px; font-size: 11px; font-weight: bold; }
  @media print {
    body { background: #fff; padding: 0; }
    .doc-container { box-shadow: none; padding: 14mm 18mm; margin: 0; max-width: none; width: 100%; }
  }
`;

const HEADER_HTML = `
  <div class="logo">
    <img src="${JemLogo}" alt="Jemsta Logo" />
  </div>
  <div class="agency-info">
    <h1>JEMSTA Estate Agency</h1>
    <p>Sales, Lettings &amp; Property Management</p>
    <p>Ty Cynon House, Navigation Park, Abercynon, Mountain Ash, CF45 4SN</p>
  </div>
  <div class="contact-info">
    <p>Web: www.jemsta.co.uk</p>
    <p>Email: admin@jemsta.co.uk</p>
    <p>Office: 01443 842731</p>
    <p>Mobile: 07747549520</p>
  </div>
`;

const FOOTER_HTML = `
  <div class="notes">
    <p>For all queries, please contact the office by emailing admin@jemsta.co.uk or by calling 01443 842731.</p>
    <p><strong>Thank you for your ongoing custom.</strong></p>
    <p class="signature">Jemsta Estate Agency</p>
  </div>
  <div class="company-footer">
    <p>A company registered in England &amp; Wales: 11342464 &nbsp;|&nbsp; VAT Number: 354258295</p>
  </div>
`;

// ── Invoice HTML (page 1) — built entirely from the invoice's own stored fields/items ──

const buildInvoiceHTML = (inv) => {
  const items = Array.isArray(inv.items) ? [...inv.items].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)) : [];
  const invoiceDate = fmtDateLong(inv.created_at);

  const itemRows = items.map(it => `
    <tr>
      <td>${it.project_name || it.description || ''}${it.project_type_name ? ` — ${it.project_type_name}` : ''}</td>
      <td class="right">${it.quantity ?? 1}</td>
      <td class="right">${fmtGBP(it.unit_price)}</td>
      <td class="right">${fmtGBP(it.subtotal)}</td>
      <td class="right">${fmtGBP(it.vat_amount)}</td>
      <td class="right">${fmtGBP(it.line_total)}</td>
    </tr>${it.notes ? `
    <tr><td colspan="6" style="font-size:11px;color:#666;padding-top:0">${it.notes}</td></tr>` : ''}`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Landlord Invoice – ${inv.invoice_ref || inv.id}</title>
  <style>${SHARED_STYLES}</style>
</head>
<body>
<div class="doc-container">

  <div class="doc-header">${HEADER_HTML}</div>

  <h2 class="doc-title">Landlord Invoice</h2>

  <div class="meta-block">
    <div class="meta-left">
      <strong>${inv.landlord_name || '—'}</strong>
    </div>
    <div class="meta-right">
      <div class="meta-row"><span class="meta-label">Invoice Ref:</span><span>${inv.invoice_ref || `#${inv.id}`}</span></div>
      <div class="meta-row"><span class="meta-label">Version:</span><span>v${inv.version ?? 1}${inv.supersedes ? ` (supersedes #${inv.supersedes})` : ''}</span></div>
      <div class="meta-row"><span class="meta-label">Invoice Date:</span><span>${invoiceDate}</span></div>
      <div class="meta-row"><span class="meta-label">Property:</span><span>${inv.property_name || '—'}</span></div>
      ${inv.tenancy_name ? `<div class="meta-row"><span class="meta-label">Tenancy:</span><span>${inv.tenancy_name}</span></div>` : ''}
      <div class="meta-row"><span class="meta-label">Plan:</span><span>${PLAN_LABELS[inv.plan] || inv.plan || '—'}</span></div>
      <div class="meta-row"><span class="meta-label">Status:</span><span style="text-transform:capitalize">${inv.status || '—'}</span></div>
      ${inv.due_date ? `<div class="meta-row"><span class="meta-label">Due:</span><span>${fmtDate(inv.due_date)}</span></div>` : ''}
    </div>
  </div>

  <!-- Line items -->
  <table class="ledger-table">
    <thead>
      <tr>
        <th>Description</th>
        <th class="right" style="width:8%">Qty</th>
        <th class="right" style="width:13%">Unit Price</th>
        <th class="right" style="width:13%">Net</th>
        <th class="right" style="width:10%">VAT</th>
        <th class="right" style="width:13%">Total</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows || `<tr><td colspan="6" style="color:#999">No line items on this invoice.</td></tr>`}
    </tbody>
  </table>

  <!-- Summary -->
  <div class="summary-block">
    <div class="row"><span>Subtotal</span><span>${fmtGBP(inv.subtotal)}</span></div>
    <div class="row"><span>VAT${inv.vat_rate ? ` (${inv.vat_rate}%)` : ''}</span><span>${fmtGBP(inv.vat_fee)}</span></div>
    <div class="row total"><span>Amount Payable</span><span>${fmtGBP(inv.amount_payable)}</span></div>
  </div>

  ${FOOTER_HTML}

</div>
</body>
</html>`;
};

// ── Rental Statement HTML (page 2) — same invoice/items data, ledger-style layout ──

const buildStatementHTML = (inv) => {
  const items = Array.isArray(inv.items) ? [...inv.items].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)) : [];
  const statementDate = fmtDate(inv.created_at);

  const initials = (inv.landlord_name || 'XX').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const stmtRef = `JEM/LRS/${initials}/${String(inv.property || inv.id).toString().padStart(4, '0')}`;

  const openingBalance = 0;
  const closingBalance = openingBalance + parseFloat(inv.amount_payable || 0);

  const rowsHTML = items.map(it => `
    <tr>
      <td></td>
      <td>${it.project_name || it.description || ''}</td>
      <td class="right"></td>
      <td class="right">${fmtGBP(it.line_total)}</td>
      <td class="right"></td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Landlord Rental Statement – ${stmtRef}</title>
  <style>${SHARED_STYLES}</style>
</head>
<body>
<div class="doc-container">

  <div class="doc-header">${HEADER_HTML}</div>

  <h2 class="doc-title">Landlord Rental Statement</h2>

  <div class="meta-block">
    <div class="meta-left">
      <strong>${inv.landlord_name || '—'}</strong>
    </div>
    <div class="meta-right">
      <div class="meta-row"><span class="meta-label">Statement Date:</span><span>${statementDate}</span></div>
      <div class="meta-row"><span class="meta-label">Statement Ref:</span><span>${stmtRef}</span></div>
      <div class="meta-row"><span class="meta-label">Property:</span><span>${inv.property_name || '—'}</span></div>
      <div class="meta-row"><span class="meta-label">Invoice Ref:</span><span>${inv.invoice_ref || `#${inv.id}`}</span></div>
    </div>
  </div>

  <table class="ledger-table">
    <thead>
      <tr>
        <th style="width:16%">Date</th>
        <th>Description</th>
        <th class="right" style="width:14%">Income</th>
        <th class="right" style="width:14%">Expend</th>
        <th class="right" style="width:14%">Balance</th>
      </tr>
    </thead>
    <tbody>
      <tr class="bold">
        <td></td><td>Opening Balance</td><td class="right"></td><td class="right"></td>
        <td class="right">${fmtGBP(openingBalance)}</td>
      </tr>

      ${rowsHTML}

      <tr class="bold section-gap">
        <td></td><td>BALANCE</td><td class="right"></td><td class="right"></td>
        <td class="right">${fmtGBP(closingBalance)}</td>
      </tr>

      <tr class="italic-bold">
        <td></td>
        <td colspan="3">Remitted to landlord</td>
        <td class="right">${fmtGBP(inv.amount_payable)}</td>
      </tr>
    </tbody>
  </table>

  ${FOOTER_HTML}

</div>
</body>
</html>`;
};

// ── Combined 2-page print ─────────────────────────────────────────────────────

const buildCombinedHTML = (invoiceHTML, statementHTML) => {
  const bodyOf = (html) => {
    const m = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    return m ? m[1] : html;
  };
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Jemsta Invoice &amp; Statement</title>
  <style>
    ${SHARED_STYLES}
    .page-break { page-break-after: always; break-after: page; }
  </style>
</head>
<body>
  <div class="page-break">
    ${bodyOf(invoiceHTML)}
  </div>
  ${bodyOf(statementHTML)}
</body>
</html>`;
};

const printDocument = (html) => {
  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 700);
};

const parseResponse = async (response) => {
  const text = await response.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!response.ok) {
    const error = new Error(
      (data && typeof data === 'object' ? data.detail || JSON.stringify(data) : data) || `Error ${response.status}`
    );
    error.data = data;
    throw error;
  }
  return data;
};

// ── Main Page ─────────────────────────────────────────────────────────────────

const InvoicePage = () => {
  const { authFetch } = useAuth();
  const { showSuccess, showError } = useToast();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [search, setSearch]     = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [previewData, setPreviewData] = useState(null); // { invoiceHTML, statementHTML }
  const [showPreview, setShowPreview] = useState(false);
  const [previewPage, setPreviewPage] = useState('invoice'); // 'invoice' | 'statement'

  const [revisingId, setRevisingId] = useState(null);

  // Status/due-date editor — per the guide, these (plus `file`, not handled here)
  // are the only fields still writable once an invoice is locked.
  const [statusModalFor, setStatusModalFor] = useState(null); // the invoice being edited, or null
  const [statusForm, setStatusForm] = useState({ status: '', due_date: '' });

  const iframeRef = useRef(null);

  const fetchInvoices = () => {
    setLoading(true);
    authFetch(`${BASE_URL}/invoices/`)
      .then(r => { if (!r.ok) throw new Error(`Server error: ${r.status}`); return r.json(); })
      .then(data => {
        setInvoices(Array.isArray(data) ? data : []);
        setError(null);
        setLoading(false);
      })
      .catch(err => { setError(err.message); setLoading(false); });
  };

  useEffect(() => { fetchInvoices(); }, []);

  // Status choices aren't enumerated in the API guide, so rather than guess valid
  // values, offer whatever statuses are actually present in the fetched data.
  const statusChoices = useMemo(() => {
    const set = new Set(invoices.map(i => i.status).filter(Boolean));
    return Array.from(set);
  }, [invoices]);

  const filteredInvoices = invoices.filter(inv => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || [inv.invoice_ref, inv.landlord_name, inv.property_name, inv.tenancy_name]
      .filter(Boolean).some(v => String(v).toLowerCase().includes(q));
    const matchesStatus = !statusFilter || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // ── Actions ──────────────────────────────────────────────────────────────

  const openPreview = (inv, page = 'invoice') => {
    setPreviewData({ invoiceHTML: buildInvoiceHTML(inv), statementHTML: buildStatementHTML(inv) });
    setPreviewPage(page);
    setShowPreview(true);
  };

  const handleRevise = (inv) => {
    if (!window.confirm(`Create a new revision of ${inv.invoice_ref || `#${inv.id}`}? This clones the invoice and its items as a new version.`)) return;
    setRevisingId(inv.id);
    authFetch(`${BASE_URL}/invoices/${inv.id}/revise/`, { method: 'POST' })
      .then(parseResponse)
      .then(() => {
        showSuccess('Revised invoice created.');
        fetchInvoices();
      })
      .catch(err => showError(err.message))
      .finally(() => setRevisingId(null));
  };

  const openStatusModal = (inv) => {
    setStatusModalFor(inv);
    setStatusForm({ status: inv.status || '', due_date: inv.due_date || '' });
  };

  const submitStatusUpdate = () => {
    if (!statusModalFor) return;
    const body = {};
    if (statusForm.status) body.status = statusForm.status;
    if (statusForm.due_date) body.due_date = statusForm.due_date;

    authFetch(`${BASE_URL}/invoices/${statusModalFor.id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then(parseResponse)
      .then(() => {
        showSuccess('Invoice updated.');
        setStatusModalFor(null);
        fetchInvoices();
      })
      .catch(err => showError(err.message));
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const currentPreviewHTML = previewData
    ? (previewPage === 'invoice' ? previewData.invoiceHTML : previewData.statementHTML)
    : '';

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-gray-500">
      <svg className="animate-spin h-6 w-6 mr-3 text-primaryGreen" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
      Loading invoices...
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center py-20 text-red-500">
      ⚠️ Failed to load invoices: {error}
    </div>
  );

  return (
    <div>
      <PageHeader title="Invoices" />

      <p className="text-sm text-gray-400 mb-4">
        Invoices are generated by the backend and are immutable — this page lists them, lets you view/print,
        create a new revision, or update status/due date (the only fields still writable once locked).
      </p>

      {/* ── Filters ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by ref, landlord, property, tenancy..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primaryGreen"
        />
        {statusChoices.length > 0 && (
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primaryGreen"
          >
            <option value="">All statuses</option>
            {statusChoices.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
      </div>

      {/* ── Invoice table ──────────────────────────────────────────────── */}
      {filteredInvoices.length === 0 ? (
        <div className="bg-white border rounded-lg py-16 text-center text-gray-400">
          {invoices.length === 0 ? 'No invoices found.' : 'No invoices match your search.'}
        </div>
      ) : (
        <AdminTable columns={[
          'S/N', 'Ref', 'Landlord', 'Property', 'Tenancy', 'Plan',
          'Version', 'Status', 'Amount Payable', 'Due Date', 'Created', 'Action',
        ]}>
          {filteredInvoices.map((inv, i) => (
            <AdminTr key={inv.id}>
              <AdminTd>{i + 1}</AdminTd>
              <AdminTd><span className="font-mono text-xs">{inv.invoice_ref || `#${inv.id}`}</span></AdminTd>
              <AdminTd>{inv.landlord_name || '—'}</AdminTd>
              <AdminTd>{inv.property_name || '—'}</AdminTd>
              <AdminTd>{inv.tenancy_name || '—'}</AdminTd>
              <AdminTd>
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-primaryGreen">
                  {PLAN_LABELS[inv.plan] || inv.plan || '—'}
                </span>
              </AdminTd>
              <AdminTd>
                v{inv.version ?? 1}
                {inv.supersedes && <span className="text-gray-400"> (was #{inv.supersedes})</span>}
              </AdminTd>
              <AdminTd>
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 capitalize">
                  {inv.status || '—'}
                </span>
              </AdminTd>
              <AdminTd className="font-medium">{fmtGBP(inv.amount_payable)}</AdminTd>
              <AdminTd>{fmtDate(inv.due_date)}</AdminTd>
              <AdminTd>{fmtDate(inv.created_at)}</AdminTd>
              <AdminTd>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => openPreview(inv, 'invoice')}
                    className="px-2 py-1 text-xs font-medium border border-primaryGreen text-primaryGreen rounded-lg hover:bg-green-50 transition-colors"
                  >
                    View
                  </button>
                  <button
                    onClick={() => openStatusModal(inv)}
                    className="px-2 py-1 text-xs font-medium border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Status
                  </button>
                  <button
                    onClick={() => handleRevise(inv)}
                    disabled={revisingId === inv.id}
                    className="px-2 py-1 text-xs font-medium bg-primaryGreen text-white rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50"
                  >
                    {revisingId === inv.id ? 'Revising…' : 'Revise'}
                  </button>
                </div>
              </AdminTd>
            </AdminTr>
          ))}
        </AdminTable>
      )}

      {/* ── Status / Due Date modal ─────────────────────────────────────── */}
      {statusModalFor && (
        <Modal onClose={() => setStatusModalFor(null)}>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">
            Update {statusModalFor.invoice_ref || `#${statusModalFor.id}`}
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            Locked invoices only allow status, file, and due date to change.
          </p>
          <div className="grid grid-cols-1 gap-y-5">
            {statusChoices.length > 0 ? (
              <FormSelect
                label="Status:"
                placeholder="Select Status"
                value={statusForm.status}
                onChange={e => setStatusForm(prev => ({ ...prev, status: e.target.value }))}
                options={statusChoices.map(s => ({ value: s, label: s }))}
              />
            ) : (
              <FormInput
                label="Status:"
                placeholder="Enter status"
                value={statusForm.status}
                onChange={e => setStatusForm(prev => ({ ...prev, status: e.target.value }))}
              />
            )}
            <FormInput
              label="Due Date:"
              type="date"
              value={statusForm.due_date || ''}
              onChange={e => setStatusForm(prev => ({ ...prev, due_date: e.target.value }))}
            />
          </div>
          <ModalActions onCancel={() => setStatusModalFor(null)} onSubmit={submitStatusUpdate} submitLabel="Save" />
        </Modal>
      )}

      {/* ── Preview Panel ───────────────────────────────────────────────── */}
      {showPreview && previewData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowPreview(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 flex flex-col"
            style={{ height: '90vh' }}>

            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200">
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setPreviewPage('invoice')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${previewPage === 'invoice'
                      ? 'bg-white shadow text-primaryGreen'
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  Invoice
                </button>
                <button
                  onClick={() => setPreviewPage('statement')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${previewPage === 'statement'
                      ? 'bg-white shadow text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  Statement
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => printDocument(currentPreviewHTML)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Print this page
                </button>
                <button
                  onClick={() => printDocument(buildCombinedHTML(previewData.invoiceHTML, previewData.statementHTML))}
                  className="px-4 py-2 bg-primaryGreen hover:bg-green-800 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Print Both (PDF)
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden rounded-b-2xl">
              <iframe ref={iframeRef} srcDoc={currentPreviewHTML}
                className="w-full h-full border-0" title="Document Preview" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicePage;