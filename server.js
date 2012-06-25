var second = 60;

var express = require('express');
var request = require('request').defaults({ timeout: 10*second });

var app = express.createServer();

app.use(app.router);
app.use(express.static(__dirname + "/client"));

app.get('/proxy/:url', function(req, res, next){
	var url = 'http://' + decodeURIComponent(req.params.url);
	console.log('got request for ' + url);
	var response = request.get(url);
	response.on('error', function(e) { 
		console.log("Error: " + e.message);
		res.write(JSON.stringify({type: "Error", message: e.message}));
		res.end();
	});
	response.pipe(res);
});

var port = process.argv[2] || 80;
console.log('Listening on port ' + port);
app.listen(port);
