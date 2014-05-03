var express = require('express');
var app = express();
app.get(/^((?!\/vendor|src|assets|fonts|.js).)*$/, function(req, res) {
  res.sendfile('./build/index.html');
});
module.exports = app;