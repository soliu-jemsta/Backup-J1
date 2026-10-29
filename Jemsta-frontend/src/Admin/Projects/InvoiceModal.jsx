import React, { useRef, useState } from 'react';
import JemBlack from '../../assets/imgs/jemEstateAgency.png';

// Requires: npm install html2pdf.js
import html2pdf from 'html2pdf.js';

const fmtGBP = (n) => `£${(parseFloat(n) || 0).toFixed(2)}`;
const fmtDate = (d) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

const landlordDisplay = (landlord) => {
  if (!landlord) return { name: '—', address: '—' };
  const primary = landlord.members?.find(m => m.is_primary) || landlord.members?.[0];
  const contact = primary?.contact;
  const name = contact ? [contact.first_name, contact.last_name].filter(Boolean).join(' ') : `Landlord #${landlord.id}`;
  return { name: name || `Landlord #${landlord.id}`, address: landlord.correspondence_address || '—' };
};

/**
 * Combined Landlord Invoice + Landlord Rental Statement.
 *
 * These used to be generated as two separate documents — per your note,
 * they belong together as one: this renders both as consecutive pages of
 * the same printable area, and "Download PDF" produces a single two-page
 * PDF rather than two separate files.
 */
const InvoiceModal = ({ project, property, landlord, onClose }) => {
  const printRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const { name: landlordName, address: landlordAddress } = landlordDisplay(landlord);
  const propertyName = property?.name || (project.property != null ? `Property #${project.property}` : '—');
  const propertyAddress = property?.address || '—';

  const today = new Date();
  const accountNumber = landlord?.account_number || '—';
  const lastFour = accountNumber.length >= 4 ? accountNumber.slice(-4) : accountNumber;


  // JEM/LINV/[AA]/[####]/[##] and JEM/LRS/[AA]/[####]/[##] per the template —
  // [AA] = landlord initials, [####] = project id padded, [##] = sequence
  // (no versioning field on the project yet, so this is always "01").
  const initials = (landlordName.match(/\b\w/g) || []).join('').toUpperCase().slice(0, 2) || 'XX';
  const paddedId = String(project.id).padStart(4, '0');
  const invoiceRef   = `JEM/LINV/${initials}/${paddedId}/01`;
  const statementRef = `JEM/LRS/${initials}/${paddedId}/01`;

  // ---- Invoice figures ----
  const cost            = Number(project.cost) || 0;
  const vatRate          = Number(project.vat_rate_snapshot) || 0;
  const vatAmount        = Number(project.vat_amount) || 0;
  const maintenanceFee   = Number(project.maintenance_fee) || 0;
  const adminFee         = Number(project.admin_fee) || 0;
  const total            = Number(project.total) || 0; // backend-computed, authoritative
  const totalDisbursements = 0; // no disbursement data source yet
  const grossCosts       = total + totalDisbursements;

  // Maintenance/Admin fees are flat service fees, not tax — they get their
  // own Net amount with 0% VAT rather than being folded into the VAT
  // columns, so the sheet doesn't mislabel a fee as tax.
  const lineItems = [
    { description: project.name, net: cost, vatRateLabel: `${vatRate}%`, vat: vatAmount, gross: cost + vatAmount },
  ];
  if (project.apply_maintenance_fee && maintenanceFee > 0) {
    lineItems.push({ description: 'Maintenance Fee', net: maintenanceFee, vatRateLabel: '0%', vat: 0, gross: maintenanceFee });
  }
  if (adminFee > 0) {
    lineItems.push({ description: 'Admin Fee', net: adminFee, vatRateLabel: '0%', vat: 0, gross: adminFee });
  }
  const linesNet = lineItems.reduce((s, i) => s + i.net, 0);
  const linesVat = lineItems.reduce((s, i) => s + i.vat, 0);

  // ---- Statement figures ----
  // No rent-ledger endpoint yet — this uses the property's rent_amount as
  // the one income line, same way the template shows a single "Rent
  // received from tenant" row. Flag to the backend dev if a real
  // transaction history should replace this once it exists.
  const rentAmount = property?.rent_amount != null ? Number(property.rent_amount) : null;
  const openingBalance = 0;
  const balance = openingBalance + (rentAmount || 0) - grossCosts;
  const remitted = balance;
  const closingBalance = 0;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await html2pdf()
        .set({
          margin: 10,
          filename: `${invoiceRef.replace(/\//g, '-')}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['css', 'legacy'], before: '.pdf-page-break' },
        })
        .from(printRef.current)
        .save();
    } finally {
      setDownloading(false);
    }
  };

  const Header = ({ addressLine }) => (
    <div className="flex items-start justify-between mb-6">
      {/* <div className="w-20 h-20 rounded-full border-2 border-gray-800 flex flex-col items-center justify-center text-center leading-tight flex-shrink-0">
        <span className="font-bold text-[13px] tracking-wide">JEMSTA</span>
        <span className="text-[6px] tracking-widest text-gray-600">ESTATE AGENCY</span>
      </div> */}
      <img src={JemBlack} className='w-40' alt='Jemsta Logo' />
      <div className="text-center flex-1 px-4">
        <p className="font-semibold">JEMSTA Estate Agency</p>
        <p className="text-gray-500 text-xs">Sales, Lettings &amp; Property Management</p>
        <p className="text-gray-500 text-xs">{addressLine}</p>
        <p className="text-gray-500 text-xs">Abercynon, Mountain Ash, CF45 4SN</p>
      </div>
      <div className="text-right text-gray-500 text-xs whitespace-nowrap">
        <p>Web: www.jemsta.co.uk</p>
        <p>Email: admin@jemsta.co.uk</p>
        <p>Office: 01443 842731</p>
        <p>Mobile: 07747549520</p>
      </div>
    </div>
  );

  const Footer = () => (
    <p className="text-center text-[11px] text-gray-500 mt-10">
      A company registered in England &amp; Wales: 11342464<br />
      VAT Number: 354258295
    </p>
  );

  return (
    <div className="fixed inset-0 bg-black/40 flex items-start justify-center overflow-y-auto z-50 py-8">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Landlord Invoice &amp; Statement — {project.name}</h2>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-primaryGreen text-white disabled:opacity-60"
            >
              {downloading ? 'Generating…' : 'Download PDF'}
            </button>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">
              &times;
            </button>
          </div>
        </div>

        {/* Printable area — both pages live here so they download as one PDF */}
        <div ref={printRef} className="text-sm text-gray-800">

          {/* ---------------- Page 1: Landlord Invoice ---------------- */}
          <div className="p-10">
            <Header addressLine="Ty Cynon House, Navigation Park" />

            <h1 className="text-3xl text-gray-400 text-right mb-8">Landlord Invoice</h1>

            <div className="flex justify-between mb-8">
              <div>
                <p className="font-semibold">{landlordName}</p>
                <p className="text-gray-500">{landlordAddress}</p>
              </div>
              <table className="text-right">
                <tbody>
                  <tr><td className="font-semibold pr-6 py-0.5">Invoice Ref:</td><td className="py-0.5">{invoiceRef}</td></tr>
                  <tr><td className="font-semibold pr-6 py-0.5">Invoice Date:</td><td className="py-0.5">{fmtDate(today)}</td></tr>
                  <tr><td className="font-semibold pr-6 py-0.5">Payment Due:</td><td className="py-0.5">N/A - Collected from rent</td></tr>
                </tbody>
              </table>
            </div>

            <table className="w-full mb-2 border-collapse">
              <thead>
                <tr className="border-b border-gray-800 text-left italic">
                  <th className="py-2 font-normal">Date</th>
                  <th className="py-2 font-normal">Description</th>
                  <th className="py-2 font-normal text-right">Net</th>
                  <th className="py-2 font-normal text-right">VAT Rate</th>
                  <th className="py-2 font-normal text-right">VAT</th>
                  <th className="py-2 font-normal text-right">Gross</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2"></td>
                    <td className="py-2">{item.description}</td>
                    <td className="py-2 text-right">{fmtGBP(item.net)}</td>
                    <td className="py-2 text-right">{item.vatRateLabel}</td>
                    <td className="py-2 text-right">{fmtGBP(item.vat)}</td>
                    <td className="py-2 text-right">{fmtGBP(item.gross)}</td>
                  </tr>
                ))}
                <tr><td colSpan={6} className="h-10"></td></tr>
                <tr className="font-bold">
                  <td className="py-2" colSpan={2}>TOTALS</td>
                  <td className="py-2 text-right">{fmtGBP(linesNet)}</td>
                  <td></td>
                  <td className="py-2 text-right">{fmtGBP(linesVat)}</td>
                  <td className="py-2 text-right">{fmtGBP(total)}</td>
                </tr>
              </tbody>
            </table>

            <p className="font-semibold underline mt-8 mb-2">DISBURSEMENTS</p>
            <table className="w-full mb-2 border-collapse">
              <thead>
                <tr className="border-b border-gray-800 text-left italic">
                  <th className="py-2 font-normal">Date</th>
                  <th className="py-2 font-normal">Description</th>
                  <th className="py-2 font-normal text-right">Gross</th>
                </tr>
              </thead>
              <tbody>
                <tr><td colSpan={3} className="h-14"></td></tr>
              </tbody>
            </table>
            <div className="flex justify-between font-bold mb-8">
              <span>TOTAL DISBURSEMENTS</span>
              <span>{fmtGBP(totalDisbursements)}</span>
            </div>

            <div className="flex justify-end mb-8">
              <table className="text-right w-64">
                <tbody>
                  <tr><td className="py-1">GROSS COSTS</td><td className="py-1">{fmtGBP(grossCosts)}</td></tr>
                  <tr><td className="py-1">GROSS DISBURSEMENTS</td><td className="py-1">{fmtGBP(totalDisbursements)}</td></tr>
                  <tr className="border-2 border-gray-800 font-bold">
                    <td className="py-1.5 pl-2">TOTAL AMOUNT PAYABLE</td>
                    <td className="py-1.5 pr-2">{fmtGBP(grossCosts)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="font-bold mb-4">
              The amount payable will be collected from your rental payments, you do not need to make any further payments.
            </p>
            <p className="mb-6">
              For all queries, please contact the office by emailing admin@jemsta.co.uk or by calling 01443 842731.
            </p>
            <p className="font-bold mb-2">Thank you for your ongoing custom.</p>
            <p className="text-2xl text-blue-800 italic" style={{ fontFamily: 'cursive' }}>Jemsta Estate Agency</p>

            <Footer />
          </div>

          {/* ---------------- Page 2: Landlord Rental Statement ---------------- */}
          <div className="p-10 pdf-page-break" style={{ pageBreakBefore: 'always' }}>
            <Header addressLine="Ty Cynon, Navigation Park" />

            <h1 className="text-3xl text-gray-400 text-right mb-8">Landlord Rental Statement</h1>

            <div className="flex justify-between mb-8">
              <div>
                <p className="font-semibold">{landlordName}</p>
                <p className="text-gray-500">{landlordAddress}</p>
              </div>
              <table className="text-right">
                <tbody>
                  <tr><td className="font-semibold pr-6 py-0.5">Statement Date:</td><td className="py-0.5">{fmtDate(today)}</td></tr>
                  <tr><td className="font-semibold pr-6 py-0.5">Statement Ref:</td><td className="py-0.5">{statementRef}</td></tr>
                  <tr><td className="font-semibold pr-6 py-0.5">Property:</td><td className="py-0.5">{propertyName}</td></tr>
                </tbody>
              </table>
            </div>

            <table className="w-full mb-2 border-collapse">
              <thead>
                <tr className="border-b border-gray-800 text-left">
                  <th className="py-2 font-bold italic">Date</th>
                  <th className="py-2 font-bold italic">Description</th>
                  <th className="py-2 font-bold italic text-right">Income</th>
                  <th className="py-2 font-bold italic text-right">Expend</th>
                  <th className="py-2 font-bold italic text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                <tr className="font-bold italic">
                  <td className="py-1.5" colSpan={4}>Opening Balance</td>
                  <td className="py-1.5 text-right">{fmtGBP(openingBalance)}</td>
                </tr>

                {rentAmount != null ? (
                  <tr>
                    <td className="py-1.5">Date</td>
                    <td className="py-1.5">Rent received from tenant</td>
                    <td className="py-1.5 text-right">{fmtGBP(rentAmount)}</td>
                    <td className="py-1.5"></td>
                    <td className="py-1.5"></td>
                  </tr>
                ) : (
                  <tr>
                    <td className="py-1.5 text-gray-400 italic" colSpan={5}>
                      No rent transactions recorded for this property yet
                    </td>
                  </tr>
                )}

                <tr>
                  <td className="py-1.5">Date</td>
                  <td className="py-1.5">Payment to Landlord Invoice: {invoiceRef}</td>
                  <td className="py-1.5"></td>
                  <td className="py-1.5 text-right text-red-600">{fmtGBP(grossCosts)}</td>
                  <td className="py-1.5"></td>
                </tr>

                <tr className="font-bold">
                  <td className="py-1.5" colSpan={4}>BALANCE</td>
                  <td className="py-1.5 text-right">{fmtGBP(balance)}</td>
                </tr>
                <tr className="font-bold italic">
                  <td className="py-1.5" colSpan={4}>Remitted to your account ending {lastFour} within the next 3-5 working days</td>
                  <td className="py-1.5 text-right">{fmtGBP(remitted)}</td>
                </tr>
                <tr className="font-bold italic">
                  <td className="py-1.5" colSpan={4}>Closing Balance</td>
                  <td className="py-1.5 text-right">{fmtGBP(closingBalance)}</td>
                </tr>
              </tbody>
            </table>

            <p className="mt-8 mb-6">
              For all queries, please contact the office by emailing admin@jemsta.co.uk or by calling 01443 842731.
            </p>
            <p className="font-bold mb-2">Thank you for your ongoing custom.</p>
            <p className="text-2xl text-blue-800 italic" style={{ fontFamily: 'cursive' }}>Jemsta Estate Agency</p>

            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;