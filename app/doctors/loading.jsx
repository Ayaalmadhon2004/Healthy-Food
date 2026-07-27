export default function DoctorsLoading() {
  return (
    <main className="min-h-screen bg-white p-8 flex items-center justify-center">
      <div className="w-full max-w-5xl space-y-6">
        <div className="h-12 rounded-full bg-gray-200 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="h-48 rounded-[2rem] bg-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    </main>
  );
}
