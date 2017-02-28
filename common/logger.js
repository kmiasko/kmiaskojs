import winston from 'winston';
import path from 'path';

const logger = new winston.Logger({
  transports: [
    new winston.transports.File({
      level: 'debug',
      filename: path.join('./logs/kmiasko_bot.log'),
      handleExceptions: true,
      json: true,
      maxsize: 5242880,
      maxFiles: 5,
      colorize: false,
    }),
    new winston.transports.Console({
      level: 'info',
      handleExceptions: true,
      json: false,
      colorize: true,
    }),
  ],
  exitOnError: false,
});

export default logger;

