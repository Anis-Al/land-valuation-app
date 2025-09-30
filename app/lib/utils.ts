import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function formatDateAndTime(value: Date | null | undefined) {
  return value ? format(value, 'yyyy-MM-dd hh:mm a') : '-';
}
