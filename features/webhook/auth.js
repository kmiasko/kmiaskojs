const router = require('express').Router();
const config = require('@root/config');

router.get('/', (req, res, next) => {
  if (req.query['hub.verify_token'] === config.facebook.API_VERIFICATION_TOKEN) {
    res.send(req.query['hub.challenge']);
    return next();
  }
  res.send('Error, wrong validation token');
  return next(config.bot.errors.AUTH_ERROR);
});

module.exports = router;
