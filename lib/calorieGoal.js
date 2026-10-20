export const DEFAULT_CALORIE_GOAL = 2000;
export const MIN_CALORIE_GOAL = 800;
export const MAX_CALORIE_GOAL = 6000;

// The goal lives in the user's existing `health_goals` JSON column as { dailyCalories: number }
// (the column holds an empty array for users who never set one), so no schema change is needed.
export function readCalorieGoal(healthGoals) {
  const value = healthGoals && !Array.isArray(healthGoals) ? healthGoals.dailyCalories : undefined;
  return Number.isInteger(value) && value >= MIN_CALORIE_GOAL && value <= MAX_CALORIE_GOAL
    ? value
    : DEFAULT_CALORIE_GOAL;
}

// Form input -> integer in range, or null.
export function validateCalorieGoalInput(raw) {
  const text = String(raw ?? "").trim();
  if (!/^\d+$/.test(text)) return null;
  const n = Number(text);
  return n >= MIN_CALORIE_GOAL && n <= MAX_CALORIE_GOAL ? n : null;
}

// Keeps any other keys already stored in health_goals.
export function withCalorieGoal(healthGoals, goal) {
  const base = healthGoals && !Array.isArray(healthGoals) && typeof healthGoals === "object" ? healthGoals : {};
  return { ...base, dailyCalories: goal };
}
