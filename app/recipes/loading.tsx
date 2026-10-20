export default function RecipesLoading() {
  return (
    <main className="min-h-screen bg-[var(--color-primary-light)] p-8 flex items-center justify-center">
      <div className="w-full max-w-6xl space-y-6">
        <div className="h-10 rounded-full bg-gray-200 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="h-64 rounded-[2rem] bg-white shadow-sm border border-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    </main>
  );
}
