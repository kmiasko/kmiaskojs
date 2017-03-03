const router = require('express').Router();
const { isBodyEmpty } = require('@root/common/middleware');
const config = require('@root/config');
const { Bot, ACTIONS, PAYLOADS, TEMPLATES } = require('@root/messenger_bot');

const bot = new Bot(config.facebook, ACTIONS, PAYLOADS, TEMPLATES);

const message = (req, res) => {
  const data = req.body;

  if (data.object === 'page') {
    data.entry.forEach((entry) => {
      entry.messaging.forEach((event) => {
        bot.emit('event', event);
      });
    });

    res.sendStatus(200);
  }
};

router.post('/', isBodyEmpty, message);

module.exports = router;
