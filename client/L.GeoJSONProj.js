(function() {
	L.Util.extend(L.GeoJSON, {
		ctllOrig: L.GeoJSON.coordsToLatLng,
		switchCtll: function(f){
			L.Util.extend(L.GeoJSON, {
				coordsToLatLng: f
			});
		},
		resetCtll: function(){
			L.Util.extend(L.GeoJSON, {
				coordsToLatLng: L.GeoJSON.ctllOrig
			});
		}
	});

	L.GeoJSONProj = L.GeoJSON.extend({
		initialize: function(geojson, options){
			L.GeoJSON.prototype.initialize.call(this, geojson, options);
		},
		addData: function (geojson, cb) {
			if(typeof(geojson.crs) === 'object'){
				var that = this;
				this._createSource(geojson.crs, function(src){
					L.GeoJSON.switchCtll(function(coords, reverse){
						var lat = parseFloat(coords[reverse ? 0 : 1])
						,   lng = parseFloat(coords[reverse ? 1 : 0]);
						var p = Proj4js.transform(src, Proj4js.WGS84, {x: lat, y: lng});
						return new L.LatLng(p.y, p.x, true);
					});
					L.GeoJSON.prototype.addData.call(that, geojson)
					L.GeoJSON.resetCtll();
					if(typeof(cb) === 'function'){
						cb();
					}
				});
			} else {
				L.GeoJSON.prototype.addData.call(this, geojson);
				if(typeof(cb) === 'function'){
					cb();
				}
			}
		},
		_createSource: function(crs, cb){
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
	});
})();
