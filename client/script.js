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
    var $urlEntryModal = $('#url-entry-modal');
    $urlEntryModal.modal({backdrop: false});
    $urlEntryModal.on('show', function () {
		$urlEntry.focus();
    });

    var $errorModal = $('#error-modal');
    $errorModal.modal({show: false});
    var $errorModalMessage = $('#error-modal-message');
	var $errorModalHeader = $('#error-modal-header');
    var geojson = new L.GeoJSON();

    geojson.on('featureparse', function(e) {
		var content = "";
		for(key in e.properties){
			var val = e.properties[key];
			content += "<dt>" + key + "</dt>";
			content += "<dd>&nbsp;" + val + "</dd>";
		}
		if(content !== ""){
			e.layer.bindPopup("<dl class=\"dl-horizontal\">" 
							  + content 
							  + "</dl>");
		} else {
			e.layer.options.clickable = false;
		}
    });

    $('#url-entry-button').click(function(){
		//TODO: show ticker
		$urlEntry.focus();
		var url = 'proxy/' + encodeURIComponent($urlEntry.val());
		$.get(url, function(data){
			geojson.clearLayers();
			if(data.type === "Error") {
				showError("Data fetch error!", error);
			} else {
				try {
					geojson.addGeoJSON(data);
					map.fitBounds(geojson.getBounds());
					map.addLayer(geojson);
					//TODO: hide ticker
					//$urlEntryModal.modal('hide');
				} catch(error) {
					showError("Parse error!", error.message);
				}
			}
		}).error(function(data){
			console.log(data);
		});
    });

    function showError(header, message){
		$errorModalHeader.text(header);
		$errorModalMessage.text(message);
		$errorModal.modal('show');
    }

})();
