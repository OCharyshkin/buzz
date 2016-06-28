var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var bodyParser = require('body-parser');
var _ = require('underscore');

var app = express();

var databaseUri = process.env.DATABASE_URI;
var port = process.env.PORT;
var serverUrl = process.env.SERVER_URL;

console.log("variables")
console.log(databaseUri)
console.log(serverUrl)
console.log(process.env.APP_ID)
console.log(process.env.MASTER_KEY)

//var api = new ParseServer({
//  databaseURI: databaseUri,
//  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
//  appId: process.env.APP_ID,
//  masterKey: process.env.MASTER_KEY, //Add your master key here. Keep it secret!
//  serverURL: serverUrl + ':' + port  // Don't forget to change to https if needed
//});

app.get('/', function(request, response) {
  response.send('Hello World!');
});

app.listen(port, function() {
  console.log("Listening on " + port);
});