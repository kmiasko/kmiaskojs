export default {
  env: {
    NODE_ENV: process.env.NODE_ENV || 'development',
  },
  http: {
    PORT: process.env.PORT || 8080,
  },
  api: {
    URL: process.env.API_URL || 'http://localhost:3000',
  },
  bot: {},
  db: {
    DATABASE_URI: process.env.DATABASE_URI || 'mongodb://172.17.0.1',
    DATABASE_DB: process.env.DATABASE_DB || 'kmiasko',
  },
};

