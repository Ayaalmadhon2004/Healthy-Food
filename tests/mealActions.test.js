import { after, afterEach, describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { cleanup, createKitchen, createUser, hasDatabase, prisma, resetRevalidated, revalidated, signInAs } from "./helpers/db.js";
import {
  addMealAction,
  cancelMealAction,
  checkUserReservation,
  deleteMealAction,
  getCalorieGoalAction,
  getMealsAction,
  getMonthlyGridDataAction,
  getMonthlyStatsAction,
  reserveMealAction,
  setCalorieGoalAction,
} from "../app/actions/mealActions.ts";

after(cleanup);
afterEach(() => {
  mock.timers.reset();
  signInAs(null);
});

// Winter in Gaza is UTC+2, so 2026-01-15T22:00:00Z is exactly midnight starting Jan 16.
const freezeClock = (iso) => mock.timers.enable({ apis: ["Date"], now: new Date(iso) });

describe("mealActions (real Postgres)", { skip: !hasDatabase && "DATABASE_URL is not set" }, () => {
  it("rejects every action when signed out", async () => {
    signInAs(null);
    assert.deepEqual(await addMealAction({ mealType: "lunch", foodName: "x", calories: 100 }), { success: false, error: "Unauthorized" });
    assert.equal((await getMealsAction()).error, "Unauthorized");
    assert.equal((await deleteMealAction("whatever")).error, "Unauthorized");
    assert.equal((await getCalorieGoalAction()).error, "Unauthorized");
    assert.equal((await setCalorieGoalAction(2000)).error, "Unauthorized");
    assert.equal((await getMonthlyGridDataAction(null, 2026, 1)).error, "Unauthorized");
    assert.equal((await getMonthlyStatsAction(null, 2026, 1)).error, "Unauthorized");
    assert.deepEqual(await reserveMealAction(null, 1, 1), { error: "LOGIN_REQUIRED" });
    assert.equal(await checkUserReservation(null, 1), false);
    assert.equal((await cancelMealAction(null, 1)).error, "Unauthorized");
  });

  it("ignores a session whose user does not exist in the database", async () => {
    signInAs({ id: "ghost-user-not-in-db" });
    assert.equal((await getMealsAction()).error, "Unauthorized");
  });

  it("adds a meal for the signed-in user and revalidates the dashboard", async () => {
    const user = await createUser();
    signInAs(user);
    resetRevalidated();
    const res = await addMealAction({ mealType: "lunch", foodName: "Lentil soup", calories: "350" });
    assert.equal(res.success, true);
    assert.equal(res.meal.userId, user.id);
    assert.equal(res.meal.calories, 350);
    assert.ok(revalidated().includes("/dashboard/tracker"));
  });

  it("rejects out-of-range or non-numeric calories without writing", async () => {
    const user = await createUser();
    signInAs(user);
    for (const calories of [-1, 20001, "abc", "", NaN, undefined]) {
      assert.deepEqual(await addMealAction({ mealType: "lunch", foodName: "x", calories }), { success: false, error: "Invalid calories" }, String(calories));
    }
    assert.equal(await prisma.meal.count({ where: { userId: user.id } }), 0);
    // boundaries are accepted
    assert.equal((await addMealAction({ mealType: "lunch", foodName: "x", calories: 0 })).success, true);
    assert.equal((await addMealAction({ mealType: "lunch", foodName: "x", calories: 20000 })).success, true);
  });

  it("only returns the caller's own meals", async () => {
    const [alice, bob] = [await createUser(), await createUser()];
    signInAs(alice);
    await addMealAction({ mealType: "lunch", foodName: "alice-food", calories: 100 });
    signInAs(bob);
    await addMealAction({ mealType: "lunch", foodName: "bob-food", calories: 200 });

    const res = await getMealsAction();
    assert.deepEqual(res.meals.map((m) => m.foodName), ["bob-food"]);
  });

  it("a user cannot delete another user's meal; the owner can", async () => {
    const [alice, bob] = [await createUser(), await createUser()];
    signInAs(alice);
    const { meal } = await addMealAction({ mealType: "dinner", foodName: "private", calories: 500 });

    signInAs(bob);
    assert.deepEqual(await deleteMealAction(meal.id), { success: false, error: "Meal not found" });
    assert.equal(await prisma.meal.count({ where: { id: meal.id } }), 1, "meal must survive");

    signInAs(alice);
    assert.deepEqual(await deleteMealAction(meal.id), { success: true });
    assert.equal(await prisma.meal.count({ where: { id: meal.id } }), 0);
    // already gone
    assert.equal((await deleteMealAction(meal.id)).error, "Meal not found");
  });

  it("getMealsAction starts the day at Gaza midnight, not UTC midnight", async () => {
    const user = await createUser();
    signInAs(user);
    // Now is 00:30 on Jan 16 in Gaza (22:30Z on Jan 15): "today" began at 22:00Z.
    freezeClock("2026-01-15T22:30:00Z");
    const at = (iso, foodName) => prisma.meal.create({ data: { userId: user.id, mealType: "snack", foodName, calories: 10, createdAt: new Date(iso) } });
    await at("2026-01-15T21:59:59Z", "yesterday-last-second");
    await at("2026-01-15T22:00:00Z", "today-first-second");
    await at("2026-01-15T22:10:00Z", "today-later");

    const names = (await getMealsAction()).meals.map((m) => m.foodName).sort();
    assert.deepEqual(names, ["today-first-second", "today-later"]);
  });

  it("monthly data buckets meals by Gaza calendar day and month", async () => {
    const user = await createUser();
    signInAs(user);
    const at = (iso, calories) => prisma.meal.create({ data: { userId: user.id, mealType: "snack", foodName: "m", calories, createdAt: new Date(iso) } });
    await at("2026-01-31T21:59:59Z", 100); // Jan 31, 23:59:59 Gaza
    await at("2026-01-31T22:00:00Z", 200); // Feb 1, 00:00 Gaza
    await at("2026-02-01T10:00:00Z", 300); // Feb 1
    await at("2025-12-31T22:00:00Z", 999); // Jan 1 2026 Gaza -> January, day 1

    const jan = await getMonthlyGridDataAction("ignored-client-id", 2026, 1);
    assert.deepEqual(jan.dailyTotals, { 1: 999, 31: 100 });
    const feb = await getMonthlyGridDataAction("ignored-client-id", 2026, 2);
    assert.deepEqual(feb.dailyTotals, { 1: 500 });
    assert.equal(feb.goal, 2000);
  });

  it("monthly data ignores the client-supplied user id and never leaks other users' meals", async () => {
    const [alice, bob] = [await createUser(), await createUser()];
    const created = new Date("2026-03-10T10:00:00Z");
    await prisma.meal.create({ data: { userId: alice.id, mealType: "snack", foodName: "a", calories: 111, createdAt: created } });
    await prisma.meal.create({ data: { userId: bob.id, mealType: "snack", foodName: "b", calories: 222, createdAt: created } });

    signInAs(bob);
    const res = await getMonthlyGridDataAction(alice.id, 2026, 3);
    assert.deepEqual(res.dailyTotals, { 10: 222 });
    const stats = await getMonthlyStatsAction(alice.id, 2026, 3);
    assert.equal(stats.stats.totalMeals, 1);
  });

  it("monthly stats average days and count days within the user's own goal", async () => {
    const user = await createUser("USER", { health_goals: { dailyCalories: 1000 } });
    signInAs(user);
    const at = (iso, calories) => prisma.meal.create({ data: { userId: user.id, mealType: "snack", foodName: "m", calories, createdAt: new Date(iso) } });
    await at("2026-04-01T10:00:00Z", 900); // under goal
    await at("2026-04-02T10:00:00Z", 1000); // exactly at goal counts
    await at("2026-04-03T10:00:00Z", 1700); // over

    const { stats } = await getMonthlyStatsAction(null, 2026, 4);
    assert.deepEqual(stats, { avgCalories: 1200, commitmentDays: 2, totalMeals: 3, goal: 1000 });

    const empty = await getMonthlyStatsAction(null, 2026, 5);
    assert.deepEqual(empty.stats, { avgCalories: 0, commitmentDays: 0, totalMeals: 0, goal: 1000 });
  });

  it("calorie goal: default, validation, persistence, and other health_goals keys are kept", async () => {
    const user = await createUser();
    signInAs(user);
    assert.deepEqual(await getCalorieGoalAction(), { success: true, goal: 2000 });

    for (const bad of ["", "abc", 799, 6001, 1500.5, null]) {
      assert.deepEqual(await setCalorieGoalAction(bad), { success: false, error: "INVALID_GOAL" }, String(bad));
    }
    assert.deepEqual(await getCalorieGoalAction(), { success: true, goal: 2000 });

    await prisma.user.update({ where: { id: user.id }, data: { health_goals: { other: "keep" } } });
    assert.deepEqual(await setCalorieGoalAction("2400"), { success: true, goal: 2400 });
    assert.deepEqual(await getCalorieGoalAction(), { success: true, goal: 2400 });
    const row = await prisma.user.findUnique({ where: { id: user.id } });
    assert.deepEqual(row.health_goals, { other: "keep", dailyCalories: 2400 });
  });

  it("calorie goals are per user", async () => {
    const [alice, bob] = [await createUser(), await createUser()];
    signInAs(alice);
    await setCalorieGoalAction(1500);
    signInAs(bob);
    assert.equal((await getCalorieGoalAction()).goal, 2000);
  });

  it("reserve, check and cancel a meal (the client-supplied user id is ignored)", async () => {
    const [alice, bob] = [await createUser(), await createUser()];
    const kitchen = await createKitchen(10);

    signInAs(alice);
    assert.deepEqual(await reserveMealAction(bob.id, kitchen.id, 2), { success: true, quantity: 2 });
    assert.equal(await checkUserReservation(bob.id, kitchen.id), true);
    assert.equal(await prisma.mealOrder.count({ where: { userId: bob.id } }), 0, "order must belong to the session user");

    signInAs(bob);
    assert.equal(await checkUserReservation(alice.id, kitchen.id), false);
    assert.deepEqual(await cancelMealAction(alice.id, kitchen.id), { success: true, quantity: 0 });
    assert.equal(await prisma.mealOrder.count({ where: { userId: alice.id } }), 1, "bob cancelling must not touch alice");

    signInAs(alice);
    assert.deepEqual(await cancelMealAction(null, kitchen.id), { success: true, quantity: 2 });
    assert.equal(await checkUserReservation(null, kitchen.id), false);
  });
});
