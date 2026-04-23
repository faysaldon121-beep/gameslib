import Link from 'next/link';

export default function Pagination({ currentPage, totalPages }: { currentPage: number, totalPages: number }) {
  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      {currentPage > 1 && (
        <Link href={`?page=${currentPage - 1}`} className="px-4 py-2 bg-g-secondary rounded text-white hover:bg-purple-600 transition">Previous</Link>
      )}
      <span className="px-4 py-2 text-gray-400 font-medium">Page {currentPage} of {totalPages}</span>
      {currentPage < totalPages && (
        <Link href={`?page=${currentPage + 1}`} className="px-4 py-2 bg-g-secondary rounded text-white hover:bg-purple-600 transition">Next</Link>
      )}
    </div>
  );
}
