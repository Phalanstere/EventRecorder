/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */ /*global define */

if (typeof(require) !== "undefined") {
	var $ = require("jquery");
	}


Array.prototype.diff = function(a) {
    return this.filter(function(i) {return a.indexOf(i) < 0;});
};

function FreezeView() {
	"use strict";
	this.all = [];
	var mself = this;
	
	this.get = function get()
	{
	var i, 
		o, 
		fn = window.getComputedStyle,
		all; 
		
	mself.all = []; 
	
	if (fn)
		{
		all = document.getElementsByTagName("*");
		
		for (i = 0; i < all.length; i++) {
			o = {};
			o.el = all[i];
			o.style = getComputedStyle(o.el);
			mself.all.push(o);	
			}			
		}
		else
		{
		all = document.getElementsByTagName("*");
		
		for (i = 0; i < all.length; i++) {
			o = {};
			o.el = all[i];
			o.style = el.currentStyle;
			mself.all.push(o);	
			}	
			
		}
	
	};
	
	//////////////////////
	
	this.set = function set() {
		var i, o;
		for (i = 0; i < mself.all.length; i++) {
			o = mself.all[i];
			o.el.style = o.style;		
			}	
		
	};
	

	mself.get();
	
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
	
	this.active_input = null; // for text area and input fields
	
	this.touched_elements = []; // the elements that the virtual mouse touches
	
	
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
	
	//
	this.key_input = function key_input(keyCode) {
		var c,
		text, 
		div = document.getElementById(ms.active_input);
		text = div.value;
		
		if (keyCode === 8) // Backspace
			{
			if (text.length !== 0) text = text.slice(0, text.length -1);	
			div.value = text;	
			}
		else
			{
			c = String.fromCharCode(keyCode);
			text += c;
		
			div.value = text;
			}
		
	};
	

	
	
	this.special_key_action = function special_key_action(event) {
		console.log("SPECIAL ACTION " + event.keyCode.charCode);
		
		ms.gesamt = event;
		
		switch(event.keyCode.charCode)
			{
				
			case 65: // A
			 
			break;
			
			case 97: // a
			   $('#' + event.id).select();
			break;
			}
	}; 
	
	
	this.special_keys = function special_keys(event) {
		
		var c,
		text, 
		div = document.getElementById(ms.active_input);
		text = div.value;
		
		switch(event.command)
			{
			case "ctrl_down":
				console.log("CTRL_DOWN");
				ms.key_ctrl = true;
			break;	
			
			case "ctrl_up":
				console.log("CTRL_UP");
				ms.key_ctrl = true;
			break;
			}

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
			
			case "mouseover":
				for (var i = 0; i < ev.elements.length; i++) {
						el = ev.elements[i];
						if (el) {
						$("#" + el).mouseover();	
						} 
							
					}
			break;
			
			case "mouseout":
				for (var i = 0; i < ev.elements.length; i++) {
						el = ev.elements[i];
						if (el) {
						$("#" + el).mouseout();	
						} 
							
					}
			break;
			
			case "keypress":
				if (ms.key_ctrl === false) { 	
					ms.key_input(ev.keyCode);
					}
				else {
					 ms.special_key_action(ev);
					 }
			break;
			
			case "specialkey":             // if CTRL is pressed or released
				ms.special_keys(ev);
			break;
			
			
			case "click":
				if (ev.elements) {
					for (var i = 0; i < ev.elements.length; i++) {
						el = ev.elements[i];
						if (el.id) {
							div = document.getElementById(el.id);
							div.click();
							
							if (el.focus === true) {
									div.focus();
									ms.active_input = div.id;
									}
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
			ms.it = 0;	// sets the iterator back to the beginning
		}
			
	};
	
	
	this.loop = function loop() {
		ms.actual = new Date().getTime() - ms.start;
		if (ms.recording) { window.setTimeout(ms.loop, 20); }
	};
	
	// transforms absolute values into percentage value
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
		
		while(n--) {
			div = ms.all[n];
			style = div.getBoundingClientRect();
			if (event.clientX < style.right && 
				event.clientX > style.left && 
				event.clientY > style.top &&
				event.clientY < style.bottom) {
					if (div.id) {
						console.log(div.tagName);
						if (div.tagName === "TEXTAREA") list.push({ id: div.id, 
																	focus: true }); 
						else list.push({ id: div.id });	
						}
					else {
						if (div.className) { list.push({ className: div.className }); }
					}
				}
			
		}
		
		
		return list;
	};
	
	
	this.on_element = function on_element(event) {
		var div, 
			n = ms.all.length,
			style,
			list = [];
			
			while(n--) {
				div = ms.all[n];
				style = div.getBoundingClientRect();	
				if (event.clientX < style.right && event.clientX > style.left && event.clientY > style.top && event.clientY < style.bottom) {
					if (div.id) list.push(div.id);
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
	
	
	
	// to detect a new element causing a mousover effect
	this.check_onmouseover = function check_onmouseover(event, time) {
		var mouseover, 
			mouseout, 
			old_elements = ms.touched_elements;
		
		ms.touched_elements = ms.on_element(event);
		
		mouseover = ms.touched_elements.diff( old_elements);
		mouseout = old_elements.diff( ms.touched_elements);		
		
		if (mouseover.length !== 0) {			 			
				ms.events.push({
					type:		"mouseover",
					time:		time,
					elements:	mouseover // BUG
				});
			
			}
			
		if (mouseout.length !== 0) {				
				ms.events.push({
					type:		"mouseout",
					time:		time,
					elements:	mouseout // BUG
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
			
			ms.check_onmouseover(event, time);
			
		}
	};
	
	

	
	this.create_clipboard = function() {
		var s, node;
		var node = document.createElement("div");
		node.id = "EventRecorderJSON";    
		
		document.body.appendChild(node);
		
		s = document.getElementById("EventRecorderJSON");
		
		s.style.width 	= "50%";
		s.style.height  = "80%";
		s.style.left 	= "20px";
		s.style.top		= "20px";
		s.style.position = "absolute";
		s.style.backgroundColor = "white";
		s.style.zIndex = 1000;		
		s.style.border = "thick solid black";
	
		
		node = document.createElement("div");
		node.id = "EventRecorderData"; 
		
		s = document.getElementById("EventRecorderJSON");
		s.appendChild(node);




		s = document.getElementById("EventRecorderData");
		
		s.style.width 	= "96%";
		s.style.height  = "80%";
		s.style.left 	= "2%";
		s.style.top		= "2%";
		s.style.position = "absolute";
		// s.style.backgroundColor = "orange";
		s.style.overflow = "hidden";

		node = document.createElement("div");
		node.id = "SubmitEvents";
		 
		s = document.getElementById("EventRecorderJSON");
		s.appendChild(node);
		
		s = document.getElementById("SubmitEvents");
		
		s.style.width 	= "16%";
		s.style.height  = "20px";
		s.style.left 	= "2%";
		s.style.bottom		= "2%";
		s.style.position = "absolute";
		s.style.backgroundColor = "gainsboro";
		s.style.padding = "10px";		
		s.style.border = "solid black";
		s.style.textAlign = "center";	
		s.style.cursor	  = "pointer";	
		s.innerHTML = "CLICK + CTRL + C";
		
		s.onclick = ms.copy_to_clipboard;
		
		node = document.createElement("div");
		node.id = "CloseEvents";
		s = document.getElementById("EventRecorderJSON");
		s.appendChild(node);
		
		s = document.getElementById("CloseEvents");
		
		s.style.width 	= "10%";
		s.style.height  = "20px";
		s.style.left 	= "22%";
		s.style.bottom		= "2%";
		s.style.position = "absolute";
		s.style.backgroundColor = "gainsboro";
		s.style.padding = "10px";		
		s.style.border = "solid black";
		s.style.textAlign = "center";	
		s.style.cursor	  = "pointer";	
		s.innerHTML = "CLOSE";		
		
		s.onclick = ms.close_clipboard;
		
	};
	
	
	 this.copy_to_clipboard = function copy_to_clipboard() {
  	
      var node = document.getElementById("EventRecorderData" );

        if ( document.selection ) {
            var range = document.body.createTextRange();
            range.moveToElementText( node  );
            range.select();
        } else if ( window.getSelection ) {
            var range = document.createRange();
            range.selectNodeContents( node );
            window.getSelection().removeAllRanges();
            window.getSelection().addRange( range );
        }
 	};
	
	
	this.close_clipboard = function close_clipboard() {
		var node = document.getElementById("EventRecorderJSON" );
		node.style.display = "none";
	} 
	
	
	this.json = function json() {
		var node, div, s, text = JSON.stringify(ms.events, null, 2);
		
		div = document.getElementById("EventRecorderData");
		if (! div) {
			ms.create_clipboard();
			div = document.getElementById("EventRecorderData");
		};
		
		div.innerHTML = text;

		node = document.getElementById("EventRecorderJSON" );
		node.style.display = "block";
	};
	
	
	this.store_keyup_event = function(event) {
		
		if (ms.recording) {
			var time = new Date().getTime() - ms.start;
			console.log(event.keyCode);
			
			ms.events.push({
				type:	"keyup",
				keyCode: event.keyCode,
				time:	time
			});
		}
	}
	
	
	this.key_ctrl = false;
	
	this.keydown = function keydown(event) {
		switch(event.keyCode)
			{
			case 17:
			  console.log("KEYCONTROL_TRUE " + ms.active_input);
			  ms.key_ctrl = true;
			
			  if (ms.recording) {
			  	
			  	// get the focus
			  	var x = document.activeElement;
			  	
			  	var time = new Date().getTime() - ms.start;
			  	ms.events.push({
					type:		"specialkey",
					command:	"ctrl_down",
					div:		x.id,
					time:	time				
				});
			  	
			  }
			

			  
			break;	
			
			case 65: // A
			  if (ms.key_ctrl === true) {
			  	// everything is marked 
			  }; 
			  	
			case 67: // C
			  if (ms.key_ctrl === true) {
			  	// selection copied 
			  }; 			  	
			  	
			case 88: // X
				// selection extracted
			break;
			  	
			break;
			}
	};
	
	
	this.keyup = function keyup(event) {
		
		if (ms.recording) {
			var time = new Date().getTime() - ms.start;
			
			switch(event.keyCode)
			 {
			 case 8: // backspace
			 	ms.store_keyup_event(event);
			 break;	
			 
			 case 17:
			 	console.log("KEYCONTROL_FALSE");
			  	ms.key_ctrl = false;
			  	ms.events.push({
					type:	"specialkey",
					command:	"ctrl_up",
					time:	time				
					});
			 break;
			 }
		 
		} 
		 
	};
	
	this.keypress = function keypress(event) {
		
		if (ms.recording) {
			var time = new Date().getTime() - ms.start;			
			var o = {
				type:	"keypress",
				keyCode: event.charCode,
				time:	time				
			};			
			
			ms.events.push(o);
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
		document.onkeydown		= ms.keydown;
		document.onkeypress		= ms.keypress;
		document.onkeyup		= ms.keyup;  
 
		
		if (params) {
			if (params.events) ms.events = params.events;
			if (params.autostart) ms.replay();
		}
		
	};
	
	
	
	
	ms.init();
}

if (typeof(module) !== "undefined") {
	module.exports = exports = EventRecorder;
	}