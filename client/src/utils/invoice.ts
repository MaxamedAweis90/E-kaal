import type { Customer, Invoice } from "../types";

const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const money = (n: number) => `$${n.toFixed(2)}`;

export function downloadCsv(
  filename: string,
  rows: (string | number)[][],
): void {
  const csv = rows
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Opens a printable statement (one page per customer) and triggers the print dialog. */
export function printInvoices(customers: Customer[], shopName: string): void {
  if (customers.length === 0) return;

  const today = new Date().toLocaleDateString("en-GB");
  const pages = customers
    .map(
      (c) => `
      <section>
        <h1>${esc(shopName)}</h1>
        <p class="muted">Statement • ${today}</p>
        <h2>${esc(c.name)}</h2>
        <p class="muted">${esc(c.phone)}</p>
        <table>
          <tr><td>Total debt added</td><td>${money(c.totalDebt)}</td></tr>
          <tr><td>Total paid</td><td>${money(c.paid)}</td></tr>
          <tr class="total"><td>Balance owed</td><td>${money(c.balance)}</td></tr>
        </table>
      </section>`,
    )
    .join("");

  const win = window.open("", "_blank");
  if (!win) return;
  win.document
    .write(`<!doctype html><html><head><meta charset="utf-8"><title>Invoice</title>
    <style>
      body{font-family:Poppins,Arial,sans-serif;color:#111;margin:0}
      section{padding:48px;page-break-after:always}
      h1{margin:0 0 4px;font-size:24px} h2{margin:28px 0 2px;font-size:20px}
      .muted{color:#666;margin:0}
      table{width:100%;border-collapse:collapse;margin-top:24px}
      td{padding:10px 0;border-bottom:1px solid #ddd;font-size:16px}
      td:last-child{text-align:right}
      .total td{font-weight:700;font-size:18px}
    </style></head><body>${pages}</body></html>`);
  win.document.close();
  win.focus();
  win.print();
}

const STATUS_TEXT: Record<Invoice["status"], string> = {
  DRAFT: "Draft",
  ISSUED: "Issued",
  PAID: "Paid",
  OVERDUE: "Overdue",
  CANCELLED: "Cancelled",
};

/** Opens a printable itemized invoice document and triggers the browser print dialog. */
export function printInvoiceDocument(
  invoice: Invoice,
  shopName: string,
  shopContact?: string,
): void {
  const rowsHtml = invoice.items
    .map(
      (item) => `
      <tr>
        <td>${esc(item.description)}</td>
        <td class="num">${item.quantity}</td>
        <td class="num">${money(item.unitPrice)}</td>
        <td class="num">${money(item.total)}</td>
      </tr>`,
    )
    .join("");

  const win = window.open("", "_blank");
  if (!win) return;

  win.document
    .write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(invoice.invoiceNumber)}</title>
    <style>
      body{font-family:Poppins,Arial,sans-serif;color:#111;margin:0;padding:48px}
      .top{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #111;padding-bottom:18px}
      h1{margin:0;font-size:24px}
      .inv-no{font-size:20px;font-weight:700;text-align:right}
      .muted{color:#555;margin:4px 0 0;font-size:13px}
      .meta{display:flex;justify-content:space-between;margin-top:24px;font-size:14px}
      table{width:100%;border-collapse:collapse;margin-top:28px}
      th{border-bottom:2px solid #222;padding:10px 6px;text-align:left;font-size:13px;text-transform:uppercase;color:#444}
      td{padding:10px 6px;border-bottom:1px solid #e2e2e2;font-size:14px}
      .num{text-align:right;font-variant-numeric:tabular-nums}
      .totals{margin-top:20px;margin-left:auto;width:280px}
      .totals-row{display:flex;justify-content:space-between;padding:6px 0;font-size:14px}
      .totals-row.grand{border-top:2px solid #111;font-weight:700;font-size:17px;padding-top:10px;margin-top:4px}
      .notes{margin-top:28px;font-size:13px;color:#444}
    </style></head><body>
      <div class="top">
        <div>
          <h1>${esc(shopName)}</h1>
          ${shopContact ? `<p class="muted">${esc(shopContact)}</p>` : ""}
        </div>
        <div>
          <div class="inv-no">${esc(invoice.invoiceNumber)}</div>
          <p class="muted" style="text-align:right">Status: ${esc(STATUS_TEXT[invoice.status])}</p>
        </div>
      </div>
      <div class="meta">
        <div>
          <strong>Bill To:</strong><br/>
          ${esc(invoice.customerName)}<br/>
          <span class="muted">${esc(invoice.customerPhone)}</span>
        </div>
        <div style="text-align:right">
          <div><strong>Issue Date:</strong> ${esc(invoice.issueDate)}</div>
          <div><strong>Due Date:</strong> ${esc(invoice.dueDate)}</div>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th class="num">Qty</th>
            <th class="num">Unit Price</th>
            <th class="num">Total</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
      <div class="totals">
        <div class="totals-row"><span>Subtotal</span><span>${money(invoice.subtotal)}</span></div>
        ${invoice.discount > 0 ? `<div class="totals-row"><span>Discount</span><span>-${money(invoice.discount)}</span></div>` : ""}
        ${invoice.taxAmount > 0 ? `<div class="totals-row"><span>Tax (${invoice.taxRate}%)</span><span>+${money(invoice.taxAmount)}</span></div>` : ""}
        <div class="totals-row grand"><span>Total</span><span>${money(invoice.total)}</span></div>
        <div class="totals-row"><span>Amount Paid</span><span>${money(invoice.amountPaid)}</span></div>
        <div class="totals-row"><span>Balance Due</span><span>${money(invoice.balanceDue)}</span></div>
      </div>
      ${invoice.notes ? `<div class="notes"><strong>Notes:</strong> ${esc(invoice.notes)}</div>` : ""}
    </body></html>`);
  win.document.close();
  win.focus();
  win.print();
}
