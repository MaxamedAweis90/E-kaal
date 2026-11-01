import React, { useState } from "react";
import { useProducts, useCreateProduct } from "../api/products";
import { formatCurrency, cn } from "../utils/cn";
import { Icons } from "../components/icons";

export const ProductsView: React.FC = () => {
  const { data, isLoading } = useProducts();
  const createProductMutation = useCreateProduct();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [barcode, setBarcode] = useState("");
  const [stockCount, setStockCount] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !unitCost || !sellingPrice) return;

    createProductMutation.mutate(
      {
        name,
        barcode: barcode || undefined,
        stockCount: stockCount ? parseInt(stockCount) : 0,
        unitCost: parseFloat(unitCost),
        sellingPrice: parseFloat(sellingPrice),
      },
      {
        onSuccess: () => {
          setIsAddModalOpen(false);
          setName("");
          setBarcode("");
          setStockCount("");
          setUnitCost("");
          setSellingPrice("");
        },
      }
    );
  };

  const metrics = data?.metrics || {
    totalProducts: 0,
    totalCostValuation: 0,
    totalSellingValuation: 0,
    potentialProfit: 0,
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-text">
            Products & Stock Inventory
          </h1>
          <p className="text-xs text-muted">
            Stock tracking, pricing matrices, and inventory gross margin audits.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 h-9 px-4 bg-primary hover:bg-accent text-black font-semibold text-xs rounded-btn transition-colors shadow-lg"
        >
          <Icons.Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Top Valuation Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-card p-4">
          <div className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">
            Total Products
          </div>
          <div className="text-2xl font-bold font-mono text-text">
            {metrics.totalProducts}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-card p-4">
          <div className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">
            Cost Valuation
          </div>
          <div className="text-2xl font-bold font-mono text-text">
            {formatCurrency(metrics.totalCostValuation)}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-card p-4">
          <div className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">
            Selling Valuation
          </div>
          <div className="text-2xl font-bold font-mono text-accent">
            {formatCurrency(metrics.totalSellingValuation)}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-card p-4">
          <div className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">
            Potential Gross Profit
          </div>
          <div className="text-2xl font-bold font-mono text-primary">
            {formatCurrency(metrics.potentialProfit)}
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-surface border border-border rounded-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-muted">Loading inventory items...</div>
        ) : !data || data.products.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted">No inventory products registered.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-bg-alt border-b border-border text-[11px] font-semibold text-muted uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Barcode / SKU</th>
                  <th className="py-3 px-4 text-center">In Stock</th>
                  <th className="py-3 px-4 text-right">Unit Cost</th>
                  <th className="py-3 px-4 text-right">Selling Price</th>
                  <th className="py-3 px-4 text-right">Gross Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.products.map((p) => {
                  const isMarginNegative = p.margin < 0;

                  return (
                    <tr key={p._id} className="hover:bg-surface-2/50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-text">{p.name}</td>
                      <td className="py-3 px-4 font-mono text-muted">{p.barcode || "—"}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-badge text-[10px] font-bold font-mono bg-surface-2 text-text border border-border">
                          {p.stockCount} units
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-muted">
                        {formatCurrency(p.unitCost)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-text">
                        {formatCurrency(p.sellingPrice)}
                      </td>
                      <td
                        className={cn(
                          "py-3 px-4 text-right font-mono font-bold",
                          isMarginNegative ? "text-out" : "text-primary"
                        )}
                      >
                        +{formatCurrency(p.margin)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-surface border border-border rounded-modal max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-sm font-bold text-text">Add Product to Inventory</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-muted hover:text-text"
              >
                <Icons.Close className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 mt-4">
              <div>
                <label className="text-[11px] font-medium text-muted block mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Biyo Dizaani 1.5L"
                  className="w-full h-9 px-3 bg-bg border border-border rounded-btn text-xs text-text focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted block mb-1">
                  Barcode / SKU (Optional)
                </label>
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="e.g. 600123456789"
                  className="w-full h-9 px-3 bg-bg border border-border rounded-btn text-xs text-text font-mono focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-muted block mb-1">
                    Stock Units
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stockCount}
                    onChange={(e) => setStockCount(e.target.value)}
                    placeholder="0"
                    className="w-full h-9 px-3 bg-bg border border-border rounded-btn text-xs text-text font-mono focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-muted block mb-1">
                    Cost Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={unitCost}
                    onChange={(e) => setUnitCost(e.target.value)}
                    placeholder="0.00"
                    className="w-full h-9 px-3 bg-bg border border-border rounded-btn text-xs text-text font-mono focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-muted block mb-1">
                    Selling Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full h-9 px-3 bg-bg border border-border rounded-btn text-xs text-text font-mono focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Computed Margin Preview */}
              {unitCost && sellingPrice && (
                <div className="p-3 bg-bg border border-border rounded-btn flex items-center justify-between text-xs">
                  <span className="text-muted">Estimated Margin per Unit:</span>
                  <span
                    className={cn(
                      "font-mono font-bold",
                      parseFloat(sellingPrice) >= parseFloat(unitCost)
                        ? "text-primary"
                        : "text-out"
                    )}
                  >
                    {formatCurrency(parseFloat(sellingPrice) - parseFloat(unitCost))}
                  </span>
                </div>
              )}

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
                  disabled={createProductMutation.isPending}
                  className="px-4 py-2 bg-primary hover:bg-accent text-black font-semibold text-xs rounded-btn transition-colors"
                >
                  {createProductMutation.isPending ? "Adding..." : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
