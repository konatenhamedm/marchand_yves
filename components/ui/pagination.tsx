import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  className?: string;
  showPageNumbers?: boolean;
  previousLabel?: string;
  nextLabel?: string;
  variant?: "default" | "compact";
}

export const Pagination = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  className = "",
  showPageNumbers = true,
  previousLabel = "Précédent",
  nextLabel = "Suivant",
  variant = "default",
}: PaginationProps) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1) return null;

  const getPageNumbers = (): (number | "…")[] => {
    const pages: (number | "…")[] = [];
    const delta = 2;
    const range: number[] = [];
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }
    pages.push(1);
    if (range[0] > 2) pages.push("…");
    pages.push(...range);
    if (range[range.length - 1] < totalPages - 1) pages.push("…");
    if (totalPages > 1) pages.push(totalPages);
    return pages;
  };

  const btnBase =
    "inline-flex items-center justify-center h-8 min-w-[32px] px-2 rounded-lg text-sm font-medium transition-colors duration-150 border";
  const btnInactive =
    "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300";
  const btnActive =
    "border-[#0052CC] bg-[#0052CC] text-white shadow-sm";
  const btnDisabled =
    "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed";

  return (
    <div className={`flex items-center justify-between px-1 py-3 ${className}`}>
      {/* Info */}
      <p className="text-xs text-slate-400">
        <span className="font-medium text-slate-600">{startItem}–{endItem}</span> sur{" "}
        <span className="font-medium text-slate-600">{totalItems}</span> résultats
      </p>

      {/* Controls */}
      <div className="flex items-center gap-1">
        {/* Précédent */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`${btnBase} ${currentPage === 1 ? btnDisabled : btnInactive} gap-1 px-3`}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{previousLabel}</span>
        </button>

        {/* Page numbers */}
        {showPageNumbers && variant === "default" && (
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, i) =>
              page === "…" ? (
                <span key={`ellipsis-${i}`} className="px-1 text-slate-400 text-sm">
                  …
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => onPageChange(page as number)}
                  className={`${btnBase} ${currentPage === page ? btnActive : btnInactive}`}
                >
                  {page}
                </button>
              )
            )}
          </div>
        )}

        {/* Suivant */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`${btnBase} ${currentPage === totalPages ? btnDisabled : btnInactive} gap-1 px-3`}
        >
          <span className="hidden sm:inline">{nextLabel}</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};