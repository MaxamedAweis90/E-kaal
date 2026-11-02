import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Customer, Invoice, InvoiceLineItem, InvoiceStatus } from "../types";
import { round2 } from "../utils/format";

export interface InvoiceLineInput {
  id?: string;
  productId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceFormInput {
  customerId?: string;
  customerName: string;
  customerPhone: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  items: InvoiceLineInput[];
  discount?: number;
  taxRate?: number;
  notes?: string;
}

export const todayIsoDate = (): string => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const addDaysIsoDate = (days: number): string => {
  const dt = new Date();
  dt.setDate(dt.getDate() + days);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const d = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const computeInvoiceTotals = (
  rawItems: InvoiceLineInput[],
  rawDiscount = 0,
  rawTaxRate = 0
): {
  items: InvoiceLineItem[];
  subtotal: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
} => {
  const items: InvoiceLineItem[] = rawItems.map((it, idx) => {
    const quantity = Math.max(0, Number.isFinite(it.quantity) ? it.quantity : 0);
    const unitPrice = Math.max(0, Number.isFinite(it.unitPrice) ? round2(it.unitPrice) : 0);
    return {
      id: it.id || `item-${Date.now()}-${idx}`,
      productId: it.productId,
      description: it.description.trim() || "Item",
      quantity,
      unitPrice,
      total: round2(quantity * unitPrice),
    };
  });

  const subtotal = round2(items.reduce((sum, it) => sum + it.total, 0));
  const discount = round2(Math.min(Math.max(0, rawDiscount || 0), subtotal));
  const taxable = round2(Math.max(0, subtotal - discount));
  const taxRate = Math.max(0, rawTaxRate || 0);
  const taxAmount = round2(taxable * (taxRate / 100));
  const total = round2(taxable + taxAmount);

  return { items, subtotal, discount, taxRate, taxAmount, total };
};

export const resolveInvoiceStatus = (invoice: Invoice): InvoiceStatus => {
  if (
    invoice.status === "ISSUED" &&
    invoice.balanceDue > 0 &&
    invoice.dueDate &&
    invoice.dueDate < todayIsoDate()
  ) {
    return "OVERDUE";
  }
  return invoice.status;
};

const applyBalancesForStatus = (
  status: InvoiceStatus,
  total: number,
  existingPaid = 0,
  existingPaidAt?: string
): { amountPaid: number; balanceDue: number; paidAt?: string } => {
  if (status === "PAID") {
    return {
      amountPaid: total,
      balanceDue: 0,
      paidAt: existingPaidAt || new Date().toISOString(),
    };
  }
  if (status === "CANCELLED") {
    return {
      amountPaid: round2(Math.min(existingPaid, total)),
      balanceDue: 0,
      paidAt: existingPaidAt,
    };
  }
  const paid = status === "DRAFT" ? 0 : round2(Math.min(existingPaid, total));
  return {
    amountPaid: paid,
    balanceDue: round2(Math.max(0, total - paid)),
    paidAt: undefined,
  };
};

interface InvoiceStoreState {
  invoices: Invoice[];
  nextSequence: number;
  createInvoice: (input: InvoiceFormInput) => Invoice;
  updateInvoice: (id: string, input: InvoiceFormInput) => void;
  setInvoiceStatus: (id: string, status: InvoiceStatus) => void;
  duplicateInvoice: (id: string) => Invoice | null;
  deleteInvoice: (id: string) => void;
  importFromCustomers: (customers: Customer[]) => number;
}

const makeId = () => `inv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const useInvoiceStore = create<InvoiceStoreState>()(
  persist(
    (set, get) => ({
      invoices: [],
      nextSequence: 1001,

      createInvoice: (input) => {
        const seq = get().nextSequence;
        const now = new Date().toISOString();
        const calc = computeInvoiceTotals(input.items, input.discount, input.taxRate);
        const balances = applyBalancesForStatus(input.status, calc.total);

        const created: Invoice = {
          id: makeId(),
          invoiceNumber: `INV-${seq}`,
          customerId: input.customerId || undefined,
          customerName: input.customerName.trim(),
          customerPhone: input.customerPhone.trim(),
          status: input.status,
          issueDate: input.issueDate || todayIsoDate(),
          dueDate: input.dueDate || addDaysIsoDate(7),
          items: calc.items,
          subtotal: calc.subtotal,
          discount: calc.discount,
          taxRate: calc.taxRate,
          taxAmount: calc.taxAmount,
          total: calc.total,
          amountPaid: balances.amountPaid,
          balanceDue: balances.balanceDue,
          notes: input.notes?.trim() || undefined,
          paidAt: balances.paidAt,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          invoices: [created, ...state.invoices],
          nextSequence: state.nextSequence + 1,
        }));

        return created;
      },

      updateInvoice: (id, input) => {
        const now = new Date().toISOString();
        set((state) => ({
          invoices: state.invoices.map((inv) => {
            if (inv.id !== id) return inv;
            const calc = computeInvoiceTotals(input.items, input.discount, input.taxRate);
            const balances = applyBalancesForStatus(
              input.status,
              calc.total,
              inv.amountPaid,
              inv.paidAt
            );
            return {
              ...inv,
              customerId: input.customerId || undefined,
              customerName: input.customerName.trim(),
              customerPhone: input.customerPhone.trim(),
              status: input.status,
              issueDate: input.issueDate || inv.issueDate,
              dueDate: input.dueDate || inv.dueDate,
              items: calc.items,
              subtotal: calc.subtotal,
              discount: calc.discount,
              taxRate: calc.taxRate,
              taxAmount: calc.taxAmount,
              total: calc.total,
              amountPaid: balances.amountPaid,
              balanceDue: balances.balanceDue,
              notes: input.notes?.trim() || undefined,
              paidAt: balances.paidAt,
              updatedAt: now,
            };
          }),
        }));
      },

      setInvoiceStatus: (id, status) => {
        const now = new Date().toISOString();
        set((state) => ({
          invoices: state.invoices.map((inv) => {
            if (inv.id !== id) return inv;
            const balances = applyBalancesForStatus(status, inv.total, inv.amountPaid, inv.paidAt);
            return {
              ...inv,
              status,
              amountPaid: balances.amountPaid,
              balanceDue: balances.balanceDue,
              paidAt: balances.paidAt,
              updatedAt: now,
            };
          }),
        }));
      },

      duplicateInvoice: (id) => {
        const source = get().invoices.find((inv) => inv.id === id);
        if (!source) return null;
        return get().createInvoice({
          customerId: source.customerId,
          customerName: source.customerName,
          customerPhone: source.customerPhone,
          status: "DRAFT",
          issueDate: todayIsoDate(),
          dueDate: addDaysIsoDate(7),
          items: source.items.map((it) => ({
            productId: it.productId,
            description: it.description,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
          })),
          discount: source.discount,
          taxRate: source.taxRate,
          notes: source.notes,
        });
      },

      deleteInvoice: (id) =>
        set((state) => ({
          invoices: state.invoices.filter((inv) => inv.id !== id),
        })),

      importFromCustomers: (customers) => {
        const state = get();
        const activeCustomerIds = new Set(
          state.invoices
            .filter((inv) => inv.status !== "CANCELLED" && inv.status !== "PAID" && inv.customerId)
            .map((inv) => inv.customerId as string)
        );

        const owing = customers.filter((c) => c.balance > 0 && !activeCustomerIds.has(c._id));
        if (owing.length === 0) return 0;

        let seq = state.nextSequence;
        const now = new Date().toISOString();
        const issueDate = todayIsoDate();
        const dueDate = addDaysIsoDate(7);

        const imported: Invoice[] = owing.map((c) => {
          const amount = round2(c.balance);
          const inv: Invoice = {
            id: `${makeId()}_${seq}`,
            invoiceNumber: `INV-${seq}`,
            customerId: c._id,
            customerName: c.name,
            customerPhone: c.phone,
            status: "ISSUED",
            issueDate,
            dueDate,
            items: [
              {
                id: `item_${seq}_1`,
                description: "Deymaha Receivable Balance",
                quantity: 1,
                unitPrice: amount,
                total: amount,
              },
            ],
            subtotal: amount,
            discount: 0,
            taxRate: 0,
            taxAmount: 0,
            total: amount,
            amountPaid: 0,
            balanceDue: amount,
            createdAt: now,
            updatedAt: now,
          };
          seq += 1;
          return inv;
        });

        set({
          invoices: [...imported, ...state.invoices],
          nextSequence: seq,
        });

        return imported.length;
      },
    }),
    {
      name: "ekaal-invoices-v1",
    }
  )
);

