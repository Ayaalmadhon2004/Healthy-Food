"use client"; 

export default function BackButton() {
  return (
    <button
      onClick={() => window.history.back()}
      className="text-green-700 hover:underline mb-4 inline-block"
    >
      ← Back to Recipes
    </button>
  );
}
