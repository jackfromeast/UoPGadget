const express = require('express')
var sqrl = require('squirrelly')
const path = require('path')
const app = express()


templatePath = path.join(__dirname, 'index.squirrelly');

app.set('views', __dirname);
app.set('view engine', 'squirrelly')
app.render(templatePath, {'testValue':'test'})


