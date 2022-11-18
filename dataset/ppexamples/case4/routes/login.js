var express = require('express');
const ion = require('ion-parser');
const pug = require('pug');
var router = express.Router();


/* GET users listing. */
router.post('/', function(req, res, next) {
    try{
      const userData = ion.parse(req.body);
      const template = pug.compile(`h1= msg`);
      if (userData.user.name == "admin" && userData.user.password == "dksjhf2798y8372ghkjfgsd8tg823gkjbfsig7g2gkfjsh"){
        res.send('How the freak did you do that??')
      } else{
        res.send(template({msg: `${userData.user.password} is the incorrect password for ${userData.user.name}`}));
      }
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
    }
    catch(error){
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
    }
});


router.get('/', function(req, res, next) {
    res.send('You need to provide a username and password');
});

module.exports = router;
