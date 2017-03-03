require('module-alias/register');
const express = require('express');
const expressValidator = require('express-validator');
const mongoose = require('mongoose');
const morgan = require('morgan');
const P = require('bluebird');
const bodyParser = require('body-parser');
const config = require('./config');
const { logger, errorHandler } = require('./common');
const features = require('./features');


mongoose.Promise = P;

const mongodbURI = `${config.db.DATABASE_URI}/${config.db.DATABASE_DB}`;
mongoose.connect(mongodbURI);
mongoose.connection.on('connected', () => logger.info('DB connected to: ', mongodbURI));
mongoose.connection.on('error', err => logger.warn('DB error:, ', err));

const app = express();
app.use(morgan('combined', { stream: logger.stream }));

app.use(bodyParser.json());
app.use(expressValidator());
app.use(features);
app.use(errorHandler);
app.listen(config.http.PORT, () => logger.info('Started server on port: ', config.http.PORT));
