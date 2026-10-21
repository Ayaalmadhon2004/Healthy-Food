import { getCapacityLimit } from "@/lib/capacity";

export interface DashboardStats {
  reservedTomorrow: number;
  // Whole percent of the combined kitchen capacity already reserved for tomorrow; null with no kitchens.
  capacityUsedPercent: number | null;
  kitchenCount: number;
  areaReports: number;
}

export function buildDashboardStats(input: {
  reservedTomorrow: number;
  kitchenCapacities: unknown[];
  areaReports: number;
}): DashboardStats {
  const totalCapacity = input.kitchenCapacities.reduce<number>((sum, c) => sum + getCapacityLimit(c), 0);
  return {
    reservedTomorrow: input.reservedTomorrow,
    capacityUsedPercent:
      totalCapacity > 0 ? Math.min(100, Math.round((input.reservedTomorrow / totalCapacity) * 100)) : null,
    kitchenCount: input.kitchenCapacities.length,
    areaReports: input.areaReports,
  };
}
