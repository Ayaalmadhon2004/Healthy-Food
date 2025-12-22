export default function ErrorPage({ message }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 p-6">
      <h1 className="text-4xl font-bold text-red-600 mb-4">حدث خطأ!</h1>
      <p className="text-red-500 text-lg mb-6">{message}</p>
      <button
        onClick={() => location.reload()}
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
      >
       try again
      </button>
    </div>
  );
}
