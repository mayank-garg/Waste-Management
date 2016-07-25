var markers_bins = {};
var markers_truck = {};
var markerStorage = {};
var trashDetails ={
	id:""
};

function removeMarker(markerId,markerStorage) 
{ 
	if(markerStorage[markerId])
	{
		markerStorage[markerId].setMap(null);
		delete markerStorage[markerId];
	}
}
	
function createMarker(imgSize,imgName,map,latitude,longitude,localityName,index)
{
	var image = 
	{
	  url: '/maps/images/'+imgName +'.jpg',
	  // This marker is 20 pixels wide by 32 pixels high.
	  size: new google.maps.Size(imgSize, imgSize),
	  // The origin for this image is (0, 0).
	  origin: new google.maps.Point(0, 0),
	  // The anchor for this image is the base of the flagpole at (0, 32).
	  anchor: new google.maps.Point(0, imgSize)
	};
	// Shapes define the clickable region of the icon. The type defines an HTML
	// <area> element 'poly' which traces out a polygon as a series of X,Y points.
	// The final coordinate closes the poly by connecting to the first coordinate.
	var shape = 
	{
	  coords: [1, 1, 1, 20, 18, 20, 18, 1],
	  type: 'poly'
	};

	var temp_marker = new google.maps.Marker(
	{

		position: {lat: latitude, lng: longitude},
		map: map,
		icon: image,
		shape: shape,
		title: localityName,
		zIndex: index
	});
	
	
	return temp_marker;
}

function setMarker(map,markerInfo,markerType) {
	
	if(markerType == "markerBin")
		markerStorage = markers_bins;
	else if(markerType == "markerTruck")
		markerStorage = markers_truck;
	
	// Marker sizes are expressed as a Size of X,Y where the origin of the image
	// (0,0) is located in the top left of the image.

	// Origins, anchor positions and coordinates of the marker increase in the X
	// direction to the right and in the Y direction down.
	
	var latitude = parseFloat(markerInfo.latitude);
	var longitude = parseFloat(markerInfo.longitude);
	var imgName="bin_green";
	if(markerInfo.capacity==100)
		imgName="bin_red";
	else if(markerInfo.capacity > 0)
		imgName="bin_blue";
	
	if(markerInfo.errorCode != undefined && markerInfo.errorCode != "E001")
		imgName="error";
	
	var temp_marker = renderMarker(imgName,markerInfo);
/*	var title = "Trash Filled" + markerInfo.capacity + "%";
	
	removeMarker(markerInfo.trashId,markerStorage);
	var temp_marker = createMarker(32, imgName, map, latitude, longitude,title,markerInfo.trashId) */
	
	temp_marker.setMap(map);
	temp_marker.metadata = { id: markerInfo.trashId,
							 triggered:false};
	temp_marker.data = markerInfo;
	markerStorage[markerInfo.trashId] = temp_marker;
}

function renderMarker(imgName,markerInfo) {
	
	getGeolocation(markerInfo);
	var title = "Trash Filled " + markerInfo.capacity + "%";
	
	removeMarker(markerInfo.trashId,markerStorage);
	var temp_marker = createMarker(32, imgName, map, parseFloat(markerInfo.latitude), parseFloat(markerInfo.longitude),title,markerInfo.trashId);
	
	google.maps.event.addListener(temp_marker, 'click', function(event) {
		//showInfo(markerType,markerInfo);
		var infowindow = new google.maps.InfoWindow({
       content: trashDetails[temp_marker.metadata.id]
		});
		console.log(event);
		infowindow.open(map, temp_marker);
	});
		return temp_marker;
}

function getGeolocation(markerInfo)
{
	var x  =0;
	var latlng = new google.maps.LatLng(markerInfo.latitude, markerInfo.longitude);
            var geocoder = geocoder = new google.maps.Geocoder();
            geocoder.geocode({ 'latLng': latlng }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    if (results[1]) {
						
						trashDetails[markerInfo.trashId] =
						'<div id="content">'+
						'<h4 id="firstHeading" class="firstHeading">'+ results[1].formatted_address + '</h4>'+
						'<div id="bodyContent">'+
						'<p><b> Trash Filled(%): ' +markerInfo.capacity+ "%" + 
						'</b></p>'+
						'<p> Bin Latitude: ' +markerInfo.latitude+ 
						'</p>'+
						'<p> Bin Longitude: ' +markerInfo.longitude+ 
						'</p>'+
						'</p>'+
						'<p> Bin Status: ' +markerInfo.errorMessage+ 
						'</p>'+
						'<a href=\"javascript:void(0);\" onclick=\"showBinanalytics('+markerInfo.trashId+');\">See bin status</a>'
						'</div>'+
						'</div>';
                    }
                }
            });
}
function setMarkers(map,markersInfo,markerType) {
	
	// Adds markers to the map.
	for (var i = 0; i < markersInfo.length; i++) 
	{
		var markerInfo = markersInfo[i];
		
		
		if(markerStorage[markerInfo.trashId] == null || !markerStorage[markerInfo.trashId].metadata.triggered) 
		{
			setMarker(map,markerInfo,markerType);
			if(markerInfo.capacity == 100)
			{
			markerStorage[markerInfo.trashId].metadata.triggered = true;
			alert("bin at location: "+ markerInfo.latitude+" , "+markerInfo.longitude+" is full. Truck needs to be sent")
			trashCoord = new google.maps.LatLng(markerInfo.latitude, markerInfo.longitude);
			triggerSchedule(trashCoord,markerInfo.trashId);
			}
		}
	}
}

function showInfo(markerType,markerInfo)
{
	if(markerType == "markerBin")
		showBinDetails(markerInfo);
	else if(markerType == "markerTruck")
		showTruckDetails(markerInfo);
}

function showBinDetails(markerInfo)
{
	showBinChart(markerInfo);
}

function showTruckDetails(markerInfo)
{
	showTruckChart(markerInfo);
}


