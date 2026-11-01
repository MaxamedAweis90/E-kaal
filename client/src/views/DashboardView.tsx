import React from "react";
import { useDashboardOverview } from "../api/dashboard";
import { formatCurrency } from "../utils/cn";
import { Icons } from "../components/icons";

export const DashboardView: React.FC = () => {
  const { data, isLoading } = useDashboardOverview();

  if (isLoading || !data) {
    return <div className="p-8 text-center text-xs text-muted">Loading merchant overview...</div>;
  }

  const { receivables, payables, topDebtors, subscription } = data;

  return (
    <div className="space-y-6">
      {/* Top Welcome & Subscription Alert */}
      {subscription && (
        <div className="bg-gradient-to-r from-surface to-surface-2 border border-border rounded-card p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-badge bg-primary-soft text-primary flex items-center justify-center border border-primary/20">
              <Icons.Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-text">
                Subscription Plan: {subscription.tier.replace("_", " ")}
              </div>
              <div className="text-[11px] text-muted">
                {subscription.remainingDays} days remaining until renewal.
              </div>
            </div>
          </div>
          <span className="px-3 py-1 bg-surface-2 border border-border text-primary rounded-badge text-xs font-semibold">
            Active
          </span>
        </div>
      )}

      {/* Top 4 Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-card p-5">
          <div className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">
            Total Customer Debt
          </div>
          <div className="text-2xl font-bold font-mono text-text">
            {formatCurrency(receivables.totalDebt)}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-card p-5">
          <div className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">
            Total Paid Back
          </div>
          <div className="text-2xl font-bold font-mono text-in">
            {formatCurrency(receivables.totalPaid)}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-card p-5">
          <div className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">
            Outstanding Balance
          </div>
          <div className="text-2xl font-bold font-mono text-out">
            {formatCurrency(receivables.netBalance)}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-card p-5">
          <div className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">
            Vendor Payables Owed
          </div>
          <div className="text-2xl font-bold font-mono text-warning">
            {formatCurrency(payables.totalOwed)}
          </div>
        </div>
      </div>

      {/* Dual Ledger Summary Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface border border-border rounded-card p-5 space-y-3">
          <h3 className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-2">
            <Icons.Deymaha className="w-4 h-4 text-primary" />
            Customer Receivables (Deymaha)
          </h3>
          <div className="flex items-center justify-between text-xs text-muted pt-2 border-t border-border">
            <span>Active Debtor Accounts:</span>
            <span className="font-mono text-text font-bold">{receivables.activeCustomerCount}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted">
            <span>Payment Progress:</span>
            <span className="font-mono text-in font-bold">{receivables.paidPercentage}%</span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-2 bg-bg-alt rounded-full overflow-hidden flex">
            <div
              className="bg-in h-full transition-all duration-500"
              style={{ width: `${receivables.paidPercentage}%` }}
            />
            <div
              className="bg-out h-full transition-all duration-500"
              style={{ width: `${receivables.balancePercentage}%` }}
            />
          </div>
        </div>

        <div className="bg-surface border border-border rounded-card p-5 space-y-3">
          <h3 className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-2">
            <Icons.Vendor className="w-4 h-4 text-warning" />
            Vendor Payables (Suppliers)
          </h3>
          <div className="flex items-center justify-between text-xs text-muted pt-2 border-t border-border">
            <span>Commercial Suppliers:</span>
            <span className="font-mono text-text font-bold">{payables.activeVendorCount}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted">
            <span>Total Outstanding Debt:</span>
            <span className="font-mono text-warning font-bold">
              {formatCurrency(payables.totalOwed)}
            </span>
          </div>
        </div>
      </div>

      {/* Top Delinquent Accounts List */}
      <div className="bg-surface border border-border rounded-card p-5 space-y-4">
        <h3 className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-2">
          <Icons.Warning className="w-4 h-4 text-out" />
          Top Delinquent Accounts
        </h3>

        {topDebtors.length === 0 ? (
          <div className="text-xs text-muted py-4 text-center">No outstanding debts found.</div>
        ) : (
          <div className="divide-y divide-border">
            {topDebtors.map((d) => (
              <div key={d._id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-text">{d.name}</div>
                  <div className="text-[11px] text-muted font-mono">{d.phone}</div>
                </div>
                <div className="text-right font-mono">
                  <div className="font-bold text-out">{formatCurrency(d.balance)}</div>
                  <div className="text-[10px] text-muted">{d.shareOfTotal}% of total debt</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
