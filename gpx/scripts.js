const mapElement = document.getElementById('map');
const map = L.map(mapElement).setView([53.18, 45], 13);

const colors = [
  ['#f44336', '#00bcd4'],
  ['#673ab7', '#4caf50'],
  ['#2196f3', '#ffeb3b'],
  ['#00bcd4', '#f44336'],
  ['#4caf50', '#673ab7'],
  ['#ffeb3b', '#2196f3'],
  ['#e91e63', '#009688'],
  ['#3f51b5', '#8bc34a'],
  ['#03a9f4', '#ffc107'],
  ['#009688', '#e91e63'],
  ['#8bc34a', '#3f51b5'],
  ['#ffc107', '#03a9f4']
];

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attributionControl: false
}).addTo(map);

//map.setZoom(map.getMaxZoom())

document.getElementsByClassName('leaflet-control-attribution')[0].style.display = 'none';

const fileinput = document.getElementById('fileinput');
const list = document.getElementById('list');
var markers = new L.FeatureGroup();

var tempGroup = new L.FeatureGroup();

let currentSegment = null;


const pointElMap = {};
const allCoordinates = [];
const segmentsMap = {}

const addMarker = (coords, globalIndex) => {
  const marker = L.marker(coords, {
        icon: L.divIcon({
          className: 'custom-div-icon',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
          html: "<b>•</b>"
        })
      })
      const popup = L.popup({ closeButton: false });

      popup.setContent(crEl({c:'point-menu', e: {click: () => map.closePopup()}},
        crEl('button', {e: {click: () => {
                  //alert(globalIndex);
        pointElMap[globalIndex]
        }}}, '✂ Разрезать тут'),
        crEl('button', {e: {click: () => {}}}, '✂ Удалить отсюда и до конца сегмента\u00a0', crEl('b', {s: {color: 'red'}}, '(красное)')),
        crEl('button', {e: {click: () => {}}}, '✂ Удалить от начала сегмента до сюда\u00a0', crEl('b', {s: {color: 'green'}}, '(зеленое)'))
      ))
      
      marker.bindPopup(popup)
      
      marker.addTo(markers);
      marker.on('popupopen', () => {
        tempGroup.clearLayers();
        const [a, b] = Object.values(segmentsMap).find(([a, b]) => globalIndex <= b && globalIndex>= a);
        alert(a + ' ' + b)

    const polyline = new L.polyline(
      allCoordinates.slice(a, globalIndex+1),
      {
        color: `green`,
        weight: 7,
        opacity: 0.5,
        smoothFactor: 1
      }
    );
    
    tempGroup.addLayer(polyline);

        const polyline2 = new L.polyline(
      allCoordinates.slice(globalIndex, b),
      {
        color: `red`,
        weight: 7,
        opacity: 0.5,
        smoothFactor: 1
      }
    );
    
    tempGroup.addLayer(polyline2);


        map.addLayer(tempGroup);
      })

      popup.on('remove', () => {
        
        map.removeLayer(tempGroup);
      })
}



map.on('zoomend dragend moveend', () => {
  if (map.getZoom() === map.getMaxZoom()) {
    markers.clearLayers();
    const mapBounds = currentSegment ? currentSegment.getBounds() : map.getBounds();

    allCoordinates.forEach((ll, i) => {
      if (mapBounds.contains(new L.LatLng(...ll))) {
        addMarker(ll, i)
      }
    })
    map.addLayer(markers);
    
  } else {
    map.removeLayer(markers);
  }
})



async function getPointsFromGpxFile(file) {
  const parser = new DOMParser();

  const blob = file?.getFile ? await file.getFile() : file;

  const fileContent = await blob.text();
  const doc = parser.parseFromString(fileContent, "text/xml");
  

  const li = document.createElement("li");
  li.textContent = file.name;

  const ul = document.createElement("ul");

  

  const segments = Array.from(doc.getElementsByTagName('trkseg'));

  segments.forEach((seg, s) => {
    const coordinates = [];
    const randomColor = colors[s][0];
    const randomColor2 = colors[s][1];

    seg.setAttribute('data-segment', s);
    const points = Array.from(seg.getElementsByTagName('trkpt'));
    segmentsMap[s] = [allCoordinates.length]
    points.forEach((p, i, all) => {
      const d = [
        parseFloat(p.getAttribute('lat')),
        parseFloat(p.getAttribute('lon'))
      ];
      p.setAttribute('data-index', i);

      
      coordinates.push(d);
      allCoordinates.push(d);

      pointElMap[allCoordinates.length - 1] = p;
    });



    const polyline = new L.polyline(
      coordinates,
      {
        color: `${randomColor}`,
        weight: 3,
        opacity: 0.9,
        smoothFactor: 1
      }
    );
    
    map.addLayer(polyline);
    
    polyline.on('click', () => {currentSegment = polyline})

    polylines.push(polyline);
    ul.appendChild(crEl('li', {
      e: {click: () => { currentSegment = polyline}}
    },
      crEl('span', { s: { color: randomColor } }, `■ Сегмент ${s+1}. (${points.length})`),
      crEl('button', {e:{click: (e) => { currentSegment = polyline; map.setView(coordinates[0], map.getMaxZoom());}}}, 'Начало'),
      crEl('button', {e:{click: (e) => { currentSegment = polyline; map.setView(coordinates[coordinates.length - 1], map.getMaxZoom());}}}, 'Конец'),
      crEl('button', {e:{click: (e) => { map.fitBounds(polyline.getBounds(), {paddingBottomRight: [0,list.offsetHeight + 50],}); }}}, 'Вписать'),
    ));
    segmentsMap[s].push(allCoordinates.length-1)
  })

  li.appendChild(ul);
  list.appendChild(li);

map.fitBounds(L.latLngBounds(allCoordinates), {paddingBottomRight: [0,150],});
console.log(segmentsMap)
}

let polylines = [];

const download = (doc, file, from = 0, to = 999999) => {
  const points = Array.from(doc.getElementsByTagName('trkpt'));
  points.forEach((p, i) => {
    const index = +p.getAttribute('data-index', i);
    if (index >= from && index <= to) {
      p.removeAttribute('data-index')
    } else {
      p.remove()
    }
  });


  const link = document.createElement("a");
  const fff = new Blob([doc.documentElement.outerHTML], { type: file.type });
  link.href = URL.createObjectURL(fff);
  link.download = [from, to, file.name].join('_');
  link.click();
  URL.revokeObjectURL(link.href);


  console.log(doc, doc.documentElement.outerHTML)
}


fileinput.onchange = async (e) => {
  Array.from(e.target.files).forEach(getPointsFromGpxFile)
}

if ('launchQueue' in window) {
    console.log('File handling API is supported!');

    launchQueue.setConsumer((launchParams) => {
        // Nothing to do when the queue is empty.
        if (!launchParams.files.length) {
            return;
        }
        // Handle the first file only.
        Array.from(launchParams.files).forEach(getPointsFromGpxFile)
    });
} else {
    console.error('File handling API is not supported!');
}