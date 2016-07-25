
//drawTable and drawRow are used to populate table for Contacts list page
//Saves contacts list table
function drawTable(phoneData,nameData) {
    for (var i = 0; i < phoneData.length; i++) {
        drawRow(phoneData[i],nameData[i]);
    }
}

//Populates each row and appends in Contacts Table
function drawRow(phoneData,nameData) {
    //var row = $("<tr class='myclass' onclick='goto_contactInfo(\"" + rowData.firstName + " " + rowData.lastName + "\");' >")
	
	var row = $("<tr>")
	$("#personDataTable").append(row);
	
	var column = $("<td align='center' valign='middle' class='mcnButtonContent' style='height:40px;width:400px;overflow:auto;font-family:Arial;font-size:16px;padding: 0;'>")
	row.append(column);
	
	var data = {
		phone: phoneData,
        name: nameData
	};
	
	clickLink = $("<a class='mcnButton' title='Info' href='#info' target='_self' style='font-weight:bold;letter-spacing:normal;line-height:100%;text-align:center;text-decoration:none;word-wrap:break-word;display: block;margin: 0;padding: 16px;' onclick='save_info(" + JSON.stringify(data) + ");'>")
	column.append(clickLink);
	clickLink.append(data.name);
	clickLink.append($("</a>"));
	column.append($("</td>"));
	row.append($("</tr>"));
}

//Populate HTML elements for the Contacts Table
function populate_info(name,phone,otp,cookie_name,cookie_phone,cookie_otp)
{
	var elements = document.getElementsByClassName(name);
	for(var i=0; i<elements.length; i++) {
		elements[i].innerHTML = $.cookie(cookie_name);
	}
	var elements = document.getElementsByClassName(phone);
	for(var i=0; i<elements.length; i++) {
		elements[i].innerHTML = $.cookie(cookie_phone);
	}
	var elements = document.getElementsByClassName(otp);
	for(var i=0; i<elements.length; i++) {
		elements[i].innerHTML = "Hi. Your OTP is: "+ $.cookie(cookie_otp);
	}
}

//Handles logic of accessing data among different tabs
function save_info(data)
{
	$.cookie("contact_name", data.name); // Sample 1
	$.cookie("contact_phone", data.phone); // Sample 1
	$.cookie("contact_otp", Math.floor(Math.random()*1000000));
	
	populate_info("myName","myPhone","myOtp","contact_name","contact_phone","contact_otp")
}

//Saves new contacts by sending POST request to contacts Servlet
function add_contact()
{
	$.ajax({
            type: "POST",
            url: "Contacts",
            data:'name=' +encodeURIComponent($('#new_name').val()) + '&phone=' + encodeURIComponent($('#new_num').val()),
            dataType: "json",
			async:false,
            //if received a response from the server
            success: function( data, textStatus, jqXHR) {
                 if(data.success)
                 {
                     console.log("success");
                  }
                 //display error message
                 else {
                     console.log("error");
                 }
            }
        });
	get_contact_list();
}

//Gets all contacts by sending GET request to contacts Servlet
function get_contact_list()
{
	$("#personDataTable").find("tr:gt(0)").remove();
	$.ajax({
		url : "Contacts",
		dataType : 'json',
		async:false,
		error : function() {

			alert("Error Occured");
		},
		success : function(data) {
			result=data;		
		}
	});
	
	drawTable(result["jsonarray"][0].phone,result["jsonarray"][0].name);
}

//drawTransactionTable and drawTransactionRow are used to populate table for all otp messages
//Populates otp list table
function drawTransactionRow(nameData,timeData,otpData)
{
	var row = $("<tr>");
	
	$("#transactionTable").append(row);
	
	var column = $("<td align='center' valign='middle' class='mcnButtonContent' style='font-family:Arial;font-size:16px;padding: 0;'>")
	row.append($("<td align='center' valign='middle' class='mcnButtonContent' style='font-family:Arial;font-size:16px;padding: 0;width:150px;'>" + nameData + "</td>"));
	row.append($("<td align='center' valign='middle' class='mcnButtonContent' style='font-family:Arial;font-size:16px;padding: 0;width:400px;'>" + new Date(timeData*1) + "</td>"));
	row.append($("<td align='center' valign='middle' class='mcnButtonContent' style='font-family:Arial;font-size:16px;padding: 0;width:100px;'>" + otpData + "</td>"));
	row.append($("</tr>"));
}

//Populates each row and appends in Transactions(OTP messgaes) Table
function drawTransactionTable(nameData,timeData,otpData)
{
    for (var i = nameData.length-1; i >=0 ; i--) {
        drawTransactionRow(nameData[i],timeData[i],otpData[i]);
    }
}

//Gets all OTP messages info by sending GET request to Transactions Servlet
function get_transactions()
{
	$("#transactionTable").find("tr:gt(0)").remove();
	var data=$.ajax({
		url : "Transactions",
		dataType : 'json',
		async:false,
		error : function() {
			alert("Error Occured");
		},
		success : function(data) {
			var receivedData = [];
			result=data;
		}
	});
	drawTransactionTable(result["jsonarray"][0].name,result["jsonarray"][0].time,result["jsonarray"][0].otp);
}

//Sends OTP message history to DB after a new OTP message is sent to the user
function update_transactions()
{
	$.ajax({
            type: "POST",
            url: "Transactions",
            data:'name=' +encodeURIComponent($.cookie("contact_name")) + '&time=' + encodeURIComponent(new Date().getTime()) + 
			'&otp=' + encodeURIComponent($.cookie("contact_otp")),
            dataType: "json",
			async:false,
            //if received a response from the server
            success: function( data, textStatus, jqXHR) {
                 if(data.success)
                 {
                     console.log("success");
                  }
                 //display error message
                 else {
                     console.log("error");
                 }
            }
        });    
	
	$.removeCookie('contact_name', { path: '/message' });
	$.removeCookie('contact_phone', { path: '/message' });
	$.removeCookie('contact_otp', { path: '/message' });
	
	get_transactions();
}

//Sends the OTP message to the chosen phone number.
function send_message()
{
	console.log("Calling twilio");
	if($.cookie("contact_name") == undefined || $.cookie("contact_otp") == undefined)
		return;
	
	update_transactions();
	/*
		var data = "To=%2B919717705251&From=%2B12513336143&Body=%22Hi%22";

		var xhr = new XMLHttpRequest();
		xhr.withCredentials = true;

		xhr.addEventListener("readystatechange", function () {
		  if (this.readyState === 4) {
			console.log(this.responseText);
		  }
		});

		xhr.open("POST", "https://api.twilio.com/2010-04-01/Accounts/AC1b256ee94ac78c1065f433df2c9ff308/SMS/Messages");
		xhr.setRequestHeader("authorization", "Basic QUMxYjI1NmVlOTRhYzc4YzEwNjVmNDMzZGYyYzlmZjMwODogN2ViZjE0NjYzOTk0MGY0OWYzMTQwMzEwNzJkMzNmZjI=");
		xhr.setRequestHeader("cache-control", "no-cache");
		xhr.setRequestHeader("content-type", "application/x-www-form-urlencoded");
		xhr.setRequestHeader("Access-Control-Allow-Origin", "http://localhost:8090");

		xhr.send(data);
	*/
	$.ajax({
            type: "POST",
            url: "SendMessage",
            data:'phone=' +encodeURIComponent($.cookie("contact_phone")) + '&otp=' + encodeURIComponent($.cookie("contact_otp"))
			+'&auth=' + encodeURIComponent("QUMxYjI1NmVlOTRhYzc4YzEwNjVmNDMzZGYyYzlmZjMwODogN2ViZjE0NjYzOTk0MGY0OWYzMTQwMzEwNzJkMzNmZjI=")
			+'&from=' + encodeURIComponent('+12513336143'),
            dataType: "json",
			async:false,
            //if received a response from the server
            success: function( data, textStatus, jqXHR) {
                 if(data.success)
                 {
                     console.log(data);
                  }
                 //display error message
                 else {
					 alert("Message Sending failed");
                     console.log("error");
                 }
            }
        });
}