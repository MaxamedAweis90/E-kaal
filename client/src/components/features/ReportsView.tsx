import React, { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, CheckCircle2, Download, AlertTriangle, Plus } from "lucide-react";
import { useCustomers, useMerchantProfile } from "../../hooks/useLedgers";
import { useAppStore } from "../../store/useAppStore";
import { formatCurrency } from "../../utils/cn";
import { pluralize } from "../../utils/format";
import { downloadCsv, printInvoices } from "../../utils/invoice";
import { cn } from "../../utils/cn";
import { EmptyLine, PANEL, PageHeader, RowButton, RowMenu, SearchBox } from "../ui/screen";

const COLS =
  "grid grid-cols-[minmax(240px,2.2fr)_minmax(138px,1.25fr)_minmax(128px,1.15fr)_minmax(134px,1.2fr)_minmax(195px,1.7fr)_194px] items-center px-[21px]";

type SortKey = "all" | "balance" | "paid" | "az";
const CHIPS: { key: SortKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "balance", label: "Balance" },
  { key: "paid", label: "Paid" },
  { key: "az", label: "A-Z" },
];

export const ReportsView: React.FC = () => {
  const { data: customers = [], isLoading } = useCustomers();
  const { data: profile } = useMerchantProfile();
  const setActiveModule = useAppStore((s) => s.setActiveModule);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("all");

  const totals = useMemo(() => {
    const added = customers.reduce((s, c) => s + c.totalDebt, 0);
    const paid = customers.reduce((s, c) => s + c.paid, 0);
    const balance = customers.reduce((s, c) => s + c.balance, 0);
    const paidPct = added > 0 ? Math.round((paid / added) * 100) : 0;
    return { added, paid, balance, paidPct, balancePct: added > 0 ? 100 - paidPct : 0 };
  }, [customers]);

  const pending = useMemo(() => customers.filter((c) => c.balance > 0), [customers]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = customers.filter(
      (c) => !q || c.name.toLowerCase().includes(q) || c.phone.includes(q)
    );
    if (sort === "balance") return [...list].sort((a, b) => b.balance - a.balance);
    if (sort === "paid") return [...list].sort((a, b) => b.paid - a.paid);
    if (sort === "az") return [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [customers, search, sort]);

  const shopName = profile?.shopName ?? "E-kaal";

  const exportCsv = () =>
    downloadCsv("deymaha-report.csv", [
      ["Customer", "Phone", "Added Amount", "Paid Amount", "Balance Owed", "Repayment %"],
      ...rows.map((c) => [
        c.name,
        c.phone,
        c.totalDebt.toFixed(2),
        c.paid.toFixed(2),
        c.balance.toFixed(2),
        c.totalDebt > 0 ? Math.round((c.paid / c.totalDebt) * 100) : 0,
      ]),
    ]);

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <PageHeader
        title="Deymaha Report & Reconciliation"
        subtitle={`${pluralize(customers.length, "Customer", "Customers")} • Financial Reconciliation`}
      />

      {/* Stat row */}
      <div className="flex gap-[18px] h-[122px] shrink-0">
        <div className={`${PANEL} rounded-[14px] flex-[586] min-w-0 px-[18px] pt-[11px]`}>
          <div className="flex items-center justify-between leading-[28px]">
            <span className="text-[20px] text-[#cfd6d1]">Total Added</span>
            <span className="text-[17px] text-[#6c7c72]">
              {pluralize(customers.length, "Deymaha record", "Deymaha records")}
            </span>
          </div>
          <div className="mt-[-2px] text-[34px] font-bold leading-[40px] text-[#f1f5f2]">
            {formatCurrency(totals.added)}
          </div>
          <div className="mt-[5px] h-[8px] flex gap-[4px]">
            {totals.added === 0 ? (
              <div className="w-full h-full rounded-full bg-[#2c322e]" />
            ) : (
              <>
                {totals.paidPct > 0 && (
                  <div style={{ width: `${totals.paidPct}%` }} className="h-full rounded-full bg-[#1faa5a]" />
                )}
                {totals.balancePct > 0 && (
                  <div style={{ width: `${totals.balancePct}%` }} className="h-full rounded-full bg-[#e0494f]" />
                )}
              </>
            )}
          </div>
          <div className="mt-[1px] flex justify-between text-[17px] leading-[24px]">
            <span className="text-[#1faa5a]">Paid {totals.paidPct}%</span>
            <span className="text-[#e0605f]">Balance {totals.balancePct}%</span>
          </div>
        </div>

        <div className={`${PANEL} rounded-[14px] flex-[238] min-w-0 px-[18px] pt-[11px]`}>
          <div className="flex items-center justify-between leading-[28px]">
            <span className="text-[20px] text-[#cfd6d1]">Paid</span>
            <CheckCircle2 className="w-[22px] h-[22px] text-[#1faa5a]" fill="#1faa5a" stroke="#141b13" />
          </div>
          <div className="mt-[2px] flex items-center gap-[10px] text-[34px] font-bold leading-[40px] text-[#f1f5f2]">
            {formatCurrency(totals.paid)}
            <ArrowUpRight className="w-[22px] h-[22px] text-[#1faa5a]" strokeWidth={2} />
          </div>
        </div>

        <div className={`${PANEL} rounded-[14px] flex-[239] min-w-0 px-[18px] pt-[11px]`}>
          <div className="flex items-center justify-between leading-[28px]">
            <span className="text-[20px] text-[#cfd6d1]">Balance</span>
            <AlertTriangle className="w-[22px] h-[22px] text-[#e0494f]" fill="#e0494f" stroke="#141b13" />
          </div>
          <div className="mt-[2px] flex items-center gap-[10px] text-[34px] font-bold leading-[40px] text-[#f1f5f2]">
            {formatCurrency(totals.balance)}
            <ArrowDownRight className="w-[22px] h-[22px] text-[#e0494f]" strokeWidth={2} />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className={`${PANEL} mt-[18px] h-[67px] shrink-0 px-[14px] flex items-center`}>
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Search customer or phone..."
          width={296}
          h={42}
          iconRight={false}
        />

        <div className="ml-[14px] flex items-center gap-[6px] shrink-0">
          {CHIPS.map((c) => (
            <button
              key={c.key}
              onClick={() => setSort(c.key)}
              className={cn(
                "h-[36px] px-[14px] rounded-full text-[16px] leading-none whitespace-nowrap shrink-0 transition-colors",
                sort === c.key
                  ? "border border-[#2f6d4a] bg-[#16301f] text-[#f1f5f2]"
                  : "border border-transparent text-[#9aa69f] hover:text-[#f1f5f2]"
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-[10px] shrink-0">
          <button
            onClick={exportCsv}
            className="h-[40px] px-[14px] rounded-[9px] border border-[#2c3a31] text-[16px] text-[#f1f5f2] inline-flex items-center gap-[8px] hover:bg-[#1a231b] whitespace-nowrap shrink-0"
          >
            <Download className="w-[18px] h-[18px]" strokeWidth={1.6} />
            Export Report
          </button>
          <button
            onClick={() => printInvoices(pending, shopName)}
            disabled={pending.length === 0}
            className="h-[40px] px-[14px] rounded-[9px] bg-[#1faa5a] hover:bg-[#25b866] disabled:opacity-50 text-[16px] text-white inline-flex items-center gap-[8px] whitespace-nowrap shrink-0"
          >
            <Plus className="w-[18px] h-[18px]" strokeWidth={1.8} />
            Create
            <span className="h-[26px] px-[9px] rounded-full bg-black/25 text-[15px] inline-flex items-center">
              ({pending.length} Pending)
            </span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className={`${PANEL} mt-[18px] flex-1 min-h-[260px] flex flex-col overflow-hidden`}>
        <div className={`${COLS} h-[58px] shrink-0 border-b border-[#233026] text-[17px] text-[#cfd6d1] font-normal`}>
          <span>Customer Name</span>
          <span className="whitespace-nowrap">Added Amount</span>
          <span className="whitespace-nowrap">Paid Amount</span>
          <span className="whitespace-nowrap">Balance Owed</span>
          <span className="whitespace-nowrap">Repayment Progress</span>
          <span>Actions</span>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          {isLoading ? (
            <EmptyLine>Loading…</EmptyLine>
          ) : rows.length === 0 ? (
            <EmptyLine>No customers found</EmptyLine>
          ) : (
            rows.map((c) => {
              const pct = c.totalDebt > 0 ? Math.min(100, Math.round((c.paid / c.totalDebt) * 100)) : 0;
              return (
                <div
                  key={c._id}
                  className={`${COLS} h-[53px] border-b border-[#233026] text-[19px] text-[#f1f5f2]`}
                >
                  <span className="min-w-0 pr-[16px]">
                    <span className="block truncate leading-[22px]">{c.name}</span>
                    <span className="block text-[16px] leading-[20px] text-[#8a978f]">sub: {c.phone}</span>
                  </span>
                  <span>{formatCurrency(c.totalDebt)}</span>
                  <span>{formatCurrency(c.paid)}</span>
                  <span>{formatCurrency(c.balance)}</span>
                  <span className="pr-[22px]">
                    <span className="block h-[8px] rounded-full bg-[#2c322e] overflow-hidden">
                      <span style={{ width: `${pct}%` }} className="block h-full bg-[#1faa5a]" />
                    </span>
                    <span className="block text-right text-[16px] leading-[20px] text-[#8a978f]">{pct}%</span>
                  </span>
                  <span className="flex items-center gap-[8px] justify-end">
                    <RowButton
                      className="h-[34px] bg-[#1a201a]"
                      onClick={() => printInvoices([c], shopName)}
                    >
                      Generate Invoice
                    </RowButton>
                    <RowMenu
                      plain
                      items={[{ label: "Open in Deymaha", onClick: () => setActiveModule("deymaha") }]}
                    />
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsView;

