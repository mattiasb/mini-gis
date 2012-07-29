var second = 60;

var express = require('express');
var request = require('request');
var helpers = require('./helpers');

var app = express.createServer();

app.use(app.router);
app.use(express.static(__dirname + "/client"));

app.get('/proxy/:url', function(req, res, next){
	var url = helpers.decodeUrl(req.params.url);
	console.log('got request for ' + url);

	// "http://a.bc".length === 11
	if(url.length < 11){
		helpers.handleError(res, "Invalid URL!");
	} else {
		var response = request.get(url);
		response.on('error', function(e) { 
			helpers.handleError(res, e.message);
		});
		response.pipe(res);
	}
});

var port = process.argv[2] || 80;
console.log('Listening on port ' + port);
app.listen(port);

