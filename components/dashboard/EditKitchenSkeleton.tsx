export default function EditKitchenSkeleton() {
    return (
        <div className="p-8 space-y-8 bg-white animate-pulse max-w-4xl mx-auto">
        {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-4">
            <div className="h-6 bg-gray-200 rounded-md w-32 border-b pb-2"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-12 bg-gray-50 rounded-xl w-full"></div>
                <div className="h-12 bg-gray-50 rounded-xl w-full"></div>
            </div>
            </div>
        ))}
        <div className="flex gap-4 pt-6 border-t">
            <div className="flex-1 h-14 bg-gray-200 rounded-2xl"></div>
            <div className="w-32 h-14 bg-gray-100 rounded-2xl"></div>
        </div>
        </div>
    );
}