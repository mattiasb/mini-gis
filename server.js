var second = 60;

var express = require('express');
var request = require('request');
var check = require('validator').check;
var helpers = require('./helpers');
var app = express.createServer();

app.use(express.bodyParser());
app.use(app.router);
app.use(express.static(__dirname + "/client"));

app.post('/proxy/', function(req, res, next){
	console.log("body: " + JSON.stringify(req.body));
	if(	helpers.validate(req, res)){
		console.log('got request for ' + req.body.url);

		var options = {
			url:    req.body.url,
			method: req.body.method
		};
		if(req.body.method === "POST"){
			// TODO: Support for other body types
			options.json = req.body.body;
		}
		var response = request(options);
		response.on('error', function(e) { 
						helpers.handleError(res, e.message);
					});
		response.pipe(res);
		
	}
});

var port = process.argv[2] || 80;
console.log('Listening on port ' + port);
app.listen(port);

