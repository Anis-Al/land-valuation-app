import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { bigIntMean, parseLocation } from './utils';
import { properties } from '@core/database';
import take from 'lodash/take';
import max from 'lodash/max';
import sortBy from 'lodash/sortBy';
import lowerCase from 'lodash/lowerCase';
import cloneDeep from 'lodash/cloneDeep';
import mean from 'lodash/mean';
import { and, asc, between, eq, gt, isNotNull, sql } from 'drizzle-orm';
import {
  type ColumnMapping,
  type LandValuationResult,
  type MatchingStrategy,
  type ProcessOptions,
} from './model';
import { loadCSV, type CSVItem } from '@core/utils';

export async function run(
  csvContents: string,
  db: PostgresJsDatabase,
  options: ProcessOptions
): Promise<LandValuationResult> {
  const items = await loadCSV(csvContents);

  const result: LandValuationResult = {
    output: [],
    refined: [],
    total: items.length,
    success: 0,
    error: 0,
    matchingStrategy: {
      Coordinates: 0,
      County: 0,
    },
  };

  for (let i = 0; i < items.length; i++) {
    const { output, refined, success, matchingStrategy } = await processItem(
      items[i],
      db,
      options
    );

    result.output.push(output);
    result.refined.push(refined);

    if (success) {
      result.success++;
      result.matchingStrategy[matchingStrategy!]++;
    } else {
      result.error++;
    }
  }

  return result;
}

type ScoredProperty = {
  url: string;
  acres: number;
  salesPrice: bigint;
  distance: number;
  distanceScore: number;
  areaScore: number;
  score: number;
};

function extractData(mapping: ColumnMapping, item: CSVItem) {
  return {
    state: item[mapping.state],
    county: lowerCase(item[mapping.county]),
    acres: parseFloat(item[mapping.acres]),
    location: parseLocation(item[mapping.lng], item[mapping.lat]),
    apn: item[mapping.apn],
  };
}

type ProcessItemResult = {
  output: CSVItem;
  refined: CSVItem;
  success: boolean;
  matchingStrategy?: MatchingStrategy;
};

async function processItem(
  item: CSVItem,
  db: PostgresJsDatabase,
  options: ProcessOptions
): Promise<ProcessItemResult> {
  const { county, acres, location, apn } = extractData(
    options.columnMapping,
    item
  );

  const output = cloneDeep(item);
  const refined = {
    APN: apn,
  };

  if (!location || !acres) {
    output['Result'] = 'Error';

    return {
      output,
      refined,
      success: false,
    };
  }

  const matchingStrategy: MatchingStrategy =
    location[0] === 0 && location[1] === 0 ? 'County' : 'Coordinates';

  let similar: any[] = [];

  const minAcres = acres * 0.8;
  const maxAcres = acres * 1.2;

  if (matchingStrategy === 'County') {
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
          gt(properties.salesPrice, BigInt(0)),
          eq(sql`lower(${properties.county})`, sql`${county}`)
        )
      )
      .orderBy(asc(sql`ABS(acres - ${acres})`))
      .limit(1000);
  } else {
    similar = await db
      .select({
        url: properties.url,
        acres: properties.acres,
        salesPrice: properties.salesPrice,
        distance: sql<number>`st_distancesphere(location, st_makepoint(${location[0]},${location[1]})) AS distance`,
      })
      .from(properties)
      .where(
        and(
          isNotNull(properties.acres),
          isNotNull(properties.salesPrice),
          gt(properties.salesPrice, BigInt(0)),
          between(properties.acres, minAcres, maxAcres)
        )
      )
      .orderBy(asc(sql`distance`))
      .limit(1000);
  }

  const maxDistance = max(similar.map((p) => p.distance)) ?? 0;
  const areaDiffs = similar.map((p) => Math.abs(acres - p.acres!));

  const maxAreaDiff = max(areaDiffs) ?? 0;

  const similarWithScore: ScoredProperty[] = similar.map((p, index) => {
    const distanceScore =
      matchingStrategy === 'Coordinates' ? 1 - p.distance / maxDistance : 0;
    const areaScore = 1 - areaDiffs[index] / maxAreaDiff;

    const score =
      matchingStrategy === 'Coordinates'
        ? (distanceScore * options.distanceCoefficient +
            areaScore * options.areaCoefficient) /
          (options.distanceCoefficient + options.areaCoefficient)
        : areaScore;

    return {
      url: p.url!,
      acres: p.acres!,
      salesPrice: p.salesPrice!,
      distance: p.distance,
      distanceScore,
      areaScore,
      score,
    };
  });

  const topScores = take(
    sortBy(similarWithScore, (p) => -p.score),
    5
  );

  generateOutput(output, topScores, matchingStrategy);

  return {
    output,
    refined,
    success: true,
    matchingStrategy,
  };
}

function generateOutput(
  output: CSVItem,
  topScores: ScoredProperty[],
  matchingStrategy: MatchingStrategy
) {
  const avgPrice = bigIntMean(topScores.map((p) => p.salesPrice));
  const avgScore = mean(topScores.map((p) => p.score));

  output['Result'] = 'Success';

  output['Matching strategy'] = matchingStrategy;

  output[`Average sale price`] = avgPrice.toString();

  output['Average score'] = avgScore.toString();
  output['Average score (rounded)'] = avgScore.toFixed(2).toString();

  for (let i = 0; i < topScores.length; i++) {
    output[`Acres ${i + 1}`] = topScores[i].acres.toFixed(2).toString();
    output[`Area Score ${i + 1}`] = topScores[i].areaScore.toString();
    output[`Area Score ${i + 1} (rounded)`] = topScores[i].areaScore
      .toFixed(2)
      .toString();

    output[`Distance in miles ${i + 1}`] = (
      topScores[i].distance * 0.00062137
    ).toString();
    output[`Distance in miles ${i + 1} (rounded)`] = (
      topScores[i].distance * 0.00062137
    )
      .toFixed(2)
      .toString();

    output[`Distance Score ${i + 1}`] = topScores[i].distanceScore.toString();
    output[`Distance Score ${i + 1} (rounded)`] = topScores[i].distanceScore
      .toFixed(2)
      .toString();

    output[`Score ${i + 1}`] = topScores[i].score.toString();
    output[`Score ${i + 1} (rounded)`] = topScores[i].score
      .toFixed(2)
      .toString();

    output[`Sale price ${i + 1}`] = topScores[i].salesPrice.toString();

    output[`Link ${i + 1}`] = topScores[i].url;
  }
}
