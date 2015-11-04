var EventRecorder 	= require("./EventRecorder.js");
var util	= require("util");
var $ = require("jquery");

"use strict";

var x;


function InitRecorder() {
	x = new EventRecorder();
	window.recorder = x;

$("#A").click(function(){
	$(this).css("background", "orange");
	x.record();
	});


	$("#B").click(function(){
	$(this).css("background", "blue");	
 	x.stop();
	});


	$("#C").mouseover(function(){
	$(this).css("background", "grey");	
	});

	$("#C").mouseout(function(){
	$(this).css("background", "green");	
	});



	$("#MeToo").click(function(){
	$(this).css("background", "yellow");	
 	x.replay();
	});


	$("#sub").click(function(){
		var s = $(this).css("background");
		if (s !== "red") 	$(this).css("background", "red");
		else 				$(this).css("background", "yellow");
 	});


	$("#Button1").click(function(){
		var s = $(this).css("background");
		if (s !== "red") 	$(this).css("background", "red");
		else 				$(this).css("background", "green");
 	});




}



window.onload = InitRecorder;


