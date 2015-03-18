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

var addDroneLocations = function(droneJSON) {
	droneJSON = JSON.parse(droneJSON);
	if (droneJSON["updateID"] <= lastUpdateId)
		return;
	lastUpdateId = droneJSON["updateID"];

	droneLocations.clearLayers();
    markers.clearLayers();
	droneLegend._div.innerHTML = "";

    dronePaths = []

	for (var droneNum in droneJSON["drones"]) {
		var singleDroneJSON = droneJSON["drones"][droneNum];
		var droneID = singleDroneJSON["id"];
        if (!(droneID in droneColors)) {
            droneColors[droneID] = randomColor( {
                luminosity: 'dark'
            });
        }
		var dronePath = new L.Polyline([], {color: droneColors[droneID]});
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

        dronePaths[droneID] = dronePath
		droneLegend._div.innerHTML += 
            "<a href=\"#\" onclick=\"map.fitBounds(dronePaths["+droneID+"]);\"><font color=\"" + droneColors[droneID] + "\">"+droneID+"</font></a><br>";
		if (dronePath.getLatLngs().length > 0) {
			droneLocations.addLayer(dronePath);	
		}
	}
	map.fitBounds(droneLocations.getBounds());
};
