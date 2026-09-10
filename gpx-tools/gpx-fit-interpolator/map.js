var map = L.map("map", { attributionControl: false });
map.setView({ lat: 52.74721, lon: 45.19569 }, 16);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>',
}).addTo(map);

L.control.scale().addTo(map);

var polylinesLayer = L.featureGroup().addTo(map);
var resultLayer = L.featureGroup().addTo(map);
var markersLayer = L.featureGroup().addTo(map);
window.activeMarker = L.marker([0, 0]).addTo(map);
window.myMap = map;
;