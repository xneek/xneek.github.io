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
function downloadGpx(segments, trackName = 'result', creator = "xneek gpx tools") {
  const trkseg = segments.map((segment) => {
    return `<trkseg>
      ${segment.map((row) => {
      return `<trkpt lat="${row.latitude}" lon="${row.longitude}">
        <time>${row.timestamp}</time>
        ${row.altitude ? `<ele>${row.altitude}</ele>` : ''}
        ${[row.temperature, row.heart_rate, row.cadence].some(Boolean) ? `<extensions>
          <ns3:TrackPointExtension>
            ${row.temperature ? `<ns3:atemp>${row.temperature}</ns3:atemp>` : ''}
            ${row.heart_rate ? `<ns3:hr>${row.heart_rate}</ns3:hr>` : ''}
            ${row.cadence ? `<ns3:cad>${row.cadence}</ns3:cad>` : ''}
          </ns3:TrackPointExtension>
        </extensions>` : ''}
      </trkpt>`
    }).join('\n')}
    </trkseg>`
  })

  const gpxString = `<gpx
    xmlns:ns3="http://www.garmin.com/xmlschemas/TrackPointExtension/v1"
    xmlns="http://www.topografix.com/GPX/1/1"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:ns2="http://www.garmin.com/xmlschemas/GpxExtensions/v3"
    creator="${creator}"
    version="1.1"
    xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/11.xsd"
  >
  <metadata>
    <link href="xneek.github.io/gpx-tools/gpx-fit-interpolator/">
      <text>xneek gpx + fit interpolator</text>
    </link>
    <time>${segments[0][0].timestamp}</time>
  </metadata>
  <trk>
    <name>${trackName}</name>
    <type>running</type>
    ${trkseg.join('\n')}
  </trk>
</gpx>`;

  const blob = new Blob([gpxString], { type: 'application/gpx+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = trackName + '.gpx';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

}