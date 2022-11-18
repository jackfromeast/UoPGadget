var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('<h1>respond with a resource</h1>');
});

module.exports = router;
