function check(form) 
{ /*function to check userid & password*/
	/*the following code checkes whether the entered userid and password are matching*/
    if(form.userid.value == "admin" && form.pswrd.value == "admin") 
	{
		setCookie("authorized","true",60*60*1000); //1 Hour timeout
		window.open('index.html',"_self")/*opens the target page while Id & password matches*/
    }
    else 
	{
		alert("Incorrect Password or Username")/*displays error message*/
	}
}

function setCookie(name,value,expireSeconds)
{
	var d = new Date();
	d.setTime(d.getTime() + expireSeconds);
	var expire = "expires=" + d.toUTCString();
	document.cookie = name + "=" + value + "; " + expire;
}

