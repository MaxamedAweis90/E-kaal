import React, { useState } from "react";
import { useCustomers, useCreateCustomer, useRecordCustomerTransaction } from "../api/customers";
import { Icons } from "../components/icons";
import { formatCurrency, cn } from "../utils/cn";
import { Customer } from "../types";

export const DeymahaView: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [txType, setTxType] = useState<"DEBT_ADD" | "DEBT_PAYMENT">("DEBT_ADD");
  const [txAmount, setTxAmount] = useState<string>("");
  const [txNote, setTxNote] = useState<string>("");

  // New Customer Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newCreditLimit, setNewCreditLimit] = useState("");

  const { data: customers, isLoading } = useCustomers({
    search,
    status: filterStatus === "ALL" ? undefined : filterStatus,
  });

  const createCustomerMutation = useCreateCustomer();
  const recordTransactionMutation = useRecordCustomerTransaction();

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) return;

    createCustomerMutation.mutate(
      {
        name: newName,
        phone: newPhone,
        creditLimit: newCreditLimit ? parseFloat(newCreditLimit) : 0,
      },
      {
        onSuccess: () => {
          setIsAddModalOpen(false);
          setNewName("");
          setNewPhone("");
          setNewCreditLimit("");
        },
      }
    );
  };

  const handleRecordTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !txAmount || parseFloat(txAmount) <= 0) return;

    recordTransactionMutation.mutate(
      {
        customerId: selectedCustomer._id,
        type: txType,
        amount: parseFloat(txAmount),
        note: txNote,
      },
      {
        onSuccess: () => {
          setSelectedCustomer(null);
          setTxAmount("");
          setTxNote("");
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-text">
            Deymaha (Customer Receivables)
          </h1>
          <p className="text-xs text-muted">
            Dual single-entry customer ledger tracking credits, installments, and delinquency thresholds.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 h-9 px-4 bg-primary hover:bg-accent text-black font-semibold text-xs rounded-btn transition-colors shadow-lg"
        >
          <Icons.Plus className="w-4 h-4" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Toolbar & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface p-3 border border-border rounded-card">
        <div className="relative max-w-xs w-full">
          <Icons.Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name or phone..."
            className="w-full h-8 pl-8 pr-3 bg-bg border border-border rounded-btn text-xs text-text placeholder:text-muted/60 focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-center">
          {["ALL", "OWING", "CLEARED", "OVER_LIMIT"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={cn(
                "px-3 py-1.5 rounded-badge text-[11px] font-semibold transition-colors",
                filterStatus === status
                  ? "bg-primary text-black"
                  : "bg-surface-2 text-muted hover:text-text"
              )}
            >
              {status.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Data Table */}
      <div className="bg-surface border border-border rounded-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-muted">Loading customer ledger...</div>
        ) : !customers || customers.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted">
            No customer accounts found matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-bg-alt border-b border-border text-[11px] font-semibold text-muted uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4 text-right">Credit Limit</th>
                  <th className="py-3 px-4 text-right">Total Debt</th>
                  <th className="py-3 px-4 text-right">Paid</th>
                  <th className="py-3 px-4 text-right">Balance Owed</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {customers.map((c) => {
                  const isOver = c.creditLimit > 0 && c.balance > c.creditLimit;
                  const isCleared = c.balance === 0;

                  return (
                    <tr key={c._id} className="hover:bg-surface-2/50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-text flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-surface-2 border border-border flex items-center justify-center text-xs font-bold text-primary">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <span>{c.name}</span>
                      </td>
                      <td className="py-3 px-4 text-muted font-mono">{c.phone}</td>
                      <td className="py-3 px-4 text-right font-mono text-muted">
                        {formatCurrency(c.creditLimit)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-text">
                        {formatCurrency(c.totalDebt)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-in">
                        {formatCurrency(c.paid)}
                      </td>
                      <td
                        className={cn(
                          "py-3 px-4 text-right font-mono font-bold",
                          isCleared ? "text-in" : isOver ? "text-out" : "text-out"
                        )}
                      >
                        {formatCurrency(c.balance)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={cn(
                            "inline-block px-2.5 py-0.5 rounded-badge text-[10px] font-bold uppercase tracking-wider",
                            isCleared
                              ? "bg-in/10 text-in border border-in/20"
                              : isOver
                              ? "bg-[#2b1212] text-out border border-out/30 animate-pulse"
                              : "bg-[#241717] text-out border border-out/20"
                          )}
                        >
                          {isCleared ? "CLEARED" : isOver ? "OVER LIMIT" : "OWING"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedCustomer(c);
                              setTxType("DEBT_ADD");
                            }}
                            className="px-2 py-1 bg-surface-2 hover:bg-border text-text rounded-btn text-[11px] font-semibold transition-colors"
                          >
                            Add Debt
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCustomer(c);
                              setTxType("DEBT_PAYMENT");
                            }}
                            className="px-2 py-1 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-btn text-[11px] font-semibold transition-colors"
                          >
                            Pay
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-surface border border-border rounded-modal max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-sm font-bold text-text">
                {txType === "DEBT_ADD" ? "Add Customer Debt" : "Log Debt Payment"}
              </h3>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-muted hover:text-text"
              >
                <Icons.Close className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordTransaction} className="space-y-4 mt-4">
              <div>
                <label className="text-[11px] font-medium text-muted block mb-1">
                  Customer
                </label>
                <div className="text-xs font-semibold text-text bg-bg p-2.5 rounded-btn border border-border">
                  {selectedCustomer.name} ({selectedCustomer.phone})
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted block mb-1">
                  Current Balance
                </label>
                <div className="text-xs font-mono font-bold text-out bg-bg p-2.5 rounded-btn border border-border">
                  {formatCurrency(selectedCustomer.balance)}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted block mb-1">
                  Amount (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full h-9 px-3 bg-bg border border-border rounded-btn text-xs text-text font-mono focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted block mb-1">
                  Note / Receipt (Optional)
                </label>
                <input
                  type="text"
                  value={txNote}
                  onChange={(e) => setTxNote(e.target.value)}
                  placeholder="e.g. Invoice #1234 or EVC Ref"
                  className="w-full h-9 px-3 bg-bg border border-border rounded-btn text-xs text-text focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  className="px-4 py-2 bg-surface-2 hover:bg-border text-muted hover:text-text text-xs rounded-btn transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recordTransactionMutation.isPending}
                  className="px-4 py-2 bg-primary hover:bg-accent text-black font-semibold text-xs rounded-btn transition-colors"
                >
                  {recordTransactionMutation.isPending ? "Recording..." : "Confirm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-surface border border-border rounded-modal max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-sm font-bold text-text">Register New Customer</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-muted hover:text-text"
              >
                <Icons.Close className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-4 mt-4">
              <div>
                <label className="text-[11px] font-medium text-muted block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Abdikafi Mohamed Warsame"
                  className="w-full h-9 px-3 bg-bg border border-border rounded-btn text-xs text-text focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted block mb-1">
                  Phone (Somali Format)
                </label>
                <input
                  type="text"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="e.g. 612121112"
                  className="w-full h-9 px-3 bg-bg border border-border rounded-btn text-xs text-text font-mono focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted block mb-1">
                  Credit Limit (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newCreditLimit}
                  onChange={(e) => setNewCreditLimit(e.target.value)}
                  placeholder="0.00"
                  className="w-full h-9 px-3 bg-bg border border-border rounded-btn text-xs text-text font-mono focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-surface-2 hover:bg-border text-muted hover:text-text text-xs rounded-btn transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createCustomerMutation.isPending}
                  className="px-4 py-2 bg-primary hover:bg-accent text-black font-semibold text-xs rounded-btn transition-colors"
                >
                  {createCustomerMutation.isPending ? "Creating..." : "Save Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
