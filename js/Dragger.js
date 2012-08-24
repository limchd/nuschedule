var handlers = (function($) {

var dragging = false;
var dragElem;
var iDiffX = 0;
var iDiffY = 0;

var onmousedown = function(e) {
	e = (jQuery.browser.msie) ? window.event : e;
	var targetElem = (jQuery.browser.msie) ? e.srcElement : e.target;
	if (targetElem.tagName == 'B') targetElem = targetElem.parentNode; //fix <B> problem in safari
	if (!targetElem.id) return;
	var jObj = $('#'+targetElem.id); //work like $(this)


	//pressing nodes/tabs
	if (/(^m_|^n_)/.test(targetElem.id)) {
		dragElem = jObj.parent();
		dragElem.fadeTo(100,0.9);
		showAvailableCell();
		dragging = true;
		iDiffX = e.screenX;
		iDiffY = e.screenY;
	}

	//pressing module nodes
	if (/^k_/.test(targetElem.id)) {
		if (targetElem.className == 'module_node') {
			targetElem.className = 'module_node_sel';
			tt.swapNode(jObj, deselectOther(jObj));
		} else if (targetElem.className == 'module_node_sel') {
			targetElem.className = 'module_node_1';
			tt.swapNode(jObj, jObj, true); //swap itself, make it fixed
		} else {
			targetElem.className = 'module_node';
			tt.removeNode(jObj);
		}
	}

	switch (targetElem.tagName) {
	case 'INPUT':
	case 'A':
	case 'TEXTAREA':
	case 'SELECT':
	case 'OPTION':
		break;
	default:
		return false;
	}
};

var onmouseup = function(e) {
	var targetElem = (jQuery.browser.msie) ? e.srcElement : e.target;
	if (targetElem.tagName == 'B') targetElem = targetElem.parentNode; //fix <B> problem in safari
	if (!targetElem.id) return;
	var jObj = $('#'+targetElem.id); //work like $(this)

	if (dragging) {
		removeAvailableCell();
		dragElem.css('left','0px').css('top','0px').fadeTo(100,0.6);
	}

	dragging = false;

	if (/(^b_|^t_)/.test(targetElem.id)) {
		tt.swapNode(jObj, dragElem);
		deselectOther(jObj);
		selectNode(jObj);
	}
};

var onmousemove = function(e) {
	//the dragging part
	if (jQuery.browser.msie) e = window.event;
	if (dragging) {
		dragElem.css('left', e.screenX-iDiffX+'px');
		dragElem.css('top', e.screenY-iDiffY+'px');
	}
};

var onmouseover = function(e) {
	var targetElem = (jQuery.browser.msie) ? e.srcElement : e.target;
	if (targetElem.tagName == 'B') targetElem = targetElem.parentNode; //fix <B> problem in safari

	if (/(^b_|^t_)/.test(targetElem.id)) {
		$('#'+targetElem.id) //work like $(this)
		.siblings().andSelf().css('backgroundColor', '#a55').css('zIndex',30);
	}
}

var onmouseout = function(e) {
	var targetElem = (jQuery.browser.msie) ? e.srcElement : e.target;
	if (targetElem.tagName == 'B') targetElem = targetElem.parentNode; //fix <B> problem in safari

	if (/(^b_|^t_)/.test(targetElem.id)) {
		$('#'+targetElem.id) //work like $(this)
		.siblings().andSelf().css('backgroundColor', '#555').css('zIndex',1);
	}
}

//taking any id, convert it into k_ prefixed id.
function convertK(elem) {
	var arrElemId = elem.attr('id').split('_');
	var elemId = 'k_'+arrElemId[1]+'_'+arrElemId[2]+'_'+arrElemId[3];
	return $('#'+elemId);
};

function selectNode(elem) {
	convertK(elem).attr('class','module_node_sel');
};

//change other nodes inside a moduleView to normal color
function deselectOther(elem) {
	return convertK(elem).siblings('.module_node_sel').attr('class','module_node');
};

function showAvailableCell() {
	var tid = dragElem.attr('id'); //like: n_0_tut_1
	var arrtid = tid.split('_');
	//rip
	var module_id = parseInt(arrtid[1]);
	var module = tt.module[module_id];

	switch (arrtid[2]) {
	case 'lec':
		for (var p=0; p < module.lecture.length; p++) {
			tt.showNode(module.code, module.lecture[p], module_id, p);
		}
		break;
	case 'tut':
		for (var p=0; p < module.tutorial.length; p++) {
			tt.showNode(module.code, module.tutorial[p], module_id, p);
		}
		break;
	case 'lab':
		for (var p=0; p < module.laboratory.length; p++) {
			tt.showNode(module.code, module.laboratory[p], module_id, p);
		}
		break;
	}
};

function removeAvailableCell() {
	var tempNodeMaster = document.getElementById('tempNodeMaster');
	while (tempNodeMaster.hasChildNodes()) {
		tempNodeMaster.removeChild(tempNodeMaster.lastChild);
	}
	tt.resetTempCell(); //important!!!
};

return {
	onmousedown: onmousedown,
	onmouseup: onmouseup,
	onmousemove: onmousemove,
	onmouseover: onmouseover,
	onmouseout: onmouseout
};
})($);

for (var i in handlers) {
	document[i] = handlers[i];
}
