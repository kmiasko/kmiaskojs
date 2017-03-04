require('module-alias/register');
const express = require('express');
const expressValidator = require('express-validator');
const mongoose = require('mongoose');
const morgan = require('morgan');
const P = require('bluebird');
const https = require('https');
const bodyParser = require('body-parser');
const config = require('./config');
const { logger, errorHandler } = require('./common');
const features = require('./features');
const fs = require('fs');

mongoose.Promise = P;

var options = {
  key: fs.readFileSync(config.http.SSL_KEY),
  cert: fs.readFileSync(config.http.SSL_CERT),
};

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

const server = https.createServer(options, app)
  .listen(config.http.PORT, () => logger.info("Express server listening on port " + config.http.PORT));
