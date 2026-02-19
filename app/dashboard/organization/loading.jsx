import TableSkeleton from "@/components/dashboard/TableSkeleton";

export default function Loading() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
            <div className="space-y-3">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
                <div className="h-8 bg-gray-200 rounded-lg w-64"></div>
            </div>
            <div className="h-4 bg-gray-100 rounded-lg w-96"></div>
            </div>
            <div className="h-12 bg-gray-200 rounded-2xl w-40"></div>
        </div>
        <TableSkeleton />
    </div>
  );
}