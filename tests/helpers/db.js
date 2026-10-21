import { randomUUID } from "node:crypto";
import { prisma } from "../../lib/prisma.ts";

// Database helpers for the Server Action tests. Every row a test creates is registered here and removed in cleanup().
export { prisma };

const userIds = new Set();
const kitchenIds = new Set();

export const hasDatabase = Boolean(process.env.DATABASE_URL);

export function signInAs(user) {
  globalThis.__testAuthUserId = user ? user.id : null;
}

// Runs fn as the given user, independent of other concurrent calls.
export function asUser(user, fn) {
  return globalThis.__testAuthStorage.run(user, fn);
}

export async function createUser(role = "USER", extra = {}) {
  const id = `test-${randomUUID()}`;
  const user = await prisma.user.create({
    data: { id, name: `Test ${role}`, email: `${id}@tests.invalid`, role, ...extra },
  });
  userIds.add(id);
  return user;
}

export async function createKitchen(capacity = 5, extra = {}) {
  const kitchen = await prisma.kitchen.create({
    data: {
      name: { ar: "مطبخ اختبار", en: "Test kitchen" },
      location: { ar: "غزة", en: "Gaza" },
      region: { ar: "غزة", en: "Gaza" },
      distributionTime: { ar: "", en: "" },
      todaysMeal: { ar: "", en: "" },
      accessInfo: { ar: "", en: "" },
      contact: "none",
      capacity,
      ...extra,
    },
  });
  kitchenIds.add(kitchen.id);
  return kitchen;
}

export function trackKitchen(id) {
  kitchenIds.add(Number(id));
}

export function revalidated() {
  return globalThis.__revalidated;
}

export function resetRevalidated() {
  globalThis.__revalidated.length = 0;
}

export function silenceConsoleError(t) {
  t.mock.method(console, "error", () => {});
}

export async function cleanup() {
  if (!hasDatabase) return;
  signInAs(null);
  const users = [...userIds];
  const kitchens = [...kitchenIds];
  await prisma.areaReport.deleteMany({ where: { userId: { in: users } } });
  await prisma.mealOrder.deleteMany({ where: { OR: [{ userId: { in: users } }, { kitchenId: { in: kitchens } }] } });
  await prisma.kitchen.deleteMany({ where: { id: { in: kitchens } } });
  await prisma.user.deleteMany({ where: { id: { in: users } } });
  await prisma.$disconnect();
}
