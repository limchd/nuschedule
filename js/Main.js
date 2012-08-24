var reLink = /https:\/\/sit.aces01.nus.edu.sg\/cors\/jsp\/report\/ModuleDetailedInfo.jsp\?acad_y=(.+)&sem_c=(\d)&mod_c=(.+)/;
//var reLink = /http:\/\/localhost:8888\/timetable\/m\/(.+)/;


var tt = new TimeTable(); //controlling time table
var ripper = new Ripper();
var st = new Set();
var arrInterval = new Array();

var backgroundColor = ['#fc9','#cc9','#c9f','#f9f','#cfc','#9c9', '#99f', '#999', '#696', '#606', '#933', '#009'];
var fontColor = ['#000','#000','#000','#000','#000','#000','#000','#000','#000','#fff','#fff','#fff'];

if (document.images) {
	//status image, the ripper textboxes
	NUSchedule.signals.register("on_module_rip_start", function(i) {
		$('#img'+i).attr('src', 'images/loader.gif');
	});
	NUSchedule.signals.register("on_module_rip_success", function(i) {
		$('#img'+i).attr('src', 'images/accept.png');
	});
	NUSchedule.signals.register("on_module_rip_error", function(i) {
		$('#img'+i).attr('src', 'images/exclamation.png');
	});
	NUSchedule.signals.register("on_module_rip_blank", function(i) {
		$('#img'+i).attr('src', 'images/blank.gif');
	});

	//setRow
	var imgSave = new Image(); imgSave.src = 'images/database_save.png';
	var imgLoad = new Image(); imgLoad.src = 'images/database_go.png';
	var imgDatabase = new Image(); imgDatabase.src = 'images/database.png';
	var imgReplace = new Image(); imgReplace.src = 'images/database_refresh.png';
	var imgRemove = new Image(); imgRemove.src = 'images/database_delete.png';
	var imgEmail = new Image();	imgEmail.src = 'images/email.png';
	//loading module
	var imgLoadModule = new Image(); imgLoadModule.src = 'images/module_load.gif';
};

function checkURLParams(){
	var linkData = getParams()["linkData"];
	if(typeof linkData != "undefined"){
		st.loadLink($.trim(linkData));
	}
}

function getParams() {
  var idx = document.URL.indexOf('?');
  var tempParams = new Object();
  if (idx != -1) {
    var pairs = document.URL.substring(idx+1, document.URL.length).split('&');
    for (var i=0; i<pairs.length; i++) {
      nameVal = pairs[i].split('=');
      tempParams[nameVal[0]] = nameVal[1];
    }
  }
return tempParams;
}

function clearAllInterval(){
	for (i=0;i<arrInterval.length;i++){
		clearInterval(arrInterval.pop());
	}
	resetStatus();
};

var statusid = 0;
var standby = 'ready';
function status(str){
	oldElem = $('stat'+statusid);
	p = createP();
	p.innerHTML = str;
	p.id = 'stat' + (++statusid);
	p.setAttribute('onclick','clearAllInterval()');
	p.setAttribute('title', 'stuck? Click the status until it fixes itself');
	if (str == standby) p.setAttribute('style', '');
	else p.setAttribute('style', 'color:#e30');
	replaceElem(p, oldElem);
	opacity(p.id, 0, 100, 100);
};

function resetStatus() {
	status(standby);
};

function replaceElem(newElem, oldElem, timeout) {

	if (timeout) {
		setTimeout(function(){
			oldElem.parentNode.replaceChild(newElem, oldElem);
		}, timeout);
	}else{
		oldElem.parentNode.replaceChild(newElem, oldElem);
	}
};

function showPage2() {
	st.renderSetRow();
	$("#page1").fadeOut(500);
	$("#page3").fadeOut(500);
	$("#master").fadeOut(500);
	setTimeout("$('#page1').hide()", 700);
	setTimeout("$('#page3').hide()", 700);
	setTimeout("$('#master').hide()",700);
	setTimeout("$('#page2').show()", 600);
	page2_addBoxes();
};

function showPage3() {
	$('#page2').fadeOut(500);
	setTimeout("$('#page2').hide()", 700);
	setTimeout("$('#page3').show()", 600);
	setTimeout("$('#master').show()",600);
};

function page2_addBoxes() {
	elemBox = document.getElementById('boxes');
	
	//don't re-add boxes if they are already made
	if($(elemBox).html()!=""){ return; }

	for (i=1;i<=Ripper.MAX_RIP_INDEX;i++) {

		div = document.createElement('div');
		h1 = document.createElement('h1');
		p = document.createElement('p');
		input = document.createElement('input');
		img = document.createElement('img');

		h1.innerHTML = 'Module '+i;

		input.setAttribute('type', 'text');
		input.setAttribute('maxlength','10');
		input.id='code'+i;
		input.className = 'module_code_box';

		img.id = 'img'+i;

		p.appendChild(input);
		div.appendChild(img); //must be first to be appended, coz floating
		div.appendChild(h1);
		div.appendChild(p);
		elemBox.appendChild(div);

		NUSchedule.signals.send("on_module_rip_blank", i);
	}

};

function test(str){
	document.getElementById('tester').innerHTML = str;
};

function testp(str){
	document.getElementById('tester').innerHTML += str;
};

jQuery.fn.selectText = function(){
    var doc = document;
    var element = this[0];
    if (doc.body.createTextRange) {
        var range = document.body.createTextRange();
        range.moveToElementText(element);
        range.select();
    } else if (window.getSelection) {
        var selection = window.getSelection();        
        var range = document.createRange();
        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);
    }
};

function get_short_url(long_url, login, api_key, func)
{
    $.getJSON(
        "http://api.bitly.com/v3/shorten?callback=?", 
        { 
            "format": "json",
            "apiKey": api_key,
            "login": login,
            "longUrl": long_url
        },
        function(response)
        {
			if(response["status_txt"]!="OK"){
				alert("There is an error getting the bit.ly link.\n\nDetails:\nStatus: "+response["status_txt"]+"\nlong_url: "+long_url);
			}else{
				func(response["data"]["url"]);
			}
        }
    );
}

function showLinkPopup(strText, strURL){
	$("#modal_popup").html("Share " + strText + " using this link:<br /><br /><textarea rows='1' cols='30' readonly='true'>" + strURL + "</textarea>");
	$("#modal_popup").bPopup({ opacity: 0.4 });
	$("#modal_popup textarea").focus().selectText();
}