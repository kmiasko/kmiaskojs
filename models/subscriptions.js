const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subscriptionSchema = new Schema({
  user: { type: String, unique: true },
  createdAt: { type: Date, default: Date.new },
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;