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