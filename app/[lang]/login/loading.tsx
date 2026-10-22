export default function LoginLoading() {
  return (
    <div className="min-h-[60vh] p-8 flex items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        <div className="h-16 rounded-md bg-stone-200 animate-pulse" />
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="h-16 rounded-lg bg-white border border-line animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
