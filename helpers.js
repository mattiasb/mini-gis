exports.decodeUrl = function(url){
	var ret = decodeURIComponent(url);
	if(ret.slice(0, 7) === 'http://'){
		return ret;
	} else {
		return 'http://' + ret;
	}
}

exports.handleError = function(res, message){
	console.log(message);
	res.write(JSON.stringify({type: "Error", message: message}));
	res.end();
}
