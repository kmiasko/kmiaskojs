const router = require('express').Router();
const auth = require('./auth');
const api = require('./api');

router.use(auth);
router.use(api);

module.exports = router;
