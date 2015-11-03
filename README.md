# EventRecorder

This package ist meant to record window events and to replay them. It stores them in a json array, so you can use it for demonstration purposes.

## Features

In this first and preliminary version, **mouse movements** and **click events** are stored. 
The support of **key-events**, **mouseover** and **mouseout** will be granted in the upcoming versions

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

### Methods
 
```javascript
	### .record
``` 



