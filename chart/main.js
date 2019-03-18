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
			toolbar.innerHTML += `
				<label class="toolbarLabel">
					<input type="checkbox" checked>
					<span style="border-color: ${colors[key]}"></span>
					${names[key]}
				</label>
			`;
			const points = vectors.x.map((x, i) => [
				Math.floor((x - minX) * coeff.cX),
				Math.floor(clientHeight - ((vectors[key][i] - minY) * coeff.cY)),
			].join(','));
			return `<polyline vector-effect="non-scaling-stroke" stroke="${colors[key] || '#0074d9'}" points="${points.join(' ')}" />`;
		});

	const coeffSc = chart.offsetHeight / clientHeight;
	chartNavPreview.innerHTML = `<svg viewBox="0 0 ${clientWidth} ${clientHeight}">${previewPolylines.join()}</svg>`;
	chart.innerHTML = `<svg  vector-effect="non-scaling-stroke" stroke-width="${3*coeff.cX}" id="mainChart" 
viewBox="0 0 ${clientWidth} ${clientHeight}">${previewPolylines.join()}</svg>` + getGrids([10,11,12,13,14,15], [1,2,3,4,5,6,7,8,9]);

	console.log(`scale(1, ${coeffSc})`);
	chart.childNodes[0].style.transformOrigin = `100% 0 0`;
	chart.childNodes[0].style.transform = ` scaleY(${coeffSc}) scaleX(${coeffSc})`
	console.log(chart.childNodes[0].style)

}

let dragstart, startX, startTransforms, leftResize, rightResize;

function start(e) {
	e = e.targetTouches ? e.targetTouches[0] : e;
	startX = e.clientX;
	dragstart = parseInt(chartNavMarker.style.right);
	startTransforms = getTransform(chart.childNodes[0].style.transform);
	if(e.offsetX>-5 && e.offsetX<5){
		leftResize = parseInt(chartNavMarker.style.width);
	} else {
		if(e.offsetX > e.target.clientWidth-5 && e.offsetX < e.target.clientWidth+5 ) {
			rightResize = parseInt(chartNavMarker.style.width);
			dragstart = parseInt(chartNavMarker.style.right);
		} else {
			this.style.cursor = 'grabbing';
		}
	}
	chartNavMarker.removeEventListener('mousedown',start);
}

function end(e) {
	dragstart = leftResize = rightResize = null;
	this.style.cursor = '';
	chartNavMarker.addEventListener('mousedown',start);
}

function move(e) {
	e = e.targetTouches ? e.targetTouches[0] : e;
	const dif = startX - e.clientX;
	if(leftResize){
		chartNavMarker.style.width = (leftResize +  dif)+'px';
		const rsd = dif/leftResize;
		chart.childNodes[0].style.transform = setTransform(Object.assign({},startTransforms, {
			scaleX: startTransforms.scaleX * (1-(rsd))
		}));
	} else if (rightResize) {
		chartNavMarker.style.width = (rightResize +  dif*-1)+'px';
		chartNavMarker.style.right = (dragstart + dif) + 'px';

		const rsd = dif/rightResize;
		chart.childNodes[0].style.transform = setTransform(Object.assign({},startTransforms, {
			translateX:(dragstart + dif),
			scaleX: startTransforms.scaleX * (1+(rsd))
		}));
	} else if (dragstart || dragstart === 0) {

		if ((dragstart + dif) < 0) {
			return;
		}
		if ((dragstart + dif) >= (chartNav.offsetWidth - e.target.clientWidth)) {
			return;
		}
		chartNavMarker.style.right = (dragstart + dif) + 'px';
		chart.childNodes[0].style.transform = setTransform(Object.assign({},startTransforms, {
			translateX:(dragstart + dif)
		}));
	}
}

function getGrids(xData, yData){
	yData = yData.reverse()
	let tbl = '<table>';
	tbl+='<tr>'+yData.map((tr,i,tra)=>{
		return '<td>'+xData.map((td,j)=>{
			return i===tra.length-1?td:j===0?tr:'';
		}).join('</td><td>')+'</td>'
	}).join('</tr><tr>')+'</tr>'
	tbl += '</table>';
	return tbl;
}

chartNavMarker.addEventListener('mousedown',start);
chartNavMarker.ontouchstart = start;

chartNavMarker.onmouseup = end;
chartNavMarker.ontouchend = end;

document.onmousemove = move;
document.ontouchmove = move;

const indexOfData = location.hash && location.hash.length ? parseInt(location.hash.substr(1)) || 0: 0;
drawAChart(data[indexOfData]);
