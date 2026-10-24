function getColorByIndex(index, total = 5, l = 90) {
  const hue = (index * (360 / total)) % 360;
  return `hsl(${Math.round(hue)}, 70%, ${l}%)`;
}


const cols = [
  'timestamp',
  'latitude',
  'longitude',
  'altitude',
  'heart_rate',
  'temperature',
  'cadence',
];

let firstPoint;

let prevTs = 0;
let prevLat = 0;
let prevLon = 0;

const START_SEQ = 65;
const START_DIVIDER = '.';

const compressByCount = (str) => {
  const res = [];

  for (let i = 0; i < str.length; i++) {
    let j = 0;
    while (str[i + j] === str[i]) {
      j++;
    }

    if (j > 1) {
      res.push(j + '' + str[i]);
      i += j - 1
    } else {
      res.push(str[i])
    }


  }

  return res.join('');
}

const decompressByCount = (str) => {

  let result = '';
  const regex = /(\D+)(\d*)/g;
  let match;

  while ((match = regex.exec(str)) !== null) {
    const char = match[1];
    const count = match[2] ? parseInt(match[2], 10) : 1;
    result += char.repeat(count);
  }

  return result;

}

const decodeNumberSeq = (nums, opts = { min: -179.99999, max: 179.99999 }) => {
  const res = [];
  let last = nums[0];
  for (let i = 0; i < nums.length; i++) {
    const diff = nums[i] - last
    res.push(String.fromCodePoint(START_SEQ + diff));
    last = nums[i]
  }

  return nums[0] + START_DIVIDER + compressByCount(res.join(''));
}

const encodeNumberSeq = (str) => {
  const [start, seqE] = str.split(START_DIVIDER);
  const seq = decompressByCount(seqE);
  let last = Number(start);
  const res = [];
  for (let i = 0; i < seq.length; i++) {
    const n = Number(seq[i].codePointAt(0));
    const diff = (last + n) - START_SEQ;
    res.push(diff)
    last = diff;
  }

  return res;
}

const test = [1, 2, 3, 3, 3, 4, 5, 6, 7, 8, 9];
const res1 = decodeNumberSeq(test);
const res2 = encodeNumberSeq(res1);

const str1 = res1.split(START_DIVIDER)[1];

const cbc1 = compressByCount(str1);
const cbc2 = decompressByCount(cbc1);



console.log(`xneek`, { test, res1, res2, cbc1, cbc2 });

const proc = {
  'timestamp': {
    to: (v, i) => {
      if (i === 0) prevTs = new Date(firstPoint.timestamp).getTime() / 1e3;
      const d = new Date(v).getTime() / 1e3;
      const res = d - prevTs;
      prevTs = d;

      return res.toString();
    }, from: (v, i) => {
      if (i === 0) prevTs = new Date(firstPoint.timestamp).getTime() / 1e3;
      const d = +v;
      const res = prevTs + d;
      prevTs = d;

      return res.toString();
    }
  },
  'latitude': {
    to: (v, i) => {
      if (i === 0) prevLat = firstPoint.latitude.toPrecision(7) * 1e5;
      const d = v.toPrecision(7) * 1e5;
      const res = d - prevLat;
      prevLat = d;

      return (res).toString();
    }, from: (v, i) => {
      if (i === 0) prevLat = firstPoint.latitude.toPrecision(7) * 1e5;
      const d = (+v).toPrecision(7) * 1e5;
      const res = prevLat + d;
      prevLat = d;

      return (res).toString();
    }
  },
  'longitude': {
    to: (v, i) => {
      if (i === 0) prevLon = firstPoint.longitude.toPrecision(7) * 1e5;
      const d = v.toPrecision(7) * 1e5;

      const res = d - prevLon;
      prevLon = d;

      return (res).toString();
    }, from: (v, i) => {
      if (i === 0) prevLon = firstPoint.longitude.toPrecision(7) * 1e5;
      const d = (+v).toPrecision(7) * 1e5;
      const res = prevLon + d;
      prevLon = d;

      return (res).toString();
    }
  },
  'altitude': { to: () => { }, from: () => { } },
  'heart_rate': { to: () => { }, from: () => { } },
  'temperature': { to: () => { }, from: () => { } },
  'cadence': { to: () => { }, from: () => { } },
}
document.getElementById("fileInput").addEventListener("change", async (e) => {
  const files = [...e.target.files];

  const d = await parseGPX(files[0]);
  console.log(`xneek`, d);

  firstPoint = d[0];

  myTable.append(crEl('thead',
    crEl('tr',
      cols.map((s) => crEl('th', {}, s)),
      Object.keys(proc).map((s) => crEl('th', {}, s)),
    )
  ));

  myTable.append(crEl('tbody',
    d.map((r, i) => crEl('tr',
      cols.map((s) => crEl('td', {}, r[s] ? r[s].toString() : '—')),
      Object.entries(proc).map(([k, { from, to }]) => crEl('td', {},
        typeof r[k] !== 'undefined' ? `${to(r[k], i)}🍏${from(to(r[k], i), i)}` : '—'
      )),
    ))
  ));

});
