const { assign } = require('lodash');
const logger = require('./logger');

const error = ({ name, message, stack = {}, code = 500 }) => assign(Error(), {
  name: name || 'Unhandled error',
  message: message || 'Unexpected, unhandler error',
  code,
  stack,
});

const errorHandler = (err, req, res, next) => {
  if (!err) {
    next();
  }

  const formattedError = error(err);

  logger.warn(JSON.stringify(formattedError.stack));
  const { code, name, message } = formattedError;
  res.status(code).json({ error: { name, message } });
};

module.exports = errorHandler;

