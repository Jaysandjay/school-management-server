import winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

const readerFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
  const cleanedMetadata = Object.fromEntries(
    Object.entries(metadata).filter(([_, value]) =>
      value !== undefined &&
      !(typeof value === 'object' && Object.keys(value).length === 0)
    )
  );

  const metaString = Object.keys(cleanedMetadata).length
    ? `\nMetadata: ${JSON.stringify(cleanedMetadata, null, 2)}`
    : '';

  return `${timestamp} [${level}]: ${message}${stack ? '\n' + stack : ''}${metaString}`;
});

const logger = winston.createLogger({
  level: 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    readerFormat
  ),
  transports: [
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        readerFormat
      )
    }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

export default logger;
