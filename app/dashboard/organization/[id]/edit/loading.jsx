import EditKitchenSkeleton from "@/components/dashboard/EditKitchenSkeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50/30 p-4 md:p-8">
      <div className="max-w-4xl mx-auto mb-8">
        <div className="h-8 bg-gray-200 rounded-lg w-48"></div>
      </div>
      <EditKitchenSkeleton />
    </div>
  );
}