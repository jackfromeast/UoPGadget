const path = require('path');
const brkt = require('bracket-template').default;
const fs = require('fs');

try{
    Object._expose.setupSymbols()
}
catch(e){
    console.log("[!] symbolic execution not enabled")
}

var template = brkt.compile(
    "Hello world: [[# translate('Hello world') ]]",
    {
      helpers: {
        translate: function(text) {
          return 'Bonjour le monde';
        }
      }
    }
  );
template();