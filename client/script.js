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

    var $urlEntryModal = $('#url-entry-modal');
    var $urlEntry = $('#url-entry');
    $urlEntry.focus();

    $urlEntryModal.modal({backdrop: false});

    $urlEntryModal.on('show', function () {
	$urlEntry.focus();
    });

    var geojson = new L.GeoJSON();
    geojson.on('featureparse', function(e) {
	if(e.properties) {
	    var content = "";
	    for(key in e.properties){
		var val = e.properties[key];
		content += "<dt>" + key + "</dt>";
		content += "<dd>&nbsp;" + val + "</dd>";
	    }
	    e.layer.bindPopup("<dl class=\"dl-horizontal\">" + content + "</dl>");
	}
    });

    $('#url-entry-button').click(function(){
	//TODO: show ticker
	$urlEntry.focus();

	$.get('http://localhost:3000/' + encodeURIComponent($urlEntry.val()), function(data){
	    geojson.clearLayers();
	    geojson.addGeoJSON(data);
	    
	    map.fitBounds(geojson.getBounds());
	    map.addLayer(geojson);
	    
	    //TODO: hide ticker
	    //$urlEntryModal.modal('hide');
	});
    });
})();
