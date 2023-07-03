const mote = require('mote');

let template = mote.compile('Hello world: {{translate}}');

let data = {
  text: 'Hello world',
  translate: function() {
    return translateToFrench(this.text);
  }
};

console.log(template(data));

function translateToFrench(text) {
  return 'Bonjour le monde';
}
