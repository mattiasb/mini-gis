(function(){
	var check = require('validator').check;

	// exports.decodeUrl = function(url){
	// 	var ret = decodeURIComponent(url);
	// 	if(ret.slice(0, 7) === 'http://'){
	// 		return ret;
	// 	} else {
	// 		return 'http://' + ret;
	// 	}
	// }

	exports.handleError = function(res, msg){
		console.log(msg);
		res.write(JSON.stringify({type: "Error", message: msg}));
		res.end();
	}

	exports.validate = function(req, res){
		try {
			// check(req.body.url).isUrl();
			check(req.body.method).isIn(["GET","POST"]);
			return true;
		} catch (msg) {
			exports.handleError(res, msg);
			return false;
		}
	}
}).call(this);
