export default function TableSkeleton() {
  const rows = Array(5).fill(0); 

  return (
    <div className="w-full bg-white rounded-3xl overflow-hidden border border-gray-100 animate-pulse">
      <div className="bg-gray-50/50 h-14 border-b border-gray-100 flex items-center px-6 gap-4">
        <div className="h-3 bg-gray-200 rounded-full w-24"></div>
        <div className="h-3 bg-gray-200 rounded-full w-24"></div>
        <div className="h-3 bg-gray-200 rounded-full w-24"></div>
        <div className="h-3 bg-gray-200 rounded-full w-20 ml-auto"></div>
      </div>

      <div className="divide-y divide-gray-50">
        {rows.map((_, i) => (
          <div key={i} className="px-6 py-5 flex items-center gap-6">
            <div className="w-1/4">
              <div className="h-4 bg-gray-200 rounded-lg w-3/4 mb-2"></div>
            </div>
            <div className="w-1/4 flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-100 rounded-md"></div>
              <div className="h-3 bg-gray-100 rounded-full w-1/2"></div>
            </div>
            <div className="w-1/6 flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-100 rounded-md"></div>
              <div className="h-3 bg-gray-100 rounded-full w-full"></div>
            </div>
            <div className="ml-auto flex gap-2">
              <div className="w-10 h-10 bg-gray-100 rounded-xl"></div>
              <div className="w-10 h-10 bg-gray-100 rounded-xl"></div>
            </div>
          </div>
        ))}
      </div>

      <div className="px-6 py-5 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center">
        <div className="h-10 bg-gray-200 rounded-2xl w-28"></div>
        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
        <div className="h-10 bg-gray-200 rounded-2xl w-28"></div>
      </div>
    </div>
  );
}