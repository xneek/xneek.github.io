/**
[
  {
    timestamp: "2025-06-15T08:30:00.000Z",
    latitude: 55.7558260,
    longitude: 37.6172999,
    altitude: 156.4,
    heart_rate: 142,
    temperature: 24,
    cadence: 88
  },
  ...
] 
 */
async function parseFIT(file) {
  const buf = await new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = function (evt) {
      res(evt.target.result);
    };
    reader.readAsArrayBuffer(file);
  });

  var v = new DataView(buf);
  var o = 0;

  // --- File Header ---
  var hSize = v.getUint8(o);
  o += 1;
  o += 1; // protocol
  o += 2; // profile
  var dataSize = v.getUint32(o, true);
  o += 4;
  o += 4; // ".FIT"
  if (hSize === 14) o += 2; // header CRC

  var end = o + dataSize;
  var defs = {};
  var results = [];
  var FIT_EPOCH = 631065600;
  var lastTs = {};
  var SEMI = 180 / Math.pow(2, 31);

  function readVal(offset, baseType, size, be) {
    var bt = baseType & 0x1f;
    if (bt === 1) {
      // sint8
      var val = v.getInt8(offset);
      return val === 0x7f ? null : val;
    }
    if (bt === 2 || bt === 0 || bt === 10 || bt === 13) {
      // uint8 / enum / uint8z / byte
      var val = v.getUint8(offset);
      return val === 0xff ? null : val;
    }
    if (bt === 3) {
      // sint16
      if (size < 2) return null;
      var val = v.getInt16(offset, !be);
      return val === 0x7fff ? null : val;
    }
    if (bt === 4) {
      // uint16
      if (size < 2) return null;
      var val = v.getUint16(offset, !be);
      return val === 0xffff ? null : val;
    }
    if (bt === 5) {
      // sint32
      if (size < 4) return null;
      var val = v.getInt32(offset, !be);
      return val === 0x7fffffff ? null : val;
    }
    if (bt === 6) {
      // uint32
      if (size < 4) return null;
      var val = v.getUint32(offset, !be);
      return val === 0xffffffff ? null : val;
    }
    return null;
  }

  // Извлекает поля Record-сообщения из блока данных
  function extractRecord(d, fieldOffset) {
    var ts = null,
      hr = null,
      temp = null,
      cad = null;
    var lat = null,
      lon = null,
      alt = null;

    for (var i = 0; i < d.fields.length; i++) {
      var f = d.fields[i];
      var raw = readVal(fieldOffset, f.bt, f.sz, d.be);
      fieldOffset += f.sz;

      switch (f.num) {
        case 253:
          ts = raw;
          break;
        case 0:
          lat = raw === null ? null : raw * SEMI;
          break;
        case 1:
          lon = raw === null ? null : raw * SEMI;
          break;
        case 2:
          alt = raw === null ? null : raw / 5 - 500;
          break;
        case 3:
          hr = raw;
          break;
        case 4:
          cad = raw;
          break;
        case 13:
          temp = raw;
          break;
      }
    }
    return {
      ts: ts,
      lat: lat,
      lon: lon,
      alt: alt,
      hr: hr,
      cad: cad,
      temp: temp,
    };
  }

  while (o < end) {
    var hdr = v.getUint8(o);
    o += 1;

    // --- Compressed timestamp data message ---
    if ((hdr & 0x80) !== 0) {
      var lmt = (hdr >> 5) & 0x03;
      var timeOff = hdr & 0x1f;
      var d = defs[lmt];
      if (!d) {
        o += (d && d.totalSize) || 0;
        continue;
      }

      var prev = lastTs[lmt] || 0;
      var newTs = (prev & ~0x1f) | timeOff;
      if (timeOff < (prev & 0x1f)) newTs += 32;
      lastTs[lmt] = newTs;

      var rec = extractRecord(d, o);
      o += d.totalSize;

      if (d.gmn === 20) {
        results.push({
          timestamp: new Date((newTs + FIT_EPOCH) * 1000).toISOString(),
          latitude: rec.lat,
          longitude: rec.lon,
          altitude: rec.alt,
          heart_rate: rec.hr,
          temperature: rec.temp,
          cadence: rec.cad,
        });
      }
      continue;
    }

    var isDef = (hdr & 0x40) !== 0;
    var lmt = hdr & 0x0f;

    if (isDef) {
      o += 1; // reserved
      var be = v.getUint8(o) === 1;
      o += 1;
      var gmn = v.getUint16(o, !be);
      o += 2;
      var nf = v.getUint8(o);
      o += 1;

      var fields = [];
      var totalSize = 0;
      for (var i = 0; i < nf; i++) {
        var fn = v.getUint8(o);
        var fs = v.getUint8(o + 1);
        var fb = v.getUint8(o + 2);
        o += 3;
        fields.push({ num: fn, sz: fs, bt: fb });
        totalSize += fs;
      }

      if ((hdr & 0x20) !== 0) {
        var ndf = v.getUint8(o);
        o += 1;
        for (var i = 0; i < ndf; i++) {
          totalSize += v.getUint8(o + 1);
          o += 3;
        }
      }

      defs[lmt] = { gmn: gmn, be: be, fields: fields, totalSize: totalSize };
    } else {
      var d = defs[lmt];
      if (!d) {
        break;
      }

      var rec = extractRecord(d, o);
      if (rec.ts !== null) lastTs[lmt] = rec.ts;
      o += d.totalSize;

      if (d.gmn === 20 && rec.ts !== null) {
        results.push({
          timestamp: new Date((rec.ts + FIT_EPOCH) * 1000).toISOString(),
          latitude: rec.lat,
          longitude: rec.lon,
          altitude: rec.alt,
          heart_rate: rec.hr,
          temperature: rec.temp,
          cadence: rec.cad,
        });
      }
    }
  }

  return results;
}
