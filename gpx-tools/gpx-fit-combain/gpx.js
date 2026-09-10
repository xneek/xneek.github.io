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
async function parseGPX(file) {
  const parser = new DOMParser();
  const gpxFileDom = await new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = function (evt) {
      const gpxString = evt.target.result;
      const xmlDoc = parser.parseFromString(gpxString, "text/xml");
      res(xmlDoc);
    };
    reader.readAsText(file);
  });

  const points = gpxFileDom.getElementsByTagName("trkpt");
  const res = [];

  [...points].forEach((point, i) => {
    const obj = {
      timestamp: null,
      latitude: null,
      longitude: null,
      altitude: null,
      heart_rate: null,
      temperature: null,
      cadence: null,
    };

    obj.timestamp = point.getElementsByTagName("time")[0].textContent;
    obj.latitude = +point.getAttribute("lat");
    obj.longitude = +point.getAttribute("lon");
    obj.altitude = +point.getElementsByTagName("ele")?.[0]?.textContent ?? null;

    const extensionsTag = point.getElementsByTagName("extensions")[0];
    if (!extensionsTag) {
      console.warn("extensions is not in point", point);
      res.push(obj);
      return obj;
    }
    const trackPointExtensionTag = extensionsTag.getElementsByTagName(
      "ns3:TrackPointExtension",
    )?.[0];

    if (!trackPointExtensionTag) {
      console.warn("ns3:TrackPointExtension is not in point", point);
      res.push(obj);
      return obj;
    }

    obj.heart_rate =
      +trackPointExtensionTag.getElementsByTagName("ns3:hr")?.[0]
        ?.textContent ?? null;
    ((obj.temperature =
      +trackPointExtensionTag.getElementsByTagName("ns3:atemp")?.[0]
        ?.textContent ?? null),
      (obj.cadence =
        +trackPointExtensionTag.getElementsByTagName("ns3:cad")?.[0]
          ?.textContent ?? null));
    res.push(obj);
  });

  return res;
}
