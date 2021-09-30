const gpxFileEl = document.getElementById('gpxFile');
const log = document.getElementById('log');
const loader = new FileReader();
const mymap = L.map('mapid',{
    minZoom: 0,
        maxZoom: 19
});

mymap.setView([0, 0], 0)
let mappedData;

let pLineGroup;
let marker;

function getDistanceBetweenPointsInMeters([lat1, lon1], [lat2, lon2]) {
    const R = 6371e3; // metres
    const φ1 = (lat1 * Math.PI) / 180; // φ, λ in radians
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2)
        + Math.cos(φ1) * Math.cos(φ2)
        * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const d = R * c; // in metres

    return d;
}

timeR.onchange = function () {draw(); }
distR.onchange = function () {draw(); }


function draw() {


    let totalDist = 0;
    let totalTime = 0;

    const problems = [];

    const timeCheckCount = 60_000 * timeR.value;
    const distanceForCheck = 1 * distR.value;
    const lim = 1200;

    let skip = 0;

    mappedData.forEach((trkpt, index, arr) => {
        if (skip > 0) {
            mappedData[index].skip = true;
            skip--;
            return '';
        }

        let cTime = 0;
        let cDist = 0;
        let i = 0;
        let probl = [];

        while (index > 0 && i < lim && arr[index + i] && cTime <= timeCheckCount && cDist < distanceForCheck) {
            const { date: prevDate } = arr[index + (i - 1)];
            const { date, dist } = arr[index + i];
            cTime += date.getTime() - prevDate.getTime();
            cDist += dist;
            probl.push(arr[index + i].point)
            i++;
        }

        if (cTime && cDist < distanceForCheck) {
            skip = i;
            console.log({cTime, cDist, skip});
            problems.push({points: probl, start: trkpt, end: arr[index + (i-1)], dist: cDist});
            return '';
        } else {
            skip = 0;
        }
    })


    log.innerHTML = '';
    log.appendChild(crEl('table', {border: 1, cellpadding: 3},
        mappedData.map((trkpt, index, arr) => {



            const { point, ele, date, dist } = trkpt;
            const { date: prevDate } = index === 0 ? trkpt : mappedData[index - 1];
            const timeDIff = index === 0 ? 0 : (date.getTime() - prevDate.getTime()) / (1000 * 60 * 60)



            const speed = (dist / 1000) / timeDIff;

            totalDist += dist;
            totalTime += timeDIff;

            return crEl('tr', {c: speed > 1 ? 'speed' : '',
                    onmouseenter: () => {
                        marker = new L.marker(point).addTo(mymap)

                    },
                    onmouseleave: () => {
                        mymap.removeLayer(marker);
                    }
                    },
                crEl('td', {s: {color: trkpt.skip ? 'red' : 'inherit'}}, crEl({id: 'tr'+point.join('-').replace(/\D+/g,'')}, point.toString())),
                crEl('td', ele.toString()),
                crEl('td', date.toLocaleString()),
                crEl('td', dist.toFixed(3)),
                crEl('td', totalDist.toFixed(3)+' m'),
                crEl('td', totalTime.toFixed(3)+' h'),
                crEl('td', speed.toFixed(2)+' km/h'),
            )
        })
    ));

    log.appendChild(crEl('h3', totalDist.toString()))


    if (pLineGroup) {
        pLineGroup.removeFrom(mymap)
        pLineGroup = null;

    }
    pLineGroup = L.layerGroup()
    problems.forEach(batch => {
        return pLineGroup.addLayer(L.polyline(batch.points, {color: 'rgba(255,0,0,0.9)', weight:4 })
            .bindPopup(batch.start.date.toLocaleString() + '<br>' + batch.end.date.toLocaleString() + '<br>' + batch.dist)
                .on('click', () => {
                     document.getElementById('tr'+batch.start.point.join('-').replace(/\D+/g,'')).scrollIntoView()
                })
            )
    });
    pLineGroup.addTo(mymap)
}

loader.onload = function (loadEvent) {
    if (loadEvent.target.readyState != 2)
        return;
    if (loadEvent.target.error) {
        alert("Error while reading file " + file.name + ": " + loadEvent.target.error);
        return;
    }
    log.innerText = "Загрузка. Ждёмс...";
    const parser = new DOMParser();
    const dom = parser.parseFromString(loadEvent.target.result, "application/xml");

    if (dom.documentElement.nodeName == "parsererror") {
        alert("error while parsing ");
        return;
    }

    const timeNodes = dom.getElementsByTagName('trkpt');
    log.innerText = "Загружено: " + timeNodes.length + " точек ";


    mappedData = Array.from(timeNodes)
        .map((trkpt, index,arr) => {
            const lat = +trkpt.getAttribute('lat');
            const lon = +trkpt.getAttribute('lon');
            const ele = +trkpt.getElementsByTagName('ele')[0].textContent;
            const date = new Date(Date.parse(trkpt.getElementsByTagName('time')[0].textContent));
            const prevPoint = index === 0 ? trkpt : arr[index - 1];
            const dist = getDistanceBetweenPointsInMeters(
                [lat, lon],
                [+prevPoint.getAttribute('lat'), +prevPoint.getAttribute('lon')]
            );

            return { point: [lat, lon], ele, date, dist };
        });
    console.log({mappedData})



    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mymap);

    const polyline = L.polyline(mappedData.map(x => x.point), {color: 'orange' }).addTo(mymap);

    mymap.fitBounds(polyline.getBounds());

    draw();
};

gpxFileEl.addEventListener('change', function(e){
    loader.readAsText(e.target.files[0]);
})
