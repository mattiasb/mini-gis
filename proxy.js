#!/bin/env node

var http = require('http');
var querystring = require('querystring');
var url = require('url');

var port = parseInt(process.argv[2]);

if ( port === NaN) {
    port = 8080;
}

http.createServer(function(req, res) {
    var tmpUrl = 'http://' + decodeURIComponent(req.url.slice(1));
    console.log("fetching from: " + tmpUrl);
    var urlObj = url.parse(tmpUrl);
    
    var options = {
	host: urlObj.hostname,
	port: urlObj.port,
	path: urlObj.path
    };

    http.get(options, function(pres) {
	console.log("got response");
	pres.on('data', function(chunk){
	    res.write(chunk, 'binary');
	});
	pres.on('end', function() {
	    res.end();
	});
	pres.headers['Access-Control-Allow-Origin'] = '*';
	res.writeHead(pres.statusCode, pres.headers);
    }).on('error', function(e) {
	console.log("got error:" + JSON.stringify(e));
	res.writeHead(404);
	res.end();
    });
}).listen(port);
