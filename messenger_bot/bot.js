const events = require('events');
const _ = require('lodash');
const P = require('bluebird');
const { axiosFacebook } = require('@root/common');
const models = require('@root/models');
const logger = require('@root/common/logger');

class Bot extends events.EventEmitter {
  constructor(config, actions, payloads, templates) {
    super();
    this.config = config;
    this.templates = templates;
    this.payloads = payloads;
    this.actions = actions;
    this.on('event', this.handleEvent);
    this.on('location', this.handleLocation);
    this.on('attachments', this.handleAttachments);
    this.on('text', this.handleText);
    this.on('payload', this.handlePayload);
    this.on('action', this.handleAction);
    this.on('error', this.handleError);
  }

  auth(verificationToken) {
    logger.info(verificationToken);
    const that = this;
    setImmediate(() => {
      if (verificationToken === this.config.API_VERIFICATION_TOKEN) {
        return that.emit('authenticated');
      }
      return that.emit('unauthenticated');
    });
  }

  handleLocation(location) {
    logger.info('Got location: ', location);
  }

  handleAttachments(attachments) {
    logger.info('Got attachments: ', attachments);
  }

  handleText(text, target) {
    const action = _.find(this.actions, a => _.has(a, 'regex') && new RegExp(a.regex, 'gi').test(text));
    this.emit('action', action, target);
  }

  handlePayload(payload, target) {
    const action = _.find(this.actions, a => a.payload === payload);
    this.emit('action', action, target);
  }

  handleAction(action, target) {
    const that = this;
    if (_.has(action, 'responseText')) {
      return this.sendMessage({ message: { text: action.responseText } }, target)
        .catch(err => that.emit('error', err));
    }

    if (_.has(action, 'template') && _.has(this.payloads, action.payload)) {
      const template = this.templates[action.template];
      return this.payloads[action.payload]
        .createData(models, template, target, action.dataFn)
        .then(attachment => this.sendMessage({ message: attachment }, target))
        .catch(err => that.emit('error', err));
    }

    return P.resolve();
  }

  handleEvent(event) {
    logger.info(event, { json: true });

    const sender = _.get(event, 'sender.id');
    // const recipient = _.get(event, 'recipient.id');
    // const time = moment(_.get(event, 'timestamp'));
    const { text, location, attachments } = _.pick(event.message, ['text', 'location', 'attachments']);
    const quickReplyPayload = _.get(event, 'message.quick_reply.payload');
    const postBackPayload = _.get(event, 'postback.payload');

    if (!_.isEmpty(quickReplyPayload) || !_.isEmpty(postBackPayload)) {
      this.emit('payload', _.defaultTo(quickReplyPayload, postBackPayload), sender);
    }

    if (!_.isEmpty(text)) {
      this.emit('text', text, sender);
    }

    if (!_.isEmpty(location)) {
      this.emit('location', location, sender);
    }

    if (!_.isEmpty(attachments)) {
      this.emit('attachments', attachments, sender);
    }

    return null;
  }

  sendMessage(content, target) {
    const message = {
      recipient: {
        id: target,
      },
    };

    return axiosFacebook.post('', _.assign({}, message, content));
  }

  handleError(err) {
    logger.warn(_.defaultTo(err.response.data, err));
  }
}

module.exports = Bot;

