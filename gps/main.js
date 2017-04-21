!function(a,b){"object"==typeof exports?module.exports=b():"function"==typeof define&&define.amd?define(b):a.crEl=b()}(this,function(){return function(a){"use strict";var b,c,d,e,g,h,i=arguments,j=document.createElement(i[0]&&"string"==typeof i[0]?i[0]:"div");for(b=0,c=i.length;b<c;b++)if(b>0&&"string"==typeof i[b])j.appendChild(document.createTextNode(i[b]));else if("object"==typeof i[b]&&"[object Array]"===Object.prototype.toString.call(i[b]))for(var k=0;k<i[b].length;k++)"string"==typeof i[b][k]?j.appendChild(document.createTextNode(i[b][k])):1===i[b][k].nodeType&&j.appendChild(i[b][k]);else if("object"==typeof i[b]&&i[b]&&1===i[b].nodeType)j.appendChild(i[b]);else if("object"==typeof i[b])for(d in i[b])if("e"===d||"events"===d||"event"===d)for(e in i[b][d])j["on"+e]=i[b][d][e];else if(/^on[a-zA-Z]+/.test(d))"function"==typeof i[b][d]?j[d]=function(a){return function(){a.apply(j,arguments)}}(i[b][d]):j[d]=i[b][d];else if("d"===d||"data"===d)for(e in i[b][d])"dataset"in j?j.dataset[e]=i[b][d][e]:j.setAttribute("data-"+e.replace(/([A-Z])/g,function(a){return"-"+a.toLowerCase()}),i[b][d][e]);else if("c"===d||"class"===d)if("classList"in j){var l=i[b][d].replace(/^\s+|\s+$/g,"").replace(/\s+/g," ").split(" ");for(g=0,h=l.length;g<h;g++)l[g].length&&j.classList.add(l[g])}else j.className=i[b][d];else if("s"===d||"style"===d)if("object"==typeof i[b][d])for(e in i[b][d])e in j.style&&(j.style[e]=i[b][d][e]);else j.style.cssText=i[b][d];else"boolean"==typeof i[b][d]?j[d]=i[b][d]:j.setAttribute(d,i[b][d]);return j}});

var gpsCoords = [];
var trkseg = crEl('trkseg');
var GEOOPTIONS = {
  enableHighAccuracy: true, 
  maximumAge        : 30000, 
  timeout           : 27000
}

var accelerationX=0, accelerationY=0 , accelerationZ=0, rotationAlpha=0, rotationBeta=0, rotationGamma=0;
var EverySec = 1;
	var pointsCountEl 	
function showError(error) {
	var x = document.getElementById("error");
    switch(error.code) {
        case error.PERMISSION_DENIED:
            x.innerHTML = "User denied the request for Geolocation."
            break;
        case error.POSITION_UNAVAILABLE:
            x.innerHTML = "Location information is unavailable."
            break;
        case error.TIMEOUT:
            x.innerHTML = "The request to get user location timed out."
            break;
        case error.UNKNOWN_ERROR:
            x.innerHTML = "An unknown error occurred."
            break;
    }
}

function download(data, filename, type) {
    var a = document.createElement("a"),
        file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}

		var interval;
		var pointsCount = 0;
		
		
	function startRecord(){
	
		var el = document.getElementById("btn");
		if(el.classList.contains('play')){
			el.classList.remove('play')
			el.classList.add('pause')
		} else {
			el.classList.add('play')
			el.classList.remove('pause')
		}
		document.getElementById("btn2").classList.remove('hidden');
		document.getElementById("map").classList.remove('hidden');
		document.getElementById("grav").classList.remove('hidden');
		document.getElementById("result").innerHTML = 'Запись начата: '+ new Date().toLocaleDateString() + ' в \u00a0' + new Date().toLocaleTimeString().substr(0,5)+'<br>'
														+ 'Записано точек: <strong id="pointsCount">0</strong><br>'
														+ '<div id="curGps"></div><br>';
		pointsCountEl = document.getElementById("pointsCount");
		getLocation();
		document.getElementById("video").play()
	}
	
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError, GEOOPTIONS);
    } else {
        document.getElementById("error").innerHTML = "Geolocation is not supported by this browser.";
    }
	
	setTimeout(function(){getLocation()}, EverySec*1000)
}		
		
document.getElementById("btn2").onclick = function(){
	var res = crEl('gpx',{
		'xmlns':"http://www.topografix.com/GPX/1/1",
		'version':"1.1",
		'creator':"Xneek",
		'xmlns:xsi':"http://www.w3.org/2001/XMLSchema-instance",
		'xsi:schemaLocation':"http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd"
	}, crEl('time', new Date().toISOString()));
	res.appendChild(crEl('trk', trkseg))
	download('<?xml version="1.0" encoding="UTF-8"?>'+res.outerHTML, 'gps_' + new Date().getTime()+'.gpx', 'application/gpx+xml');

}	






if (window.DeviceMotionEvent != undefined) {
	
	window.ondevicemotion = function(e) {
	
		
	
		accelerationX = e.accelerationIncludingGravity.x;
		accelerationY = e.accelerationIncludingGravity.y;
		accelerationZ = e.accelerationIncludingGravity.z;
		
		
		
		if ( e.rotationRate ) {
			rotationAlpha = e.rotationRate.alpha;
			rotationBeta = e.rotationRate.beta;
			rotationGamma = e.rotationRate.gamma;
			
		}
		

		
	}
} 






	
function showPosition(position) {
	var str = ""; var arr = [];
	if(position && position.coords){
		for(var k in position.coords){
			str += '<div><em>' + k + ': </em><strong>'  + position.coords[k] + '</strong></div>';
			arr.push(position.coords[k])
		}
	}
    document.getElementById("curGps").innerHTML = str;
	var trkpt = crEl('trkpt',{lat:position.coords.latitude, lon:position.coords.longitude},
		crEl('time',new Date().toISOString())
	);
	
	gpsCoords.push([position.coords.latitude, position.coords.longitude])
	
/*	if(position.coords && position.coords.altitude && position.coords.altitude>0){
		trkpt.appendChild(crEl('ele',position.coords.altitude.toString()));
	}	
	if(position.coords && position.coords.accuracy && position.coords.accuracy>0){
		trkpt.appendChild(crEl('pdop',position.coords.accuracy.toString()));
	}
	if(position.coords && position.coords.heading && position.coords.heading>0){
		trkpt.appendChild(crEl('magvar',position.coords.heading.toString()));
	}	
	*/
	trkpt.appendChild(crEl('cmt', accelerationX +', ' + accelerationY +', ' + accelerationZ +'|' +rotationAlpha +', '  +rotationBeta +', ' +rotationGamma +''));
	trkseg.appendChild(trkpt);
	pointsCount++; 
	if(pointsCountEl){ pointsCountEl.innerText = pointsCount; }
	
	
		var str = '';
		str+= 'X:'+ +accelerationX +'; ' + 'Y:'+ +accelerationY +'; ' + 'Z:'+ +accelerationZ +';<br>';
		str+= 'A:'+ +rotationAlpha +'; ' + 'B:'+ +rotationBeta +'; ' + 'G:'+ +rotationGamma +'; ';
		
		document.getElementById("grav").innerHTML = str;
	
	
	
		if(gpsCoords && gpsCoords.length>1){
			var minX = gpsCoords[0][0], maxX =gpsCoords[0][0], minY = gpsCoords[0][1], maxY = gpsCoords[0][1];
			gpsCoords.forEach(function(x){
				if(x[0]<minX){minX=x[0]}
				if(x[0]>maxX){maxX=x[0]}
				if(x[1]<minY){minY=x[1]}
				if(x[1]>maxY){maxY=x[1]}
			})
			
			
			console.log(minX, maxX, minY, maxY)

			var data = []


			var element = document.getElementById("main")
			var height = element.offsetHeight;
			var width = element.offsetWidth;


			console.log('height', height, 'width', width);


			gpsCoords.forEach(function(x){
				var X = ((x[0]-minX)/(maxX-minX));
				var Y = ((x[1]-minY)/(maxY-minY));
				if(X>0 && Y>0){ data.push([Math.round(width*X), Math.round(height*Y)]) }
			})
		

			 var str = data.map(function(b){  return b[0]+','+b[1];  }).join('\r\n\t');
			 console.log(str)
			
			
			document.getElementById("poly").setAttribute('points', str)
		}
	
	
	
	
	
}	

	
document.getElementById("btn").onclick = function(){
	startRecord();
}