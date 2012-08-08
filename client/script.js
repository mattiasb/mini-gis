(function(){
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

    $('#url-entry-button').click(fetch);

    var $errorModal = $('#error-modal');
    $errorModal.modal({show: false});

    var $errorModalMessage = $('#error-modal-message');
    var $errorModalHeader = $('#error-modal-header');

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

    function fetch(){
		//TODO: show ticker
		var opt = {
			url:    'http://' + $urlEntry.val(),
			method: "GET"
		}
		$.post('proxy/', opt, function(data){
			$urlEntry.val('');
			geojson.clearLayers();
			if(data.type === "Error") {
				showError("Data fetch error!", data.message);
			} else {
				try {
					addGeojson(data, function(){
						map.fitBounds(geojson.getBounds());
						map.addLayer(geojson);
						//TODO: hide ticker
					});
				} catch(error) {
					showError("Parse error!", error.message);
				}
			}
		},"json").error(function(jqXHR, textStatus, error){
			showError(textStatus, error.message);
		});
    }

    function showError(header, message){
		$errorModalHeader.text(header);
		$errorModalMessage.text(message);
		$errorModal.modal('show');
    }
	
	function setClickable(layer, bool){
		if($.isFunction(layer.eachLayer)) {
			layer.eachLayer(function (l) {
				setClickable(l, bool);
			});
		} else {
			layer.options.clickable = bool;
		}
	}

	function addGeojson(data, cb){
		if(typeof(data.crs) === 'object'){
			createSource(data.crs, function(src){
				geojson.addData(data, function(lat, lng){
					var p = Proj4js.transform(src, Proj4js.WGS84, {x: lat, y: lng});
					return new L.LatLng(p.y, p.x, true);
				});
				if(cb){
					cb();
				}
			});
		} else {
			geojson.addData(data);
			if(cb){
				cb();
			}
		}
	}

	function createSource(crs, cb){
		switch(crs.type){
		case 'name':
			// TODO: handle URN's
			return new Proj4js.Proj(crs.properties.name, cb);
		case 'link':
			// TODO: support this!
			throw "Not Supported!";
			break;
		case 'EPSG': // support for non-standard behaviour of GeoServer
			return new Proj4js.Proj('EPSG:' + crs.properties.code, cb);
		}
		throw "Not Supported!";
	}
})();

