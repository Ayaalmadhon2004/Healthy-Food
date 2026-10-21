import { after, afterEach, describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { asUser, cleanup, createKitchen, createUser, hasDatabase, prisma, resetRevalidated, revalidated, signInAs, trackKitchen } from "./helpers/db.js";
import { addKitchenAction, deleteKitchenAction, getKitchensAction, updateKitchenAction } from "../app/actions/kitchenActions.ts";
import { reserveMealAction } from "../app/actions/mealActions.ts";

after(cleanup);
afterEach(() => {
  mock.timers.reset();
  signInAs(null);
});

function form(fields) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) if (v !== undefined) fd.set(k, v);
  return fd;
}

const validForm = (token, extra = {}) =>
  form({ nameAr: `مطبخ-${token}`, nameEn: `Kitchen-${token}`, regionId: "Rafah", capacity: "120", mealAr: "عدس", mealEn: "Lentils", timeAr: "١٢", timeEn: "12:00", contact: "0591", ...extra });

const sumReserved = async (kitchenId) => (await prisma.mealOrder.aggregate({ where: { kitchenId }, _sum: { quantity: true } }))._sum.quantity ?? 0;

describe("kitchen management (real Postgres)", { skip: !hasDatabase && "DATABASE_URL is not set" }, () => {
  it("only ORG and ADMIN can add, update or delete kitchens", async () => {
    const kitchen = await createKitchen(50);
    const token = randomUUID();
    for (const role of [null, "USER"]) {
      signInAs(role ? await createUser(role) : null);
      assert.deepEqual(await addKitchenAction(validForm(token)), { success: false, error: "Unauthorized" }, `add as ${role}`);
      assert.deepEqual(await updateKitchenAction(kitchen.id, validForm(token)), { success: false, error: "Unauthorized" }, `update as ${role}`);
      assert.deepEqual(await deleteKitchenAction(kitchen.id), { success: false, error: "Unauthorized" }, `delete as ${role}`);
    }
    const untouched = await prisma.kitchen.findUnique({ where: { id: kitchen.id } });
    assert.ok(untouched, "kitchen must still exist");
    assert.equal(untouched.capacity, 50);
    assert.equal(await prisma.kitchen.count({ where: { name: { path: ["ar"], string_starts_with: `مطبخ-${token}` } } }), 0);
  });

  it("ORG and ADMIN can add, update and delete; pages are revalidated", async () => {
    for (const role of ["ORG", "ADMIN"]) {
      signInAs(await createUser(role));
      const token = randomUUID();
      resetRevalidated();
      const added = await addKitchenAction(validForm(token));
      assert.equal(added.success, true, role);
      trackKitchen(added.kitchen.id);
      assert.deepEqual(added.kitchen.name, { ar: `مطبخ-${token}`, en: `Kitchen-${token}` });
      assert.deepEqual(added.kitchen.region, { ar: "رفح", en: "Rafah" });
      assert.equal(added.kitchen.capacity, 120);
      assert.deepEqual(revalidated().sort(), ["/dashboard/organization", "/gaza-kitchen"]);

      const updated = await updateKitchenAction(String(added.kitchen.id), validForm(token, { nameEn: "Renamed", capacity: "٢٠٠", contact: "" }));
      assert.equal(updated.success, true);
      assert.equal(updated.kitchen.capacity, 200, "Arabic digits are accepted");
      assert.equal(updated.kitchen.contact, "No Contact");
      assert.equal(updated.kitchen.name.en, "Renamed");

      assert.deepEqual(await deleteKitchenAction(added.kitchen.id), { success: true });
      assert.equal(await prisma.kitchen.count({ where: { id: added.kitchen.id } }), 0);
    }
  });

  it("add and update reject bad names and capacities without writing", async () => {
    signInAs(await createUser("ORG"));
    const kitchen = await createKitchen(50);
    const token = randomUUID();

    assert.equal((await addKitchenAction(validForm(token, { nameAr: "  " }))).error, "Name is required");
    assert.equal((await addKitchenAction(validForm(token, { nameEn: undefined }))).error, "Name is required");
    for (const capacity of ["", "abc", "0", "-5", "12.5", "100001", "1e3", undefined]) {
      assert.equal((await addKitchenAction(validForm(token, { capacity }))).error, "Invalid capacity", String(capacity));
      assert.equal((await updateKitchenAction(kitchen.id, validForm(token, { capacity }))).error, "Invalid capacity", String(capacity));
    }
    assert.equal((await updateKitchenAction(kitchen.id, validForm(token, { nameAr: "" }))).error, "Name is required");

    assert.equal(await prisma.kitchen.count({ where: { name: { path: ["ar"], string_starts_with: `مطبخ-${token}` } } }), 0);
    assert.equal((await prisma.kitchen.findUnique({ where: { id: kitchen.id } })).capacity, 50);
  });

  it("add numbers duplicate names; unknown region falls back to Unspecified", async () => {
    signInAs(await createUser("ORG"));
    const token = randomUUID();
    const first = await addKitchenAction(validForm(token, { regionId: "Nowhere" }));
    const second = await addKitchenAction(validForm(token));
    trackKitchen(first.kitchen.id);
    trackKitchen(second.kitchen.id);
    assert.equal(first.kitchen.region.en, "Unspecified");
    assert.equal(second.kitchen.name.ar, `مطبخ-${token} 2`);
    assert.equal(second.kitchen.name.en, `Kitchen-${token} 2`);
  });

  it("update keeps the region when none is given, and fails cleanly for a missing kitchen", async (t) => {
    t.mock.method(console, "error", () => {});
    signInAs(await createUser("ORG"));
    const kitchen = await createKitchen(50);
    const res = await updateKitchenAction(kitchen.id, validForm("x", { regionId: undefined }));
    assert.equal(res.success, true);
    assert.deepEqual(res.kitchen.region, { ar: "غزة", en: "Gaza" });

    assert.deepEqual(await updateKitchenAction(999_999_999, validForm("x")), { success: false, error: "Failed to save kitchen" });
    assert.deepEqual(await deleteKitchenAction(999_999_999), { success: false, error: "Failed to delete kitchen" });
  });

  it("getKitchensAction is public, paginates, and reports numeric capacity and tomorrow's reservations", async () => {
    const kitchen = await createKitchen("350-500 families");
    const user = await createUser();
    signInAs(user);
    assert.equal((await reserveMealAction(null, kitchen.id, 3)).success, true);

    signInAs(null);
    const total = await prisma.kitchen.count();
    const page = await getKitchensAction(1, 2);
    assert.equal(page.success, true);
    assert.equal(page.kitchens.length, Math.min(2, total));
    assert.equal(page.totalPages, Math.ceil(total / 2));

    const all = await getKitchensAction(1, total);
    const mine = all.kitchens.find((k) => k.id === kitchen.id);
    assert.equal(mine.capacityLimit, 500);
    assert.equal(mine.reservedTomorrow, 3);
  });
});

describe("reservations (real Postgres)", { skip: !hasDatabase && "DATABASE_URL is not set" }, () => {
  it("validates quantity and kitchen", async (t) => {
    t.mock.method(console, "error", () => {});
    signInAs(await createUser());
    const kitchen = await createKitchen(5);
    for (const q of [0, -1, 21, 1.5, "abc", NaN]) {
      assert.deepEqual(await reserveMealAction(null, kitchen.id, q), { error: "INVALID_QUANTITY" }, String(q));
    }
    assert.deepEqual(await reserveMealAction(null, 999_999_999, 1), { error: "KITCHEN_NOT_FOUND" });
    // A non-numeric id is rejected before it reaches the database.
    assert.deepEqual(await reserveMealAction(null, "not-a-number", 1), { error: "KITCHEN_NOT_FOUND" });
    assert.equal(await sumReserved(kitchen.id), 0);
  });

  it("a user can reserve once per kitchen per day", async () => {
    signInAs(await createUser());
    const kitchen = await createKitchen(5);
    assert.deepEqual(await reserveMealAction(null, kitchen.id, 1), { success: true, quantity: 1 });
    assert.deepEqual(await reserveMealAction(null, kitchen.id, 1), { error: "ALREADY_RESERVED" });
    assert.equal(await sumReserved(kitchen.id), 1);
  });

  it("refuses a reservation that does not fit and reports what is left", async () => {
    const kitchen = await createKitchen(5);
    const [a, b, c] = [await createUser(), await createUser(), await createUser()];
    signInAs(a);
    assert.equal((await reserveMealAction(null, kitchen.id, 4)).success, true);
    signInAs(b);
    assert.deepEqual(await reserveMealAction(null, kitchen.id, 2), { error: "NOT_ENOUGH_LEFT", remaining: 1 });
    assert.equal((await reserveMealAction(null, kitchen.id, 1)).success, true);
    signInAs(c);
    assert.deepEqual(await reserveMealAction(null, kitchen.id, 1), { error: "NOT_ENOUGH_LEFT", remaining: 0 });
    assert.equal(await sumReserved(kitchen.id), 5);
  });

  it("falls back to the default capacity (500) when the stored value is unusable", async () => {
    const kitchen = await createKitchen("unknown");
    signInAs(await createUser());
    assert.equal((await reserveMealAction(null, kitchen.id, 20)).success, true);
    signInAs(await createUser());
    assert.equal((await prisma.mealOrder.aggregate({ where: { kitchenId: kitchen.id }, _sum: { quantity: true } }))._sum.quantity, 20);
  });

  it("never exceeds capacity under concurrent reservations by different users", async () => {
    const capacity = 5;
    const kitchen = await createKitchen(capacity);
    const users = await Promise.all(Array.from({ length: 12 }, () => createUser()));

    const results = await Promise.all(users.map((user) => asUser(user, () => reserveMealAction(null, kitchen.id, 1))));

    const ok = results.filter((r) => "success" in r);
    const total = await sumReserved(kitchen.id);
    assert.ok(total <= capacity, `reserved ${total} > capacity ${capacity}`);
    assert.equal(total, ok.length, "every success has exactly one stored order");
    for (const r of results) {
      if ("error" in r) assert.ok(["NOT_ENOUGH_LEFT", "BUSY"].includes(r.error), JSON.stringify(r));
    }
    assert.ok(ok.length >= 1);
  });

  it("never exceeds capacity with mixed quantities fired in parallel", async () => {
    const capacity = 10;
    const kitchen = await createKitchen(capacity);
    const users = await Promise.all(Array.from({ length: 8 }, () => createUser()));
    const results = await Promise.all(users.map((user) => asUser(user, () => reserveMealAction(null, kitchen.id, 3))));

    const total = await sumReserved(kitchen.id);
    assert.ok(total <= capacity, `reserved ${total} > capacity ${capacity}`);
    assert.equal(total, results.filter((r) => "success" in r).length * 3);
    assert.ok(results.filter((r) => "success" in r).length <= 3);
  });

  it("the same user cannot double-book by firing two requests at once", async () => {
    const kitchen = await createKitchen(100);
    const user = await createUser();
    const results = await Promise.all([1, 2].map(() => asUser(user, () => reserveMealAction(null, kitchen.id, 1))));
    assert.equal(results.filter((r) => "success" in r).length, 1, JSON.stringify(results));
    assert.equal(await prisma.mealOrder.count({ where: { kitchenId: kitchen.id } }), 1);
  });

  it("reserves for tomorrow in Gaza time, across the midnight boundary", async () => {
    const kitchen = await createKitchen(100);
    const [early, late] = [await createUser(), await createUser()];

    // 21:30Z on Jan 15 is 23:30 in Gaza (still Jan 15) -> reserves Jan 16.
    mock.timers.enable({ apis: ["Date"], now: new Date("2026-01-15T21:30:00Z") });
    signInAs(early);
    assert.equal((await reserveMealAction(null, kitchen.id, 1)).success, true);
    mock.timers.reset();

    // 22:30Z is 00:30 on Jan 16 in Gaza -> reserves Jan 17, a different day for the same kitchen.
    mock.timers.enable({ apis: ["Date"], now: new Date("2026-01-15T22:30:00Z") });
    signInAs(late);
    assert.equal((await reserveMealAction(null, kitchen.id, 1)).success, true);
    mock.timers.reset();

    const orders = await prisma.mealOrder.findMany({ where: { kitchenId: kitchen.id }, orderBy: { targetDate: "asc" } });
    assert.deepEqual(orders.map((o) => o.targetDate.toISOString()), ["2026-01-16T00:00:00.000Z", "2026-01-17T00:00:00.000Z"]);
  });

  it("capacity is counted per day: a full day does not block the next", async () => {
    const kitchen = await createKitchen(1);
    const [a, b] = [await createUser(), await createUser()];

    mock.timers.enable({ apis: ["Date"], now: new Date("2026-01-15T10:00:00Z") });
    signInAs(a);
    assert.equal((await reserveMealAction(null, kitchen.id, 1)).success, true);
    signInAs(b);
    assert.equal((await reserveMealAction(null, kitchen.id, 1)).error, "NOT_ENOUGH_LEFT");

    mock.timers.setTime(new Date("2026-01-16T10:00:00Z").getTime());
    assert.equal((await reserveMealAction(null, kitchen.id, 1)).success, true);
  });
});
