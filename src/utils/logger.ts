const isDev = import.meta.env.DEV;

export const logger = {
  error: (message: string, error?: unknown): void => {
    if (isDev) {
      console.error(message, error);
    }
  },
  warn: (message: string, data?: unknown): void => {
    if (isDev) {
      console.warn(message, data);
    }
  },
  log: (message: string, data?: unknown): void => {
    if (isDev) {
      console.log(message, data);
    }
  },
};
