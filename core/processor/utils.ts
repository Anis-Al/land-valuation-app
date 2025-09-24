import { parseISO } from 'date-fns';

export function parseDate(value: string) {
  if (!value || value.length === 0) {
    return undefined;
  }

  try {
    const date = parseISO(value);

    if (date.getFullYear() < 1800) {
      return undefined;
    } else {
      return date;
    }
  } catch {
    return undefined;
  }
}

export function parseBigInt(value: string) {
  try {
    return BigInt(value.split('.')[0]);
  } catch {
    return undefined;
  }
}

export function parseLocation(lat: string, lng: string) {
  if (!lat || lat.length === 0 || !lng || lng.length === 0) {
    return undefined;
  } else {
    try {
      return [parseFloat(lat), parseFloat(lng)] as [number, number];
    } catch {
      return undefined;
    }
  }
}

export function bigIntMean(arr: bigint[]) {
  if (arr.length === 0) {
    return 0n;
  }

  let sum = 0n;

  for (const num of arr) {
    sum += num;
  }

  return sum / BigInt(arr.length);
}
