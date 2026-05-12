import { environment } from '../../environments/environment';

export function debugLog(...args: unknown[]) {
  if (!environment.production) {
    // // eslint-disable-next-line no-console
    // console.log(...args);
  }
}

export function debugWarn(...args: unknown[]) {
  if (!environment.production) {
    // eslint-disable-next-line no-console
    console.warn(...args);
  }
}

export function logError(...args: unknown[]) {
  // eslint-disable-next-line no-console
  console.error(...args);
}

