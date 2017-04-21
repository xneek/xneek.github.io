!function(a,b){"object"==typeof exports?module.exports=b():"function"==typeof define&&define.amd?define(b):a.crEl=b()}(this,function(){return function(a){"use strict";var b,c,d,e,g,h,i=arguments,j=document.createElement(i[0]&&"string"==typeof i[0]?i[0]:"div");for(b=0,c=i.length;b<c;b++)if(b>0&&"string"==typeof i[b])j.appendChild(document.createTextNode(i[b]));else if("object"==typeof i[b]&&"[object Array]"===Object.prototype.toString.call(i[b]))for(var k=0;k<i[b].length;k++)"string"==typeof i[b][k]?j.appendChild(document.createTextNode(i[b][k])):1===i[b][k].nodeType&&j.appendChild(i[b][k]);else if("object"==typeof i[b]&&i[b]&&1===i[b].nodeType)j.appendChild(i[b]);else if("object"==typeof i[b])for(d in i[b])if("e"===d||"events"===d||"event"===d)for(e in i[b][d])j["on"+e]=i[b][d][e];else if(/^on[a-zA-Z]+/.test(d))"function"==typeof i[b][d]?j[d]=function(a){return function(){a.apply(j,arguments)}}(i[b][d]):j[d]=i[b][d];else if("d"===d||"data"===d)for(e in i[b][d])"dataset"in j?j.dataset[e]=i[b][d][e]:j.setAttribute("data-"+e.replace(/([A-Z])/g,function(a){return"-"+a.toLowerCase()}),i[b][d][e]);else if("c"===d||"class"===d)if("classList"in j){var l=i[b][d].replace(/^\s+|\s+$/g,"").replace(/\s+/g," ").split(" ");for(g=0,h=l.length;g<h;g++)l[g].length&&j.classList.add(l[g])}else j.className=i[b][d];else if("s"===d||"style"===d)if("object"==typeof i[b][d])for(e in i[b][d])e in j.style&&(j.style[e]=i[b][d][e]);else j.style.cssText=i[b][d];else"boolean"==typeof i[b][d]?j[d]=i[b][d]:j.setAttribute(d,i[b][d]);return j}});


	var trkseg = crEl('trkseg');
	var GEOOPTIONS = {
	  enableHighAccuracy: true, 
	  maximumAge        : 30000, 
	  timeout           : 27000
	}
		
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
		var interval;
		var pointsCount = 0;
		document.getElementById("btn").onclick = function(){
			document.getElementById("btn2").classList.remove('hidden');
			document.getElementById("map").classList.remove('hidden');
			document.getElementById("result").innerHTML = 'Запись начата: '+ new Date().toLocaleDateString() + ' в \u00a0' + new Date().toLocaleTimeString().substr(0,5)+'<br>'
														+ 'Записано точек: <strong id="pointsCount">0</strong><br>'
														+ '<div id="curGps"></div><br>';
			if(this.classList.contains('play')){
				this.classList.remove('play')
				this.classList.add('pause')
			} else {
				this.classList.add('play')
				this.classList.remove('pause')
			}
			
			
			var pointsCountEl = document.getElementById("pointsCount");
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
			
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(showPosition, showError, GEOOPTIONS);
    } else {
        document.getElementById("error").innerHTML = "Geolocation is not supported by this browser.";
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
	if(position.coords && position.coords.altitude){
		trkpt.appendChild(crEl('ele',position.coords.altitude));
	}	
	if(position.coords && position.coords.accuracy){
		trkpt.appendChild(crEl('pdop',position.coords.accuracy));
	}
	if(position.coords && position.coords.heading){
		trkpt.appendChild(crEl('magvar',position.coords.heading));
	}	
	trkpt.appendChild(crEl('cmt','Olololo'));
	trkseg.appendChild(trkpt);
	
	
	
	
	pointsCount++; pointsCountEl.innerText = pointsCount;
	
}

		getLocation()	
		
		
		gpsCoords = [
			[53.2325958, 44.9583199],
			[53.2325958, 44.9583199],
			[53.2194729, 44.9506996],
			[53.2194729, 44.9506996],
			[53.2194729, 44.9506996],
			[53.2194729, 44.9506996],
			[53.2271219, 44.9559566],
			[53.2271219, 44.9559566],
			[53.227052, 44.9556518],
			[53.2270138, 44.9556657],
			[53.2139444, 44.9665387],
			[53.2194729, 44.9506996],
			[53.2194729, 44.9506996],
			[53.2239834, 44.9535634],
			[53.2243022, 44.953563],
			[53.2243022, 44.953563],
			[53.2240914, 44.9571098],
			[53.2194729, 44.9506996],
			[53.2194729, 44.9506996],
			[53.2194729, 44.9506996],
			[53.2241978, 44.9573313],
			[53.2238473, 44.9572971],
			[53.2238473, 44.9572971],
			[53.2139444, 44.9665387],
			[53.2139444, 44.9665387],
			[53.2194729, 44.9506996],
			[53.2194729, 44.9506996],
			[53.2194729, 44.9506996]
		]
		
		var minX = gpsCoords[0][0], maxX =gpsCoords[0][0], minY = gpsCoords[0][1], maxY = gpsCoords[0][1];
		gpsCoords.forEach(function(x){
			if(x[0]<minX){minX=x[0]}
			if(x[0]>maxX){maxX=x[0]}
			if(x[1]<minY){minY=x[1]}
			if(x[1]>maxY){maxY=x[1]}
		})
		
		
		console.log(minX, maxX, minY, maxY)



		gpsCoords.forEach(function(x){
			console.log(100-(minX/x[0])*100, 100-(x[0]/maxX)*100, 100-(minY/x[1])*100, 100-(x[1]/maxY)*100)
		})



		
var element = document.getElementById("map")
var height = element.offsetHeight;
var width = element.offsetWidth;


console.log('height', height, 'width', width);



	
		gpsCoords.forEach(function(x){})
		
		
			var data = [
			[0,120],
			[20,60],
			[40,80],
			[60,20],
			[80,80],
			[100,80],
			[120,60],
			[140,100],
			[160,90],
			[180,80],
			[200, 110],
			[220, 10],
			[240, 70],
			[260, 100],
			[280, 100],
			[300, 40],
			[320, 0],
			[340, 100],
			[360, 100],
			[380, 120],
			[400, 60],
			[420, 70],
			[440, 80]
		]
		 var str = data.map(function(b){  return b[0]+','+b[1];  }).join('\r\n\t');
		 console.log(str)
		
		
		document.getElementById("poly").setAttribute('points', str)
		}