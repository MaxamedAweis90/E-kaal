import React, { useMemo, useState } from "react";
import { User } from "lucide-react";
import {
  useCustomers,
  useCreateCustomer,
  useCustomerTransaction,
} from "../../hooks/useLedgers";
import { formatCurrency } from "../../utils/cn";
import { formatDate, pluralize } from "../../utils/format";
import type { Customer } from "../../types";
import {
  Avatar,
  EmptyLine,
  HEAD_TEXT,
  PANEL,
  PageHeader,
  PrimaryButton,
  RowButton,
  RowMenu,
  SearchBox,
  SelectBox,
} from "../ui/screen";
import { AmountDialog, PartyDialog, StatementDialog } from "./dialogs";

const COLS =
  "grid grid-cols-[minmax(254px,2.45fr)_minmax(122px,1.15fr)_minmax(210px,2fr)_minmax(122px,1.15fr)_minmax(136px,1.3fr)_168px] items-center";

type TxState = { customer: Customer; type: "DEBT_ADD" | "DEBT_PAYMENT" } | null;

export const DeymahaView: React.FC = () => {
  const { data: customers = [], isLoading } = useCustomers();
  const createCustomer = useCreateCustomer();
  const transaction = useCustomerTransaction();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("recent");
  const [adding, setAdding] = useState(false);
  const [tx, setTx] = useState<TxState>(null);
  const [statementId, setStatementId] = useState<string | null>(null);

  const totalBalance = useMemo(
    () => customers.reduce((sum, c) => sum + c.balance, 0),
    [customers]
  );

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = customers.filter((c) => {
      if (q && !c.name.toLowerCase().includes(q) && !c.phone.includes(q)) return false;
      if (status === "owing") return c.balance > 0;
      if (status === "cleared") return c.balance === 0;
      if (status === "over") return c.creditLimit > 0 && c.balance > c.creditLimit;
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sort === "balance") return b.balance - a.balance;
      if (sort === "name") return a.name.localeCompare(b.name);
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
    return list;
  }, [customers, search, status, sort]);

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <PageHeader
        boxed
        title="Deymaha (Customer Ledger)"
        subtitle={`${pluralize(customers.length, "Account", "Accounts")} • Total Balance ${formatCurrency(totalBalance)}`}
        actions={
          <>
            <PrimaryButton h={41} onClick={() => setAdding(true)}>
              Add Customer
            </PrimaryButton>
            <SearchBox
              value={search}
              onChange={setSearch}
              placeholder="Search by customer name or phone..."
              width={364}
              h={41}
            />
          </>
        }
        filters={
          <>
            <SelectBox
              width={70}
              h={33}
              value={status}
              onChange={setStatus}
              options={[
                { value: "all", label: "All" },
                { value: "owing", label: "Owing" },
                { value: "cleared", label: "Cleared" },
                { value: "over", label: "Over limit" },
              ]}
            />
            <SelectBox
              width={118}
              h={33}
              value={sort}
              onChange={setSort}
              options={[
                { value: "recent", label: "Overdue" },
                { value: "balance", label: "Balance" },
                { value: "name", label: "A–Z" },
              ]}
            />
          </>
        }
      />

      <div className={`${PANEL} flex-1 min-h-[320px] flex flex-col overflow-hidden`}>
        <div className={`${COLS} h-[54px] shrink-0 px-[29px] ${HEAD_TEXT}`}>
          <span className="whitespace-nowrap">Customer Name</span>
          <span className="whitespace-nowrap">Phone</span>
          <span className="whitespace-nowrap">Last Transaction Date</span>
          <span className="whitespace-nowrap">Credit Limit</span>
          <span className="whitespace-nowrap">Balance Owed</span>
          <span className="text-right whitespace-nowrap">Actions</span>
        </div>

        <div className="mx-[19px] mb-[22px] flex-1 min-h-0 overflow-y-auto border border-[#233026] rounded-[14px] bg-[#121912]">
          {isLoading ? (
            <EmptyLine>Loading…</EmptyLine>
          ) : rows.length === 0 ? (
            <EmptyLine>No customers found</EmptyLine>
          ) : (
            rows.map((c) => (
              <div
                key={c._id}
                className={`${COLS} h-[60px] px-[9px] border-b border-[#233026] last:border-b-0 text-[20px] text-[#f1f5f2]`}
              >
                <span className="flex items-center gap-[12px] min-w-0 pr-[16px]">
                  <Avatar size={40} square>
                    <User className="w-[22px] h-[22px]" strokeWidth={1.6} />
                  </Avatar>
                  <span className="truncate">{c.name}</span>
                </span>
                <span>{c.phone}</span>
                <span>{formatDate(c.updatedAt)}</span>
                <span>{formatCurrency(c.creditLimit)}</span>
                <span className={c.balance > 0 ? "text-[#e0605f]" : "text-[#54a376]"}>
                  {formatCurrency(c.balance)}
                </span>
                <span className="flex items-center gap-[8px] justify-end">
                  <RowButton onClick={() => setStatementId(c._id)}>View</RowButton>
                  <RowMenu
                    label="Action"
                    items={[
                      { label: "Add Debt", onClick: () => setTx({ customer: c, type: "DEBT_ADD" }) },
                      { label: "Log Payment", onClick: () => setTx({ customer: c, type: "DEBT_PAYMENT" }) },
                    ]}
                  />
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <PartyDialog
        open={adding}
        title="Add Customer"
        extraLabel="Credit Limit"
        submitLabel="Add Customer"
        pending={createCustomer.isPending}
        error={createCustomer.error}
        onClose={() => {
          setAdding(false);
          createCustomer.reset();
        }}
        onSubmit={(v) =>
          createCustomer.mutate(
            { name: v.name, phone: v.phone, creditLimit: v.extra },
            { onSuccess: () => setAdding(false) }
          )
        }
      />

      <AmountDialog
        open={!!tx}
        title={tx?.type === "DEBT_ADD" ? "Add Debt" : "Log Payment"}
        description={tx ? `${tx.customer.name} • Balance ${formatCurrency(tx.customer.balance)}` : undefined}
        initialAmount={tx?.type === "DEBT_PAYMENT" ? tx.customer.balance : undefined}
        submitLabel={tx?.type === "DEBT_ADD" ? "Add Debt" : "Log Payment"}
        pending={transaction.isPending}
        error={transaction.error}
        onClose={() => {
          setTx(null);
          transaction.reset();
        }}
        onSubmit={(amount, note) =>
          tx &&
          transaction.mutate(
            { id: tx.customer._id, type: tx.type, amount, note },
            { onSuccess: () => setTx(null) }
          )
        }
      />

      <StatementDialog customerId={statementId} onClose={() => setStatementId(null)} />
    </div>
  );
};

export default DeymahaView;

