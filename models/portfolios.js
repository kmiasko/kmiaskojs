const mongoose = require('mongoose');
const _ = require('lodash');
const Schema = mongoose.Schema;

const porfolioSchema = new Schema({
  title: String,
  url: String,
  image: String,
  github: String,
  date: { type: Date, default: Date.now },
  description: String,
  tools: String,
});

const Portfolio = mongoose.model('Portfolio', porfolioSchema);

module.exports = Portfolio;

