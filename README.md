# EventRecorder

This package ist meant to record window events and to replay them. It stores them in a json array, so you can use it for demonstration purposes.

## Demo

You can find a [demo](http://burckhardt.ludicmedia.de/EventRecorder) here


## Features

In this first and preliminary version, **mouse movements**. **click events** and **select box actions** are stored. 
**keypress** in textareas and input filed is working, as well as **radio-buttons** and **check-boxes**.
The support of **mouseover** and **mouseout** is given, so the user has a WYSIWYG-website impression.

Form version 0.0.25 the playback of an  **audio commend** is supported, as well as the option to record or dub your audio-comment (as an mp3 file)  


## Installation

You may download the zipped file or install it via npm 
 
```javascript
	npm install event-recorder
``` 



## Usage

```javascript
	var EventRecorder = require("event-recorder");
``` 

Since the Event Recorder needs the dom, it is important that you initate the object after having read in all the dom elemets, be it via **document.ready** or **window.onload**

The creation of an instance is easy

```javascript
	EventRecorder = new EventRecorder();
``` 

While this makes sense if you want to use the library to store events, you may want to autostart it with alreay stored events.
Then an expression like this would be used. 

```javascript
	x = new EventRecorder({
		autostart: false,
		events: data,
		recorder: true
	});
``` 

The **events** parameter assumes that you have the data already. The **recorder** option lets you decide whether you see the **recorder panel** or not. 
If you want to read in a json file, you may come up with a solution like this:


```javascript
	$.ajax({
	url: "./test.json",
	success: function (data) {

		x = new EventRecorder({
			autostart: true,
			events: data
			audioFile: 'audio_comment.mp3'
			});

		}
	});
``` 


## Methods
 

### .record()

Starts a recording session

### .stop()

Stops the recording session

### .replay()

Starts the playback of the recorded data

### .json()

Shows the recorded data in a json format. Can be used to copy paste the data and store it.

### .find_events(type)

 