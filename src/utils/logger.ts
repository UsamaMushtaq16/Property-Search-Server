type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const isDev = process.env.NODE_ENV !== 'production';

function formatMessage(level: LogLevel, message: string, meta?: unknown): string {
  const timestamp = new Date().toISOString();
  const metaStr = meta !== undefined ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
}

export const logger = {
  info(message: string, meta?: unknown): void {
    console.log(formatMessage('info', message, meta));
  },

  warn(message: string, meta?: unknown): void {
    console.warn(formatMessage('warn', message, meta));
  },

  error(message: string, meta?: unknown): void {
    console.error(formatMessage('error', message, meta));
  },

  debug(message: string, meta?: unknown): void {
    if (isDev) {
      console.debug(formatMessage('debug', message, meta));
    }
  },
};
