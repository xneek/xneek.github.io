const radius = 6378137.0 ; // earth radius in meter
const DE2RA = 0.01745329252; // degre to radian conversion

// return the distance between [lat1,lon1] and [lat2,lon2] in meters.
const getDistance = ([lat1, lon1], [lat2, lon2]) => {
	if (lat1 == lat2 && lon1 == lon2) return 0;
	lat1 *= DE2RA;
	lon1 *= DE2RA;
	lat2 *= DE2RA;
	lon2 *= DE2RA;
	const d = Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2);
	return (radius * Math.acos(d));
};

const getDistanceForTrack = (trackPointsArr) => {
	let distance = 0;
	for (let i = 1; i < trackPointsArr.length; i++) {
		distance += getDistance(trackPointsArr[i - 1], trackPointsArr[i]);
	}
	return distance;
};

const getNearestPointInfo = (point, trackPointsArr) => {
	let nearPoint = trackPointsArr[0];
	let nearDist = getDistance(point, trackPointsArr[0]);
	let nearInd = 0;
	
	for (let i = 1; i < trackPointsArr.length; i++) {
		const curDist = getDistance(point, trackPointsArr[i]);
		if (curDist < nearDist) {
			nearDist = curDist;
			nearPoint = trackPointsArr[i];
			nearInd = i;
		}
	}
	
	return [nearPoint, nearDist, nearInd];
}

const mapElement = document.getElementById('map');
const map = L.map(mapElement).setView([53.18, 45], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attributionControl: false
}).addTo(map);

document.getElementsByClassName( 'leaflet-control-attribution' )[0].style.display = 'none';

const footerElement = document.getElementById('footer');

const init = () => {
	const trackDataLSKey = 'track-data';
	const pointsDataLSKey = 'points-data';
	const trackDataStr = localStorage.getItem(trackDataLSKey);
	const pointsDataStr = localStorage.getItem(pointsDataLSKey);
	
	const points = JSON.parse(pointsDataStr || '[]');
	const track = JSON.parse(trackDataStr || '[]');
	
	let currentPositionMarker;
	let polylineForNearest;
	
	let polylinePassed;
	let polylineFutured;

	if (!track.length) {
		footerElement.innerHTML = '';
		const inp = document.createElement('input');
		inp.setAttribute('type', 'file');
		inp.setAttribute('accept', '.gpx');
		inp.onchange = async (e) => {
			const file = e.target.files[0];
			const fileContent = await file.text();
			const parser = new DOMParser();
			const doc = parser.parseFromString(fileContent, "text/xml");
			const points = Array.from(doc.getElementsByTagName('trkpt'));
			const data = []; // [lat, lon, alt*]
			points.forEach((p) => {
				const d = [
					parseFloat(p.getAttribute('lat')),
					parseFloat(p.getAttribute('lon'))
				];
			
				const eleEl = p.querySelector('ele');
				if (eleEl) {
					d.push(parseFloat(eleEl.textContent))
				}

				data.push(d);
			});
			localStorage.setItem(trackDataLSKey, JSON.stringify(data));
			init();
		}
	
		const lbl = document.createElement('label');
		lbl.textContent = 'Загрузите GPX трек';
		lbl.appendChild(document.createElement('br'))
		lbl.appendChild(inp)
		footerElement.appendChild(lbl)
	} else {


		const btn = document.getElementById('fab');
		btn.onclick = () => {
			computeFromCurrentPosition()
		}

		const polyline = L.polyline(track.map(([a, b]) => ([a,b])), {color: 'yellow', weight: 6, opacity: 0.5})
		polyline.addTo(map)
		map.fitBounds(polyline.getBounds());
		
		points.forEach((point) => {
			
			const icon = L.divIcon({
				className: 'routepoint-div-icon',
				html: "<div data-name='" + point.name + "'></div>",
				iconSize: [8, 8],
				iconAnchor: [4, 4]
			})
					
			const marker = L.marker(point.coords, { icon });
			const popup = L.popup().setContent(point.name);
			marker.on('contextmenu',(e) => {
				L.DomEvent.stopPropagation(e);
				if (confirm('Удалить ' + point.name + '?')) {
					map.removeLayer(marker);
					localStorage.setItem(pointsDataLSKey, JSON.stringify(points.filter(p => p.coords[0] !== point.coords[0] && p.coords[1] !== point.coords[1])));
				}
			})

			marker.bindPopup(popup).openPopup();
			marker.addTo(map);
		})
		
		polyline.on('click',(e) => {
			L.DomEvent.stopPropagation(e);
			const name = prompt('Введите название точки', '')
			if (name) {
				const [nearPoint, nearDist, nearInd] = getNearestPointInfo([e.latlng.lat, e.latlng.lng], track);
				
				points.push({ name, coords: nearPoint, trackIndex: nearInd });
				
				localStorage.setItem(pointsDataLSKey, JSON.stringify(points));

				const marker = L.marker(nearPoint);
				const popup = L.popup().setContent(name);

				marker.bindPopup(popup).openPopup();
				marker.addTo(map);
			}
		});
		
	}
	


	function computeFromCurrentPosition() {
		navigator.geolocation.getCurrentPosition(function (position) {
			currentPositionMarker && map.removeLayer(currentPositionMarker)
			const coords = [position.coords.latitude, position.coords.longitude];
			currentPositionMarker = L.marker(coords);
			currentPositionMarker.addTo(map);
			map.panTo(coords);
			const [nearPoint, nearDist, nearInd] = getNearestPointInfo(coords, track);
			
			polylineForNearest && map.removeLayer(polylineForNearest);
			polylineForNearest = L.polyline([coords, nearPoint], {weight: 5, color: 'gray', dashArray: '8, 8'})
			const popup = L.popup().setContent(`До ближайшей точки ${nearDist} m.`);
			polylineForNearest.bindPopup(popup).openPopup();
			polylineForNearest.addTo(map);
			
			polylinePassed && map.removeLayer(polylinePassed);
			polylineFutured && map.removeLayer(polylineFutured);

			const passedTrackPart = track.slice(0, nearInd+1);
			const futuredTrackPart = track.slice(nearInd);
			
			const totalDist = getDistanceForTrack(track);
			const passDist = getDistanceForTrack(passedTrackPart);
			const futureDist = getDistanceForTrack(futuredTrackPart);
			
			let nearestPoint = points[0];
			let nearestPointDist = getDistance(coords, points[0].coords);
			
			const futurePoints = points.filter((p) => p.trackIndex >= nearInd).sort((a, b) =>  a.trackIndex - b.trackIndex);
			
			
			const nextPointTrack = futuredTrackPart.slice(0, (futurePoints[0].trackIndex - passedTrackPart.length) + 1);
			if (futurePoints.length) {
				nearestPoint = futurePoints[0];
				nearestPointDist = getDistanceForTrack(nextPointTrack)
			}
			
			footerElement.innerHTML = '';
			const stat = document.createElement('div');
			
			const row1 = document.createElement('div');
			const row2 = document.createElement('div');
			const row3 = document.createElement('div');
			
			row1.textContent = 'Пройдено: ' + (passDist / 1000).toFixed(2) + ' км.  из ' + (totalDist / 1000).toFixed(2) + ' (' + Math.round((passDist / totalDist) * 100) + '%)';
			row2.textContent = 'Осталось: ' + (futureDist / 1000).toFixed(2) + ' км.';
			row3.textContent = 'Ближайшая точка: ' + nearestPoint.name + ' ' + getDistanceForTrack(track.slice(nearInd, nearestPoint.trackIndex)).toFixed(2) + 'м от вас';
			
			stat.appendChild(row1);
			stat.appendChild(row2);
			stat.appendChild(row3);
			
			footerElement.appendChild(stat);
			
			polylinePassed = L.polyline(passedTrackPart, {color: 'green', opacity: 1})
			polylineFutured = L.polyline(futuredTrackPart, {color: 'red', opacity: 1})
			polylineNextPoint = L.polyline(nextPointTrack, {color: 'orange', opacity: 1})
			
	
			polylinePassed.addTo(map)
			polylineFutured.addTo(map)
					polylineNextPoint.addTo(map)
			
			//map.fitBounds(polylineForNearest.getBounds());
		});
	}


}

init();


