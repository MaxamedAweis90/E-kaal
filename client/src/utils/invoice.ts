import type { Customer } from "../types";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const money = (n: number) => `$${n.toFixed(2)}`;

export function downloadCsv(filename: string, rows: (string | number)[][]): void {
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
      </section>`
    )
    .join("");

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Invoice</title>
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

