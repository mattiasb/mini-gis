(function(){

	////// XHR Proxy

	Proxy = {
		get: function(url, cb){
			return Proxy.call(url, "GET", cb);
		},
		post: function(url, cb){ 
			return Proxy.call(url, "POST", cb);
		},
		call: function(url, method, cb){
			return $.post('proxy/', {url: url, method: method}, cb);
		}
	}

	///// MAP

    var osmTileJSON = {    
		"tilejson": "2.0.0"
		, "name": "OpenStreetMap"
		, "description": "A free editable map of the whole world."
		, "version": "1.0.0"
		, "attribution": "&copy; OpenStreetMap contributors, CC-BY-SA"
		, "scheme": "xyz"
		, "tiles": [
            "http://a.tile.openstreetmap.org/${z}/${x}/${y}.png",
            "http://b.tile.openstreetmap.org/${z}/${x}/${y}png",
            "http://c.tile.openstreetmap.org/${z}/${x}/${y}.png"
		]
		, "minzoom": 0
		, "maxzoom": 18
		, "bounds": [ -180, -85, 180, 85 ]
		, "center": [ 0, 25, 2 ]
    };

    var map = L.TileJSON.createMap('map', osmTileJSON);

	map.addControl(new L.Control.Form({
		name: { type: "text", label: "Name" },
		passw: { type: "textarea", label: "Password" },
	})); 

	//// Setup spinner
	var $spinner = $('#spinner');
	var blah = new Spinner({
		lines: 11, // The number of lines to draw
		length: 3, // The length of each line
		width: 2, // The line thickness
		radius: 4, // The radius of the inner circle
		corners: 0.7, // Corner roundness (0..1)
		rotate: 0, // The rotation offset
		color: '#000', // #rgb or #rrggbb
		speed: 1, // Rounds per second
		trail: 40, // Afterglow percentage
		shadow: false, // Whether to render a shadow
		hwaccel: false, // Whether to use hardware acceleration
		className: 'spinner', // The CSS class to assign to the spinner
		zIndex: 2e9, // The z-index (defaults to 2000000000)
		top: 'auto', // Top position relative to parent in px
		left: 'auto' // Left position relative to parent in px
	});

	//// Setup DOM

    var $urlEntry = $('#url-entry');
    $urlEntry.focus();
    $urlEntry.keyup(function(e){
		if(e.which == 13){ // ENTER
			fetch();
		}
		if(e.keyCode == 27){ // ESC
			$urlEntry.blur();
		}
    });
    $(document).keyup(function(e) {
		if(e.which == 76){ // 'L'
			$urlEntry.focus();
		}
    });
	$urlEntry.bind('input propertychange', function() {
		if(this.value.slice(0,7) === 'http://'){
			this.value = this.value.slice(7);
		}
	});
	var $urlEntryButton = $('#url-entry-button');
    $urlEntryButton.click(fetch);

    var $errorModal = $('#error-modal');
    $errorModal.modal({show: false});

    var $errorModalMessage = $('#error-modal-message');
    var $errorModalHeader = $('#error-modal-header');

    function showError(header, message){
		$errorModalHeader.text(header);
		$errorModalMessage.text(message);
		$errorModal.modal('show');
    }

	function searchDisabled(){
		searchEnabled(false);
	}

	function searchEnabled(enabled){
		if(enabled === true || typeof(enabled) === "undefined"){
			// Stop spinner
			$urlEntry.removeAttr("disabled");
			$urlEntryButton.removeAttr("disabled");
		} else {
			// Start spinner
			$urlEntry.attr("disabled", "disabled");
			$urlEntryButton.attr("disabled", "disabled");
		}
	}

	function fetch(){
		searchDisabled();
		execFetch(searchEnabled, function(header, msg){
			showError(header, msg);
			searchEnabled();
		});
	}

	///// Leaflet GeoJSON support

    var geojson = new L.GeoJSON(null, {
		onEachFeature: function (feature, layer) {
			var content = "";
			for(key in feature.properties){
				var val = feature.properties[key];
				content += "<dt>" + key + "</dt>";
				content += "<dd>&nbsp;" + val + "</dd>";
			}
			if(content !== ""){
				layer.bindPopup("<dl class=\"dl-horizontal\">" 
								+ content 
								+ "</dl>");
			} else {
				setClickable(layer, false);
			}
		}
	});

	function setClickable(layer, bool){
		if($.isFunction(layer.eachLayer)) {
			layer.eachLayer(function (l) {
				setClickable(l, bool);
			});
		} else {
			layer.options.clickable = bool;
		}
	}

	///// Fetch methods

    function execFetch(cb, err){
		var url = 'http://' + $urlEntry.val();
		Proxy.get(url, function(data){
			$urlEntry.val('');
			geojson.clearLayers();
			if(data.type === "Error") {
				err && err("Data fetch error!", data.message);
			} else {
				try {
					addGeojson(url, data, function(){
						map.fitBounds(geojson.getBounds());
						map.addLayer(geojson);
						cb && cb();
					});
				} catch(error) {
					err && err("Parse error!", error.message);
				}
			}
		},"json").error(function(jqXHR, textStatus, error){
			err && err(textStatus, error.message);
		});
    }
	
	function addGeojson(baseUrl, data, cb){
		if(validateCRS(data.crs)){
			createSource(baseUrl, data.crs, function(src){
				geojson.addData(data, function(lat, lng){
					var p = Proj4js.transform(src, Proj4js.WGS84, {x: lat, y: lng});
					return new L.LatLng(p.y, p.x, true);
				});
				cb && cb();
			});
		} else {
			geojson.addData(data);
			cb && cb();
		}
	}

	///// Projections

	function createSource(baseUrl, crs, cb){
		switch(crs.type){
		// Standard GeoJSON
		case 'name': return new Proj4js.Proj(crs.properties.name, cb);
		case 'link': 
			return projFromLink( absoluteUrl(baseUrl, crs.properties.href)
								 , crs.properties.type
								 , cb);
		// Non-standard GeoServer behaviour
		case 'EPSG': return new Proj4js.Proj('EPSG:' + crs.properties.code, cb);
		}
	}

	function absoluteUrl(baseUrl, href){
		return new URI(href)
			.resolve(new URI(baseUrl))
			.toString()
	}

	function projFromLink(url, type, cb){
		Proxy.get(url, function(def){
			if(type === "proj4"){
				// A horrible horrible hack, but proj4js really really sucks
				var tmpName = "TMP-" + Math.random().toString().slice(2);
				Proj4js.defs[tmpName] = def;
				return new Proj4js.Proj(tmpName, function(proj){
					delete Proj4js.defs[tmpName];
					cb && cb(proj);
				});
			} else if(type === "proj4js"){
				return new Proj4js.Proj(/[^"]*"([^"]*)"/.exec(def)[1], cb);
			} else { // wkt
				return new Proj4js.Proj(def, cb);
			}
		}).error(function(){
			throw "Couldn't fetch proj definition (" + type + ") from [" + href + "]";
		});
	}

	function validateCRS(crs){
		if(typeof(crs) === "undefined" || crs === null){
			return false;
		}

		if(  typeof(crs)            !== "object" 
		  || typeof(crs.type)       !== "string" 
		  || typeof(crs.properties) !== "object" ){
			throw "Malformed CRS object";
		}

		switch(crs.type){

		// Standard GeoJSON
		case 'name': 
			if(  typeof(crs.properties.type) !== "string" ){
				throw "Malformed CRS object";
			}
			break;
		case 'link':
			var type = crs.properties.type.toLowerCase();
			if(!(type === "proj4" || type === "proj4js" ||  /wkt/.test(type))){
				throw "Malformed CRS object (CRS link type '" + crs.properties.type +"' not supported!";
			}
			break;

		// Non-standard GeoServer behaviour
		case 'EPSG': break;
			
		default:
			throw "Malformed CRS object (CRS type '" + crs.type  + "' not supported)";
		}
		return true;
	}
})();

