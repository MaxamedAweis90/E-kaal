import React from "react";
import { useResellerStore, ResellerProviderId } from "../store/useResellerStore";
import { useResellerProviders, useResellerHistory, useResellerTransact } from "../api/reseller";
import { formatCurrency, cn } from "../utils/cn";
import { Icons } from "../components/icons";

export const ResellerView: React.FC = () => {
  const {
    provider,
    amount,
    recipientPhone,
    earningProfit,
    netAmount,
    setProvider,
    setAmount,
    setRecipientPhone,
    resetForm,
  } = useResellerStore();

  const { data: providersData } = useResellerProviders();
  const { data: history, isLoading: isHistoryLoading } = useResellerHistory();
  const transactMutation = useResellerTransact();

  const availableProviders = (providersData?.map((p) => p.id) || [
    "HORMUUD",
    "SOMTEL",
    "TELESOM",
  ]) as ResellerProviderId[];

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientPhone || amount <= 0) return;

    transactMutation.mutate(
      {
        provider,
        recipientPhone,
        amount,
        earningProfit,
      },
      {
        onSuccess: () => {
          resetForm();
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-text">
          Reseller Terminal (Utility & Airtime Resale)
        </h1>
        <p className="text-xs text-muted">
          Fast commission calculation and digital top-up dispatch for local telecom providers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Pane: Dispatch Form & Real-time Calculation Readout */}
        <div className="lg:col-span-5 bg-surface border border-border rounded-card p-6 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <Icons.Reseller className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-text uppercase tracking-wider">
              Airtime & Data Dispatch
            </h2>
          </div>

          <form onSubmit={handleDispatch} className="space-y-4">
            {/* Service Provider Selection */}
            <div>
              <label className="text-[11px] font-semibold text-muted block mb-1.5 uppercase tracking-wider">
                Telecom Provider
              </label>
              <div className="grid grid-cols-3 gap-2">
                {availableProviders.map((p) => {
                  const isSelected = provider === p;
                  return (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setProvider(p)}
                      className={cn(
                        "py-2.5 px-3 rounded-btn text-xs font-bold border transition-all text-center",
                        isSelected
                          ? "bg-primary text-black border-primary shadow-md"
                          : "bg-surface-2 text-text border-border hover:bg-border"
                      )}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recipient Target Phone */}
            <div>
              <label className="text-[11px] font-semibold text-muted block mb-1.5 uppercase tracking-wider">
                Recipient Target Phone
              </label>
              <input
                type="text"
                required
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                placeholder="e.g. 614888881"
                className="w-full h-10 px-3 bg-bg border border-border rounded-btn text-xs font-mono text-text placeholder:text-muted/60 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Numerical Amount */}
            <div>
              <label className="text-[11px] font-semibold text-muted block mb-1.5 uppercase tracking-wider">
                Principal Amount ($)
              </label>
              <input
                type="number"
                step="1"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                placeholder="100.00"
                className="w-full h-10 px-3 bg-bg border border-border rounded-btn text-sm font-mono font-bold text-text focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Real-time Calculation Readout */}
            <div className="bg-bg border border-border rounded-btn p-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs text-muted">
                <span>Principal Face Value:</span>
                <span className="font-mono text-text font-semibold">{formatCurrency(amount)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted">
                <span>Earning Profit (17% Fixed Tier):</span>
                <span className="font-mono text-primary font-bold">
                  +{formatCurrency(earningProfit)}
                </span>
              </div>
              <div className="pt-2 border-t border-border flex items-center justify-between text-sm font-bold text-text">
                <span>Computed Net Amount:</span>
                <span className="font-mono text-accent text-base">{formatCurrency(netAmount)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={transactMutation.isPending || !recipientPhone || amount <= 0}
              className="w-full h-11 bg-primary hover:bg-accent text-black font-extrabold text-xs rounded-btn uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              <Icons.Send className="w-4 h-4" />
              <span>{transactMutation.isPending ? "Dispatching..." : "Execute Top-Up"}</span>
            </button>
          </form>
        </div>

        {/* Right Pane: Live Activity Log */}
        <div className="lg:col-span-7 bg-surface border border-border rounded-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Icons.Clock className="w-4 h-4 text-muted" />
              <h2 className="text-sm font-bold text-text uppercase tracking-wider">
                Recent Reseller Dispatches
              </h2>
            </div>
            <span className="text-[11px] font-mono text-muted">Live Stream</span>
          </div>

          {isHistoryLoading ? (
            <div className="p-8 text-center text-xs text-muted">Loading dispatch history...</div>
          ) : !history || history.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted">
              No reseller dispatches recorded yet.
            </div>
          ) : (
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {history.map((item) => (
                <div
                  key={item._id}
                  className="bg-bg border border-border rounded-btn p-3 flex items-center justify-between hover:bg-surface-2/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-badge bg-primary-soft border border-primary/20 flex items-center justify-center font-bold text-xs text-primary">
                      {item.provider.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-text">
                        {item.provider} • {item.recipientPhone}
                      </div>
                      <div className="text-[10px] text-muted font-mono">
                        {new Date(item.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <div className="text-xs font-bold text-accent">
                      {formatCurrency(item.netAmount)}
                    </div>
                    <div className="text-[10px] text-primary">
                      Profit: +{formatCurrency(item.earningProfit)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
