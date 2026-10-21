export default function TipsLoading() {
  return (
    <div className="min-h-[60vh] p-8 flex items-center justify-center">
      <div className="w-full max-w-6xl space-y-8">
        <div className="h-12 rounded-md bg-stone-200 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="h-72 rounded-lg bg-white border border-line animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
