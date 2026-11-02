import React, { useMemo, useState } from "react";
import { Icons } from "../icons";
import {
  useCustomers,
  useCustomerTransaction,
  useMerchantProfile,
  useProducts,
} from "../../hooks/useLedgers";
import {
  addDaysIsoDate,
  computeInvoiceTotals,
  InvoiceLineInput,
  resolveInvoiceStatus,
  todayIsoDate,
  useInvoiceStore,
} from "../../store/useInvoiceStore";
import { cn, formatCurrency } from "../../utils/cn";
import { formatDate, pluralize } from "../../utils/format";
import { downloadCsv, printInvoiceDocument } from "../../utils/invoice";
import type { Invoice, InvoiceStatus } from "../../types";
import { Modal } from "../ui/Modal";
import {
  Avatar,
  Checkbox,
  EmptyLine,
  HEAD_TEXT,
  PageHeader,
  PrimaryButton,
  RowButton,
  RowMenu,
  SearchBox,
  SelectBox,
  StatCard,
} from "../ui/screen";
import { ConfirmDialog } from "./dialogs";

const COLS =
  "grid grid-cols-[minmax(150px,1.3fr)_minmax(210px,2fr)_minmax(126px,1.15fr)_minmax(112px,1fr)_minmax(122px,1.1fr)_236px] items-center px-[24px]";

const STATUS_META: Record<
  InvoiceStatus,
  { label: string; pillClass: string; amountClass: string }
> = {
  DRAFT: {
    label: "Draft",
    pillClass: "bg-surface-2 border border-border text-muted",
    amountClass: "text-text-2",
  },
  ISSUED: {
    label: "Issued",
    pillClass: "bg-[#132230] border border-[#233d54] text-[#60a5fa]",
    amountClass: "text-text",
  },
  PAID: {
    label: "Paid",
    pillClass: "bg-primary-soft border border-[#1f4d32] text-primary",
    amountClass: "text-primary",
  },
  OVERDUE: {
    label: "Overdue",
    pillClass: "bg-[#2b1515] border border-[#5c2323] text-out",
    amountClass: "text-out",
  },
  CANCELLED: {
    label: "Cancelled",
    pillClass: "bg-[#161c18] border border-border text-[#6c7c72]",
    amountClass: "text-[#6c7c72] line-through",
  },
};

const FILTER_TABS: { key: "ALL" | InvoiceStatus; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "DRAFT", label: "Draft" },
  { key: "ISSUED", label: "Issued" },
  { key: "PAID", label: "Paid" },
  { key: "OVERDUE", label: "Overdue" },
  { key: "CANCELLED", label: "Cancelled" },
];

const emptyLine = (): InvoiceLineInput => ({
  id: `line_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  description: "",
  quantity: 1,
  unitPrice: 0,
});

const compactInput =
  "w-full h-[38px] px-3 rounded-badge bg-bg-alt border border-border text-sm text-text placeholder:text-[#6c7c72] focus:outline-none focus:border-primary/60";

export const InvoicesView: React.FC = () => {
  const { data: customers = [] } = useCustomers();
  const { data: productsData } = useProducts();
  const { data: profile } = useMerchantProfile();
  const customerTx = useCustomerTransaction();

  const {
    invoices: rawInvoices,
    nextSequence,
    createInvoice,
    updateInvoice,
    setInvoiceStatus,
    duplicateInvoice,
    deleteInvoice,
    importFromCustomers,
  } = useInvoiceStore();

  const products = productsData?.products ?? [];
  const shopName = profile?.shopName ?? "E-kaal";
  const shopContact = profile?.phone || profile?.email;

  // Resolve overdue status dynamically when dueDate passes
  const invoices = useMemo(
    () =>
      rawInvoices.map((inv) => {
        const effective = resolveInvoiceStatus(inv);
        return effective === inv.status ? inv : { ...inv, status: effective };
      }),
    [rawInvoices]
  );

  // Table filter & sort state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | InvoiceStatus>("ALL");
  const [sort, setSort] = useState("recent");

  // Inline composer state
  const [composerOpen, setComposerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [issueDate, setIssueDate] = useState(todayIsoDate);
  const [dueDate, setDueDate] = useState(() => addDaysIsoDate(7));
  const [formStatus, setFormStatus] = useState<InvoiceStatus>("ISSUED");
  const [lines, setLines] = useState<InvoiceLineInput[]>(() => [emptyLine()]);
  const [discountStr, setDiscountStr] = useState("");
  const [taxRateStr, setTaxRateStr] = useState("");
  const [notes, setNotes] = useState("");
  const [syncToDeymaha, setSyncToDeymaha] = useState(false);

  // Detail & Delete modals
  const [viewing, setViewing] = useState<Invoice | null>(null);
  const [deleting, setDeleting] = useState<Invoice | null>(null);

  const metrics = useMemo(() => {
    let totalBilled = 0;
    let totalPaid = 0;
    let outstanding = 0;
    let overdueAmount = 0;
    let overdueCount = 0;
    const counts: Record<"ALL" | InvoiceStatus, number> = {
      ALL: invoices.length,
      DRAFT: 0,
      ISSUED: 0,
      PAID: 0,
      OVERDUE: 0,
      CANCELLED: 0,
    };

    for (const inv of invoices) {
      counts[inv.status] += 1;
      if (inv.status !== "CANCELLED" && inv.status !== "DRAFT") {
        totalBilled += inv.total;
      }
      if (inv.status === "PAID") {
        totalPaid += inv.total;
      } else if (inv.status === "ISSUED" || inv.status === "OVERDUE") {
        totalPaid += inv.amountPaid;
        outstanding += inv.balanceDue;
        if (inv.status === "OVERDUE") {
          overdueAmount += inv.balanceDue;
          overdueCount += 1;
        }
      }
    }

    return { totalBilled, totalPaid, outstanding, overdueAmount, overdueCount, counts };
  }, [invoices]);

  const importableCustomers = useMemo(() => {
    const activeIds = new Set(
      invoices
        .filter((inv) => inv.status !== "CANCELLED" && inv.status !== "PAID" && inv.customerId)
        .map((inv) => inv.customerId as string)
    );
    return customers.filter((c) => c.balance > 0 && !activeIds.has(c._id));
  }, [customers, invoices]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = invoices.filter((inv) => {
      if (statusFilter !== "ALL" && inv.status !== statusFilter) return false;
      if (
        q &&
        !inv.invoiceNumber.toLowerCase().includes(q) &&
        !inv.customerName.toLowerCase().includes(q) &&
        !inv.customerPhone.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sort === "amount") return b.total - a.total;
      if (sort === "due") return a.dueDate.localeCompare(b.dueDate);
      if (sort === "name") return a.customerName.localeCompare(b.customerName);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [invoices, search, statusFilter, sort]);

  const selectedCustomer = useMemo(
    () => customers.find((c) => c._id === selectedCustomerId) ?? null,
    [customers, selectedCustomerId]
  );

  const liveCalc = useMemo(
    () =>
      computeInvoiceTotals(
        lines,
        parseFloat(discountStr) || 0,
        parseFloat(taxRateStr) || 0
      ),
    [lines, discountStr, taxRateStr]
  );

  const resetComposer = () => {
    setEditingId(null);
    setSelectedCustomerId("");
    setCustomerName("");
    setCustomerPhone("");
    setIssueDate(todayIsoDate());
    setDueDate(addDaysIsoDate(7));
    setFormStatus("ISSUED");
    setLines([emptyLine()]);
    setDiscountStr("");
    setTaxRateStr("");
    setNotes("");
    setSyncToDeymaha(false);
  };

  const openNewComposer = () => {
    resetComposer();
    setComposerOpen(true);
  };

  const openEditComposer = (inv: Invoice) => {
    setEditingId(inv.id);
    setSelectedCustomerId(inv.customerId ?? "");
    setCustomerName(inv.customerName);
    setCustomerPhone(inv.customerPhone);
    setIssueDate(inv.issueDate);
    setDueDate(inv.dueDate);
    setFormStatus(inv.status);
    setLines(
      inv.items.length > 0
        ? inv.items.map((it) => ({
            id: it.id,
            productId: it.productId,
            description: it.description,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
          }))
        : [emptyLine()]
    );
    setDiscountStr(inv.discount > 0 ? inv.discount.toFixed(2) : "");
    setTaxRateStr(inv.taxRate > 0 ? String(inv.taxRate) : "");
    setNotes(inv.notes ?? "");
    setSyncToDeymaha(false);
    setComposerOpen(true);
  };

  const handleBindCustomer = (id: string) => {
    setSelectedCustomerId(id);
    if (!id) return;
    const found = customers.find((c) => c._id === id);
    if (found) {
      setCustomerName(found.name);
      setCustomerPhone(found.phone);
    }
  };

  const handleLoadCustomerBalance = () => {
    if (!selectedCustomer || selectedCustomer.balance <= 0) return;
    setLines([
      {
        id: emptyLine().id,
        description: "Deymaha Account Balance",
        quantity: 1,
        unitPrice: selectedCustomer.balance,
      },
    ]);
  };

  const handleInsertProduct = (productId: string) => {
    if (!productId) return;
    const prod = products.find((p) => p._id === productId);
    if (!prod) return;

    setLines((prev) => {
      const firstEmptyIdx = prev.findIndex(
        (l) => !l.description.trim() && l.unitPrice === 0
      );
      const nextLine: InvoiceLineInput = {
        id: emptyLine().id,
        productId: prod._id,
        description: prod.name,
        quantity: 1,
        unitPrice: prod.sellingPrice,
      };
      if (firstEmptyIdx >= 0) {
        return prev.map((l, i) => (i === firstEmptyIdx ? nextLine : l));
      }
      return [...prev, nextLine];
    });
  };

  const updateLine = (idx: number, patch: Partial<InvoiceLineInput>) => {
    setLines((prev) => prev.map((line, i) => (i === idx ? { ...line, ...patch } : line)));
  };

  const removeLine = (idx: number) => {
    setLines((prev) => (prev.length <= 1 ? [emptyLine()] : prev.filter((_, i) => i !== idx)));
  };

  const validLines = lines.filter((l) => l.description.trim() && l.quantity > 0 && l.unitPrice >= 0);
  const canSubmit =
    customerName.trim().length > 0 &&
    customerPhone.trim().length > 0 &&
    validLines.length > 0 &&
    liveCalc.total > 0;

  const saveInvoice = (overrideStatus?: InvoiceStatus) => {
    if (!canSubmit) return;
    const targetStatus = overrideStatus ?? formStatus;
    const payload = {
      customerId: selectedCustomerId || undefined,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      status: targetStatus,
      issueDate,
      dueDate,
      items: validLines,
      discount: parseFloat(discountStr) || 0,
      taxRate: parseFloat(taxRateStr) || 0,
      notes: notes.trim() || undefined,
    };

    if (editingId) {
      updateInvoice(editingId, payload);
    } else {
      const created = createInvoice(payload);
      if (
        syncToDeymaha &&
        selectedCustomerId &&
        (targetStatus === "ISSUED" || targetStatus === "OVERDUE")
      ) {
        customerTx.mutate({
          id: selectedCustomerId,
          type: "DEBT_ADD",
          amount: created.total,
          note: `Invoice ${created.invoiceNumber}`,
        });
      }
    }

    setComposerOpen(false);
    resetComposer();
  };

  const exportCsv = () => {
    if (rows.length === 0) return;
    downloadCsv("ekaal-invoices.csv", [
      [
        "Invoice #",
        "Customer",
        "Phone",
        "Issue Date",
        "Due Date",
        "Status",
        "Subtotal",
        "Discount",
        "Tax",
        "Total",
        "Paid",
        "Balance Due",
      ],
      ...rows.map((inv) => [
        inv.invoiceNumber,
        inv.customerName,
        inv.customerPhone,
        inv.issueDate,
        inv.dueDate,
        STATUS_META[inv.status].label,
        inv.subtotal.toFixed(2),
        inv.discount.toFixed(2),
        inv.taxAmount.toFixed(2),
        inv.total.toFixed(2),
        inv.amountPaid.toFixed(2),
        inv.balanceDue.toFixed(2),
      ]),
    ]);
  };

  const editingInvoice = editingId
    ? invoices.find((inv) => inv.id === editingId) ?? null
    : null;

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <PageHeader
        gapAfter={18}
        title="Invoices"
        subtitle={`${pluralize(invoices.length, "Invoice", "Invoices")} • Outstanding ${formatCurrency(metrics.outstanding)}`}
        actions={
          <>
            {importableCustomers.length > 0 && (
              <RowButton
                className="h-[44px] px-[14px] bg-surface border-border text-text-2 hover:bg-surface-2"
                onClick={() => importFromCustomers(customers)}
              >
                Import Deymaha ({importableCustomers.length})
              </RowButton>
            )}
            <RowButton
              className="h-[44px] px-[14px] bg-surface border-border inline-flex items-center gap-2"
              disabled={rows.length === 0}
              onClick={exportCsv}
            >
              <Icons.Download className="w-[17px] h-[17px]" strokeWidth={1.6} />
              Export CSV
            </RowButton>
            <PrimaryButton
              className="bg-primary hover:bg-primary-600"
              onClick={() => (composerOpen && !editingId ? setComposerOpen(false) : openNewComposer())}
            >
              New Invoice
            </PrimaryButton>
            <SearchBox
              value={search}
              onChange={setSearch}
              placeholder="Search invoice #, customer, or phone..."
              width={320}
            />
          </>
        }
      />

      {/* Flat KPI Summary Cards */}
      <div className="grid grid-cols-4 gap-[15px] shrink-0 mb-[18px] tabular-nums">
        <StatCard
          label="Total Billed"
          value={formatCurrency(metrics.totalBilled)}
          className="bg-surface border-border"
        />
        <StatCard
          label="Collected (Paid)"
          value={formatCurrency(metrics.totalPaid)}
          tone="green"
          className="bg-surface border-border"
        />
        <StatCard
          label="Outstanding"
          value={formatCurrency(metrics.outstanding)}
          tone="red"
          className="bg-surface border-border"
        />
        <StatCard
          label={`Overdue (${metrics.overdueCount})`}
          value={formatCurrency(metrics.overdueAmount)}
          tone={metrics.overdueAmount > 0 ? "red" : "white"}
          className="bg-surface border-border"
        />
      </div>

      {/* Inline Billing / Invoice Creation & Edit Workflow */}
      {composerOpen && (
        <section className="bg-surface border border-border rounded-card p-[20px] mb-[18px] shrink-0">
          <div className="flex items-center justify-between pb-[14px] mb-[16px] border-b border-border">
            <div className="flex items-center gap-3">
              <h2 className="text-[20px] font-semibold text-text leading-tight">
                {editingInvoice ? `Edit ${editingInvoice.invoiceNumber}` : `New Invoice (INV-${nextSequence})`}
              </h2>
              <span
                className={cn(
                  "h-[26px] px-2.5 rounded-badge text-xs font-medium inline-flex items-center",
                  STATUS_META[formStatus].pillClass
                )}
              >
                {STATUS_META[formStatus].label}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setComposerOpen(false);
                resetComposer();
              }}
              className="p-1.5 rounded-badge text-muted hover:text-text hover:bg-surface-2 transition-colors"
              title="Close composer"
            >
              <Icons.Close className="w-[18px] h-[18px]" />
            </button>
          </div>

          <div className="grid grid-cols-[340px_1fr] gap-[20px] items-start">
            {/* Left Column: Customer Binding & Invoice Metadata */}
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-text-2 uppercase tracking-wide">
                    Bind Deymaha Customer
                  </label>
                  {selectedCustomer && selectedCustomer.balance > 0 && (
                    <button
                      type="button"
                      onClick={handleLoadCustomerBalance}
                      className="text-xs text-primary hover:underline tabular-nums"
                    >
                      Use Balance ({formatCurrency(selectedCustomer.balance)})
                    </button>
                  )}
                </div>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => handleBindCustomer(e.target.value)}
                  className={cn(compactInput, "cursor-pointer")}
                >
                  <option value="" className="bg-surface">
                    Walk-in / Manual Customer
                  </option>
                  {customers.map((c) => (
                    <option key={c._id} value={c._id} className="bg-surface">
                      {c.name} • {c.phone} ({formatCurrency(c.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs text-muted mb-1">Customer Name</label>
                  <input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Full name"
                    className={compactInput}
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1">Phone</label>
                  <input
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value.replace(/[^0-9+]/g, ""))}
                    placeholder="61xxxxxxx"
                    className={compactInput}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs text-muted mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className={compactInput}
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className={compactInput}
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1">State</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as InvoiceStatus)}
                    className={cn(compactInput, "cursor-pointer")}
                  >
                    <option value="DRAFT" className="bg-surface">Draft</option>
                    <option value="ISSUED" className="bg-surface">Issued</option>
                    <option value="PAID" className="bg-surface">Paid</option>
                    <option value="OVERDUE" className="bg-surface">Overdue</option>
                    <option value="CANCELLED" className="bg-surface">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-muted mb-1">Notes (optional)</label>
                <input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Payment terms or reference..."
                  className={compactInput}
                />
              </div>

              {!editingId && selectedCustomerId && (
                <div className="pt-1 flex items-center gap-2.5">
                  <Checkbox checked={syncToDeymaha} onChange={setSyncToDeymaha} size={20} />
                  <span className="text-xs text-text-2">
                    Post invoice amount to customer Deymaha ledger on Issue
                  </span>
                </div>
              )}
            </div>

            {/* Right Column: Line Items & Totals Calculation */}
            <div className="flex flex-col bg-bg-alt border border-border rounded-btn p-3.5">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-medium text-text-2 uppercase tracking-wide">
                  Line Items
                </span>
                <div className="flex items-center gap-2">
                  {products.length > 0 && (
                    <select
                      value=""
                      onChange={(e) => handleInsertProduct(e.target.value)}
                      className="h-[32px] px-2.5 rounded-badge bg-surface border border-border text-xs text-text-2 focus:outline-none cursor-pointer"
                    >
                      <option value="">+ Add from Products…</option>
                      {products.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name} ({formatCurrency(p.sellingPrice)})
                        </option>
                      ))}
                    </select>
                  )}
                  <button
                    type="button"
                    onClick={() => setLines((prev) => [...prev, emptyLine()])}
                    className="h-[32px] px-2.5 rounded-badge border border-border bg-surface hover:bg-surface-2 text-xs text-text inline-flex items-center gap-1 transition-colors"
                  >
                    <Icons.Plus className="w-3.5 h-3.5 text-primary" />
                    Add Line
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-[1fr_76px_112px_104px_32px] gap-2 text-xs text-muted pb-1.5 border-b border-border">
                <span>Item / Description</span>
                <span className="text-right">Qty</span>
                <span className="text-right">Unit Price</span>
                <span className="text-right">Total</span>
                <span />
              </div>

              <div className="max-h-[168px] overflow-y-auto divide-y divide-border/60">
                {lines.map((line, idx) => {
                  const lineTotal = (line.quantity || 0) * (line.unitPrice || 0);
                  return (
                    <div
                      key={line.id ?? idx}
                      className="grid grid-cols-[1fr_76px_112px_104px_32px] gap-2 items-center py-2"
                    >
                      <input
                        value={line.description}
                        onChange={(e) => updateLine(idx, { description: e.target.value })}
                        placeholder="Item or service description"
                        className="h-[34px] px-2.5 rounded-badge bg-surface border border-border text-sm text-text placeholder:text-[#6c7c72] focus:outline-none focus:border-primary/60"
                      />
                      <input
                        inputMode="numeric"
                        value={line.quantity === 0 ? "" : String(line.quantity)}
                        onChange={(e) =>
                          updateLine(idx, {
                            quantity: parseFloat(e.target.value.replace(/[^0-9.]/g, "")) || 0,
                          })
                        }
                        placeholder="1"
                        className="h-[34px] px-2 rounded-badge bg-surface border border-border text-sm text-right text-text tabular-nums focus:outline-none focus:border-primary/60"
                      />
                      <input
                        inputMode="decimal"
                        value={line.unitPrice === 0 ? "" : String(line.unitPrice)}
                        onChange={(e) =>
                          updateLine(idx, {
                            unitPrice: parseFloat(e.target.value.replace(/[^0-9.]/g, "")) || 0,
                          })
                        }
                        placeholder="0.00"
                        className="h-[34px] px-2.5 rounded-badge bg-surface border border-border text-sm text-right text-text tabular-nums focus:outline-none focus:border-primary/60"
                      />
                      <span className="text-sm text-right text-text tabular-nums font-medium">
                        {formatCurrency(lineTotal)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeLine(idx)}
                        className="w-[30px] h-[30px] inline-flex items-center justify-center rounded-badge text-muted hover:text-out hover:bg-[#241616] transition-colors"
                        title="Remove line"
                      >
                        <Icons.Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Totals & Actions Bar */}
              <div className="mt-3 pt-3 border-t border-border flex items-end justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-[116px]">
                    <label className="block text-xs text-muted mb-1">Discount ($)</label>
                    <input
                      inputMode="decimal"
                      value={discountStr}
                      onChange={(e) => setDiscountStr(e.target.value.replace(/[^0-9.]/g, ""))}
                      placeholder="0.00"
                      className="w-full h-[34px] px-2.5 rounded-badge bg-surface border border-border text-sm text-text tabular-nums focus:outline-none focus:border-primary/60"
                    />
                  </div>
                  <div className="w-[96px]">
                    <label className="block text-xs text-muted mb-1">Tax (%)</label>
                    <input
                      inputMode="decimal"
                      value={taxRateStr}
                      onChange={(e) => setTaxRateStr(e.target.value.replace(/[^0-9.]/g, ""))}
                      placeholder="0"
                      className="w-full h-[34px] px-2.5 rounded-badge bg-surface border border-border text-sm text-text tabular-nums focus:outline-none focus:border-primary/60"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right tabular-nums space-y-0.5">
                    <div className="text-xs text-muted">
                      Subtotal {formatCurrency(liveCalc.subtotal)}
                      {liveCalc.discount > 0 && ` • Disc −${formatCurrency(liveCalc.discount)}`}
                      {liveCalc.taxAmount > 0 && ` • Tax +${formatCurrency(liveCalc.taxAmount)}`}
                    </div>
                    <div className="text-[20px] font-semibold text-text leading-tight">
                      Total: {formatCurrency(liveCalc.total)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <RowButton
                      type="button"
                      onClick={() => {
                        setComposerOpen(false);
                        resetComposer();
                      }}
                    >
                      Cancel
                    </RowButton>
                    {!editingId && (
                      <RowButton
                        type="button"
                        disabled={!canSubmit}
                        onClick={() => saveInvoice("DRAFT")}
                      >
                        Save Draft
                      </RowButton>
                    )}
                    <button
                      type="button"
                      disabled={!canSubmit}
                      onClick={() => saveInvoice(editingId ? undefined : formStatus)}
                      className="h-[36px] px-4 rounded-badge bg-primary hover:bg-primary-600 disabled:opacity-50 text-sm font-medium text-white transition-colors whitespace-nowrap"
                    >
                      {editingId
                        ? "Save Changes"
                        : formStatus === "DRAFT"
                        ? "Create Draft"
                        : "Issue Invoice"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Filter Bar & Ledger Table */}
      <div className="bg-surface border border-border rounded-card flex-1 min-h-[260px] flex flex-col overflow-hidden">
        <div className="h-[54px] px-[20px] border-b border-border flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {FILTER_TABS.map((tab) => {
              const active = statusFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setStatusFilter(tab.key)}
                  className={cn(
                    "h-[32px] px-3 rounded-badge text-sm inline-flex items-center gap-1.5 transition-colors whitespace-nowrap border",
                    active
                      ? "bg-primary-soft border-primary/40 text-text"
                      : "border-transparent text-muted hover:text-text hover:bg-surface-2"
                  )}
                >
                  <span>{tab.label}</span>
                  <span className="text-xs text-muted tabular-nums">
                    {metrics.counts[tab.key]}
                  </span>
                </button>
              );
            })}
          </div>

          <SelectBox
            width={126}
            h={34}
            value={sort}
            onChange={setSort}
            options={[
              { value: "recent", label: "Recent" },
              { value: "due", label: "Due Date" },
              { value: "amount", label: "Amount" },
              { value: "name", label: "A–Z" },
            ]}
          />
        </div>

        <div className={`${COLS} h-[48px] shrink-0 border-b border-border ${HEAD_TEXT}`}>
          <span>Invoice #</span>
          <span>Customer</span>
          <span>Due Date</span>
          <span>Status</span>
          <span>Total</span>
          <span className="text-right">Actions</span>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto tabular-nums">
          {rows.length === 0 ? (
            <EmptyLine>
              {invoices.length === 0
                ? "No invoices created yet — click New Invoice to bill a customer"
                : "No invoices match the current filter"}
            </EmptyLine>
          ) : (
            rows.map((inv) => {
              const meta = STATUS_META[inv.status];
              return (
                <div
                  key={inv.id}
                  className={`${COLS} h-[64px] border-b border-border last:border-b-0 text-[18px] text-text hover:bg-surface-2/40 transition-colors`}
                >
                  <span className="flex items-center gap-3 min-w-0 pr-3">
                    <Avatar size={38} square>
                      <Icons.Invoices className="w-[19px] h-[19px]" strokeWidth={1.6} />
                    </Avatar>
                    <span className="min-w-0">
                      <span className="block text-[17px] font-medium leading-tight truncate">
                        {inv.invoiceNumber}
                      </span>
                      <span className="block text-[13px] text-muted leading-tight">
                        {formatDate(inv.issueDate)}
                      </span>
                    </span>
                  </span>

                  <span className="min-w-0 pr-3">
                    <span className="block text-[17px] leading-tight truncate">
                      {inv.customerName}
                    </span>
                    <span className="block text-[14px] text-muted leading-tight truncate">
                      {inv.customerPhone}
                    </span>
                  </span>

                  <span className="text-[17px] text-text-2">{formatDate(inv.dueDate)}</span>

                  <span>
                    <span
                      className={cn(
                        "inline-flex items-center h-[28px] px-3 rounded-badge text-sm font-normal whitespace-nowrap",
                        meta.pillClass
                      )}
                    >
                      {meta.label}
                    </span>
                  </span>

                  <span className={cn("text-[18px] font-medium", meta.amountClass)}>
                    {formatCurrency(inv.total)}
                  </span>

                  <span className="flex items-center gap-2 justify-end">
                    <RowButton onClick={() => setViewing(inv)}>View</RowButton>

                    {inv.status === "DRAFT" && (
                      <RowButton
                        tone="success"
                        onClick={() => setInvoiceStatus(inv.id, "ISSUED")}
                      >
                        Issue
                      </RowButton>
                    )}

                    {(inv.status === "ISSUED" || inv.status === "OVERDUE") && (
                      <RowButton
                        tone="success"
                        onClick={() => setInvoiceStatus(inv.id, "PAID")}
                      >
                        Mark Paid
                      </RowButton>
                    )}

                    {(inv.status === "PAID" || inv.status === "CANCELLED") && (
                      <RowButton
                        onClick={() => printInvoiceDocument(inv, shopName, shopContact)}
                      >
                        Print
                      </RowButton>
                    )}

                    <RowMenu
                      items={[
                        {
                          label: "Edit Invoice",
                          onClick: () => openEditComposer(inv),
                        },
                        {
                          label: "Print Invoice",
                          onClick: () => printInvoiceDocument(inv, shopName, shopContact),
                        },
                        ...(inv.status !== "ISSUED"
                          ? [
                              {
                                label: "Mark as Issued",
                                onClick: () => setInvoiceStatus(inv.id, "ISSUED"),
                              },
                            ]
                          : []),
                        ...(inv.status !== "PAID"
                          ? [
                              {
                                label: "Mark as Paid",
                                onClick: () => setInvoiceStatus(inv.id, "PAID"),
                              },
                            ]
                          : []),
                        ...(inv.status === "ISSUED"
                          ? [
                              {
                                label: "Mark as Overdue",
                                onClick: () => setInvoiceStatus(inv.id, "OVERDUE"),
                              },
                            ]
                          : []),
                        {
                          label: "Duplicate",
                          onClick: () => duplicateInvoice(inv.id),
                        },
                        ...(inv.status !== "CANCELLED"
                          ? [
                              {
                                label: "Cancel Invoice",
                                danger: true,
                                onClick: () => setInvoiceStatus(inv.id, "CANCELLED"),
                              },
                            ]
                          : []),
                        {
                          label: "Delete",
                          danger: true,
                          onClick: () => setDeleting(inv),
                        },
                      ]}
                    />
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Itemized Invoice Detail Modal */}
      <Modal
        isOpen={!!viewing}
        onClose={() => setViewing(null)}
        maxWidth="lg"
        title={viewing ? `${viewing.invoiceNumber} — ${viewing.customerName}` : "Invoice"}
        description={
          viewing
            ? `${viewing.customerPhone} • Issued ${formatDate(viewing.issueDate)} • Due ${formatDate(viewing.dueDate)}`
            : undefined
        }
        footer={
          viewing && (
            <>
              <RowButton onClick={() => setViewing(null)}>Close</RowButton>
              {viewing.status !== "PAID" && viewing.status !== "CANCELLED" && (
                <RowButton
                  tone="success"
                  onClick={() => {
                    setInvoiceStatus(viewing.id, "PAID");
                    setViewing(null);
                  }}
                >
                  Mark Paid
                </RowButton>
              )}
              <PrimaryButton
                icon={false}
                h={38}
                className="bg-primary hover:bg-primary-600 text-sm px-4"
                onClick={() => printInvoiceDocument(viewing, shopName, shopContact)}
              >
                <Icons.Printer className="w-4 h-4" />
                Print Invoice
              </PrimaryButton>
            </>
          )
        }
      >
        {viewing && (
          <div className="space-y-4 tabular-nums">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Current State</span>
              <span
                className={cn(
                  "inline-flex items-center h-[28px] px-3 rounded-badge text-sm",
                  STATUS_META[viewing.status].pillClass
                )}
              >
                {STATUS_META[viewing.status].label}
              </span>
            </div>

            <div className="border border-border rounded-btn overflow-hidden">
              <div className="grid grid-cols-[1fr_64px_100px_100px] px-3.5 py-2 bg-bg-alt border-b border-border text-xs text-muted uppercase">
                <span>Description</span>
                <span className="text-right">Qty</span>
                <span className="text-right">Unit</span>
                <span className="text-right">Total</span>
              </div>
              <div className="divide-y divide-border">
                {viewing.items.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[1fr_64px_100px_100px] px-3.5 py-2.5 text-sm text-text"
                  >
                    <span className="truncate pr-2">{item.description}</span>
                    <span className="text-right text-text-2">{item.quantity}</span>
                    <span className="text-right text-text-2">
                      {formatCurrency(item.unitPrice)}
                    </span>
                    <span className="text-right font-medium">
                      {formatCurrency(item.total)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 pt-1 text-sm">
              <div className="flex justify-between text-text-2">
                <span>Subtotal</span>
                <span>{formatCurrency(viewing.subtotal)}</span>
              </div>
              {viewing.discount > 0 && (
                <div className="flex justify-between text-text-2">
                  <span>Discount</span>
                  <span>−{formatCurrency(viewing.discount)}</span>
                </div>
              )}
              {viewing.taxAmount > 0 && (
                <div className="flex justify-between text-text-2">
                  <span>Tax ({viewing.taxRate}%)</span>
                  <span>+{formatCurrency(viewing.taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-semibold text-text pt-2 border-t border-border">
                <span>Total</span>
                <span>{formatCurrency(viewing.total)}</span>
              </div>
              <div className="flex justify-between text-primary">
                <span>Amount Paid</span>
                <span>{formatCurrency(viewing.amountPaid)}</span>
              </div>
              <div className="flex justify-between text-out font-medium">
                <span>Balance Due</span>
                <span>{formatCurrency(viewing.balanceDue)}</span>
              </div>
            </div>

            {viewing.notes && (
              <p className="text-sm text-muted pt-2 border-t border-border">
                Note: {viewing.notes}
              </p>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete invoice"
        message={
          deleting
            ? `Permanently delete ${deleting.invoiceNumber} for ${deleting.customerName}?`
            : ""
        }
        confirmLabel="Delete"
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) {
            deleteInvoice(deleting.id);
            setDeleting(null);
          }
        }}
      />
    </div>
  );
};

export default InvoicesView;
