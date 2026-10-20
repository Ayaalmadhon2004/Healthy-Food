export default function GazaKitchenLoading() {
  return (
    <main className="min-h-screen bg-emerald-50 p-8 flex items-center justify-center">
      <div className="w-full max-w-7xl space-y-6">
        <div className="h-14 rounded-full bg-gray-200 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 rounded-[3rem] bg-white shadow-sm border border-gray-100 animate-pulse" />
          <div className="h-80 rounded-[3rem] bg-white shadow-sm border border-gray-100 animate-pulse" />
        </div>
      </div>
    </main>
  );
}
