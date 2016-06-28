var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var bodyParser = require('body-parser');
var _ = require('underscore');

var app = express();

app.get('/', function(request, response) {
  response.send('Hello World!');
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});