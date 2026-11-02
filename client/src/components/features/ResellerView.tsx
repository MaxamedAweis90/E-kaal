import React, { useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useProviders, useResellerHistory, useResellerTransact } from "../../hooks/useLedgers";
import { formatCurrency } from "../../utils/cn";
import { errorMessage, pluralize, round2 } from "../../utils/format";
import type { ProviderId } from "../../types";
import {
  EmptyLine,
  HEAD_TEXT,
  PANEL,
  PageHeader,
  PrimaryButton,
  SearchBox,
  StatusPill,
  inputClass,
} from "../ui/screen";

const COLS =
  "grid grid-cols-[minmax(98px,1fr)_minmax(156px,1.55fr)_minmax(88px,0.9fr)_minmax(86px,0.9fr)_minmax(94px,0.95fr)_118px] items-center px-[22px]";

const SHORT_NAME: Record<ProviderId, string> = {
  HORMUUD: "Hormuud",
  SOMTEL: "Somtel",
  TELESOM: "Telesom",
};

const STATUS_LABEL = { COMPLETED: "Completed", PENDING: "Pending", FAILED: "Failed" } as const;
const STATUS_TONE = { COMPLETED: "completed", PENDING: "pending", FAILED: "failed" } as const;

export const ResellerView: React.FC = () => {
  const { data: providers = [] } = useProviders();
  const { data: history = [], isLoading } = useResellerHistory();
  const transact = useResellerTransact();

  const [provider, setProvider] = useState<ProviderId>("HORMUUD");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  const rate = providers.find((p) => p.id === provider)?.commissionRate ?? 0.17;
  const base = parseFloat(amount) || 0;
  const profit = round2(base * rate);
  const net = round2(base + profit);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return history;
    return history.filter(
      (h) =>
        h.recipientPhone.includes(q) || SHORT_NAME[h.provider].toLowerCase().includes(q)
    );
  }, [history, search]);

  const canSend = phone.trim().length > 0 && base > 0 && !transact.isPending;

  const send = () => {
    setNotice(null);
    transact.mutate(
      { provider, recipientPhone: phone.trim(), amount: base },
      {
        onSuccess: () => {
          setNotice({ ok: true, text: "Top-up sent" });
          setPhone("");
          setAmount("");
        },
        onError: (err) => setNotice({ ok: false, text: errorMessage(err) }),
      }
    );
  };

  const label = "block text-[18px] leading-[24px] text-[#cfd6d1]";

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <PageHeader
        gapAfter={22}
        title="Reseller (Telecom & Utility Terminal)"
        subtitle="Telecom & UT Transits"
        actions={
          <>
            <PrimaryButton className="px-[15px]" onClick={() => phoneRef.current?.focus()}>
              New Dispatch
            </PrimaryButton>
            <SearchBox
              value={search}
              onChange={setSearch}
              placeholder="Search dispatches or phone..."
              width={312}
            />
          </>
        }
      />

      <div className="flex-1 min-h-0 flex gap-[27px]">
        {/* New Top-up */}
        <div className={`${PANEL} w-[358px] shrink-0 p-[23px] flex flex-col`}>
          <h2 className="text-[24px] font-medium leading-[30px] text-[#f1f5f2]">New Top-up</h2>

          <span className={`${label} mt-[13px]`}>Provider</span>
          <div className="relative mt-[5px]">
            <span className="absolute left-[10px] top-1/2 -translate-y-1/2 w-[26px] h-[26px] rounded-full bg-[#1faa5a] text-white text-[15px] font-semibold flex items-center justify-center pointer-events-none">
              {SHORT_NAME[provider][0]}
            </span>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as ProviderId)}
              className={`${inputClass} h-[43px] appearance-none pl-[46px] pr-[36px] cursor-pointer`}
            >
              {(providers.length
                ? providers.map((p) => p.id)
                : (["HORMUUD", "SOMTEL", "TELESOM"] as ProviderId[])
              ).map((id) => (
                <option key={id} value={id} className="bg-[#141b13]">
                  {SHORT_NAME[id]}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-[12px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#b6c0b9] pointer-events-none" />
          </div>

          <span className={`${label} mt-[11px]`}>Recipient Phone</span>
          <input
            ref={phoneRef}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/[^0-9+]/g, ""))}
            inputMode="tel"
            className={`${inputClass} mt-[5px]`}
          />

          <span className={`${label} mt-[12px]`}>Enter Payment Amount</span>
          <input
            value={amount ? `$${amount}` : ""}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
            onBlur={() => base > 0 && setAmount(base.toFixed(2))}
            placeholder="$0.00"
            inputMode="decimal"
            className={`${inputClass} mt-[5px]`}
          />

          <div className="mt-[18px] h-[116px] rounded-[12px] border border-[#2c3a31] bg-[#101610] px-[14px] py-[11px] flex flex-col justify-between">
            <div>
              <div className="flex justify-between text-[20px] leading-[28px] text-[#cfd6d1]">
                <span>Base Amount:</span>
                <span className="text-[#f1f5f2]">{formatCurrency(base)}</span>
              </div>
              <div className="flex justify-between text-[20px] leading-[28px] text-[#54a376]">
                <span>Earning Profit:</span>
                <span>+{formatCurrency(profit)}</span>
              </div>
            </div>
            <div className="border-t border-[#2c3a31] pt-[6px] flex justify-between text-[24px] leading-[32px] font-semibold text-[#f1f5f2]">
              <span>Net Amount:</span>
              <span>{formatCurrency(net)}</span>
            </div>
          </div>

          <button
            onClick={send}
            disabled={!canSend}
            className="mt-[16px] h-[51px] rounded-[10px] bg-[#1faa5a] hover:bg-[#25b866] disabled:opacity-50 text-[20px] text-white transition-colors"
          >
            {transact.isPending ? "Sending…" : "Send Top-up"}
          </button>

          {notice && (
            <p
              className={`mt-[6px] text-[15px] leading-[20px] ${notice.ok ? "text-[#54a376]" : "text-[#e0605f]"}`}
            >
              {notice.text}
            </p>
          )}
        </div>

        {/* Recent Resale Dispatches */}
        <div className={`${PANEL} flex-1 min-w-0 flex flex-col overflow-hidden`}>
          <div className="h-[76px] shrink-0 px-[22px] flex items-center gap-[12px] border-b border-[#233026]">
            <h2 className="text-[24px] font-medium leading-[30px] text-[#f1f5f2] whitespace-nowrap">
              Recent Resale Dispatches
            </h2>
            <span className="h-[32px] px-[10px] rounded-[9px] bg-[#1c241d] text-[16px] text-[#cfd6d1] inline-flex items-center whitespace-nowrap">
              {pluralize(history.length, "record", "records")}
            </span>
          </div>

          <div className={`${COLS} h-[65px] shrink-0 border-b border-[#233026] ${HEAD_TEXT}`}>
            <span>Provider</span>
            <span className="whitespace-nowrap">Recipient Phone</span>
            <span>Amount</span>
            <span>Profit</span>
            <span className="whitespace-nowrap">Net Total</span>
            <span>Status</span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto">
            {isLoading ? (
              <EmptyLine>Loading…</EmptyLine>
            ) : rows.length === 0 ? (
              <EmptyLine>No dispatches yet</EmptyLine>
            ) : (
              rows.map((h) => (
                <div
                  key={h._id}
                  className={`${COLS} h-[66px] border-b border-[#233026] text-[20px] text-[#f1f5f2]`}
                >
                  <span>{SHORT_NAME[h.provider]}</span>
                  <span>{h.recipientPhone}</span>
                  <span>{formatCurrency(h.amount)}</span>
                  <span className="text-[#54a376]">+{formatCurrency(h.earningProfit)}</span>
                  <span>{formatCurrency(h.netAmount)}</span>
                  <span>
                    <StatusPill compact tone={STATUS_TONE[h.status]}>
                      {STATUS_LABEL[h.status]}
                    </StatusPill>
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResellerView;

