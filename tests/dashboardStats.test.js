import test from "node:test";
import assert from "node:assert/strict";
import { buildDashboardStats } from "../lib/dashboardStats.ts";

test("capacity percentage uses the combined kitchen capacity", () => {
  const stats = buildDashboardStats({ reservedTomorrow: 150, kitchenCapacities: [100, "200"], areaReports: 4 });
  assert.deepEqual(stats, { reservedTomorrow: 150, capacityUsedPercent: 50, kitchenCount: 2, areaReports: 4 });
});

test("unparseable capacities count as the default limit", () => {
  assert.equal(buildDashboardStats({ reservedTomorrow: 250, kitchenCapacities: [null], areaReports: 0 }).capacityUsedPercent, 50);
});

test("percentage is capped at 100 and null without kitchens", () => {
  assert.equal(buildDashboardStats({ reservedTomorrow: 900, kitchenCapacities: [100], areaReports: 0 }).capacityUsedPercent, 100);
  assert.equal(buildDashboardStats({ reservedTomorrow: 0, kitchenCapacities: [], areaReports: 0 }).capacityUsedPercent, null);
});
