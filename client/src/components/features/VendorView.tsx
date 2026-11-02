import React, { useMemo, useState } from "react";
import { Store } from "lucide-react";
import { useVendors, useCreateVendor, usePayVendor } from "../../hooks/useLedgers";
import { formatCurrency } from "../../utils/cn";
import { formatDate, pluralize } from "../../utils/format";
import type { Vendor } from "../../types";
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
  StatusPill,
} from "../ui/screen";
import { AmountDialog, DetailDialog, PartyDialog } from "./dialogs";

const COLS =
  "grid grid-cols-[minmax(230px,2.2fr)_minmax(128px,1.2fr)_minmax(202px,1.9fr)_minmax(106px,1fr)_minmax(112px,1.05fr)_238px] items-center px-[24px]";

export const VendorView: React.FC = () => {
  const { data: vendors = [], isLoading } = useVendors();
  const createVendor = useCreateVendor();
  const pay = usePayVendor();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("status");
  const [adding, setAdding] = useState(false);
  const [paying, setPaying] = useState<Vendor | null>(null);
  const [viewing, setViewing] = useState<Vendor | null>(null);

  const totalOwed = useMemo(() => vendors.reduce((s, v) => s + v.totalOwed, 0), [vendors]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = vendors.filter((v) => {
      if (q && !v.name.toLowerCase().includes(q) && !v.phone.includes(q)) return false;
      if (filter === "owing") return v.totalOwed > 0;
      if (filter === "settled") return v.totalOwed === 0;
      return true;
    });
    return [...list].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "recent") return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      return b.totalOwed - a.totalOwed;
    });
  }, [vendors, search, filter, sort]);

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <PageHeader
        title="Vendor (Supplier Ledger)"
        subtitle={`${pluralize(vendors.length, "Supplier", "Suppliers")} • Total Owed ${formatCurrency(totalOwed)}`}
        actions={
          <>
            <PrimaryButton onClick={() => setAdding(true)}>Add Vendor</PrimaryButton>
            <SearchBox
              value={search}
              onChange={setSearch}
              placeholder="Search by supplier name or phone..."
              width={374}
            />
          </>
        }
        filters={
          <>
            <SelectBox
              width={70}
              value={filter}
              onChange={setFilter}
              options={[
                { value: "all", label: "All" },
                { value: "owing", label: "Owing" },
                { value: "settled", label: "Settled" },
              ]}
            />
            <SelectBox
              width={104}
              value={sort}
              onChange={setSort}
              options={[
                { value: "status", label: "Status" },
                { value: "recent", label: "Recent" },
                { value: "name", label: "A–Z" },
              ]}
            />
          </>
        }
      />

      <div className={`${PANEL} flex-1 min-h-[320px] flex flex-col overflow-hidden`}>
        <div className={`${COLS} h-[48px] shrink-0 border-b border-[#233026] ${HEAD_TEXT}`}>
          <span>Supplier Name</span>
          <span>Phone</span>
          <span className="whitespace-nowrap">Last Transaction Date</span>
          <span>Status</span>
          <span>Total Owed</span>
          <span className="text-right">Actions</span>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          {isLoading ? (
            <EmptyLine>Loading…</EmptyLine>
          ) : rows.length === 0 ? (
            <EmptyLine>No suppliers found</EmptyLine>
          ) : (
            rows.map((v) => {
              const owing = v.totalOwed > 0;
              return (
                <div
                  key={v._id}
                  className={`${COLS} h-[66px] border-b border-[#233026] text-[20px] text-[#f1f5f2]`}
                >
                  <span className="flex items-center gap-[12px] min-w-0 pr-[16px]">
                    <Avatar>
                      <Store className="w-[22px] h-[22px]" strokeWidth={1.6} />
                    </Avatar>
                    <span className="truncate">{v.name}</span>
                  </span>
                  <span>{v.phone}</span>
                  <span>{formatDate(v.updatedAt)}</span>
                  <span>
                    <StatusPill tone={owing ? "owing" : "settled"}>
                      {owing ? "Owing" : "Settled"}
                    </StatusPill>
                  </span>
                  <span className={owing ? "text-[#e0605f]" : "text-[#4a554e]"}>
                    {formatCurrency(v.totalOwed)}
                  </span>
                  <span className="flex items-center gap-[8px] justify-end">
                    <RowButton onClick={() => setViewing(v)}>View</RowButton>
                    <RowButton tone="danger" disabled={!owing} onClick={() => setPaying(v)}>
                      Pay
                    </RowButton>
                    <RowMenu
                      label="Action"
                      items={[
                        { label: "Pay Vendor", onClick: () => owing && setPaying(v) },
                      ]}
                    />
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      <PartyDialog
        open={adding}
        title="Add Vendor"
        extraLabel="Initial Amount Owed"
        submitLabel="Add Vendor"
        pending={createVendor.isPending}
        error={createVendor.error}
        onClose={() => {
          setAdding(false);
          createVendor.reset();
        }}
        onSubmit={(v) =>
          createVendor.mutate(
            { name: v.name, phone: v.phone, totalOwed: v.extra },
            { onSuccess: () => setAdding(false) }
          )
        }
      />

      <AmountDialog
        open={!!paying}
        title="Pay Vendor"
        description={paying ? `${paying.name} • Owed ${formatCurrency(paying.totalOwed)}` : undefined}
        initialAmount={paying?.totalOwed}
        submitLabel="Pay"
        pending={pay.isPending}
        error={pay.error}
        onClose={() => {
          setPaying(null);
          pay.reset();
        }}
        onSubmit={(amount, note) =>
          paying &&
          pay.mutate({ id: paying._id, amount, note }, { onSuccess: () => setPaying(null) })
        }
      />

      <DetailDialog
        open={!!viewing}
        title={viewing?.name ?? ""}
        onClose={() => setViewing(null)}
        rows={
          viewing
            ? [
                { label: "Phone", value: viewing.phone },
                { label: "Status", value: viewing.totalOwed > 0 ? "Owing" : "Settled" },
                { label: "Total Owed", value: formatCurrency(viewing.totalOwed) },
                { label: "Last Transaction", value: formatDate(viewing.updatedAt) },
                { label: "Added", value: formatDate(viewing.createdAt) },
              ]
            : []
        }
      />
    </div>
  );
};

export default VendorView;

