import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import { fileURLToPath } from 'url';
import PrismaTransport from './prismaTransport.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logDirectory = path.join(__dirname, '..', 'logs');

// Özel formatlama: zaman damgası ve renkler (sadece konsol için)
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return `[${timestamp}] ${level.toUpperCase()}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
  })
);

const logger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    // Genel loglar için daily rotate file
    new winston.transports.DailyRotateFile({
      dirname: logDirectory,
      filename: 'application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d' // 14 günlük log saklanır
    }),
    // Hata logları için ayrı dosya
    new winston.transports.DailyRotateFile({
      level: 'error',
      dirname: logDirectory,
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d' // Hatalar 30 gün saklanır
    }),
    // DB'ye LogEvent olarak (Deduplication ile) yaz
    new PrismaTransport({ level: 'info' })
  ]
});

// Geliştirme ortamında (Dev) logları renkli olarak konsola bas
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        return `[${timestamp}] ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
      })
    )
  }));
}

export default logger;
