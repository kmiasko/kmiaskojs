const _ = require('lodash');
const P = require('bluebird');
const config = require('@root/config');
const logger = require('@root/common/logger');

const { errors } = config.http;

const isBodyEmpty = body => P.resolve(body)
  .then(() => {
    if (_.isNil(body) || _.isEmpty(body)) {
      return P.reject(errors.EMPTY_BODY);
    }
    return P.resolve(body);
  });

const validateRequest = (req) => {
  const { check, method } = req;
  const { path } = req.route;
  const validationSelector = `${method}:${path}`;
  const validationSchema = config.http.validation[validationSelector];

  if (_.isNil(validationSchema)) {
    return P.resolve();
  }

  req.check(validationSchema);
  return req.getValidationResult()
    .then(result => result.useFirstErrorOnly())
    .then(result => {
      return (result.isEmpty())
        ? P.resolve()
        : P.reject(_.assign(config.http.errors.VALIDATION_ERROR, { message: result.mapped() }));
    });
};


module.exports = {
  isBodyEmpty,
  validateRequest,
};

