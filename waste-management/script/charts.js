
google.charts.load('current', {'packages':['corechart']});

function drawBinChart(trashData) {

	var data = google.visualization.arrayToDataTable([
	  ['State', 'Incidence'],
	  ['Error', parseInt(trashData.E)],
	  ['Warning', parseInt(trashData.W)],
	  ['Active', parseInt(trashData.A)]
	]);
	
	var options = {
	  title: 'Trash Bin Status for last 12 hours.'
	};

	var chart = new google.visualization.PieChart(document.getElementById('modeltext'));

	chart.draw(data, options);
}

function drawTruckChart(markerInfo)
{
	var data = google.visualization.arrayToDataTable([
	  ['Complaints', 'Quantity'],
	  ['Co2 emission', markerInfo.pollutionComplaint],
	  ['Breakdown', markerInfo.breakdownComplaint],
	  ['trips complaints', markerInfo.tripsComplaint],
	  ['Other complaints', markerInfo.otherComplaint]
	]);

	var options = {
	  title: 'Truck complaints'
	};

	var chart = new google.visualization.PieChart(document.getElementById('modeltext'));

	chart.draw(data, options);
}

function showBinanalytics(trashId)
{
	$.ajax({
		url : "servlet/binstatusanalytic?id="+trashId,
		dataType : 'json',
		async:false,
		error : function() {
			alert("Error Retrieving Analytics data");
		},
		success : function(data) {
			showBinChart(data);	
		}
	});
}
function showBinChart(trashData)
{
	google.charts.setOnLoadCallback(drawBinChart(trashData));
	openNewTab();
}
function showTruckChart(markerInfo)
{
	google.charts.setOnLoadCallback(drawTruckChart(markerInfo));
	openNewTab();
}

function openNewTab()
{
	var w = window.open('', "", "width=400, height=400, scrollbars=yes");
	var html = $("#modeltext").html();
    $(w.document.body).html(html);
}
	  
	  
	  