/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */ /*global define */

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
		var ev = ms.events[ms.it];
		ms.it ++;
		
		switch(ev.type) {
			case "mousemove":
				ms.mouse.style.left	= ev.x;
				ms.mouse.style.top	= ev.y;
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
	
	this.mouseclick	= function mouseclick(event) {
		if (ms.recording) {
			var pos, time;
			time = new Date().getTime() - ms.start;
			pos = ms.percentpos(event);
			
			ms.events.push({
				type:	"click",
				x:		pos.x,
				y:		pos.y,
				time:	time
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
	
	this.init = function init() {
		ms.mouse = document.getElementById("mymouse");
		
		document.onmousemove	= ms.mousemove;
		document.onclick		= ms.mouseclick;
		document.onkeyup		= ms.keyup;    
	};
	
	
	
	
	ms.init();
}

