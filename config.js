module.exports = {
  facebook: {
    PAGE_ACCESS_TOKEN: 'EAADyKQ94c3IBACrJXG00x2x192AQMiqA0IuNWIIqPdLfZCUALunAe7ZBgvZBn5DZAPnZB5ygyJOdYZCXxEUrcy2z2Y9T672ul0R24mDXuEGgATlF4e8Qqe1HwhyzBWZCWHp1wLAAIawLZC5cUqz8SPfZB3wiS6dSpoXtnwjnJelJ5NgZDZD',
    API_VERIFICATION_TOKEN: 'MbB9GAJ07o3I4vQiAog6JhzfJh2oN0ih',
    APP_ID: '266258167133042',
    APP_SECRET: '6bb2aeeda5575ed469289b4a1f3768c3',
    PAGE_ID: '615596925315002',
  },
  env: {
    NODE_ENV: process.env.NODE_ENV || 'development',
  },
  http: {
    PORT: process.env.PORT || 55555,
    errors: {
      EMPTY_BODY: {
        code: 500,
        name: 'EMPTY_BODY',
        message: 'Body cannot be empty',
      },
      MISSING_REQUIRED_FIELDS: {
        code: 500,
        name: 'MISSING_REQUIRED_FIELDS',
        message: 'One or more of required fields missing',
      },
      GENERAL_ERROR: {
        code: 500,
        name: 'GENERAL_ERROR',
        message: 'Unexpected error occured',
      },
      VALIDATION_ERROR: {
        code: 500,
        name: 'VALIDATION_ERROR',
        message: {},
      },
    },
    validation: {
    },
  },
  api: {
    URL: process.env.API_URL || 'http://localhost:55555',
  },
  bot: {
    payloads: {
      PAYLOAD_GETTING_STARTED: {
        responseText: `Hi. You can use a menu at the bottom, next to the input field or use commands: 'ABOUT', 'PORTFOLIO', 'HELP'`,
      },
      PAYLOAD_POSTBACK_ABOUT: {
        responseText: `My name is Krzysztof. I'm self taught fullstack developer. I'm focused on programming with JavaScript language. My tools of choice are: React, Redux, NodeJS, Express, MongoDB.`,
      },
      PAYLOAD_POSTBACK_HELP: {
        responseText: `ABOUT - some info about Krzysztof, PORTFOLIO - work done, HELP - this message`,
      },
    },
    texts: {
      HELLO: {
        regex: 'H(i|ello|ey|owdy)',
        responseText: `Hi there. If you want to know more use menu at the bottom left, or send me 'HELP' message`,
      },
      ABOUT: {
        regex: 'ABOUT',
        responseText: `My name is Krzysztof. I'm self taught fullstack developer. I'm focused on programming with JavaScript language. My tools of choice are: React, Redux, NodeJS, Express, MongoDB.`,
      },
      HELP: {
        regex: 'HELP',
        responseText: `Hi. You can use a menu at the bottom, next to the input field or use commands: 'ABOUT', 'PORTFOLIO', 'HELP'`,
      },
      DEFAULT: {
        responseText: `Don't understand You human.`,
      },
    },
    errors: {
      AUTH_ERROR: {
        code: 403,
        name: 'AUTH_ERROR',
        message: 'Bad authorization token',
      },
      CREDENTIALS_ERROR: {
        code: 403,
        name: 'CREDENTIALS_ERROR',
        message: 'Missing credentials',
      },
    },
  },
  db: {
    DATABASE_URI: process.env.DATABASE_URI || 'mongodb://172.17.0.1',
    DATABASE_DB: process.env.DATABASE_DB || 'kmiasko',
  },
};

