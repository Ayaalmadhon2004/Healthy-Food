export default function GazaKitchenLoading() {
  return (
    <div className="min-h-[60vh] p-8 flex items-center justify-center">
      <div className="w-full max-w-7xl space-y-6">
        <div className="h-14 rounded-md bg-stone-200 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 rounded-lg bg-white border border-line animate-pulse" />
          <div className="h-80 rounded-lg bg-white border border-line animate-pulse" />
        </div>
      </div>
    </div>
  );
}
