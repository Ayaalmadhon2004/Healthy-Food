export default function ProgressCard({ calories }) {
  const percent = Math.min(100, Math.round((calories / 2000) * 100));

  return (
    <div className="w-full h-auto rounded-xl my-4 p-6 
      bg-gradient-to-br from-[rgba(227,238,224,1)] to-[rgba(240,238,226,1)] 
      shadow-lg">
      <div className="flex items-center justify-between pb-8">
        <h3 className="font-bold text-xl">Today's Goal</h3>
        <span>{percent}%</span>
      </div>

      <div className="pb-8">
        <span>{calories} / 2000 calories</span>
      </div>

      <div className="w-full h-4 bg-white/40 rounded-full mb-8">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            percent < 70
              ? "bg-green-600"
              : percent < 100
              ? "bg-yellow-500"
              : "bg-red-600"
          }`}
          style={{ width: `${percent}%` }}
        ></div>
      </div>

      <p className="text-[var(--color-gray-300)]">
        {Math.max(2000 - calories, 0)} calories remaining
      </p>
    </div>
  );
}
