import { landValuationRequests, properties, db } from '@core/database';
import { sql } from 'drizzle-orm';
import type { DashboardKpis } from './model';

export async function getDashboardKpis(): Promise<DashboardKpis> {
  const statusDist = await db
    .select({
      status: landValuationRequests.status,
      count: sql<number>`count(*)`,
    })
    .from(landValuationRequests)
    .groupBy(landValuationRequests.status);

  const [{ avg: avgProcessingTime }] = await db
    .select({
      avg: sql<number>`avg(extract(epoch from (completed_at - created_at)))`,
    })
    .from(landValuationRequests)
    .where(sql`completed_at is not null`);

  const [{ count: totalProperties }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(properties);

  const statesCounties = await db
    .select({ state: properties.state, county: properties.county })
    .from(properties);

  const stateCountyMap: Record<string, string[]> = {};
  for (const { state, county } of statesCounties) {
    if (!state) continue;
    if (!stateCountyMap[state]) stateCountyMap[state] = [];
    if (county && !stateCountyMap[state].includes(county)) {
      stateCountyMap[state].push(county);
    }
  }

  return {
    statusDist: {
      label: 'Status Distribution',
      value: statusDist,
    },
    avgProcessingTime: {
      label: 'Average Processing Time',
      value: avgProcessingTime,
    },
    totalProperties: {
      label: 'Total Comparable Properties',
      value: totalProperties,
    },
    availableStates: {
      label: 'Available States',
      value: stateCountyMap,
    },
  };
}
