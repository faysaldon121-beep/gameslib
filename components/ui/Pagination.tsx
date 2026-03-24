import Link from "next/link";

export default function Pagination({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2));

  return (
    <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
      <Link href={`?page=${Math.max(1, currentPage - 1)}`} className="btn-secondary px-3 py-2 text-sm" aria-disabled={currentPage === 1}>
        Prev
      </Link>
      {pages.map((page) => (
        <Link
          key={page}
          href={`?page=${page}`}
          className={page === currentPage ? "btn-primary px-4 py-2 text-sm" : "btn-secondary px-4 py-2 text-sm"}
        >
          {page}
        </Link>
      ))}
      <Link href={`?page=${Math.min(totalPages, currentPage + 1)}`} className="btn-secondary px-3 py-2 text-sm" aria-disabled={currentPage === totalPages}>
        Next
      </Link>
    </nav>
  );
}
