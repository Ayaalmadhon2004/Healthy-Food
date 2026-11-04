export default function AssistantLoading() {
  return (
    <div className="min-h-[60vh] p-8 flex items-center justify-center">
      <div className="w-full max-w-3xl space-y-6">
        <div className="h-12 rounded-md bg-stone-200 animate-pulse" />
        <div className="h-20 rounded-lg bg-white border border-line animate-pulse" />
        <div className="h-64 rounded-lg bg-white border border-line animate-pulse" />
      </div>
    </div>
  );
}
