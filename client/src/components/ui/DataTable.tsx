import React from "react";
import { cn } from "../../utils/cn";

export interface Column<T> {
  key: string;
  header: string;
  accessor?: keyof T | ((row: T) => React.ReactNode);
  align?: "left" | "center" | "right";
  className?: string;
  headerClassName?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
  onRowClick?: (item: T) => void;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyMessage = "No records found.",
  className,
  onRowClick,
}: DataTableProps<T>) {
  return (
    <div className={cn("w-full overflow-hidden border border-[#213328] rounded-[14px] bg-[#111C15]", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs font-sans">
          <thead>
            <tr className="bg-[#0C1610] border-b border-[#213328]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "py-3 px-4 text-[11px] font-bold text-[#8FA396] uppercase tracking-wider select-none",
                    col.align === "right"
                      ? "text-right"
                      : col.align === "center"
                      ? "text-center"
                      : "text-left",
                    col.headerClassName
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#213328]">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-xs text-[#8FA396]">
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-[#1fbf55] border-t-transparent rounded-full animate-spin" />
                    <span>Loading ledger records...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-xs text-[#8FA396]">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, index) => {
                const isEven = index % 2 === 0;
                return (
                  <tr
                    key={keyExtractor(row)}
                    onClick={() => onRowClick?.(row)}
                    className={cn(
                      "transition-colors",
                      isEven ? "bg-[#111C15]" : "bg-[#0B120E]",
                      onRowClick && "cursor-pointer hover:bg-[#16241B]"
                    )}
                  >
                    {columns.map((col) => {
                      let cellContent: React.ReactNode = null;
                      if (typeof col.accessor === "function") {
                        cellContent = col.accessor(row);
                      } else if (col.accessor) {
                        cellContent = (row as any)[col.accessor];
                      }

                      return (
                        <td
                          key={col.key}
                          className={cn(
                            "py-2.5 px-4 text-xs text-[#E8F3EB]",
                            col.align === "right"
                              ? "text-right"
                              : col.align === "center"
                              ? "text-center"
                              : "text-left",
                            col.className
                          )}
                        >
                          {cellContent}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
