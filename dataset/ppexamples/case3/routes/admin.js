var express = require('express');
var router = express.Router();

/* GET home page. */
const flag = "flag{pr0t0TypE-PollUti0n-AST-Inj3Ction}"
router.get('/', function(req, res, next) {
  res.send("You can't read this >:)");
});

module.exports = router;