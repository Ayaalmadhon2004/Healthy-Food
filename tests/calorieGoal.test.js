import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_CALORIE_GOAL, readCalorieGoal, validateCalorieGoalInput, withCalorieGoal } from "../lib/calorieGoal.ts";

test("readCalorieGoal falls back to the default for users without a goal", () => {
  for (const v of [null, undefined, [], {}, { dailyCalories: "2500" }, { dailyCalories: 10 }, { dailyCalories: 99999 }]) {
    assert.equal(readCalorieGoal(v), DEFAULT_CALORIE_GOAL);
  }
  assert.equal(readCalorieGoal({ dailyCalories: 2500 }), 2500);
});

test("validateCalorieGoalInput accepts whole numbers in range only", () => {
  assert.equal(validateCalorieGoalInput("1800"), 1800);
  for (const v of ["", "abc", "1500.5", "799", "6001", "-2000", null]) assert.equal(validateCalorieGoalInput(v), null);
});

test("withCalorieGoal keeps other keys and replaces the legacy empty array", () => {
  assert.deepEqual(withCalorieGoal([], 2200), { dailyCalories: 2200 });
  assert.deepEqual(withCalorieGoal(null, 2200), { dailyCalories: 2200 });
  assert.deepEqual(withCalorieGoal({ other: 1, dailyCalories: 1800 }, 2200), { other: 1, dailyCalories: 2200 });
});
