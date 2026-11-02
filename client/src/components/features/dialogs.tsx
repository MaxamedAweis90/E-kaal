import React, { useEffect, useState } from "react";
import { Modal } from "../ui/Modal";
import { Field, PrimaryButton, RowButton, inputClass } from "../ui/screen";
import { formatCurrency } from "../../utils/cn";
import { formatDate, errorMessage } from "../../utils/format";
import { useCustomerDetail } from "../../hooks/useLedgers";
import type { Product } from "../../types";
import type { ProductInput } from "../../hooks/useLedgers";

const parseNum = (s: string): number => {
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
};

const FormError: React.FC<{ error: unknown }> = ({ error }) =>
  error ? <p className="text-[16px] text-[#e0605f] mt-[10px]">{errorMessage(error)}</p> : null;

const Actions: React.FC<{
  onClose: () => void;
  submitLabel: string;
  pending?: boolean;
  disabled?: boolean;
}> = ({ onClose, submitLabel, pending, disabled }) => (
  <div className="flex justify-end gap-[10px] mt-[18px]">
    <RowButton type="button" onClick={onClose} className="h-[42px]">
      Cancel
    </RowButton>
    <PrimaryButton type="submit" icon={false} h={42} disabled={pending || disabled}>
      {pending ? "Saving…" : submitLabel}
    </PrimaryButton>
  </div>
);

/* ---------- Amount (+ optional note) ---------- */
export const AmountDialog: React.FC<{
  open: boolean;
  title: string;
  description?: string;
  amountLabel?: string;
  initialAmount?: number;
  submitLabel: string;
  pending?: boolean;
  error?: unknown;
  onSubmit: (amount: number, note: string) => void;
  onClose: () => void;
}> = ({
  open,
  title,
  description,
  amountLabel = "Amount",
  initialAmount,
  submitLabel,
  pending,
  error,
  onSubmit,
  onClose,
}) => {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open) {
      setAmount(initialAmount ? initialAmount.toFixed(2) : "");
      setNote("");
    }
  }, [open, initialAmount]);

  return (
    <Modal isOpen={open} onClose={onClose} title={title} description={description}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(parseNum(amount), note);
        }}
        className="space-y-[12px]"
      >
        <Field label={amountLabel}>
          <input
            autoFocus
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder="0.00"
            className={inputClass}
          />
        </Field>
        <Field label="Note (optional)">
          <input value={note} onChange={(e) => setNote(e.target.value)} className={inputClass} />
        </Field>
        <FormError error={error} />
        <Actions
          onClose={onClose}
          submitLabel={submitLabel}
          pending={pending}
          disabled={parseNum(amount) <= 0}
        />
      </form>
    </Modal>
  );
};

/* ---------- Add customer / vendor ---------- */
export const PartyDialog: React.FC<{
  open: boolean;
  title: string;
  extraLabel: string;
  submitLabel: string;
  pending?: boolean;
  error?: unknown;
  onSubmit: (v: { name: string; phone: string; extra: number }) => void;
  onClose: () => void;
}> = ({ open, title, extraLabel, submitLabel, pending, error, onSubmit, onClose }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [extra, setExtra] = useState("");

  useEffect(() => {
    if (open) {
      setName("");
      setPhone("");
      setExtra("");
    }
  }, [open]);

  return (
    <Modal isOpen={open} onClose={onClose} title={title}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit({ name: name.trim(), phone: phone.trim(), extra: parseNum(extra) });
        }}
        className="space-y-[12px]"
      >
        <Field label="Name">
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Phone">
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="61xxxxxxx" className={inputClass} />
        </Field>
        <Field label={extraLabel}>
          <input
            inputMode="decimal"
            value={extra}
            onChange={(e) => setExtra(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder="0.00"
            className={inputClass}
          />
        </Field>
        <FormError error={error} />
        <Actions
          onClose={onClose}
          submitLabel={submitLabel}
          pending={pending}
          disabled={!name.trim() || !phone.trim()}
        />
      </form>
    </Modal>
  );
};

/* ---------- Product create / edit ---------- */
export const ProductDialog: React.FC<{
  open: boolean;
  product: Product | null;
  pending?: boolean;
  error?: unknown;
  onSubmit: (v: ProductInput) => void;
  onClose: () => void;
}> = ({ open, product, pending, error, onSubmit, onClose }) => {
  const [name, setName] = useState("");
  const [barcode, setBarcode] = useState("");
  const [stock, setStock] = useState("");
  const [cost, setCost] = useState("");
  const [price, setPrice] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(product?.name ?? "");
    setBarcode(product?.barcode ?? "");
    setStock(product ? String(product.stockCount) : "");
    setCost(product ? product.unitCost.toFixed(2) : "");
    setPrice(product ? product.sellingPrice.toFixed(2) : "");
  }, [open, product]);

  const num = (set: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) =>
    set(e.target.value.replace(/[^0-9.]/g, ""));

  return (
    <Modal isOpen={open} onClose={onClose} title={product ? "Edit Product" : "Add Product"}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit({
            name: name.trim(),
            barcode: barcode.trim() || undefined,
            stockCount: Math.floor(parseNum(stock)),
            unitCost: parseNum(cost),
            sellingPrice: parseNum(price),
          });
        }}
        className="space-y-[12px]"
      >
        <Field label="Product Name">
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Barcode (optional)">
          <input value={barcode} onChange={(e) => setBarcode(e.target.value)} className={inputClass} />
        </Field>
        <div className="grid grid-cols-3 gap-[12px]">
          <Field label="Stock">
            <input inputMode="numeric" value={stock} onChange={num(setStock)} className={inputClass} />
          </Field>
          <Field label="Unit Cost">
            <input inputMode="decimal" value={cost} onChange={num(setCost)} className={inputClass} />
          </Field>
          <Field label="Selling Price">
            <input inputMode="decimal" value={price} onChange={num(setPrice)} className={inputClass} />
          </Field>
        </div>
        <FormError error={error} />
        <Actions
          onClose={onClose}
          submitLabel={product ? "Save" : "Add Product"}
          pending={pending}
          disabled={!name.trim() || !cost || !price}
        />
      </form>
    </Modal>
  );
};

/* ---------- Confirm ---------- */
export const ConfirmDialog: React.FC<{
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  pending?: boolean;
  error?: unknown;
  onConfirm: () => void;
  onClose: () => void;
}> = ({ open, title, message, confirmLabel, pending, error, onConfirm, onClose }) => (
  <Modal isOpen={open} onClose={onClose} title={title} maxWidth="sm">
    <p className="text-[17px] text-[#cfd6d1]">{message}</p>
    <FormError error={error} />
    <div className="flex justify-end gap-[10px] mt-[18px]">
      <RowButton onClick={onClose} className="h-[42px]">
        Cancel
      </RowButton>
      <RowButton tone="danger" onClick={onConfirm} disabled={pending} className="h-[42px]">
        {pending ? "Working…" : confirmLabel}
      </RowButton>
    </div>
  </Modal>
);

/* ---------- Read-only details ---------- */
export const DetailDialog: React.FC<{
  open: boolean;
  title: string;
  rows: { label: string; value: React.ReactNode }[];
  onClose: () => void;
}> = ({ open, title, rows, onClose }) => (
  <Modal isOpen={open} onClose={onClose} title={title}>
    <div className="divide-y divide-[#233026]">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center justify-between py-[10px] text-[18px]">
          <span className="text-[#9aa69f]">{r.label}</span>
          <span className="text-[#f1f5f2]">{r.value}</span>
        </div>
      ))}
    </div>
  </Modal>
);

/* ---------- Customer statement ---------- */
export const StatementDialog: React.FC<{
  customerId: string | null;
  onClose: () => void;
}> = ({ customerId, onClose }) => {
  const { data, isLoading } = useCustomerDetail(customerId);

  return (
    <Modal
      isOpen={!!customerId}
      onClose={onClose}
      maxWidth="lg"
      title={data?.customer.name ?? "Statement"}
      description={data ? `${data.customer.phone} • Balance ${formatCurrency(data.customer.balance)}` : undefined}
    >
      {isLoading || !data ? (
        <p className="text-[17px] text-[#6c7c72]">Loading…</p>
      ) : data.transactions.length === 0 ? (
        <p className="text-[17px] text-[#6c7c72]">No transactions yet</p>
      ) : (
        <div className="divide-y divide-[#233026]">
          {data.transactions.map((t) => {
            const isPay = t.type === "DEBT_PAYMENT";
            return (
              <div key={t._id} className="flex items-center justify-between py-[10px]">
                <div>
                  <div className="text-[18px] text-[#f1f5f2]">{isPay ? "Payment" : "Debt added"}</div>
                  <div className="text-[15px] text-[#6c7c72]">
                    {formatDate(t.date ?? t.createdAt)}
                    {t.note ? ` • ${t.note}` : ""}
                  </div>
                </div>
                <div className={isPay ? "text-[#54a376] text-[18px]" : "text-[#e0605f] text-[18px]"}>
                  {isPay ? "−" : "+"}
                  {formatCurrency(t.amount)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
};

