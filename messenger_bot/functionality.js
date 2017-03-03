const _ = require('lodash');
const models = require('@root/models');

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
    dataFn(portfolio) {
      return ({
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
    },
  },
  BLOG: {
    payload: 'PAYLOAD_POSTBACK_BLOG',
    regex: '^BLOG',
    template: 'list',
    dataFn(blogPost) {
      return ({
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
    },
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
    dataFn(reply) {
      return ({
        content_type: 'text',
        title: reply.title,
        payload: reply.payload,
        text: reply.text,
      });
    },
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
    createData(models, template, target, dataFn) {
      return models.Portfolio
        .find({})
        .limit(5)
        .exec()
        .then(portfolios => _.map(portfolios, dataFn))
        .then(elements => _.merge({}, template, { attachment: { payload: { elements } } }));
    },
  },
  PAYLOAD_POSTBACK_BLOG: {
    createData(models, template, target, dataFn) {
      return models.Blog
        .find({})
        .limit(5)
        .exec()
        .then(blogPosts => _.map(blogPosts, dataFn))
        .then(elements => _.merge({}, template, { attachment: { payload: { elements } } }));
    },
  },
  PAYLOAD_POSTBACK_SUBSCRIPTION: {
    createData(models, template, target, dataFn) {
      const subscribe = { title: 'Yes', payload: 'PAYLOAD_SUBSCRIBE', text: 'Subscribe?' };
      const unsubscribe = { title: 'Yes', payload: 'PAYLOAD_UNSUBSCRIBE', text: 'Unsubscribe?' };
      const cancel = { title: 'No', payload: 'PAYLOAD_CANCEL' };

      return models.Subscription
        .findOne({ user: target })
        .exec()
        .then(user => _.isEmpty(user) ? [subscribe, cancel] : [unsubscribe, cancel])
        .then(qrs => _.map(qrs, dataFn))
        .then(qrs => _.merge({}, template, { text: qrs[0].text, quick_replies: _.map(qrs, q => _.omit(q, 'text')) }));
    },
  },
  PAYLOAD_SUBSCRIBE: {
    createData(models, template, target) {
      const sub = new models.Subscription({ user: target });
      return sub
        .save()
        .then(() =>
          _.merge({}, template, { text: `Thank you. Now You'll be infomed of any update in portfolio or blog posts` }));
    },
  },
  PAYLOAD_UNSUBSCRIBE: {
    createData(models, template, target) {
      return models.Subscription
        .find({ user: target })
        .remove()
        .exec()
        .then(() => _.merge({}, template, { text: `It's a shame. You will miss pretty cool stuff. See ya!` }));
    },
  },
};

module.exports = {
  TEMPLATES,
  ACTIONS,
  PAYLOADS,
};
