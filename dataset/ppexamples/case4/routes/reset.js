var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send("Resetting");
  setTimeout(function () {
    process.on("exit", function () {

      require("child_process")
        .spawn(
          process.argv.shift(),
          process.argv,
          {
            cwd: process.cwd(),
            detached: true,
            stdio: "inherit"
          }
        );
      
    });
    process.exit();
}, 1000);

});

module.exports = router;