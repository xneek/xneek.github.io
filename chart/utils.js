function getTransform(trasformStr){
	const rxps = {
		scaleX:/scaleX\((-?\d+\.?\d*)/,
		scaleY:/scaleY\((-?\d+\.?\d*)/,
		translateX:/translateX\((-?\d+\.?\d*)/,
		translateY:/translateY\((-?\d+\.?\d*)/,
	}
	const res = {};
	Object.keys(rxps).forEach(k=>{
		const f = trasformStr.match(rxps[k]);
		if(f && f[1]){
			res[k] = parseFloat(f[1]);
		}
	})
	return res;
}

function setTransform(obj, unit = 'px'){
	return Object.keys(obj).map(k=>`${k}(${obj[k]}${k.indexOf('scale')===0?'':unit})`).join(' ');
}

function getOffsetRect(el) {
	const box = el.getBoundingClientRect();
	const body = document.body;
	const docElem = document.documentElement;

	const scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
	const scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;

	const clientTop = docElem.clientTop || body.clientTop || 0;
	const clientLeft = docElem.clientLeft || body.clientLeft || 0;

	const top  = box.top + scrollTop - clientTop;
	const left = box.left + scrollLeft - clientLeft;

	return { top: Math.round(top), left: Math.round(left) }
}
