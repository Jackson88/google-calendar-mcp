/**
 * Logger utility for the application
 */

import winston from 'winston';
import { env } from '../config/environment';

const formatConfig = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.simple()
);

const logger = winston.createLogger({
  level: env.isProd ? 'info' : 'debug',
  format: formatConfig,
  defaultMeta: { service: 'google-calendar-mcp' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// If not in production, also log to console
if (!env.isProd) {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

export default logger;
