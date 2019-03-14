function drawAChart({columns, types, names, colors}) {
	const vectors = {};
	const extremums = {};
	columns.forEach((col) => {
		const key = col[0];
		vectors[key] = col.slice(1);
		extremums[key] = [Math.min(...vectors[key]), Math.max(...vectors[key])]; // [min, max]
	});

	let minX = Infinity;
	let maxX = -Infinity;

	let minY = Infinity;
	let maxY = -Infinity;

	Object.keys(types).forEach((key) => {
		if (types[key] === 'x') {
			minX = Math.min(minX, extremums[key][0]);
			maxX = Math.max(maxX, extremums[key][1]);
		} else if (types[key] === 'line') {
			minY = Math.min(minY, extremums[key][0]);
			maxY = Math.max(maxY, extremums[key][1]);
		}
	});

	getTotalSvg({
		minX, maxX, minY, maxY, vectors, types, names, colors,
	});
}

function getTotalSvg({ minX, maxX, minY, maxY, vectors, types, names, colors }) {

	const chartNav = document.getElementById('chartNav');

	const clientWidth = chartNav.offsetWidth;
	const clientHeight = chartNav.offsetHeight;

	const difX = maxX - minX;
	const difY = maxY - minY;

	const coeff = {
		cX: clientWidth / difX,
		cY: clientHeight / difY,
	};
	console.log(coeff, vectors);

	chartNavMarker.style.right = `0`;
	chartNavMarker.style.width = (clientHeight * (chart.offsetWidth / chart.offsetHeight)) + 'px';
	const toolbar = document.getElementById('toolbar');
	toolbar.innerHTML = '';
	const previewPolylines = Object.keys(types)
		.filter(k => types[k] === 'line')
		.map((key) => {
			toolbar.innerHTML += `<label class="toolbarLabel">
<input type="checkbox" checked>
<span style="background: ${colors[key]}">(0)</span>
${names[key]}</label>`;
			const points = vectors.x.map((x, i) => [
				Math.floor((x - minX) * coeff.cX),
				Math.floor(clientHeight - ((vectors[key][i] - minY) * coeff.cY)),
			].join(','));
			return `<polyline stroke="${colors[key] || '#0074d9'}" points="${points.join(' ')}" />`;
		});

	const coeffSc = chart.offsetHeight / clientHeight;
	chartNavPreview.innerHTML = `<svg viewBox="0 0 ${clientWidth} ${clientHeight}">${previewPolylines.join()}</svg>`;
	chart.innerHTML = `<svg id="mainChart" viewBox="0 0 ${clientWidth} ${clientHeight}">${previewPolylines.join()}</svg>`;

	console.log(`scale(1, ${coeffSc})`);
	chart.childNodes[0].style.transformOrigin = `100% 0 0`;
	chart.childNodes[0].childNodes[0].style.strokeWidth = 1;
	chart.childNodes[0].style.transform = ` scaleY(${coeffSc}) scaleX(${coeffSc})`
	console.log(chart.childNodes[0].style)

}

let dragstart, startX, startTransforms;

function start(e) {
	e = e.changedTouches ? e.changedTouches[0] : e;
	dragstart = parseInt(chartNavMarker.style.right);
	startX = e.clientX;
	startTransforms = getTransform(chart.childNodes[0].style.transform);
}

function end(e) {
	dragstart = false;
}

function move(e) {
	e = e.changedTouches ? e.changedTouches[0] : e;
	if (dragstart || dragstart === 0) {
		const dif = startX - e.clientX;
		if ((dragstart + dif) < 0) {
			return;
		}
		if ((dragstart + dif) >= (chartNav.offsetWidth - e.target.clientWidth)) {
			return;
		}
		chartNavMarker.style.right = (dragstart + dif) + 'px';
		chart.childNodes[0].style.transform = setTransform(Object.assign(startTransforms, {
			translateX:(dragstart + dif)
		}));
	}
}

chartNavMarker.onmousedown = start;
chartNavMarker.ondragstart = start;

chartNavMarker.onmouseup = end;
chartNavMarker.ondragend = end;

document.onmousemove = move;
document.ontouchmove = move;

if (location.hash && location.hash.length) {
	drawAChart(data[parseInt(location.hash.substr(1))]);
}