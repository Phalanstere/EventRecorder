/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */ /*global define */

if (typeof(require) !== "undefined") {
	var $ = require("jquery");
	require("./recordmp3.js");
	}

"use strict";

Array.prototype.diff = function(a) {
    return this.filter(function(i) {return a.indexOf(i) < 0;});
};

Array.prototype.contains = function (elem) {
var q;
for (q = 0; q < this.length; q++) {
    if (elem === this[q]) 
        {
        return true;
        }
    }

return false;
};


function FreezeView() {
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
			o.initial = {};
			mself.all.push(o);	
			}			
		}
		else
		{
		all = document.getElementsByTagName("*");
		
		for (i = 0; i < all.length; i++) {
			o = {};
			o.el = all[i];
			// o.style = el.currentStyle;
			o.initial = {};
			o.style = jQuery.extend({}, el.currentStyle)
			
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
			// mself.set_attributes(o.el, o.style)		
			}	
		
	};
	



	this.set_initial_state = function set_initial_state(obj) {
		var i, 
			list = mself.list, 
			m, st;
		
		
		switch(obj.el.tagName) {
			case "TEXTAREA":
				obj.el.value 	= obj.initial.value;
				
			break;	
			
			case "INPUT":
				obj.el.checked	= obj.initial.checked;
				obj.el.value	= obj.initial.value;

			break;
			
			case "OPTION":
			   obj.el.selected = obj.initial.selected;
			break;
			
			case "DIV":
				for (i = 0; i < list.length; i++) {
					m = list[i];
					st = obj.initial[m];
					obj.el.style[m] = st;
				}
			break;
			
		}
	};


	this.list = ["backgroundColor", "color", "width", "height", "fontSize"];


	this.store_initial_state = function store_initial_state(obj) {
		
		var list = mself.list,
			m,
			i,
			a;
		

		
		switch(obj.el.tagName)
			{
			case "TEXTAREA":
				obj.initial.value = obj.el.value;
			break;	
			
			case "INPUT":
				if (typeof(obj.el.checked) !== "undefined") {
					obj.initial.checked = obj.el.checked;
				}
				
				obj.initial.value = obj.el.value;
			break;
			
			case "OPTION":
			   obj.initial.selected = obj.el.selected;
			break;
			
			case "DIV":
				for (i = 0; i < list.length; i++) {
					m = list[i];
					var a = obj.el.style[m];
					obj.initial[m] = a;
					// obj.initial[m] = $(obj).css(m);
					}
			break;
						
			}
		
	}; 


	this.get_attributes = function get_attributes() {

		var i, o;
		for (i = 0; i < mself.all.length; i++) {
			o = mself.all[i];
			// console.log(o.el.tagName);
			mself.store_initial_state(o);
			}	

	};


	this.set_attributes = function set_attributes() {
		var i, o;
		for (i = 0; i < mself.all.length; i++) {
			o = mself.all[i];
			mself.set_initial_state(o);
			}			
	};



	mself.get();
	
}


/*
 *  
 */

// This is a wrapper for the Recordmp3js audio recorder

function AudioRecorder(params) {
	var ms = this;
	
	this.startUserMedia = function startUserMedia(stream) {
    var input = audio_context.createMediaStreamSource(stream);
    console.log('Media stream created.' );
	console.log("input sample rate " +input.context.sampleRate);

    // Feedback!
    //input.connect(audio_context.destination);
    console.log('Input connected to audio context destination.');

	
    ms.recorder = new Recorder(input, {
                  numChannels: 1
                });
    console.log('Recorder initialised.');
    
  };
	
	
	
	this.init = function init() {

		
		    try {
		      // webkit shim
		      window.AudioContext = window.AudioContext || window.webkitAudioContext;
		      navigator.getUserMedia = ( navigator.getUserMedia ||
		                       navigator.webkitGetUserMedia ||
		                       navigator.mozGetUserMedia ||
		                       navigator.msGetUserMedia);
		      window.URL = window.URL || window.webkitURL;
		
		      audio_context = new AudioContext;
		    } catch (e) {
		      alert('No web audio support in this browser!');
		    }
		
		    navigator.getUserMedia({audio: true}, ms.startUserMedia, function(e) {	
		    console.log('No live audio input: ' + e);
		    });
		    
		    
	};
	
	
	
	this.start = function start() {
		console.log("START RECORDING");
		ms.recorder && ms.recorder.record();
	};
	
	this.stop = function stop() {
		ms.recorder && ms.recorder.stop();
		ms.createDownloadLink();
		ms.recorder.clear();
	};

	
	this.createDownloadLink = function createDownloadLink() {
	   $("#RecordedAudio").show();  
		
	   ms.recorder.exportWAV(function(blob) {
	    });
    
	};
	
	
	ms.init();
}

/**************************************************** EVENT RECORDER **********************************************************
*
* 
******************************************************************************************************************************/


function EventRecorder(params) {
	var ms = this; // myself = ms
	this.start		= null;	
	this.actual		= 0;	// holds the recorded time
	this.recording	= false;
	this.apt		= 0; // actual_playback_time	
	this.events		= [];	
	this.width		= null;
	this.height		= null;
	this.it			= 1; // iterator for playplack
	this.duration   = 0; // length of the recording
	this.prct		= 0; // pecentage of the replayed portion 

	this.mouse      = null;
	this.all		= []; // holds all the elements of the page
	this.active_input = null; // for text area and input fields
	this.touched_elements = []; // the elements that the virtual mouse touches
	
	this.mouse_on_selection = false; // checks whether the mouse is on a select field 
	
	this.audio_checked = false;
	this.audio_dub	   = false;
	
	
	// records the movements
	this.record = function record() {
		if (! ms.playback)
		{
		if (ms.audio_checked && ms.audioRecorder) {
			ms.audioRecorder.start();
		};
		
		
		console.log("RECORD");
		ms.events.length = 0;
		
		ms.width	= window.innerWidth;
		ms.height	= window.innerHeight;
		ms.recording = true;
		ms.start = new Date().getTime();
		// ms.loop();
		}
	};
	
	
	this.get_last_position = function get_last_position() {
		var ev = ms.events[ms.events.length-1];
		ms.duration = ev.time;
	}; 
	
	
	// stop
	this.stop = function stop() {
		if (ms.recording === true){
			ms.remove_false_clicks();  // to work around the select problem
			ms.get_last_position();
			ms.it = 1;
			
			
			
			if (ms.audio_checked && ms.audioRecorder) {
				ms.audioRecorder.stop();
			};
			
			}
			
		if (ms.playback === true) {
				$("#evPLAY").css({
				backgroundColor: "gainsboro",
				color: "black"
				});
			
			if (ms.audioFile) {  
			$("#AUDIOCOMMENT").remove();
			}
			
			ms.it = 1;		
			}	
			
		ms.recording	= false;
		ms.playback 	= false;	
		

	};
	
	//
	this.key_input = function key_input(keyCode) {
		var c,
		text, 
		div = document.getElementById(ms.active_input);
		
		if (! div)  // this is a text input 
			{
			div = ms.active_input;	
			}
		
		text = div.value;
		
		if (keyCode === 8) // Backspace
			{
			if (text.length !== 0) { text = text.slice(0, text.length -1); }	
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
	

	
	this.trigger_select_change = function select_change(event) {	
		var s = document.getElementById(event.div);
		$("#" + event.div).val(event.str);
		s.setAttribute('size', 1);		 
		ms.mouse.style.visibility = "visible";
		ms.mouse_on_selection  = false;	
		$("#" + event.div).blur();	


	};
	
	this.trigger_select_focus = function trigger_select_focus(event) {
	  
	  ms.mouse_on_selection  = true;
	  var s = document.getElementById(event.div);
	  s.setAttribute('size', event.options);
	  ms.mouse.style.visibility = "hidden";
	};
	
	
	this.trigger_input_focus = function triffer_input_focus(event) {
		var el,s;
		
		if (event.id) {
		console.log("MIT ID");	
		}
		else {
			if (event.form && event.name) {
				s = "document.forms." + event.form + "." + event.name;
				ms.active_input = eval(s);
				s = "document.forms." + event.form + "." + event.name + ".focus()";
				eval(s);
				
				// document.forms.MyForm.firstname.focus();
			} 
				
		}
	};
	
	
	
	this.display = function display() {
		if (ms.playback) {
		
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
			
			
			case "keyup":
				console.log("KEYUP");
				ms.key_input(ev.keyCode);
			break;
			
			
			case "specialkey":             // if CTRL is pressed or released
				ms.special_keys(ev);
			break;
			
			
			case "select_change":
			  ms.trigger_select_change(ev);
			break;
			
			case "select_focus":
			  ms.trigger_select_focus(ev);
			break;
			
			case "input_focus":
			  ms.trigger_input_focus(ev);
			break;
			
			
			
			case "click":
				if (ev.elements) {

					
					for (var i = 0; i < ev.elements.length; i++) {
						el = ev.elements[i];
						if (el.id) {
							div = document.getElementById(el.id);
							div.click(); 

							console.log(el.id + " " + div.tagName);					
							if (div.tagName === "FORM") {
								for (var i = 0; i < div.children.length; i++) {
									if (div.children[i].value === el.checked) {
										div.children[i].checked = true;
									} 
										
								}
							}
							
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
		
		}
		
	};
	
	
	
	
	// replay
	this.replay = function replay() {
		var ev, to;
		ms.recording	= false;
		if (ms.it === 1) { 
			ms.freeze.set_attributes();
			ms.start = new Date().getTime();
			if (params.recorder) ms.loop();
			
			if (ms.audioFile) {  
			  var s = '<embed id = "AUDIOCOMMENT" src="' + ms.audioFile + '" hidden="true" autostart="true" loop="1">';
			  $("body").append(s);
			}
			
			
			if (ms.audioRecorder && ms.audio_dub === true) {
				ms.audioRecorder.start();
				}
			
			}
		
		
		if (ms.it < ms.events.length) {
			ev = ms.events[ms.it];
			to = ev.time-ms.apt;
			// console.log(to);
			ms.apt = ev.time;
			window.setTimeout(ms.display, to);
			
		}
		else {
			ms.stop();
			ms.it = 1;	// sets the iterator back to the beginning
			
			if (ms.audioRecorder && ms.audio_dub === true) {
				ms.audioRecorder.stop();
				}
			
			
			$("#evPLAY").css({
		   	backgroundColor: "gainsboro",
		   	color: "black"
		   });
			
		}
			
	};
	
	
	this.loop = function loop() {
		var p;
		ms.actual = new Date().getTime() - ms.start;
		
		if (ms.actual === 0) ms.prct = 0;
		else ms.prct = ms.actual / ms.duration;
	
		if (ms.prct > 1) ms.prct = 1;
		p = (ms.prct*100) + "%";
		$("#evSliderButton").css("left", p);

		
		if (ms.playback) { window.setTimeout(ms.loop, 20); }
	};
	
	// transforms absolute values into percentage value
	this.percentpos	= function percentpos(event) {
		var pos = {};
		pos.x = ((event.clientX / ms.width) *100).toFixed(4) + "%";
		pos.y = ((event.clientY / ms.height)*100).toFixed(4) + "%";
		return pos;
	};
	
	
	// check input
	this.check_input = function check_input(div, event) {
		var form, 
			id, 
			name,
			input = false;
			
		switch(div.tagName)
			{
			case "FORM":
				id 		= $(div).attr("id");
				name	= $(div).attr("name");
			break; 	
			}	
			
			
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
						
						switch(div.tagName) {
							case "TEXTAREA":
							 list.push({ id: div.id, 
										focus: true }); 
							break;
							
							case "FORM":
								$("#Gender input:checked").each(function() {
								    // $(this).val();
								    // alert(  this.value );
								    list.push({ id: div.id, 
										checked: this.value }); 
								    
								    
								});
							break;
							
							default:
								list.push({ id: div.id });
							break;
						};
						
						/*
						if (div.tagName === "TEXTAREA") list.push({ id: div.id, 
																	focus: true }); 
						else {
							 
							 list.push({ id: div.id });
							 }
						*/	
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
	
	
	this.record_input_click = function record_input_click(el) {
		var name,
			type,
			temp,
			form,
			time = new Date().getTime() - ms.start;
		
		type = el.nodeType;
		
		window.el = el;
		
		
		switch(type) {
			case 1:	
				if (el.id){
				
				ms.events.push({
				type:	"click_input",
				time:	time,
				id:		el.id,
				name:	null
			});
				  	
				}
			break;
		};
		
	}; 
	
	
	this.mousedown	= function mousedown(event) {
		if (ms.recording) {
		console.log("mousedown");
		}
	};

	this.mouseup	= function mouseup(event) {
		if (ms.recording) {
		console.log("mouseup");			
		}

	};
	

	this.scroll = function scroll(event) {
		if (ms.recording) {
		console.log("scrolling " + document.scrolltop);	
		}
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
			
			if (ms.mouse_on_selection) console.log("SELECTION");
			
			ms.events.push({
				type:	"mousemove",
				x:		pos.x,
				y:		pos.y,
				time:	time
			});
			
			// console.log("MM");
			
			ms.check_onmouseover(event, time);
			
		}
	};
	
	

	
	this.show_recorder = function show_recorder() {
		var s, fb, node, el, subnode, subsub;
		
		fb = document.createElement("div");
		fb.id = "RecordedAudio";    
		
		document.body.appendChild(fb);
		s = '<div id ="HideRecordedAudio">X</div>';
		$("#RecordedAudio").append(s);
		
		
		
		node = document.createElement("div");
		node.id = "EventRecorderPanel";    
		document.body.appendChild(node);
		
		
		
		el = document.getElementById("EventRecorderPanel");
		subnode 			= document.createElement("div");
		subnode.id			= "evREC";
		subnode.className	= "evButtons";
		subnode.innerHTML = "REC";			
		node.appendChild(subnode);
		
		subnode 			= document.createElement("div");
		subnode.id			= "evSTOP";
		subnode.className	= "evButtons";
		subnode.innerHTML = "STOP";			
		node.appendChild(subnode);

		subnode 			= document.createElement("div");
		subnode.id			= "evPLAY";
		subnode.className	= "evButtons";
		subnode.innerHTML = "PLAY";			
		node.appendChild(subnode);

		subnode 			= document.createElement("div");
		subnode.id			= "evJSON";
		subnode.className	= "evButtons";
		subnode.innerHTML = "JSON";			
		node.appendChild(subnode);


		subnode 			= document.createElement("div");
		subnode.id			= "evSLIDER";
		subnode.className	= "evSliderBar";				
		node.appendChild(subnode);



 		$("#evSLIDER").append('<div id="evSliderButton"></div>') 			

		s = '<div id ="EVAudio"><input id = "evAudio" type="checkbox" name="audio">';
		s += '<div>AUDIO</div>';
		s += '</div>';
		
		s += '<div id ="EVDub"><input id = "evDub" type="checkbox" name="audio">';
		s += '<div>DUB</div>';
		s += '</div>';		
		
		$("#EventRecorderPanel").append(s); 





		$("#evPLAY").click(function(){
			ms.playback = true; 
			ms.replay();
			$(this).css({
		   	 backgroundColor: "lightgreen",
		   	 color: "white"
		   });
		});


		$("#evREC").click(function(){
		   if (! ms.playback) { 
			   $(this).css({
			   	 backgroundColor: "red",
			   	 color: "white"
			   });	
			   
		   	ms.record();
		   	}
		});



		$("#evSTOP").click(function(){
			ms.stop();
			$("#evREC").css({
		   	 backgroundColor: "gainsboro",
		   	 color: "black"
		   });	
		});
		
		$("#evJSON").click(function(){
			ms.json();
		});


		$("#evAudio").click(function(){
			if (ms.audio_checked === false) ms.audio_checked = true;
			else							ms.audio_checked = false;
			
			if (! ms.media_recorder) {
				ms.audioRecorder = new AudioRecorder();
			};  				
		});


		$("#evDub").click(function(){
			if (ms.audio_dub === false) ms.audio_dub = true;
			else						ms.audio_dub = false;
			
				
		});




		$("#HideRecordedAudio").click(function(){
			$("#RecordedAudio").hide();		
		});


		$("#RecordedAudio").css({
			position: "absolute",
			top: "2%",
			right: "2%",
			width: "400px",
			height: "80%",
			color: "darkgray",
			fontWeight: 400,
			backgroundColor: "gainsboro",
			display: 'none',
			border: 'solid 4px black' 
		});

		$("#HideRecordedAudio").css({
			position: "absolute",
			top: "2%",
			right: "2%",
			width: "20px",
			height: "20px",
			color: "white",
			backgroundColor: "black",
			textAlign: 'center',
			fontSize: "20px",
			cursor: "pointer",
			border: 'solid 4px black' 
		});




		$("#EVAudio").css({
			position: "absolute",
			top: "6px",
			left: "260px",
			width: "40px",
			height: "20px",
			color: "darkgray",
			fontWeight: 400,
			backgroundColor: "gainsboro",
		});


		$("#EVDub").css({
			position: "absolute",
			top: "6px",
			left: "310px",
			width: "40px",
			height: "20px",
			color: "darkgray",
			fontWeight: 400,
			backgroundColor: "gainsboro",
		});



		$(".evSliderBar").css({
			position: "absolute",
			top: "40px",
			left: "10px",
			width: "340px",
			height: "8px",
			backgroundColor: "gainsboro",
		});
		

		$("#evSliderButton").css({
			position: "absolute",
			top: "0px",
			left: "0px",
			width: "8px",
			height: "8px",
			backgroundColor: "black",
			cursor: "pointer"
		});

		
		$(".evButtons").css({
			position: "relative",
			marginLeft: "6px",
			padding: "4px",
			width: "48px",
			height: "auto",
			backgroundColor: "gainsboro",
			cursor: "pointer",
			float: "left",
			marginTop: "6px"
		});
		
		$("#EventRecorderPanel").css({
			position: "absolute",
			left: "2%",
			top: "82%",
			width: "360px",
			height: "56px",
			backgroundColor: "white",
			border: "solid 4px black",
			zIndex: 999,
			fontSize: "12px",
			fontWeight: 800,
			textAlign: "center",
			
		});
		
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
	
	
	this.focus_input = function focus_input(elem) {
		var name = $(elem).attr("name"),
			id = $(elem).attr("id"),
			temp,
			form = null,
			dom,
			time = new Date().getTime() - ms.start;
			
			
	temp = $(elem).parent().attr("id");
	dom	 = document.getElementById(temp);
	if (dom) {
		if (dom.tagName === "FORM") {
		form = temp;	
		}
	}
			
			
	console.log("FIN " + name);		
	
		ms.events.push({
			type:		"input_focus",
			div:		id,
			name:		name,
			form:		form,
			time: 		time,	
			});
			
	};
	
	
	this.focus_selection = function focus_selection(elem) {
		
		var id = $(elem).attr("id"),
			no = $(elem).children().length,
			time = new Date().getTime() - ms.start,
			position = $(elem).position();
		
		ms.events.push({
			type:		"select_focus",
			div:		id,
			options:	no,
			time: 		time,
			x:			position.left,
			y:			position.top	
			});
		
		console.log("FOCUS" + position.left);
	}; 
	
	
	this.change_selection = function change_selection(elem) {
		var list = [],
			s, 
			no,
			time = new Date().getTime() - ms.start,
			id = $(elem).attr("id");

		s = $(elem).children(":selected").html();
		list = $(elem).children();
		
	  	for (var i = 0; i < list.length; i++) {
	  		if (list[i].selected === true) no = i;
	  	}
		
		ms.events.push({
			type:	"select_change",
			div:	id,
			option:	no,
			str: s,
			time: time				
			});
		
	var position = $(elem).position();	
	console.log(position.left);
		
	}; 
	
	
	
	// workaround function
	this.remove_false_clicks = function remove_false_clicks() {
		var clicks 	= ms.find_events('click'),
			change 	= ms.find_events('select_change'),
			time,
			ev,
			list = [],
			dlist = [];
		
		for (var i = 0; i < change.length; i++) {
			var time = change[i].time;
			
			for (var j = 0; j < ms.events.length; j++) {
				ev = ms.events[j];
				if (ev.type === "click" && ev.time > time && ev.time < time + 30) {
				  list.push(j);
				  }
				}
					
		}
		
	console.log("REMOVE FALSE CLICKS " + list);
		
	for (var i = 0; i < ms.events.length; i++) {
		if (list.contains(i) === false) {
			dlist.push( ms.events[i] );
			}		
		}
	
	ms.events = dlist;
		
	}; 
	
	
	
	// gets all the elements of the page
	this.get_all_elements = function get_all_elements() {
		ms.all = document.getElementsByTagName("*");
		ms.freeze = new FreezeView();
		ms.freeze.get_attributes();
		
	}; 
	

	
	this.find_events = function find_events(type) {
		var list = [];
	
		for (var i = 0; i < ms.events.length; i++) {
			if (ms.events[i].type === type) {
				list.push(ms.events[i]);
				}
			
			} 
		return list;
	};
	
	
	
	
	this.init = function init() {
		window.er = this;
		
		ms.get_all_elements(); 
		ms.mouse = document.getElementById("mymouse");
		
		document.onmousemove	= ms.mousemove;
		document.onmousedown	= ms.mousedown;
		document.onmouseup		= ms.mouseup;
		document.onscroll			= ms.scroll;
		
				
		document.onclick		= ms.mouseclick;
		document.onkeydown		= ms.keydown;
		document.onkeypress		= ms.keypress;
		document.onkeyup		= ms.keyup;  
 
		$("select").change(function(){
			if (ms.recording) {
				ms.change_selection(this);	
		    	}
		});

		$("select").focus(function(){
			if (ms.recording) {
				console.log("FOKUS getriggert");
				ms.focus_selection(this);	
		    	}
		});		
		

		$("input").focus(function(){
			if (ms.recording) {
				ms.focus_input(this);
		    	}
		});	

		

		if (params) {
			
			if (params.recorder)	ms.show_recorder();
			if (params.audioFile)   ms.audioFile = params.audioFile;
				
			if (params.events) 		ms.events = params.events;
			if (params.autostart)	{
							$("#evPLAY").css({
		   	 				backgroundColor: "lightgreen",
		   	 				color: "white"
		   					});
		   	
		   	ms.start = new Date().getTime();
		   	ms.get_last_position();
		   	
		   
		   	
		   	ms.playback = true;
		   	ms.replay();
		   	ms.loop();
			}   

			
		}
		
	};
	
	
	ms.init();
}

if (typeof(module) !== "undefined") {
	module.exports = exports = EventRecorder;
	}