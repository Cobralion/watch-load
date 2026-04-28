import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { createHash } from 'node:crypto';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const FORMAT_DATE = new Intl.DateTimeFormat('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'long',
});

export function sha256Hex(message: string): string {
    return createHash('sha256').update(message).digest('hex');
}