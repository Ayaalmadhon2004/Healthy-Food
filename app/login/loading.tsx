export default function LoginLoading() {
  return (
    <main className="min-h-screen bg-white p-8 flex items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        <div className="h-16 rounded-full bg-gray-200 animate-pulse" />
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="h-16 rounded-3xl bg-white border border-gray-100 shadow-sm animate-pulse" />
          ))}
        </div>
      </div>
    </main>
  );
}
