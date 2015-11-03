/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */ /*global define */

if (typeof(module)!== "undefined") {
	var freeze = require("freeze-view");	
	}


function EventRecorder(params) {
	"use strict";
	var ms = this; // myself = ms
	this.start		= null;	
	this.actual		= 0;	// holds the recorded time
	this.recording	= false;
	
	this.apt		= 0; // actual_playback_time
	
	this.events		= [];
	
	this.width		= null;
	this.height		= null;
	
	this.it			= 1; // iterator for playplack
	
	this.mouse      = null;
	
	this.all		= []; // holds all the elements of the page
	
	
	// records the movements
	this.record = function record() {
		ms.width	= window.innerWidth;
		ms.height	= window.innerHeight;
		ms.recording = true;
		ms.start = new Date().getTime();
		ms.loop();
	};
	
	// stop
	this.stop = function stop() {
		ms.recording	= false;
	};
	
	
	this.display = function display() {
		var el,
			div,
			ev = ms.events[ms.it];
			
		ms.it ++;
		
		switch(ev.type) {
			case "mousemove":
				ms.mouse.style.left	= ev.x;
				ms.mouse.style.top	= ev.y;
			break;
			
			case "click":
				if (ev.elements) {
					for (var i = 0; i < ev.elements.length; i++) {
						el = ev.elements[i];
						if (el.id) {
							div = document.getElementById(el.id);
							div.click();	
							}		
					}
				} 
			break;
			
		}
		
		ms.replay();
	};
	
	
	// replay
	this.replay = function replay() {
		var ev, to;
		
		if (ms.it < ms.events.length) {
			ev = ms.events[ms.it];
			to = ev.time-ms.apt;
			// console.log(to);
			ms.apt = ev.time;
			window.setTimeout(ms.display, to);
			
		}
		else {
			ms.it = 0;	
		}
			
			

	};
	
	
	this.loop = function loop() {
		ms.actual = new Date().getTime() - ms.start;
		if (ms.recording) { window.setTimeout(ms.loop, 20); }
	};
	
	this.percentpos	= function percentpos(event) {
		var pos = {};
		pos.x = ((event.clientX / ms.width) *100).toFixed(4) + "%";
		pos.y = ((event.clientY / ms.height)*100).toFixed(4) + "%";
		return pos;
	};
	
	// checks which element is touched by the mouse
	this.get_element = function get_element(event) {
		var div, 
			n = ms.all.length,
			style,
			list = [];
		
		console.log("get_element " + n);
		
		while(n--) {
			div = ms.all[n];
			style = div.getBoundingClientRect();
			if (event.clientX < style.right && 
				event.clientX > style.left && 
				event.clientY > style.top &&
				event.clientY < style.bottom) {
					if (div.id) {
						list.push({ id: div.id });	
						}
					else {
						if (div.className) { list.push({ className: div.className }); }
					}
				}
			
		}
		
		
		return list;
	};
	
	
	this.mouseclick	= function mouseclick(event) {
		if (ms.recording) {
			var pos, time, list;
			time = new Date().getTime() - ms.start;
			pos = ms.percentpos(event);
			
			list = ms.get_element(event);
			
			
			ms.events.push({
				type:	"click",
				x:		pos.x,
				y:		pos.y,
				time:	time,
				elements: list
			});
			
		}
	};
	
	this.mousemove = function mousemove(event) {
		if (ms.recording) {
			var pos, time = new Date().getTime() - ms.start;
			pos = ms.percentpos(event);
			
			ms.events.push({
				type:	"mousemove",
				x:		pos.x,
				y:		pos.y,
				time:	time
			});
		}
	};
	
	
	
	
	
	this.keyup = function keyup(event) {
		if (ms.recording) {
			var time = new Date().getTime() - ms.start;
			ms.events.push({
				type:	"keyup",
				keyCode: event.keyCode,
				time:	time
			});
		}
	};
	
	// gets all the elements of the page
	this.get_all_elements = function get_all_elements() {
		ms.all = document.getElementsByTagName("*");
	}; 
	
	
	this.init = function init() {
		window.er = this;
		
		ms.get_all_elements(); 
		ms.mouse = document.getElementById("mymouse");
		
		document.onmousemove	= ms.mousemove;
		document.onclick		= ms.mouseclick;
		document.onkeyup		= ms.keyup;    
	};
	
	
	
	
	ms.init();
}


if (typeof(module)!== "undefined") module.exports = exports = EventRecorder;