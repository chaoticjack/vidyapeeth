import { useState } from "react";
import { ChevronLeft, ChevronRight, Search, Loader2 } from "lucide-react";

interface AdminTableProps<T> {
  columns: {
    key: string;
    label: string;
    render?: (row: T) => React.ReactNode;
  }[];
  data: T[];
  loading?: boolean;
  searchPlaceholder?: string;
  onSearch?: (term: string) => void;
  emptyState?: React.ReactNode;
}

export function AdminTable<T extends { id: string }>({
  columns,
  data,
  loading = false,
  searchPlaceholder = "Search...",
  onSearch,
  emptyState = "No records found.",
}: AdminTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const totalPages = Math.max(1, Math.ceil(data.length / itemsPerPage));
  const paginatedData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex flex-col rounded-2xl border border-navy/10 bg-white shadow-sm overflow-hidden">
      {onSearch && (
        <div className="border-b border-navy/5 p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder={searchPlaceholder}
              onChange={(e) => {
                onSearch(e.target.value);
                setCurrentPage(1); // Reset page on search
              }}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm outline-none transition-all focus:border-saffron focus:bg-white focus:ring-1 focus:ring-saffron"
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-ink/80">
          <thead className="bg-gray-50/50 text-xs font-semibold uppercase tracking-wider text-navy">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-6 py-4 whitespace-nowrap">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <Loader2 className="mb-2 h-8 w-8 animate-spin text-saffron" />
                    <span>Loading data...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="h-48 text-center text-gray-500">
                  {emptyState}
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-gray-50/50">
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-4">
                      {col.render ? col.render(row) : String((row as any)[col.key] || "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && data.length > 0 && (
        <div className="flex items-center justify-between border-t border-navy/5 px-6 py-4">
          <span className="text-xs text-gray-500">
            Showing <span className="font-semibold text-navy">{Math.min(data.length, (currentPage - 1) * itemsPerPage + 1)}</span> to <span className="font-semibold text-navy">{Math.min(data.length, currentPage * itemsPerPage)}</span> of <span className="font-semibold text-navy">{data.length}</span> results
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-semibold text-navy">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
