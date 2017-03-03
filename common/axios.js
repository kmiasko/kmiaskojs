const axios = require('axios');
const config = require('@root/config');

const axiosFacebook = axios.create({
  baseURL: 'https://graph.facebook.com/v2.6/me/messages',
  params: {
    access_token: config.facebook.PAGE_ACCESS_TOKEN,
  },
});

module.exports = axiosFacebook;
