export default function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;
  const { page, totalPages, total, limit } = pagination;

  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t">
      <p className="text-sm text-gray-500">
        Jami: {total} ta | Sahifa {page}/{totalPages}
      </p>
      <div className="flex gap-2">
        <button
          disabled={!pagination.hasPrev}
          onClick={() => onPageChange(page - 1)}
          className="px-3 py-1 rounded border text-sm disabled:opacity-40"
        >← Oldingi</button>
        <button
          disabled={!pagination.hasNext}
          onClick={() => onPageChange(page + 1)}
          className="px-3 py-1 rounded border text-sm disabled:opacity-40"
        >Keyingi →</button>
      </div>
    </div>
  );
}
