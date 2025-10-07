import { compressCSV, decompressCSV, dumpCSV, logger } from '@core/utils';
import { db } from '@core/database';
import {
  findAllPendingLandValuationRequests,
  findLandValuationRequestContents,
  updateLandValuationRequestPartialResult,
  updateLandValuationRequestProcessing,
  updateLandValuationRequestResult,
  type LandValuationRequest,
} from '@core/lvr';
import { run } from './run';
import omit from 'lodash/omit';
import { DEFAULT_PROCESS_OPTIONS, type LandValuationResult } from './model';

 async function processLandValuationRequest(lvr: LandValuationRequest) {
  logger.info(`Processing ${lvr.id}`);

  await updateLandValuationRequestProcessing(lvr.id, {
    status: 'Processing',
    processingAt: new Date(),
  });

  const rawContents = await findLandValuationRequestContents(lvr.id, 'raw');

  if (!rawContents) {
    throw 'not found';
  }

  const contents = await decompressCSV(rawContents);

  let partialResult: LandValuationResult | undefined;

  const progressInterval = setInterval(async () => {
    try {
      if (partialResult) {
        await updateLandValuationRequestPartialResult(lvr.id, {
          result: partialResult,
        });
      }
    } catch {
      logger.error(`Failed to update ${lvr.id}`);
    }
  }, 1000);

  const result = await run(
    contents,
    db,
    Object.assign(DEFAULT_PROCESS_OPTIONS, {
      columnMapping: lvr.columnMapping,
      onProgress: (result: LandValuationResult) => {
        partialResult = result;
      },
    })
  );

  clearInterval(progressInterval);

  await updateLandValuationRequestResult(lvr.id, {
    status: 'Complete',
    result: omit(result, 'output', 'refined') as LandValuationResult,
    completedAt: new Date(),
    outputContents: await compressCSV(await dumpCSV(result.output)),
    refinedContents: await compressCSV(await dumpCSV(result.refined)),
  });

  logger.info(`Completed processing ${lvr.id}`);
}

async function process() {
  const lvrs = await findAllPendingLandValuationRequests();
  logger.info(`Found ${lvrs.length} requests`);
  for (const lvr of lvrs) {
    processLandValuationRequest(lvr);
  }
}

async function main() {
  logger.info('Starting');

  const task = async () => {
    try {
      await process();
    } catch (err) {
      logger.error(err, 'Task failed');
    }
  };

  await task();

  setInterval(task, 1000 * 60 * 5);
}

main();
