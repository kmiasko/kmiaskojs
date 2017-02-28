import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import logger from './common/logger';
import config from './config';

logger.stream = {
  write(message) {
    logger.info(message);
  },
};

const app = express();

app.use(bodyParser.json());
app.use(morgan('combined', { stream: logger.stream }));

app.listen(config.http.PORT, () => logger.info('Started server on port: ', config.http.PORT));

