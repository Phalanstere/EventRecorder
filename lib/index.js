var EventRecorder 	= require("./EventRecorder.js");
var util	= require("util");
"use strict";

var er;


function InitRecorder() {
	er = new EventRecorder();
	window.recorder = er;

	
	
	console.log(util.inspect(EventRecorder));
}



window.onload = InitRecorder;


