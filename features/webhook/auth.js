const router = require('express').Router();
const config = require('@root/config');
const { Bot } = require('@root/messenger_bot');

const bot = new Bot(config.facebook);

router.get('/', (req, res, next) => {
  bot.auth(req.query['hub.verify_token']);
  bot.on('authenticated', () => {
    res.send(req.query['hub.challenge']);
  });
  bot.on('unauthenticated', () => {
    next(config.bot.errors.AUTH_ERROR);
  });
});

module.exports = router;
