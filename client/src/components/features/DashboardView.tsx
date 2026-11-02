import React from "react";
import { useDashboardOverview } from "../../hooks/useDashboard";
import { useAppStore } from "../../store/useAppStore";
import { formatCurrency } from "../../utils/cn";
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  Store,
  FileText,
  Bell,
  ListChecks,
  Package,
} from "lucide-react";

const plainMoney = (n: number) => `$${n.toFixed(2)}`;

const PANEL = "bg-[#141b13] border border-[#233026] rounded-[16px]";

export const DashboardView: React.FC = () => {
  const { data, isLoading, isError } = useDashboardOverview();
  const setActiveModule = useAppStore((s) => s.setActiveModule);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-[21px] animate-pulse">
        <div className="grid grid-cols-4 gap-[20px]">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`${PANEL} h-[183px]`} />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-[21px]">
          <div className={`${PANEL} h-[425px]`} />
          <div className={`${PANEL} h-[425px]`} />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex-1 flex items-center justify-center text-[17px] text-[#6c7c72]">
        Unable to load dashboard
      </div>
    );
  }

  const { receivables, payables, topDebtors } = data;

  const kpiTitle =
    "flex items-center gap-[10px] text-[17px] text-[#9aa69f] leading-[24px]";
  const kpiValue = "text-[34px] font-medium leading-[44px] tracking-tight";
  const kpiSub = "text-[17px] text-[#6c7c72] leading-[24px]";
  const kpiCard = `${PANEL} h-[183px] shrink-0 px-[21px] pt-[32px] pb-[28px] flex flex-col justify-between`;

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-[21px]">
      {/* KPI row: 4 x (260 x 183), gap 20 */}
      <div className="grid grid-cols-4 gap-[20px] shrink-0">
        <div className={kpiCard}>
          <div className={kpiTitle}>
            <TrendingUp className="w-[22px] h-[22px]" strokeWidth={1.5} />
            <span>Total Debt</span>
          </div>
          <div className={`${kpiValue} text-[#f1f5f2]`}>
            {formatCurrency(receivables.totalDebt)}
          </div>
          <div className={kpiSub}>
            {receivables.activeCustomerCount}{" "}
            {receivables.activeCustomerCount === 1 ? "customer" : "customers"}
          </div>
        </div>

        <div className={kpiCard}>
          <div className={kpiTitle}>
            <CheckCircle2 className="w-[22px] h-[22px]" strokeWidth={1.5} />
            <span>Total Recovered</span>
          </div>
          <div className={`${kpiValue} text-[#54a376]`}>
            {formatCurrency(receivables.totalPaid)}
          </div>
          <div className="h-[24px]" />
        </div>

        <div className={kpiCard}>
          <div className={kpiTitle}>
            <Clock className="w-[22px] h-[22px]" strokeWidth={1.5} />
            <span>Remaining Balance</span>
          </div>
          <div className={`${kpiValue} text-[#e0605f]`}>
            {formatCurrency(receivables.netBalance)}
          </div>
          <div className="h-[24px]" />
        </div>

        <div className={kpiCard}>
          <div className={kpiTitle}>
            <Store className="w-[22px] h-[22px]" strokeWidth={1.5} />
            <span>Vendor Payables</span>
          </div>
          <div className={`${kpiValue} text-[#f1f5f2]`}>
            {formatCurrency(payables.totalOwed)}
          </div>
          <div className={kpiSub}>What you owe</div>
        </div>
      </div>

      {/* Lower panels: 2 x (539 x ~425), gap 21 */}
      <div className="grid grid-cols-2 gap-[21px] flex-1 min-h-[425px]">
        {/* LEFT: Active Ledgers + Quick Actions in one panel */}
        <div className={`${PANEL} flex flex-col overflow-hidden`}>
          <div className="px-[20px] pt-[22px] pb-[24px]">
            <h2 className="text-[21px] font-medium text-[#f1f5f2] leading-[30px] mb-[14px]">
              Active Ledgers
            </h2>
            <div className="grid grid-cols-2 gap-[18px]">
              <button
                onClick={() => setActiveModule("deymaha")}
                className="h-[141px] text-left rounded-[14px] bg-[#141b13] border border-[#233026] hover:border-[#2e4034] px-[19px] py-[18px] flex flex-col justify-between transition-colors"
              >
                <div className="flex items-start justify-between">
                  <span className="text-[20px] font-normal text-[#f1f5f2] leading-[28px]">
                    Deymaha
                  </span>
                  <span className="w-[38px] h-[38px] rounded-[9px] bg-[#16301f] flex items-center justify-center text-[#54a376]">
                    <FileText className="w-[20px] h-[20px]" strokeWidth={1.6} />
                  </span>
                </div>
                <div>
                  <div className="text-[28px] font-medium text-[#f1f5f2] leading-[36px]">
                    {formatCurrency(receivables.netBalance)}
                  </div>
                  <div className="text-[17px] text-[#6c7c72] leading-[24px]">
                    {receivables.activeCustomerCount}{" "}
                    {receivables.activeCustomerCount === 1 ? "record" : "records"}
                  </div>
                </div>
              </button>

              <button
                onClick={() => setActiveModule("vendor")}
                className="h-[141px] text-left rounded-[14px] bg-[#141b13] border border-[#233026] hover:border-[#2e4034] px-[19px] py-[18px] flex flex-col justify-between transition-colors"
              >
                <div className="flex items-start justify-between">
                  <span className="text-[20px] font-normal text-[#f1f5f2] leading-[28px]">
                    Vendor
                  </span>
                  <span className="w-[38px] h-[38px] rounded-[9px] bg-[#35191f] flex items-center justify-center text-[#d0686f]">
                    <Store className="w-[20px] h-[20px]" strokeWidth={1.6} />
                  </span>
                </div>
                <div>
                  <div className="text-[28px] font-medium text-[#f1f5f2] leading-[36px]">
                    {formatCurrency(payables.totalOwed)}
                  </div>
                  <div className="text-[17px] text-[#6c7c72] leading-[24px]">
                    What you owe
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="border-t border-[#233026]" />

          <div className="px-[20px] pt-[22px] pb-[20px] flex-1 flex flex-col">
            <h2 className="text-[21px] font-medium text-[#f1f5f2] leading-[30px] mb-[14px]">
              Quick Actions
            </h2>
            <div className="grid grid-cols-4 gap-[15px] flex-1 max-h-[102px]">
              {[
                {
                  label: "Reminders",
                  module: "deymaha" as const,
                  icon: (
                    <span className="relative">
                      <Bell className="w-[34px] h-[34px] text-[#e8a23a]" strokeWidth={1.4} />
                      <span className="absolute -top-[2px] -right-[2px] w-[11px] h-[11px] rounded-full bg-[#e0494f]" />
                    </span>
                  ),
                },
                {
                  label: "Dir Ogeysiis",
                  module: "dir-ogeysiis" as const,
                  icon: <ListChecks className="w-[34px] h-[34px] text-[#54a376]" strokeWidth={1.4} />,
                },
                {
                  label: "Invoices",
                  module: "invoices" as const,
                  icon: <FileText className="w-[34px] h-[34px] text-[#5b8def]" strokeWidth={1.4} />,
                },
                {
                  label: "Products",
                  module: "products" as const,
                  icon: <Package className="w-[34px] h-[34px] text-[#c36bd6]" strokeWidth={1.4} />,
                },
              ].map((a) => (
                <button
                  key={a.label}
                  onClick={() => setActiveModule(a.module)}
                  className="rounded-[14px] bg-[#141b13] border border-[#233026] hover:border-[#2e4034] flex flex-col items-center justify-center gap-[8px] transition-colors"
                >
                  {a.icon}
                  <span className="text-[17px] text-[#f1f5f2] leading-[24px]">{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Largest Balances */}
        <div className={`${PANEL} flex flex-col min-h-0 px-[20px] pt-[22px] pb-[20px]`}>
          <h2 className="text-[21px] font-medium text-[#f1f5f2] leading-[30px] mb-[14px]">
            Largest Balances
          </h2>
          <div className="flex-1 min-h-0 overflow-y-auto rounded-[14px] border border-[#233026] bg-[#121912]">
            {topDebtors.length === 0 ? (
              <div className="h-full flex items-center justify-center text-[17px] text-[#6c7c72]">
                No outstanding balances
              </div>
            ) : (
              topDebtors.map((d, i) => {
                const pct =
                  d.totalDebt > 0
                    ? Math.min(100, Math.round((d.paid / d.totalDebt) * 100))
                    : 0;
                return (
                  <button
                    key={d._id}
                    onClick={() => setActiveModule("deymaha")}
                    className="w-full text-left flex items-start gap-[16px] px-[20px] py-[20px] border-b border-[#233026] last:border-b-0 hover:bg-[#161e16] transition-colors"
                  >
                    <span className="w-[36px] h-[44px] rounded-[9px] bg-[#1c241d] flex items-center justify-center text-[17px] text-[#b6c0b9] shrink-0">
                      {i + 1}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="flex items-center justify-between gap-3">
                        <span className="text-[20px] text-[#f1f5f2] truncate leading-[28px]">
                          {d.name}
                        </span>
                        <span className="text-[23px] font-medium text-[#e0605f] leading-[28px] shrink-0">
                          {plainMoney(d.balance)}
                        </span>
                      </span>
                      <span className="block text-[16px] text-[#6c7c72] leading-[22px]">
                        {d.phone} • paid {plainMoney(d.paid)}
                      </span>
                      <span className="flex items-center gap-[12px] mt-[10px]">
                        <span className="flex-1 h-[7px] rounded-full bg-[#2c322e] overflow-hidden">
                          <span
                            style={{ width: `${pct}%` }}
                            className="block h-full rounded-full bg-[#54a376]"
                          />
                        </span>
                        <span className="text-[16px] text-[#9aa69f] w-[44px] text-right">
                          {pct}%
                        </span>
                      </span>
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
