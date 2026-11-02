import React, { useMemo, useState } from "react";
import { Package } from "lucide-react";
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "../../hooks/useLedgers";
import { formatCurrency } from "../../utils/cn";
import { pluralize } from "../../utils/format";
import type { Product } from "../../types";
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
  StatCard,
} from "../ui/screen";
import { AmountDialog, ConfirmDialog, DetailDialog, ProductDialog } from "./dialogs";

const COLS =
  "grid grid-cols-[minmax(250px,2.3fr)_minmax(126px,1.15fr)_minmax(114px,1fr)_minmax(130px,1.15fr)_minmax(96px,0.9fr)_254px] items-center px-[24px]";

const isBottleItem = (name: string) => /\b(saliid|oil|bottle|sharaab|soda|juice)\b/i.test(name);

const BottleGlyph: React.FC = () => (
  <svg viewBox="0 0 24 24" className="w-[22px] h-[22px]" fill="currentColor">
    <rect x="9.5" y="2.5" width="5" height="2.5" rx="1" />
    <path d="M9 6.5h6l1.8 3.2c.45.8.7 1.7.7 2.6v7.2A2.5 2.5 0 0 1 15 22H9a2.5 2.5 0 0 1-2.5-2.5v-7.2c0-.9.25-1.8.7-2.6L9 6.5Zm-.3 7h6.6v-2H8.7v2Z" />
  </svg>
);

export const ProductsView: React.FC = () => {
  const { data, isLoading } = useProducts();
  const create = useCreateProduct();
  const update = useUpdateProduct();
  const remove = useDeleteProduct();

  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState<{ product: Product | null } | null>(null);
  const [viewing, setViewing] = useState<Product | null>(null);
  const [stockOf, setStockOf] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);

  const products = data?.products ?? [];
  const metrics = data?.metrics;

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || (p.barcode ?? "").toLowerCase().includes(q)
    );
  }, [products, search]);

  const closeDialog = () => {
    setDialog(null);
    create.reset();
    update.reset();
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <PageHeader
        title="Products (Inventory & Margins)"
        subtitle={pluralize(metrics?.totalProducts ?? products.length, "Product", "Products")}
        actions={
          <>
            <PrimaryButton onClick={() => setDialog({ product: null })}>Add Product</PrimaryButton>
            <SearchBox
              value={search}
              onChange={setSearch}
              placeholder="Search by name or barcode..."
              width={374}
            />
          </>
        }
      />

      <div className="grid grid-cols-3 gap-[15px] shrink-0 mb-[22px]">
        <StatCard label="Total Products" value={String(metrics?.totalProducts ?? 0)} />
        <StatCard
          label="Total Cost"
          value={formatCurrency(metrics?.totalCostValuation ?? 0)}
          tone="red"
        />
        <StatCard
          label="Total Selling"
          value={formatCurrency(metrics?.totalSellingValuation ?? 0)}
          tone="green"
        />
      </div>

      <div className={`${PANEL} flex-1 min-h-[300px] flex flex-col overflow-hidden`}>
        <div className={`${COLS} h-[66px] shrink-0 border-b border-[#233026] ${HEAD_TEXT}`}>
          <span>Product Name</span>
          <span>Stock Count</span>
          <span>Unit Cost</span>
          <span>Selling Price</span>
          <span>Margin</span>
          <span className="text-right">Actions</span>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          {isLoading ? (
            <EmptyLine>Loading…</EmptyLine>
          ) : rows.length === 0 ? (
            <EmptyLine>No products found</EmptyLine>
          ) : (
            rows.map((p) => (
              <div
                key={p._id}
                className={`${COLS} h-[66px] border-b border-[#233026] text-[20px] text-[#f1f5f2]`}
              >
                <span className="flex items-center gap-[12px] min-w-0 pr-[16px]">
                  <Avatar>
                    {isBottleItem(p.name) ? (
                      <BottleGlyph />
                    ) : (
                      <Package className="w-[22px] h-[22px]" strokeWidth={1.8} />
                    )}
                  </Avatar>
                  <span className="truncate">{p.name}</span>
                </span>
                <span>{p.stockCount} item</span>
                <span>{formatCurrency(p.unitCost)}</span>
                <span>{formatCurrency(p.sellingPrice)}</span>
                <span className={p.margin >= 0 ? "text-[#54a376]" : "text-[#e0605f]"}>
                  {p.margin >= 0 ? "+" : "−"}
                  {formatCurrency(Math.abs(p.margin))}
                </span>
                <span className="flex items-center gap-[8px] justify-end">
                  <RowButton onClick={() => setViewing(p)}>View</RowButton>
                  <RowButton onClick={() => setDialog({ product: p })}>Edit</RowButton>
                  <RowButton onClick={() => setStockOf(p)}>Action</RowButton>
                  <RowMenu
                    items={[{ label: "Delete", danger: true, onClick: () => setDeleting(p) }]}
                  />
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <ProductDialog
        open={!!dialog}
        product={dialog?.product ?? null}
        pending={create.isPending || update.isPending}
        error={create.error || update.error}
        onClose={closeDialog}
        onSubmit={(v) => {
          if (dialog?.product) {
            update.mutate({ id: dialog.product._id, body: v }, { onSuccess: closeDialog });
          } else {
            create.mutate(v, { onSuccess: closeDialog });
          }
        }}
      />

      <AmountDialog
        open={!!stockOf}
        title="Adjust stock"
        description={stockOf ? `${stockOf.name} • Current ${stockOf.stockCount} item` : undefined}
        amountLabel="New stock count"
        initialAmount={stockOf?.stockCount}
        submitLabel="Save"
        pending={update.isPending}
        error={update.error}
        onClose={() => {
          setStockOf(null);
          update.reset();
        }}
        onSubmit={(amount) =>
          stockOf &&
          update.mutate(
            { id: stockOf._id, body: { stockCount: Math.floor(amount) } },
            { onSuccess: () => setStockOf(null) }
          )
        }
      />

      <ConfirmDialog
        open={!!deleting}
        title="Delete product"
        message={deleting ? `Remove "${deleting.name}" from inventory?` : ""}
        confirmLabel="Delete"
        pending={remove.isPending}
        error={remove.error}
        onClose={() => {
          setDeleting(null);
          remove.reset();
        }}
        onConfirm={() =>
          deleting && remove.mutate(deleting._id, { onSuccess: () => setDeleting(null) })
        }
      />

      <DetailDialog
        open={!!viewing}
        title={viewing?.name ?? ""}
        onClose={() => setViewing(null)}
        rows={
          viewing
            ? [
                { label: "Barcode", value: viewing.barcode || "—" },
                { label: "Stock", value: `${viewing.stockCount} item` },
                { label: "Unit Cost", value: formatCurrency(viewing.unitCost) },
                { label: "Selling Price", value: formatCurrency(viewing.sellingPrice) },
                { label: "Margin / unit", value: formatCurrency(viewing.margin) },
              ]
            : []
        }
      />
    </div>
  );
};

export default ProductsView;

