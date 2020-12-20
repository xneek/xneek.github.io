var gpxFileEl = document.getElementById('gpxFile');
var tempEl = document.getElementById('temp');
var a = document.getElementById('dwnload');
var loader = new FileReader();

var tz = 3600000 * 3; // смещение времени
var presision = 60000;

loader.onload = function (loadEvent) {
    if (loadEvent.target.readyState != 2)
        return;
    if (loadEvent.target.error) {
        alert("Error while reading file " + file.name + ": " + loadEvent.target.error);
        return;
    }

    const parser = new DOMParser();
    const dom = parser.parseFromString(loadEvent.target.result, "application/xml");

    if (dom.documentElement.nodeName == "parsererror") {
        alert("error while parsing ");
        return;
    }

    a.innerText = "Загрузка. Ждёмс...";

    console.log(dom);

    var temps = tempEl.value.trim()
        .split('\n')
        .map(function(row) {
            var cols = row.trim().split('\t');
            var date = Date.parse(cols[0]) - tz;
            var temp = parseFloat(cols[1].replace(',','.'));

            return [date, temp];
        })

    console.log(temps);

    var finded = 0;
    var lost = 0;

    const times = [].map.call(dom.getElementsByTagName('time'), function(utsTag){
        ts = Date.parse(utsTag.innerHTML);
        var fndd = temps.find(x => x[0] > (ts - presision) && x[0] < (ts + presision));

        if (fndd) {

                extensions = dom.createElement('extensions');
                extensions.innerHTML = `<gpxtpx:TrackPointExtension><gpxtpx:atemp>${fndd[1]}</gpxtpx:atemp></gpxtpx:TrackPointExtension>`
                utsTag.parentNode.appendChild(extensions)

            finded++;
        } else {
            lost++;
        }

        return utsTag.innerHTML
    })
    console.log(times, { finded, lost }); // Your text is in loadEvent.target.result
    dom.getElementsByTagName('gpx')[0].setAttribute('xmlns:gpxtpx', 'http://www.garmin.com/xmlschemas/TrackPointExtension/v1')
    a.href = "data:application/xml+gpx;charset=utf-8,"+(new XMLSerializer()).serializeToString(dom);
    a.innerText = "СКАЧАТЬ";
};

gpxFileEl.addEventListener('change', function(e){

    loader.readAsText(e.target.files[0]);
})
