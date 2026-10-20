export default function ReportAreaLoading() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] p-8 flex items-center justify-center">
      <div className="w-full max-w-xl space-y-6">
        <div className="h-16 rounded-full bg-gray-200 animate-pulse" />
        <div className="space-y-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="h-16 rounded-3xl bg-white shadow-sm border border-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    </main>
  );
}
