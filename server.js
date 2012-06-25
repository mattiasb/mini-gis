var express = require('express');
var request = require('request');

var app = express.createServer();

app.use(app.router);
app.use(express.static(__dirname + "/client"));

app.get('/proxy/:url', function(req, res, next){
	var url = 'http://' + decodeURIComponent(req.params.url);
	console.log('got request for ' + url);
	request.get(url).pipe(res);
});

var port = process.argv[2] || 80;
console.log('Listening on port ' + port);
app.listen(port);
