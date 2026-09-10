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
function downloadGpx(rows) {
  const trkpts = rows.map((row) => {
    return `<trkpt lat="${row.latitude}" lon="${row.longitude}">
        <time>${row.timestamp}</time>
        ${row.altitude ? `<ele>${row.altitude}</ele>`: ''}
        ${[row.temperature, row.heart_rate, row.cadence].some(Boolean) ? `<extensions>
          <ns3:TrackPointExtension>
            ${row.temperature ? `<ns3:atemp>${row.temperature}</ns3:atemp>`: ''}
            ${row.heart_rate ? `<ns3:hr>${row.heart_rate}</ns3:hr>`: ''}
            ${row.cadence ? `<ns3:cad>${row.cadence}</ns3:cad>`: ''}
          </ns3:TrackPointExtension>
        </extensions>` : ''}
      </trkpt>`
  })
  const gpxString = `<gpx xmlns:ns3="http://www.garmin.com/xmlschemas/TrackPointExtension/v1" xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:ns2="http://www.garmin.com/xmlschemas/GpxExtensions/v3" creator="Garmin Connect" version="1.1" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/11.xsd">
  <metadata>
    <link href="connect.garmin.com">
      <text>Garmin Connect</text>
    </link>
    <time>${rows[0].timestamp}</time>
  </metadata>
  <trk>
    <name>Пенза Бег</name>
    <type>running</type>
    <trkseg>
      ${trkpts.join('\n')}
    </trkseg>
  </trk>
</gpx>`;

  const blob = new Blob([gpxString], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
 const link = document.createElement('a');
  link.href = url;
  link.download = 'Result.gpx';
  
  // 4. Append to body, click it, and remove it immediately
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // 5. Free up memory by revoking the Object URL
  URL.revokeObjectURL(url);

}