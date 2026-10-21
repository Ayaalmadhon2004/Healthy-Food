export default function Loading() {
  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto" aria-busy="true">
      <div className="h-10 w-64 rounded-md bg-paper-deep" />
      <div className="mt-3 h-5 w-96 max-w-full rounded-md bg-paper-deep" />
      <div className="mt-10 surface h-72" />
    </div>
  );
}
