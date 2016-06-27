// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var bodyParser = require('body-parser');
var _ = require('underscore');

var databaseUri = process.env.DATABASE_URI;

var port = process.env.PORT;
var serverUrl = process.env.SERVER_URL;

var api = new ParseServer({
  databaseURI: databaseUri,
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID,
  masterKey: process.env.MASTER_KEY, //Add your master key here. Keep it secret!
  serverURL: serverUrl + ':' + port  // Don't forget to change to https if needed
});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

console.log('start...')

var app = express();

console.log('set express handlers')

// Global app configuration section
app.set('views', './cloud/views');  // Specify the folder to find templates
app.set('view engine', 'ejs');    // Set the template engine
app.use(bodyParser.urlencoded({ extended: true }));    // Middleware for reading request body

//app.use('', api);

app.use('/*', function(req, res) {


  return res.render("error");

  var content_id = req.params[0];

  if (!content_id) {
    res.render("error");
  } else {
    var content = Parse.Object.extend("Content");
    var query = new Parse.Query(content);
    query.select("owner", "audio", "title", "cover", "location", "tags", "duration", "map");
    query.include("owner");

    query.get(content_id, {
      success : function (content) {

        // res.send(content);
        var params = setupAudioPlayer(content);
        _.extend(params, setupApp(content_id));

        res.render("index", params);
      },
      error : function () {
        res.render("error");
      }
    });
  }
});

function setupApp(content_id) {
  return {
    absoluteUrl : api.serverURL + '/' + content_id
  }
}

function setupAudioPlayer(content) {
  var audio 		= content.get("audio");
  var owner 		= content.get("owner");
  var cover 		= content.get("cover");
  var map   		= content.get("map");
  var title 		= content.get("title");
  var date  		= content.get("created_at");
  var duration 	= content.get("duration");
  var url, author, pic;

  if (audio) {
    url = audio.url();
  }

  if (owner) {
    author = owner.get("display_name");
  }

  if (cover) {
    pic  = 	cover.url();
  } else if (map) {
    pic = map.url();
  }

//YYYY-MM-DD
  return {
    duration 	: duration >> 0,
    date 		: new Date(date),
    description : "Buzz record",
    title 		: title,
    author 		: author,
    recordUrl 	: url,
    pic 		: pic
  }
}

var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server-buzz running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
