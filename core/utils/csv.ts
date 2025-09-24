import fs from 'fs/promises';
import Papa from 'papaparse';
import zlib from 'node:zlib';
import { filesize } from 'filesize';
import first from 'lodash/first';
import { logger } from './logger';

export type CSVItem = {
  [key: string]: string;
};

export function loadCSV(contents: string) {
  return Papa.parse<CSVItem>(contents, { header: true }).data;
}

export function loadCSVHeaders(contents: string) {
  return first(
    Papa.parse(contents, { header: false, preview: 1 }).data
  ) as string[];
}

export function dumpCSV(items: CSVItem[]) {
  return Papa.unparse(items);
}

export async function loadCSVFromFile(path: string) {
  const contents = await fs.readFile(path, { encoding: 'utf8' });

  return loadCSV(contents);
}

export function compressCSV(contents: string | Buffer) {
  return new Promise<Buffer>((resolve, reject) => {
    zlib.gzip(contents, (error, result) => {
      if (error) {
        reject(error);
      } else {
        if (process.env.NODE_ENV === 'development') {
          logger.info(
            `Compressing CSV from ${filesize(contents.length)} to ${filesize(result.length)}`
          );
        }

        resolve(result);
      }
    });
  });
}

export function decompressCSV(contents: Buffer) {
  return new Promise<string>((resolve, reject) => {
    zlib.gunzip(contents, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result.toString('utf-8'));
      }
    });
  });
}
