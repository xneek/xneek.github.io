const map = L.map('map', { attributionControl: false });
map.setView({lat: 52.74721, lon: 45.19569}, 16);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
}).addTo(map);

L.control.scale().addTo(map);

const allMarkersLayer = L.featureGroup().addTo(map);
const polylinesLayer = L.featureGroup().addTo(map);
const newDrawingLayer = L.featureGroup().addTo(map);
let allCoordinates = [];
let newPoints = [];

let aPoint = null;
let bPoint = null;

let aPointIndex = null;
let bPointIndex = null;

let aPointTrkPt = null;
let bPointTrkPt = null;

let doc;
let fileName;
let polyline;
let newPolyline;
let direction; // backward | forward
let isPiece = false;

function getVisiblePolylinePoints() {
  if (!polyline) return;
  if (newPoints.length && (isPiece && bPoint)) return;
  
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

    if (isPiece && !bPoint) {
      pointMarker.on('click', (e) => {
        const latlng = e.latlng;
        const pointMarker = L.marker([latlng.lat, latlng.lng], {
        icon: L.divIcon({
          iconSize: [16, 16], // Set the size
          iconAnchor: [8, 8], // Set the anchor to half the size (centered)
          html: crEl('b', {c: 'finish-icon'})
        })
      });

      pointMarker.addTo(newDrawingLayer);

      bPoint = [latlng.lat, latlng.lng];
      bPointIndex = allCoordinates.findIndex((x) => x[0] === latlng.lat && x[1] === latlng.lng);
      if (aPointIndex<0) return alert(`bPoint point not found`);
      bPointTrkPt = doc.querySelector(`trkpt[lat='${bPoint[0]}'][lon='${bPoint[1]}']`);
      if (!bPointTrkPt) return alert(`bPointTrkPt not found trkpt[lat='${bPoint[0]}'][lon='${bPoint[1]}']`);

      map.setView(latlng, 16);
      footer.innerHTML = `📌 Нарисуйте точки от зеленой до красной последовательно, соблюдая порядок`;

      allMarkersLayer.clearLayers();
      polylinesLayer.clearLayers();

      polyline1 = new L.polyline(
        allCoordinates.slice(0, aPointIndex+1),
        {
          weight: 3,
          opacity: 0.9,
          smoothFactor: 1
        }
      );
  
      polylinesLayer.addLayer(polyline1);

      polyline2 = new L.polyline(
        allCoordinates.slice(bPointIndex),
        {
          weight: 3,
          opacity: 0.9,
          smoothFactor: 1
        }
      );
  
      polylinesLayer.addLayer(polyline2);

    })

    } else {
    pointMarker.bindPopup(crEl('div', 
      crEl('div', {}, 

        crEl('button', {
          d: { lat: p.lat, lng: p.lng },
          onclick: (e) => {
            direction = 'backward'
            startDrawNewPoints(+e.target.dataset.lat,+e.target.dataset.lng, true);
            map.closePopup();
          }
        }, 'Удалить начало', removeStartIcon()),
        crEl('br'),
        crEl('button', {
          d: { lat: p.lat, lng: p.lng },
          onclick: (e) => {
            direction = 'backward'
            startDrawNewPoints(+e.target.dataset.lat,+e.target.dataset.lng);
            map.closePopup();
          }
        }, 'Перерисовать начало', addStartIcon()),
        crEl('br'),


        crEl('button', {
          d: { lat: p.lat, lng: p.lng },
          onclick: (e) => {
            direction = 'forward';
            isPiece = true;
            startDrawNewPoints(+e.target.dataset.lat,+e.target.dataset.lng, false, true);
            map.closePopup();
          }
        }, 'Редактировать кусок', editMiddleIcon()),
        crEl('br'),


        crEl('button', {
          d: { lat: p.lat, lng: p.lng },
          onclick: (e) => {
            direction = 'forward'
            startDrawNewPoints(+e.target.dataset.lat,+e.target.dataset.lng, true);
            map.closePopup();
          }
        }, 'Удалить конец', removeFinishIcon()),
        crEl('br'),
        crEl('button', {
          d: { lat: p.lat, lng: p.lng },
          onclick: (e) => {
            direction = 'forward'
            startDrawNewPoints(+e.target.dataset.lat,+e.target.dataset.lng);
            map.closePopup();
          }
        }, 'Перерисовать конец', addFinishIcon()),
        
      )
    ), {className: 'menu'})
}
    pointMarker.addTo(allMarkersLayer);

  })
}

map.on('moveend', getVisiblePolylinePoints);
map.on('zoomend', getVisiblePolylinePoints);


function startDrawNewPoints(lat, lng, justCutMode = false) {

  if (direction === 'forward' || isPiece) {
    aPoint = [lat, lng];
    aPointIndex = allCoordinates.findIndex((x) => x[0] === lat && x[1] === lng);
    if (aPointIndex<0) return alert(`aPoint point not found`);
    aPointTrkPt = doc.querySelector(`trkpt[lat='${aPoint[0]}'][lon='${aPoint[1]}']`);
    if (!aPointTrkPt) return alert(`aPointTrkPt not found trkpt[lat='${aPoint[0]}'][lon='${aPoint[1]}']`);
  }

  if (direction === 'backward') {
    bPoint = [lat, lng];
    bPointIndex = allCoordinates.findIndex((x) => x[0] === lat && x[1] === lng);
    if (aPointIndex<0) return alert(`bPoint point not found`);
    bPointTrkPt = doc.querySelector(`trkpt[lat='${bPoint[0]}'][lon='${bPoint[1]}']`);
    if (!bPointTrkPt) return alert(`bPointTrkPt not found trkpt[lat='${bPoint[0]}'][lon='${bPoint[1]}']`);
  }

  if (justCutMode) {
    footer.innerHTML=""
    completeDrawingPoints(true, true)

    return;
  }

  const pointMarker = L.marker([lat, lng], {
    icon: L.divIcon({
      iconSize: [16, 16], // Set the size
      iconAnchor: [8, 8], // Set the anchor to half the size (centered)
      html: crEl('b', {c: 'start-icon'})
    })
  });

  pointMarker.addTo(newDrawingLayer);

  newPolyline = new L.polyline(
    [[lat, lng], [lat, lng]],
    {
      color: 'blue',
      weight: 3,
      opacity: 0.9,
      smoothFactor: 1
    }
  );
    
  newDrawingLayer.addLayer(newPolyline); 

  if (isPiece) {
     footer.innerHTML = `📌 Выберите точку где должен заканчиваться кусок`
  } else {
    allMarkersLayer.clearLayers();
    polyline.setLatLngs(allCoordinates.filter((_, i) => direction === 'forward' ? i<= aPointIndex : i>= bPointIndex));
    footer.innerHTML = `📌 Нарисуйте точки ${direction==='forward' ? 'от начала к концу' : ' к началу'} последовательно, соблюдая порядок`
  }
}


const completeDrawingPoints = async (justCutMode = false, save = false) => {

  const allPoints = aPoint ? [aPoint, ...newPoints] : [...newPoints];
  if (bPoint) allPoints.push(bPoint);

  const distance = allPoints.reduce((acc, p, i, all) => {
    return acc + (i > 0 ? latlng2distance(all[i-1][0], all[i-1][1], p[0], p[1]) : 0);
  }, 0);


  const count = 20;
  let sumSec = 0;
  let sumMeters = 0;

  const samplePoints = aPoint
    ? allCoordinates.slice(aPointIndex - count, aPointIndex) // count точек до
    : allCoordinates.slice(bPointIndex, bPointIndex + count) // count точек после

  samplePoints.forEach((p, i, all) => {
    if (i === 0) return;
    const [lat1, lon1] = all[i-1];
    const [lat2, lon2] = p;
    const p1 = doc.querySelector(`trkpt[lat='${lat1}'][lon='${lon1}']`);
    const p2 = doc.querySelector(`trkpt[lat='${lat2}'][lon='${lon2}']`);

    if (p1  && p2) {
      const d1 = new Date(p1.getElementsByTagName('time')[0].textContent);
      const d2 = new Date(p2.getElementsByTagName('time')[0].textContent);

      sumSec += (d2.getTime() - d1.getTime()) / 1000;
      sumMeters += latlng2distance(lat1, lon1, lat2, lon2);
    }
  })

  console.log(
    'xneek',
    `${direction==='forward' ? 'prev' : 'next'} ${count} points statistic`,
    { samplePoints, sumSec, sumMeters }
  );

  const pointsForDelete = isPiece ? allCoordinates.slice(aPointIndex + 1, bPointIndex) : (direction === 'forward'
    ? allCoordinates.slice(aPointIndex + 1)
    : allCoordinates.slice(0, bPointIndex));
  
  pointsForDelete.forEach((c) => {
    const el = doc.querySelector(`trkpt[lat='${c[0]}'][lon='${c[1]}']`);
    if (el) {
      el.remove();
      console.info(`Removed: trkpt[lat='${c[0]}'][lon='${c[1]}']`);
    } else {
      console.warn(`not found: trkpt[lat='${c[0]}'][lon='${c[1]}']`);
    }
  });


  if (!justCutMode) {

    const trkPtForClone = direction === 'forward' ? aPointTrkPt : bPointTrkPt;

    const trkPtForCloneParent = trkPtForClone.parentNode;
    if (!trkPtForCloneParent) return alert(`trkPtForClone has no parent`);


    const avgMeterPerSec = sumMeters/sumSec;

    const secBySpeed = distance / avgMeterPerSec;
   
    let prevDate = new Date(trkPtForClone.getElementsByTagName('time')[0].textContent);

    console.log('xneek 🚀', `Среднее за ${count} точек: ${sumMeters.toFixed(2)}м.  со скоростью ${(avgMeterPerSec * 3.6).toFixed(1)} км/ч`);
    console.log('xneek 🚀', `Секунд до финиша: ${secBySpeed}`, new Date(prevDate.getTime() + (secBySpeed * 1000)));
    
    

    let lastAddedPoint

    newPoints.forEach((c, i, all) => {

      const prevPoint = i == 0 ? aPoint ?? bPoint : all[i-1];
      const distForPrev = latlng2distance(prevPoint[0], prevPoint[1], c[0], c[1]);
      const secFromPrev = distForPrev / avgMeterPerSec;
      const msecFromPrev = secFromPrev * 1000;

      const clone = trkPtForClone.cloneNode(true);
      clone.setAttribute('lat', c[0]);
      clone.setAttribute('lon', c[1]);


      prevDate = direction === 'forward'
        ? new Date(prevDate.getTime() + msecFromPrev)
        : new Date(prevDate.getTime() - msecFromPrev);

      console.log('xneek', 'date for point 🐦', prevDate, prevDate.toISOString(), {distForPrev, secFromPrev})
      clone.getElementsByTagName('time')[0].textContent = prevDate.toISOString();

      if (isPiece) {

        if (!lastAddedPoint) {
          aPointTrkPt.after(clone);
          console.log('xneek', `aPointTrkPt`, clone.outerHTML);
        } else {
          lastAddedPoint.after(clone);
          console.log('xneek', `append clone before`, {clone, lastAddedPoint: lastAddedPoint.getElementsByTagName('time')[0].textContent });
        }
        
      } else if (direction === 'forward') {
        trkPtForCloneParent.append(clone);
        console.log('xneek', `append clone node`, clone.outerHTML);
      } else {
        trkPtForCloneParent.prepend(clone);
        console.log('xneek', `prepend clone node`, clone.outerHTML);
      }

      
      lastAddedPoint = clone
    });
    footer.innerHTML = '✅ Готово!';
    setTimeout(initForDoc, 1500)
  } else {
    footer.innerHTML = '✅ Готово!'
    setTimeout(initForDoc, 1500)
  }

  const serializer = new XMLSerializer();
  const newHtmlString = serializer.serializeToString(doc);
  save && saveGpxStringAsFile(newHtmlString, fileName)
};

function initForDoc() {


    allCoordinates = [];
    newPoints = [];
    aPoint = null;
    bPoint = null;
    aPointIndex = null;
    bPointIndex = null;
    aPointTrkPt = null;
    bPointTrkPt = null;
    direction = undefined; // backward | forward
    isPiece = false;

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


    polylinesLayer.clearLayers();
    allMarkersLayer.clearLayers();
    newDrawingLayer.clearLayers();

    polyline = new L.polyline(
      coordinates,
      {
        weight: 3,
        opacity: 0.9,
        smoothFactor: 1
      }
    );
    
    polylinesLayer.addLayer(polyline);
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
      }}, 'Начало 🟢'),
      ' \u00a0 \u00a0 | \u00a0 \u00a0 ',
      crEl('a', {href: 'javascript:void(0)', e: {
        click: () => {
          map.setView({lat: allCoordinates.at(-1)[0], lon: allCoordinates.at(-1)[1]}, map.getMaxZoom());
        }
      }}, 'Конец 🏁')
    )
  ))

}


async function getPointsFromGpxFile(file) {
  const parser = new DOMParser();
  const blob = file?.getFile ? await file.getFile() : file;
  const fileContent = await blob.text();
  
  doc = parser.parseFromString(fileContent, "text/xml");
  fileName = file.name ?? 'file.gpx'

  initForDoc()



  map.on('click', (e) => {

    if (isPiece && !bPoint) {
      footer.innerHTML = 'Выберите точку дальше которой оставляем. 🅱️';
      return;
    }


    if (!aPoint && !bPoint) {
      footer.innerHTML = 'Приблизьте трек и выберите точку от которой начнете редактирование';
      return;
    }

    const latlng = e.latlng;



    const icon = L.divIcon({
      iconSize: [16, 16], // Set the size
      iconAnchor: [8, 8], // Set the anchor to half the size (centered)
      html: crEl('b', {
        title: newPoints.length+1,
        c: 'new-div-icon',
        id: `new-point-${newPoints.length}`
      }),
    });

    const pointMarker = L.marker(latlng, {
      className: 'new-div-icon',
      icon
    });
    
    newPoints.push([+latlng.lat, +latlng.lng]);
    newPolyline.setLatLngs(direction==='forward'?[aPoint, ...newPoints]:[bPoint,...newPoints]);

    pointMarker.addTo(newDrawingLayer);

    footer.innerHTML="";
  
    footer.appendChild(crEl('div',
      crEl('p', `📌 Нарисуйте все точки ${direction==='forward' ? 'от начала к концу' : ' к началу'} соблюдая порядок (последовательно)`),
      crEl('button', {
        e: {
          click: () => completeDrawingPoints()
        }
      }, `Завершить`),
      " ",
       crEl('button', {
        e: {
          click: () => completeDrawingPoints(false, true)
        }
      }, `Завершить и скачать`)
    ));
  })
}

fileInput.onchange = async (e) => {
  Array.from(e.target.files).forEach(getPointsFromGpxFile)
}