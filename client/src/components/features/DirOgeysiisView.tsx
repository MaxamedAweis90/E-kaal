import React, { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useCustomers, useMerchantProfile, useSendBroadcast } from "../../hooks/useLedgers";
import { formatCurrency } from "../../utils/cn";
import { errorMessage, plainMoney, pluralize } from "../../utils/format";
import { Avatar, Checkbox, EmptyLine, PANEL, PageHeader } from "../ui/screen";

const COLS =
  "grid grid-cols-[minmax(250px,2.1fr)_minmax(130px,1.1fr)_minmax(165px,1.4fr)_24px] items-center px-[22px]";
const SMS_UNIT_COST = 0.05;
const MAX_SMS_LENGTH = 125;

export const DirOgeysiisView: React.FC = () => {
  const { data: customers = [], isLoading } = useCustomers();
  const { data: profile } = useMerchantProfile();
  const sendBroadcast = useSendBroadcast();

  const [message, setMessage] = useState("");
  const [addBalance, setAddBalance] = useState(false);
  const [addStoreName, setAddStoreName] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  const visibleCustomers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q)
    );
  }, [customers, search]);

  const selectedCustomers = useMemo(
    () => customers.filter((c) => selectedIds.has(c._id)),
    [customers, selectedIds]
  );

  const composeFor = (balance: number): string => {
    const base = message.trim();
    if (!base) return "";
    const balPart = addBalance ? ` (${plainMoney(balance)})` : "";
    const shopPart = addStoreName && profile?.shopName ? ` - ${profile.shopName}` : "";
    return `${base}${balPart}${shopPart}`;
  };

  const effectiveLength = useMemo(() => {
    if (!message.trim()) return 0;
    if (selectedCustomers.length === 0) return composeFor(0).length;
    return Math.max(...selectedCustomers.map((c) => composeFor(c.balance).length));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message, addBalance, addStoreName, profile?.shopName, selectedCustomers]);

  const allVisibleSelected =
    visibleCustomers.length > 0 && visibleCustomers.every((c) => selectedIds.has(c._id));

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllVisible = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        visibleCustomers.forEach((c) => next.delete(c._id));
      } else {
        visibleCustomers.forEach((c) => next.add(c._id));
      }
      return next;
    });
  };

  const selectOverLimit = () => {
    const overIds = customers
      .filter((c) => c.creditLimit > 0 && c.balance > c.creditLimit)
      .map((c) => c._id);
    setSelectedIds(new Set(overIds));
    if (overIds.length === 0) {
      setNotice({ ok: false, text: "No over-limit balances found" });
    } else {
      setNotice(null);
    }
  };

  const canSend =
    message.trim().length > 0 &&
    selectedCustomers.length > 0 &&
    effectiveLength <= MAX_SMS_LENGTH &&
    !sending;

  const handleSend = async () => {
    if (!canSend) return;
    setSending(true);
    setNotice(null);
    try {
      if (addBalance) {
        await Promise.all(
          selectedCustomers.map((c) =>
            sendBroadcast.mutateAsync({
              message: composeFor(c.balance).slice(0, MAX_SMS_LENGTH),
              recipientIds: [c._id],
            })
          )
        );
      } else {
        await sendBroadcast.mutateAsync({
          message: composeFor(0).slice(0, MAX_SMS_LENGTH),
          recipientIds: selectedCustomers.map((c) => c._id),
        });
      }
      setNotice({
        ok: true,
        text: `Sent to ${pluralize(selectedCustomers.length, "recipient", "recipients")}`,
      });
      setMessage("");
      setSelectedIds(new Set());
    } catch (err) {
      setNotice({ ok: false, text: errorMessage(err) });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <PageHeader
        title="Dir Ogeysiis (SMS Broadcast Console)"
        subtitle={`${pluralize(customers.length, "Customer", "Customers")} • Broadcast messages`}
      />

      <div className="flex-1 min-h-0 flex gap-[24px]">
        {/* Compose Message */}
        <div className={`${PANEL} w-[395px] shrink-0 flex flex-col overflow-hidden`}>
          <div className="h-[65px] shrink-0 px-[22px] flex items-center border-b border-[#233026]">
            <h2 className="text-[24px] font-medium leading-[30px] text-[#f1f5f2]">
              Compose Message
            </h2>
          </div>

          <div className="px-[22px] pt-[21px] pb-[20px] flex-1 min-h-0 flex flex-col">
            <textarea
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (notice) setNotice(null);
              }}
              maxLength={MAX_SMS_LENGTH}
              placeholder="Macaamil, fadlan iska bixi deynta lagugu leeyahay si adeeggu kuugu socdo. Mahadsanid."
              className="w-full flex-1 min-h-[150px] rounded-[8px] bg-[#161a19] border border-[#2c3a31] px-[14px] py-[12px] text-[18px] leading-[26px] text-[#f1f5f2] placeholder:text-[#6c7c72] resize-y focus:outline-none focus:border-[#2e5a40]"
            />

            <div
              className={`mt-[8px] shrink-0 text-right text-[16px] leading-[22px] ${
                effectiveLength > MAX_SMS_LENGTH ? "text-[#e0605f]" : "text-[#8a978f]"
              }`}
            >
              {effectiveLength} / {MAX_SMS_LENGTH} characters
            </div>

            <div className="mt-[14px] py-[16px] space-y-[14px] border-y border-[#233026] shrink-0">
              <div
                onClick={() => setAddBalance((v) => !v)}
                className="flex items-center justify-between cursor-pointer select-none"
              >
                <span className="text-[18px] leading-[24px] text-[#f1f5f2]">
                  Add Debt Balance to message
                </span>
                <span onClick={(e) => e.stopPropagation()}>
                  <Checkbox checked={addBalance} onChange={setAddBalance} size={24} />
                </span>
              </div>

              <div
                onClick={() => setAddStoreName((v) => !v)}
                className="flex items-center justify-between cursor-pointer select-none"
              >
                <span className="text-[18px] leading-[24px] text-[#f1f5f2]">Add Store Name</span>
                <span onClick={(e) => e.stopPropagation()}>
                  <Checkbox checked={addStoreName} onChange={setAddStoreName} size={24} />
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSend}
              disabled={!canSend}
              className="mt-[20px] shrink-0 w-full h-[51px] rounded-[10px] bg-[#1faa5a] hover:bg-[#25b866] disabled:opacity-50 text-[20px] font-medium text-white transition-colors"
            >
              {sending ? "Sending…" : "Send Broadcast Message"}
            </button>

            <div className="mt-[12px] text-center text-[16px] leading-[22px] text-[#8a978f]">
              Estimated Cost: ${(selectedCustomers.length * SMS_UNIT_COST).toFixed(2)} for{" "}
              {pluralize(selectedCustomers.length, "recipient", "recipients")}
            </div>

            {notice && (
              <div
                className={`mt-[4px] text-center text-[15px] leading-[20px] ${
                  notice.ok ? "text-[#54a376]" : "text-[#e0605f]"
                }`}
              >
                {notice.text}
              </div>
            )}
          </div>
        </div>

        {/* Select Recipients */}
        <div className={`${PANEL} flex-1 min-w-0 flex flex-col overflow-hidden`}>
          <div className="h-[65px] shrink-0 px-[22px] flex items-center justify-between border-b border-[#233026]">
            <h2 className="text-[24px] font-medium leading-[30px] text-[#f1f5f2]">
              Select Recipients
            </h2>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or phone..."
              className="w-[283px] h-[43px] px-[16px] bg-[#161a19] border border-[#233026] rounded-[10px] text-[18px] text-[#f1f5f2] placeholder:text-[#7d8a82] focus:outline-none focus:border-[#2e5a40]"
            />
          </div>

          <div className="h-[52px] shrink-0 px-[22px] flex items-center justify-between border-b border-[#233026]">
            <div
              onClick={toggleAllVisible}
              className="flex items-center gap-[12px] cursor-pointer select-none"
            >
              <span onClick={(e) => e.stopPropagation()}>
                <Checkbox checked={allVisibleSelected} onChange={toggleAllVisible} size={24} />
              </span>
              <span className="text-[18px] text-[#f1f5f2]">
                Select all users ({selectedCustomers.length}/{customers.length} selected)
              </span>
            </div>

            <span className="h-[32px] px-[14px] rounded-full bg-[#1a241c] border border-[#2c3a31] text-[16px] text-[#9aa69f] inline-flex items-center">
              {customers.length}/Selected
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto">
            {isLoading ? (
              <EmptyLine>Loading…</EmptyLine>
            ) : visibleCustomers.length === 0 ? (
              <EmptyLine>No customers found</EmptyLine>
            ) : (
              visibleCustomers.map((c) => {
                const checked = selectedIds.has(c._id);
                const initial = (c.name.trim()[0] || "?").toUpperCase();
                return (
                  <div
                    key={c._id}
                    onClick={() => toggleOne(c._id)}
                    className={`${COLS} h-[52px] border-b border-[#233026] cursor-pointer select-none hover:bg-[#172017] transition-colors`}
                  >
                    <span className="flex items-center gap-[12px] min-w-0 pr-[10px]">
                      <Avatar size={34} muted={!checked}>
                        <span className="text-[17px] font-medium leading-none">{initial}</span>
                      </Avatar>
                      <span className="text-[20px] text-[#f1f5f2] truncate">{c.name}</span>
                    </span>
                    <span className="text-[19px] text-[#f1f5f2]">{c.phone}</span>
                    <span className="text-[19px] text-[#f1f5f2] text-right pr-[16px] whitespace-nowrap">
                      Balance: {formatCurrency(c.balance)}
                    </span>
                    <span onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={checked} onChange={() => toggleOne(c._id)} size={24} />
                    </span>
                  </div>
                );
              })
            )}
          </div>

          <div className="h-[64px] shrink-0 px-[22px] flex items-center justify-between border-t border-[#233026]">
            <span className="h-[34px] px-[15px] rounded-full bg-[#1a241c] border border-[#2c3a31] text-[17px] text-[#f1f5f2] inline-flex items-center">
              {selectedCustomers.length} Selected
            </span>

            <button
              type="button"
              onClick={selectOverLimit}
              className="text-[17px] inline-flex items-center gap-[5px] text-[#8a978f] hover:text-[#b6c0b9] transition-colors"
            >
              <span>Quick action:</span>
              <span className="text-[#54a376] inline-flex items-center gap-[2px]">
                Check all over-limit balances
                <ChevronRight className="w-[18px] h-[18px]" strokeWidth={1.8} />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirOgeysiisView;

