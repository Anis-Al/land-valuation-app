import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { bigIntMean, parseLocation } from './utils';
import { properties } from '@core/database';
import take from 'lodash/take';
import max from 'lodash/max';
import sortBy from 'lodash/sortBy';
import lowerCase from 'lodash/lowerCase';
import mean from 'lodash/mean';
import { and, asc, eq, gt, isNotNull, sql } from 'drizzle-orm';
import type { ProcessOptions } from './model';
import { loadCSV, type CSVItem } from '@core/utils';
import { DEFAULT_COLUMN_MAPPING } from './model';

export async function run(
  csvContents: string,
  db: PostgresJsDatabase,
  options: ProcessOptions = {
    distanceCoefficient: 1,
    areaCoefficient: 1,
    columnMapping: DEFAULT_COLUMN_MAPPING,
  }
): Promise<CSVItem[]> {
  const items = await loadCSV(csvContents);

  for (let i = 0; i < items.length; i++) {
    await processItem(items[i], db, options);
  }

  return items;
}

async function processItem(
  item: CSVItem,
  db: PostgresJsDatabase,
  options: ProcessOptions
) {
  const county = lowerCase(item['COUNTY']);
  const acres = parseFloat(item['LOT ACREAGE']);
  const location = parseLocation(item['LONGITUDE'], item['LATITUDE']);

  if (!location || !acres) {
    return;
  }

  let similar: any[] = [];

  if (location[0] === 0 && location[1] === 0) {
    item['Matching strategy'] = 'COUNTY';

    similar = await db
      .select({
        url: properties.url,
        acres: properties.acres,
        salesPrice: properties.salesPrice,
        distance: sql<number>`0`,
      })
      .from(properties)
      .where(
        and(
          isNotNull(properties.acres),
          isNotNull(properties.salesPrice),
          eq(sql`lower(${properties.county})`, sql`${county}`)
        )
      )
      .limit(100);
  }

  const areaDiffs = similar.map((p) => Math.abs(acres - p.acres!));

  const maxAreaDiff = max(areaDiffs) ?? 0;

  similar.map((p, index) => {
    const distanceScore = 0;

    const areaScore = 1 - areaDiffs[index] / maxAreaDiff;

    return {
      url: p.url!,
      acres: p.acres!,
      salesPrice: p.salesPrice!,
      distance: p.distance,
      distanceScore,
      areaScore,
    };
  });
}
