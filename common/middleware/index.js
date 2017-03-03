const _ = require('lodash');
const logger = require('@root/common/logger');
const { validateRequest } = require('@root/helpers');
const config = require('@root/config');

const isBodyEmpty = (req, res, next) => {
  'use strict';

  if (_.isNil(req.body) || _.isEmpty(req.body)) {
    return next(config.http.errors.EMPTY_BODY);
  }

  next();
};

const validate = (req, res, next) =>
  validateRequest(req)
    .then(() => {
      _.assign(res, { result: { code: 200, data: 'Weee!' } });
      return next();
    })
    .catch(next);

const resolve = (req, res, next) => {
  const result = _.get(res, 'result');
  if (!result) {
    return next(config.http.errors.GENERAL_ERROR);
  }
  const data = _.get(result, 'data');
  return res.status(result.code).json({ data });
};

module.exports = {
  validate,
  resolve,
  isBodyEmpty,
};

