import trim from 'lodash/trim';

export function idString(value: string) {
  return trim(value).toLowerCase();
}