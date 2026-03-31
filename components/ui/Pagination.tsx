import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;  // optional client-side handler
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).slice(
    Math.max(0, currentPage - 3),
    Math.min(totalPages, currentPage + 2)
  );

  const handlePageClick = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
    }
  };

  const buttonClass = (isActive: boolean) =>
    isActive
      ? "btn-primary px-4 py-2 text-sm"
      : "btn-secondary px-4 py-2 text-sm";

  // If onPageChange is provided, render buttons and use client-side handler
  if (onPageChange) {
    return (
      <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
        <button
          className="btn-secondary px-3 py-2 text-sm"
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Prev
        </button>
        {pages.map((page) => (
          <button
            key={page}
            className={buttonClass(page === currentPage)}
            onClick={() => handlePageClick(page)}
          >
            {page}
          </button>
        ))}
        <button
          className="btn-secondary px-3 py-2 text-sm"
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </nav>
    );
  }

  // Original server-side navigation using Link
  return (
    <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
      <Link
        href={`?page=${Math.max(1, currentPage - 1)}`}
        className="btn-secondary px-3 py-2 text-sm"
        aria-disabled={currentPage === 1}
      >
        Prev
      </Link>
      {pages.map((page) => (
        <Link
          key={page}
          href={`?page=${page}`}
          className={buttonClass(page === currentPage)}
        >
          {page}
        </Link>
      ))}
      <Link
        href={`?page=${Math.min(totalPages, currentPage + 1)}`}
        className="btn-secondary px-3 py-2 text-sm"
        aria-disabled={currentPage === totalPages}
      >
        Next
      </Link>
    </nav>
  );
}
