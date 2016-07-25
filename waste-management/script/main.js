var map;

var trash_reached_limit=[false,false,false,false];

var regionData=
[{
	"regionId": 10,
	"regionName": "MG Road",
	"latitude": "12.966333",
	"longitude": "77.606796"
}];

var trashData=[];

var scheduleData=[
{"scheduleId":1,"scheduleTime":1468355468000,"scheduleInterval":10,"truckId":0,"regionId":10,"localityId":100,"status":"I"},
{"scheduleId":2,"scheduleTime":1468355468000,"scheduleInterval":35,"truckId":1,"regionId":10,"localityId":101,"status":"I"}
];

var scheduleInterval=40000;
var realTimeBinDataInterval=3000;


var truckImg = "M17.402,0H5.643C2.526,0,0,3.467,0,6.584v34.804c0,3.116,2.526,5.644,5.643,5.644h11.759c3.116,0,5.644-2.527,5.644-5.644 V6.584C23.044,3.467,20.518,0,17.402,0z M22.057,14.188v11.665l-2.729,0.351v-4.806L22.057,14.188z M20.625,10.773 c-1.016,3.9-2.219,8.51-2.219,8.51H4.638l-2.222-8.51C2.417,10.773,11.3,7.755,20.625,10.773z M3.748,21.713v4.492l-2.73-0.349 V14.502L3.748,21.713z M1.018,37.938V27.579l2.73,0.343v8.196L1.018,37.938z M2.575,40.882l2.218-3.336h13.771l2.219,3.336H2.575z M19.328,35.805v-7.872l2.729-0.355v10.048L19.328,35.805z"

// Data for the markers consisting of a name, a LatLng and a zIndex for the
// order in which these markers should display on top of each other.
//the last column is also used as the key value for storing all the markers in a map
var count =0;
var timeoutValue = 60;
var numberOfReqPerSecond = 0;
var stepSize = .00005;
var carArray =[1,2,3,4];
function getCookie(cname)
{
	var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length,c.length);
        }
    }
    return "";
}

function getBinData(asyncType)
{
	//publishBinData(trashData);
	
	$.ajax({
		url : "servlet/trash",
		dataType : 'json',
		async:asyncType,
		error : function() {
			alert("Error Occured");
		},
		success : function(data) {
			trashData = data;
			publishBinData(data);		
		}
	});
}

function getScheduleData(asyncType)
{
	$.ajax({
		url : "servlet/schedule",
		dataType : 'json',
		async:asyncType,
		error : function() {
			alert("Error Occured");
		},
		success : function(data) {
			scheduleData = data;
			//publishBinData(data);	
			//modifySchedules();
			//executeSchedules();
		}
	});
}

function modifySchedules()
{
	for(var i =0;i<scheduleData.length;i++)
		scheduleData[i].scheduleTime = new Date().getTime() + (scheduleData[i].scheduleInterval*1000);
}
function publishRealTimeBinData(trashRealTimeData) {
	
	console.log(trashRealTimeData);
	for(var i = 0;i<trashRealTimeData.length;i++)
	{
		if(trashRealTimeData[i].capacity != 100) {
			trash_reached_limit[trashRealTimeData[i].trashId-1] = false;
		} 
		if(trash_reached_limit[trashRealTimeData[i].trashId-1] == true)
		{
			//trashRealTimeData.splice(i,1);
			//i--;
			return;
		}
		if(trashRealTimeData[i].capacity == 100){
			trash_reached_limit[trashRealTimeData[i].trashId-1] = true;
		}		
	}
	setMarkers(map,trashRealTimeData,"markerBin");
}
function publishBinData(bins)
{
	//console.log(bins);
	setMarkers(map,bins,"markerBin");
}

function getTruckData(asyncType)
{
	/*
	$.ajax({
		url : "TruckData",
		dataType : 'json',
		async:asyncType,
		error : function() {
			alert("Error Occured");
		},
		success : function(data) {
			truckInfo = data;
			publishTruckData(data);		
		}
	});
	*/
}

function publishTruckData(trucks)
{
	//console.log(trucks);
	//setMarkers(map,trucks.truckData,"markerTruck");
}

function initMap() 
{
	//console.log("this should work");
	var regionId =0;
	var cookieVal = getCookie("authorized");
	if(cookieVal == "")
	{
		console.log("Not authorized!");
		document.location.href = "login.html";
		console.log("what am I doing here");
	}
	else
	{
		console.log(cookieVal);
	}
	//console.log("Why are you not working");
	map = new google.maps.Map(document.getElementById('map'), {
	  center: 
	  {
		  lat: 12.976289426815722, lng: 77.60171413421631},
		  zoom: 15,
		  panControl: false,
			zoomControl: false,
			scaleControl: false,
			maxZoom: 15,
		  mapTypeId: google.maps.MapTypeId.ROADMAP
	});

	google.maps.event.addListener(map, "rightclick", function(event) {
						var lat = event.latLng.lat();
						var lng = event.latLng.lng();
						// populate yor box/field with lat, lng
						console.log(lat +  ", " +lng);
					});
					
					
	getBinData(false);
	//getTruckData(false);
	
	//setwarehouse
	var warehouse = createMarker(50,'warehouse', map, parseFloat(regionData[regionId].latitude), parseFloat(regionData[regionId].longitude),'Warehouse',1);
	warehouse.setMap(map);
	getScheduleData(false);
	
	//scheduleIntervalVariable = setInterval("launchSchedule(scheduleData)", scheduleInterval);
	binDataIntervalVariable = setInterval("getRealTimeBinData(true)",realTimeBinDataInterval);
	
}

function stopSchedules()
{
	clearInterval(intervalVariable);
}

function getRealTimeBinData(Async)
{
	$.ajax({
		url : "servlet/trashrealtime",
		dataType : 'json',
		async:Async,
		error : function() {
			alert("Error Occured");
		},
		success : function(data) {
			console.log("New records fetched");
			//console.log(data);
			publishRealTimeBinData(data);	
			//modifySchedules();
			//executeSchedules();
		}
	});	
}
function updateData()
{
	//getRealTimeBinData(true);
	//getTruckData(true);
	launchSchedule(scheduleData);
}

function executeSchedules()
{
	var time = new Date().getTime(); 
	//console.log(time);
	var kickedOffschedules = [];
	for(var i =0;i<scheduleData.length;i++)
	{
		//scheduleData[i].scheduleTime > (time-(2*scheduleInterval)) &&
		if( scheduleData[i].scheduleTime <= time)
		{
			kickedOffschedules.push(scheduleData[i]);
			scheduleData.splice(i,1);
			i--;
		}
		else
			console.log("No Schedule");
	}
	
	if(kickedOffschedules.length > 0)
		launchSchedule(kickedOffschedules);
	
	//setTimeout("executeSchedules()",5000);
}


function launchSchedule(schedules)
{
	
	for(var i =0;i<schedules.length;i++)
	{
		var trashCoord = null;
		//get locatlity coordinates
		//for(var j =0;j<trashData.length;j++)
		{
			//if(schedules[i].localityId == trashData[j].localityId)
			{
				trashCoord = new google.maps.LatLng(trashData[i].latitude, trashData[i].longitude);
				//break;
			}
		}
		
		var regionInfo = regionData[0];
		
		var truckCoord = new google.maps.LatLng(regionInfo.latitude, regionInfo.longitude);

		if(truckCoord !== undefined && trashCoord !== undefined && truckCoord !== null && trashCoord !== null)
		{
			var truck = new Car(i,truckCoord,trashCoord,trashData[i].trashId);
			carArray.splice(i,1,truck);
		}
	}
	
	getPathIfNotPresent(carArray,0);
	keepMoving(carArray);
	
}

function triggerSchedule(destLatLong,trashId)
{
	var regionInfo = regionData[0];
	truckCoord = new google.maps.LatLng(regionInfo.latitude, regionInfo.longitude);
	var truck = new Car(carArray.length,truckCoord,destLatLong,trashId);
	carArray.splice(carArray.length,0,truck);
	
	carArray[carArray.length-1].getPath();
	keepMoving(carArray);
	
}


function getCarPath()
{
	var directionsService = new google.maps.DirectionsService();
	//console.log("getting car path");
	
	var tempPath;
	var that = this;
	var request =
	{
		origin:this.source,
		destination:this.destination,
		travelMode: google.maps.TravelMode.DRIVING
	};
	
	directionsService.route(request, function(response, status)
	{
		
		if (status == google.maps.DirectionsStatus.OK)
		{
			console.log("getting path : "+that.number);
			tempPath = getPolyline(response);
			//console.log(tempPath.getPath());
			that.polyline = tempPath;
			that.path=tempPath.getPath().b;
			//console.log(that.path.length);
			carArray[that.number].pathAvailable = true;
		}
		
		else
		{
			console.log("getting path : "+that.number + " : "+status);
			that.path=null;
		}
	});	
}

function Car(number,source,destination,trashId)
{
	//console.log("Car");
	var image = 
	{
	  url: '/maps/images/newtruck.jpg',
	  // This marker is 20 pixels wide by 32 pixels high.
	  size: new google.maps.Size(32, 32),
	  // The origin for this image is (0, 0).
	  origin: new google.maps.Point(0, 0),
	  // The anchor for this image is the base of the flagpole at (0, 32).
	  anchor: new google.maps.Point(10, 32)
	};
	// Shapes define the clickable region of the icon. The type defines an HTML
	// <area> element 'poly' which traces out a polygon as a series of X,Y points.
	// The final coordinate closes the poly by connecting to the first coordinate.
	var shape = 
	{
	  coords: [1, 1, 1, 20, 18, 20, 18, 1],
	  type: 'poly'
	};
	this.complete=false;
	this.trashId = trashId;
	this.number = number;
	this.source = source;
	this.destination = destination;
	this.getPath = getCarPath;
	this.path=null;
	this.polyline = null;
	this.icon = new google.maps.Marker({
								position: source,
								map: map,
								icon: 
								{
									path: truckImg,
									scale:.7,
									strokeColor: 'white',
									strokeWeight: .10,
									fillOpacity: 1,
									fillColor: '#404040',
									anchor: new google.maps.Point(10, 25)
								}
								
							});
	this.shape=shape;
	this.currentPosition = 0;
	this.pathAvailable = false;

	
}

function keepMoving(carArray)
{
	for(var i=0;i<carArray.length;i++)
	{
		if (carArray[i].pathAvailable) {			
			proceedCar(carArray[i]);
		}
	}
	
	setTimeout("keepMoving(carArray)",timeoutValue);
	
}

function doNothing()
{
	
}

function proceedCar(car)
{	
	if (car.currentPosition>=car.path.length )
	{
		car.icon.icon.rotation = 0.0;
		if(car.complete)
			return;
		
		car.icon.setMap(null);
		markerStorage[car.trashId].metadata.triggered = false;
		
		//stop processing of truck which has reached 100% capapcity
		if(markerStorage[car.trashId].data.capacity == 100)
			trash_reached_limit[car.trashId-1] = true;
		
		markerStorage[car.trashId].data.capacity = 0;
		var temp_marker = renderMarker("bin_green",markerStorage[car.trashId].data);
		temp_marker.metadata = { id: car.trashId,
								 triggered:false};
		
		for(var i=0;i<trashData.length;i++) {
			if(trashData[i].trashId == car.trashId) {
				temp_marker.data = trashData[i];
				break;
			}
		}
		
		markerStorage[car.trashId] = temp_marker;
		car.complete = true;
		//addOneCar(number);
		/*
		for(var i =0;i<carArray.length;i++)
		{
			if(carArray[i].number == car.number)
			{
				carArray.splice(i,1);
				break;
			}
		}
		*/
		return;
	}
	
	var x = car.icon.getPosition().lat();
	var y = car.icon.getPosition().lng();
	var diffx = car.path[car.currentPosition].lat()-x;
	var diffy = car.path[car.currentPosition].lng()-y;
	var distanceFromNextPoint = Math.sqrt(Math.pow(diffx,2)+Math.pow(diffy,2));
	
	if (distanceFromNextPoint >= stepSize)
	{
		var newCord = calculateNextPoint(diffx,diffy);
		var newPos = new google.maps.LatLng(x+newCord.x,y+newCord.y);
		//var prevPos = new google.maps.LatLng(car.polyline.getPath().getAt(0).lat(),car.polyline.getPath().getAt(0).lng());
		var prevPos = new google.maps.LatLng(x,y);
		car.icon.setPosition(newPos);
		var heading = google.maps.geometry.spherical.computeHeading(prevPos, newPos);
		car.icon.icon.rotation = heading;
		car.icon.setIcon(car.icon.icon);
		//car.icon.setMap(null);
		
		//var segmentId = getSegmentId((y+newCord.y),(x+newCord.x));
		
					// car.icon = new google.maps.Marker({
								// position: newPos,
								// map: map,
								// icon: {
									// path: truckImg,
									// scale:.7,
									// strokeColor: 'white',
									// strokeWeight: .20,
									// fillOpacity: 1,
									// fillColor: '#404040',
									// anchor: new google.maps.Point(10, 25),
									// rotation : newCord.angle + 240
								// }
							// });

		//car.currentPosition++;
	}
	
	else
	{
		car.icon.setPosition(new google.maps.LatLng(car.path[car.currentPosition].lat(),car.path[car.currentPosition].lng()));
		//var segmentId = getSegmentId(car.path[car.currentPosition].k,car.path[car.currentPosition].A);
		car.currentPosition++;
	}
	
}

function calculateNextPoint(x,y)
{
	var theta = Math.atan(Math.abs(y/x));
	
	var newx = stepSize*Math.cos(theta);
	var newy = stepSize*Math.sin(theta);
	var newAngle = (theta*180)/Math.PI;
	
	if (y>0)
	{
		newAngle = 90-newAngle;
	}
		
	else
	{
		newAngle = 90+newAngle;
	}
	
	
	if (x<0)
	{
		newAngle = (-1)*newAngle;
		newx = (-1)*newx;
		
	}
	
	if (y<0)
	{
		newy = (-1)*newy;
	}
	
	var newCord = {
		x : newx,
		y : newy,
		angle : newAngle
	}
	console.log(newCord);
	return newCord;
}

function getPathIfNotPresent(carArray)
{
	for(var i=0;i<carArray.length;i++)
	{
		if (!carArray[i].pathAvailable)
		{
			carArray[i].getPath();
			numberOfReqPerSecond++;
		}
		
		else if (numberOfReqPerSecond >=7)
		{
			console.log(numberOfReqPerSecond);
			numberOfReqPerSecond = 0;
			
			//setTimeout("getPathIfNotPresent()",4000);
			return;
		}
	}
}

function getPolyline(response)
{
	//console.log(response);
	polyline = new google.maps.Polyline({
		path: [],
		strokeColor: '#FF0000',
		strokeWeight: 3
	});
	endLocation = new Object();
	
	var bounds = new google.maps.LatLngBounds();
	var legs = response.routes[0].legs;
	
	for (i=0;i<legs.length;i++)
	{
		endLocation.latlng = legs[i].end_location;
        endLocation.address = legs[i].end_address;
		var steps = legs[i].steps;
		for (j=0;j<steps.length;j++)
		{
			var nextSegment = steps[j].path;
			
			for (k=0;k<nextSegment.length;k++)
			{
			polyline.getPath().push(nextSegment[k]);
			//console.log(polyline.getPath())
			bounds.extend(nextSegment[k]);
			}
		}
	}
	map.fitBounds(bounds);
	polyline.setMap(map);
	//map.setZoom(15.2);
	lineDistance = polyline.length;
	//console.log(lineDistance);
	return polyline;
}