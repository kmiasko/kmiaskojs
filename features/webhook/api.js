const router = require('express').Router();
const _ = require('lodash');
const P = require('bluebird');
const moment = require('moment');
const logger = require('@root/common/logger');
const { isBodyEmpty } = require('@root/common/middleware');
const { axiosFacebook } = require('@root/common');
const models = require('@root/models');

const constructPortfolio = portfolio => ({
  title: portfolio.title,
  image_url: portfolio.image,
  subtitle: portfolio.description,
  default_action: {
    type: 'web_url',
    url: portfolio.url,
  },
  buttons: [
    {
      type: 'web_url',
      url: portfolio.url,
      title: 'Visit',
    },
    {
      type: 'web_url',
      title: 'Visit Github',
      url: portfolio.github,
    },
  ],
});

const constructBlogList = blogPost => ({
  title: blogPost.title,
  image_url: blogPost.image,
  default_action: {
    type: 'web_url',
    url: blogPost.url,
  },
  buttons: [
    {
      title: 'View',
      type: 'web_url',
      url: blogPost.url,
    },
  ],
});

const constructQuickReply = reply => ({
  content_type: 'text',
  title: reply.title,
  payload: reply.payload,
  text: reply.text,
});

const TEMPLATES = {
  generic: {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'generic',
        elements: [],
      },
    },
  },
  list: {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'list',
        elements: [],
      },
    },
  },
  quick: {
    text: '',
    quick_replies: [],
  },
  text: {
    text: '',
  },
};

const ACTIONS = {
  PORTFOLIO: {
    payload: 'PAYLOAD_POSTBACK_PORTFOLIO',
    regex: '^PORTFOLIO',
    template: 'generic',
  },
  BLOG: {
    payload: 'PAYLOAD_POSTBACK_BLOG',
    regex: '^BLOG',
    template: 'list',
  },
  GETTING_STARTED: {
    payload: 'PAYLOAD_GETTING_STARTED',
    responseText: `Hi. You can use a menu at the bottom, next to the input field or use commands: 'ABOUT', 'PORTFOLIO', 'BLOG', 'SUBSCRIPTION', 'HELP'`,
  },
  ABOUT: {
    payload: 'PAYLOAD_POSTBACK_ABOUT',
    regex: '^ABOUT',
    responseText: `My name is Krzysztof. I'm self taught fullstack developer. I'm focused on programming with JavaScript language. My tools of choice are: React, Redux, NodeJS, Express, MongoDB.`,
  },
  HELP: {
    payload: 'PAYLOAD_POSTBACK_HELP',
    regex: '^HELP',
    responseText: `Hi. You can use a menu at the bottom, next to the input field or use commands: 'ABOUT', 'PORTFOLIO', 'SUBSCRIPTION', 'BLOG', 'HELP'`,
  },
  HELLO: {
    regex: '^H(i|ello|ey|owdy)',
    responseText: `Hi there. If you want to know more use menu next to the input field, or send me 'HELP' message`,
  },
  SUBSCRIPTION: {
    regex: 'SUBSCRIPTION',
    payload: 'PAYLOAD_POSTBACK_SUBSCRIPTION',
    template: 'quick',
  },
  SUBSCRIBE: {
    payload: 'PAYLOAD_SUBSCRIBE',
    template: 'text',
  },
  UNSUBSCRIBE: {
    payload: 'PAYLOAD_UNSUBSCRIBE',
    template: 'text',
  },
  IGNORE: {
    regex: '^(Yes|No)',
  },
  DEFAULT: {
    regex: '\\w+',
    responseText: `Don't understand you human. Type 'HELP' for list of commands or use menu`,
  },
};

const PAYLOADS = {
  PAYLOAD_POSTBACK_PORTFOLIO: {
    createData(models, template) {
      return models.Portfolio.find({})
        .limit(5)
        .exec()
        .then(portfolios => _.map(portfolios, constructPortfolio))
        .then(elements => _.merge({}, template, { attachment: { payload: { elements } } }));
    },
  },
  PAYLOAD_POSTBACK_BLOG: {
    createData(models, template) {
      return models.Blog.find({})
        .limit(5)
        .exec()
        .then(blogPosts => _.map(blogPosts, constructBlogList))
        .then(elements => _.merge({}, template, { attachment: { payload: { elements } } }));
    },
  },
  PAYLOAD_POSTBACK_SUBSCRIPTION: {
    createData(models, template, target) {
      const subscribe = { title: 'Yes', payload: 'PAYLOAD_SUBSCRIBE', text: 'Subscribe?' };
      const unsubscribe = { title: 'Yes', payload: 'PAYLOAD_UNSUBSCRIBE', text: 'Unsubscribe?' };
      const cancel = { title: 'No', payload: 'PAYLOAD_CANCEL' };

      return models.Subscription.findOne({ user: target }).exec()
        .then(user => (_.isEmpty(user)) ? [subscribe, cancel] : [unsubscribe, cancel])
        .then(qrs => _.map(qrs, qr => constructQuickReply(qr)))
        .then(qrs => _.merge({}, template, { text: qrs[0].text, quick_replies: _.map(qrs, q => _.omit(q, 'text')) }));
    },
  },
  PAYLOAD_SUBSCRIBE: {
    createData(models, template, target) {
      const sub = new models.Subscription({ user: target });
      return sub.save()
        .then(() => _.merge({}, template, { text: `Thank you. Now You'll be infomed of any update in portfolio or blog posts` }));
    },
  },
  PAYLOAD_UNSUBSCRIBE: {
    createData(models, template, target) {
      return models.Subscription.find({ user: target })
        .remove()
        .exec()
        .then(() => _.merge({}, template, { text: `It's a shame. You will miss pretty cool stuff. See ya!`}));
    },
  },
};

const sendMessage = (content, target) => {
  const message = {
    recipient: {
      id: target,
    },
  };

  return axiosFacebook.post('', _.assign({}, message, content));
};

const handleAction = (action, target) => {
  if (_.has(action, 'responseText')) {
    return sendMessage({ message: { text: action.responseText } }, target);
  }

  if (_.has(action, 'template')) {
    const template = TEMPLATES[action.template];
    if (_.has(PAYLOADS, action.payload)) {
      return PAYLOADS[action.payload].createData(models, template, target)
        .then(attachment => sendMessage({ message: attachment }, target));
    }
  }

  return P.resolve();
};

const handleLocation = location => logger.info('Got location: ', location);
const handleAttachments = attachments => logger.info('Got attachments: ', attachments);

const handleText = (text, target) => {
  const action = _.find(ACTIONS, a => (_.has(a, 'regex') && new RegExp(a.regex, 'gi').test(text)));
  return handleAction(action, target)
    .catch(err => logger.warn(err.response.data));
};

const handlePayload = (payload, target) => {
  const action = _.find(ACTIONS, a => a.payload === payload);
  return handleAction(action, target)
    .catch(err => logger.warn(err.response.data));
};


const handleEvent = (event) => {
  logger.info(event, { json: true });

  const sender = _.get(event, 'sender.id');
  const recipient = _.get(event, 'recipient.id');
  const time = moment(_.get(event, 'timestamp'));
  const { text, location, attachments } = _.pick(event.message, ['text', 'location', 'attachments']);
  const quickReplyPayload = _.get(event, 'message.quick_reply.payload');
  const postBackPayload = _.get(event, 'postback.payload');

  if (!_.isEmpty(quickReplyPayload) || !_.isEmpty(postBackPayload)) {
    handlePayload(_.defaultTo(quickReplyPayload, postBackPayload), sender);
  }

  if (!_.isEmpty(text)) {
    handleText(text, sender);
  }

  if (!_.isEmpty(location)) {
    handleLocation(location, sender);
  }

  if (!_.isEmpty(attachments)) {
    handleAttachments(attachments, sender);
  }

  return null;
};

const message = (req, res) => {
  const data = req.body;

  if (data.object === 'page') {
    data.entry.forEach((entry) => {
      entry.messaging.forEach((event) => {
        handleEvent(event);
      });
    });

    res.sendStatus(200);
  }
};

router.post('/', isBodyEmpty, message);

module.exports = router;
