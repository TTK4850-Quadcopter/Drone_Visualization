var ajax = function(method, route, async, cb) {
	var req = new XMLHttpRequest();
	req.onload = cb;
	req.open(method, route, async);
	req.send();
}

var textLabel = function(latLng, text) {
    var marker = L.marker(latLng).bindLabel(text, { noHide: true });
    return marker;
}

function hashCode(str) { // java String#hashCode
	var hash = 0;
	for (var i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}
	return hash;
} 

function strToRGB(str){
	var i = hashCode(str);
	var r = i>>16&0xFF;
	var g = i>>8&0xFF;
	var b = i&0xFF;
	var out = "#" + ((r > 9) ? "" : "0") + r.toString(16);
	out += ((g > 9) ? "" : "0") + g.toString(16);
	out += ((b > 9) ? "" : "0") + b.toString(16);
	return out;
}

var addDroneLocations = function(droneJSON) {
	droneJSON = JSON.parse(droneJSON);
	if (droneJSON["updateID"] <= lastUpdateId)
		return;
	lastUpdateId = droneJSON["updateID"];

	droneLocations.clearLayers();
	droneLegend._div.innerHTML = "";

	for (var droneNum in droneJSON["drones"]) {
		var singleDroneJSON = droneJSON["drones"][droneNum];
		var droneID = singleDroneJSON["id"];
		var droneColor = strToRGB(droneID);
		droneLegend._div.innerHTML += "<font color=\"" + droneColor + "\">"+droneID+"</font><br>";
		var dronePath = new L.Polyline([], {color: droneColor});
		for (var droneLocationNum in singleDroneJSON["positions"]) {
			var droneLocation = singleDroneJSON["positions"][droneLocationNum];
            var latLng = [droneLocation["lat"], droneLocation["lon"]];
			dronePath.addLatLng(latLng);
            var locationTime = new Date(droneLocation["timestamp"]);
            var timeString = locationTime.toLocaleString('en-US', { hour12: false });
            var marker = textLabel(
                    latLng, 
                    droneID + ": " + timeString);
            marker.addTo(markers);
		}

		if (dronePath.getLatLngs().length > 0) {
			droneLocations.addLayer(dronePath);	
		}
	}
	console.log(droneLocations.getBounds());
	map.fitBounds(droneLocations.getBounds());
};
