"use client";

export default function Error({ error, reset }) {
  console.error(error);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
      <h2 className="text-2xl font-bold mb-4">
        Something went wrong while loading kitchens
      </h2>

      <p className="text-gray-600 mb-6">
        Please try again later.
      </p>

      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-black text-white rounded"
      >
        Try again
      </button>
    </div>
  );
}
