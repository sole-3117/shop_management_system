export default function Table({ columns, data, loading, emptyMessage = 'Ma\'lumot topilmadi' }) {
  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-gray-200">
            {columns.map(col => (
              <th key={col.key} className="px-4 py-3 font-semibold text-gray-600 bg-gray-50">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={columns.length} className="text-center py-12 text-gray-400">{emptyMessage}</td></tr>
          ) : (
            data.map((row, i) => (
              <tr key={row.id || i} className="border-b border-gray-100 hover:bg-gray-50">
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
