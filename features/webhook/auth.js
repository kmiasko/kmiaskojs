const router = require('express').Router();
const config = require('@root/config');
const logger = require('@root/common/logger');
const { Bot, TEMPLATES, PAYLOADS, ACTIONS } = require('@root/messenger_bot');

const bot = new Bot(config.facebook, ACTIONS, PAYLOADS, TEMPLATES);

router.get('/', (req, res, next) => {
  bot.auth(req.query['hub.verify_token']);
  bot.on('authenticated', () => {
    logger.info('authenticated');
    res.send(req.query['hub.challenge']);
    next();
  });
  bot.on('unauthenticated', () => {
    logger.info('unauthenticated');
    next(config.bot.errors.AUTH_ERROR);
  });
});

module.exports = router;
