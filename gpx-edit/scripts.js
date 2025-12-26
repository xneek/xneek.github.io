const map = L.map('map', { attributionControl: false });
map.setView({lat: 52.74721, lon: 45.19569}, 16);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
}).addTo(map);

const allMarkersLayer = L.featureGroup().addTo(map);
const allCoordinates = [];
const newPoints = [];
let doc;
let fileName;

L.control.scale().addTo(map);

L.marker({lon: 0, lat: 0}).bindPopup('The center of the world').addTo(map);


let polyline;
let newPolyline;


function getVisiblePolylinePoints() {
  if (!polyline) return;
  if (newPoints.length) return;
  allMarkersLayer.clearLayers();
  

  const currentZoom = map.getZoom();
  const maxZoom = map.getMaxZoom();

  if (currentZoom < maxZoom - 3) return;



  footer.innerHTML = '🎯 Выберите точку от которой начнете редактирование';


  const mapBounds = map.getBounds();
  const polylinePoints = polyline.getLatLngs();
  const visiblePoints = polylinePoints.filter(function(latlng) {
    return mapBounds.contains(latlng);
  });

  visiblePoints.forEach((p) => {
    const pointMarker = L.marker(p, {
      icon: L.divIcon({
      iconSize: [16, 16], // Set the size
      iconAnchor: [8, 8], // Set the anchor to half the size (centered)
      html: crEl('b', {
        d: { lat: p.lat, lng: p.lng }
      })
      })
    });

    pointMarker.bindPopup(crEl('div', 
      crEl('div', {}, 
        crEl('button', {
          d: { lat: p.lat, lng: p.lng },
          onclick: (e) => {
            drawToEnd(+e.target.dataset.lat,+e.target.dataset.lng, true);
            map.closePopup();
          }
        }, 'Выкинуть конец'),
        crEl('br'),
        crEl('button', {
          d: { lat: p.lat, lng: p.lng },
          onclick: (e) => {
            drawToEnd(+e.target.dataset.lat,+e.target.dataset.lng);
            map.closePopup();
          }
        }, 'Перерисовать конец'),
      )
    ), {className: 'menu'})

    pointMarker.addTo(allMarkersLayer);

  })
}

map.on('moveend', getVisiblePolylinePoints);
map.on('zoomend', getVisiblePolylinePoints);








function drawToEnd(lat, lng, justCutMode) {
  newPoints.push([lat, lng]);

  



  const lastPointIndex = allCoordinates.findIndex((x) => x[0] === lat && x[1] === lng);
  if (!lastPointIndex>0) return alert(`Last point not found`);

  polyline.setLatLngs(allCoordinates.filter((_, i) => i<= lastPointIndex));



  allMarkersLayer.clearLayers();


if (justCutMode) {

      footer.innerHTML=""
    drawToEndComplete(true)

  return;
}


  const pointMarker = L.marker([lat, lng], {
    icon: L.divIcon({
      iconSize: [16, 16], // Set the size
      iconAnchor: [8, 8], // Set the anchor to half the size (centered)
      html: crEl('b', {c: 'start-icon'})
    })
  });

  pointMarker.addTo(map);


  newPolyline = new L.polyline(
      [[lat, lng], [lat, lng]],
      {
        color: 'lime',
        weight: 3,
        opacity: 0.9,
        smoothFactor: 1
      }
    );
    
    map.addLayer(newPolyline);

    
  footer.innerHTML = '📌 Нарисуйте точки последовательно, соблюдая порядок'
}


const drawToEndComplete = async (justCutMode = false) => {
  const firstPoint = newPoints[0];

  const distance = newPoints.reduce((acc, p, i, all) => {
    return acc + (i > 0 ? latlng2distance(all[i-1][0], all[i-1][1], p[0], p[1]) : 0);
  }, 0);

  const lastPointIndex = allCoordinates.findIndex((x) => x[0] === firstPoint[0] && x[1] === firstPoint[1]);
  if (lastPointIndex<=0) return alert(`Last point not found`)
  if (lastPointIndex==allCoordinates.length) return alert(`Last point not found last`)

  console.log('xneek', {lastPointIndex});
  
  const count = 10;
  let sumSec = 0;
  let sumMeters = 0;
  for (let i = lastPointIndex - count; i< lastPointIndex; i++) {
    const p1 = doc.querySelector(`trkpt[lat='${allCoordinates[i-1][0]}'][lon='${allCoordinates[i-1][1]}']`);
    const p2 = doc.querySelector(`trkpt[lat='${allCoordinates[i][0]}'][lon='${allCoordinates[i][1]}']`);

    if (!p1 || !p2) continue;
    const d1 = new Date(p1.getElementsByTagName('time')[0].textContent);
    const d2 = new Date(p2.getElementsByTagName('time')[0].textContent);

    sumSec += (d2.getTime() - d1.getTime()) / 1000;
    sumMeters += i > lastPointIndex - count ? latlng2distance(allCoordinates[i-1][0], allCoordinates[i-1][1], allCoordinates[i][0], allCoordinates[i][1]) : 0;

  }

  console.log('xneek', {sumSec, sumMeters});
  

  allCoordinates.slice(lastPointIndex + 1).forEach((c) => {
    const el = doc.querySelector(`trkpt[lat='${c[0]}'][lon='${c[1]}']`);
    if (el) {
      el.remove();
      console.info(`Removed: trkpt[lat='${c[0]}'][lon='${c[1]}']`);
    } else {
      console.warn(`not found: trkpt[lat='${c[0]}'][lon='${c[1]}']`);
    }
  });


  if (!justCutMode) {

  const startTrkPt = doc.querySelector(`trkpt[lat='${firstPoint[0]}'][lon='${firstPoint[1]}']`);
  if (!startTrkPt) return alert(`Start point not found trkpt[lat='${firstPoint[0]}'][lon='${firstPoint[1]}']`);

  const startTrkPtParent = startTrkPt.parentNode;
  if (!startTrkPtParent) return alert(`Start point has no parent`);


  const startDate = new Date(startTrkPt.getElementsByTagName('time')[0].textContent);

  const finishDateStr = await requestDateModal(startDate, distance, sumMeters/sumSec);
  const finishDate = new Date(finishDateStr);

  const diffSec = (finishDate.getTime() - startDate.getTime()) / 1000;
  const meterSec = distance / diffSec;


  console.log('xneek 🚀', {startDate, finishDate, distance, diffSec, meterSec});


  let prevDate = startDate;
  newPoints.forEach((c, i, all) => {
    if (i === 0) return; // skip existing point
    const clone = startTrkPt.cloneNode(true);
    clone.setAttribute('lat', c[0]);
    clone.setAttribute('lon', c[1]);

    
    const distForPrev = latlng2distance(all[i-1][0], all[i-1][1], c[0], c[1]);
    const secFromPrev = distForPrev * meterSec;
    prevDate = new Date(prevDate.getTime() + (secFromPrev * 1000));
    console.log('xneek', 'date for point 🐦', prevDate, prevDate.toISOString(), {distForPrev, secFromPrev})
    clone.getElementsByTagName('time')[0].textContent = prevDate.toISOString()
    startTrkPtParent.append(clone);
    console.log('xneek', `added clone node`, clone.outerHTML);
    footer.innerHTML = '✅ Готово!'
  });

  } else {
    footer.innerHTML = '✅ Готово!'
  }

const serializer = new XMLSerializer();
const newHtmlString = serializer.serializeToString(doc);
saveGpxStringAsFile(newHtmlString, fileName)
 // console.log('xneek', doc.innerHTML,newHtmlString, finishDateStr);
};


async function getPointsFromGpxFile(file) {
  const parser = new DOMParser();
  const blob = file?.getFile ? await file.getFile() : file;
  const fileContent = await blob.text();
  
  doc = parser.parseFromString(fileContent, "text/xml");


fileName = file.name ?? 'file.gpx'

  const segments = Array.from(doc.getElementsByTagName('trkseg'));
  segments.forEach((seg, s) => {
    const coordinates = [];
    
    const points = Array.from(seg.getElementsByTagName('trkpt'));

    points.forEach((p, i, all) => {
      const d = [
        parseFloat(p.getAttribute('lat')),
        parseFloat(p.getAttribute('lon'))
      ];

      p.setAttribute('lat', d[0])
      p.setAttribute('lon', d[1])
      coordinates.push(d);
      allCoordinates.push(d);
    });



    polyline = new L.polyline(
      coordinates,
      {
        weight: 3,
        opacity: 0.9,
        smoothFactor: 1
      }
    );
    
    map.addLayer(polyline);
  })

  map.fitBounds(L.latLngBounds(allCoordinates), {paddingBottomRight: [0,150],});


  footer.innerHTML = "";
  footer.append(crEl('div',
    crEl('p', `Приблизьте трек и выберите точку от которой начнете редактирование`),
    crEl('div',
      crEl('a', {href: 'javascript:void(0)', e: {
        click: () => {
          map.setView({lat: allCoordinates[0][0], lon: allCoordinates[0][1]}, map.getMaxZoom());
        }
      }}, 'Начало'),
      ' \u00a0 \u00a0 | \u00a0 \u00a0 ',
      crEl('a', {href: 'javascript:void(0)', e: {
        click: () => {
          map.setView({lat: allCoordinates.at(-1)[0], lon: allCoordinates.at(-1)[1]}, map.getMaxZoom());
        }
      }}, 'Конец')
    )
  ))

  map.on('click', (e) => {
    if (!newPoints.length) {
      footer.innerHTML = 'Приблизьте трек и выберите точку от которой начнете редактирование';
      return;
    }


    const latlng = e.latlng;

    const icon = L.divIcon({
      iconSize: [16, 16], // Set the size
      iconAnchor: [8, 8], // Set the anchor to half the size (centered)
      html: crEl('b', {
        title: newPoints.length,
        c: 'new-div-icon',
        id: `new-point-${newPoints.length}`
      }),
    })

    const pointMarker = L.marker(latlng, {
      className: 'new-div-icon',
      icon
    })
    
    newPoints.push([+latlng.lat, +latlng.lng])
    console.log({ newPoints })
    // Create a new marker and add it to the map
    
   newPolyline.setLatLngs(newPoints)

    pointMarker.addTo(map);

      footer.innerHTML=""
    
      footer.appendChild(crEl('div',
        crEl('p', '📌 Нарисуйте промежуточные точки от начала к концу соблюдая порядок (последовательно)'),
        crEl('button', {
          e: {
            click: () => drawToEndComplete()
          }
        }, `Завершить`)
      ));

  


  })
   

}


fileInput.onchange = async (e) => {
  Array.from(e.target.files).forEach(getPointsFromGpxFile)
}