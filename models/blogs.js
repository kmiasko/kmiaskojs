const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const blogSchema = Schema({
  title: String,
  url: String,
  image: String,
  date: { type: Date, default: Date.now },
});

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;
