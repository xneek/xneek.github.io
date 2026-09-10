function getColorByIndex(index, total = 5, l = 90) {
  const hue = (index * (360 / total)) % 360;
  return `hsl(${Math.round(hue)}, 70%, ${l}%)`;
}

let lastCheckbox;

const cols = [
  {
    key: "point",
    label: "lat, lng, alt",
    setValues: ["latitude", "longitude", "altitude"],
    val: (row) =>
      crEl(
        "span",
        {
          title: "Click to center map on this point",
          s: { cursor: "pointer" },
          e: {
            mouseenter: (e) => {
              window.activeMarker.setLatLng([row.latitude, row.longitude]);
            },
            click: (e) => {
              window.myMap.flyTo([row.latitude, row.longitude], 15);
            },
          },
        },
        [row.latitude, row.longitude]
          .filter(Boolean)
          .map((x) => x.toPrecision(7))
          .join(", "),
        row.altitude && crEl("small", "   " + row.altitude + ""),
      ),
    hasValue: (row) => [row.latitude, row.longitude].every(Boolean),
  },
  { key: "heart_rate", label: "hr" },
  { key: "temperature", label: "temp" },
  { key: "cadence", label: "cadence" },
];

document.getElementById("computeResult").onclick = () => computeResult();
document.getElementById("computeResult").oncontextmenu = (e) => {
  e.preventDefault();
  computeResult(true);
}

function computeResult(withDownload = false) {
  /*
  {
    timestamp: "2025-06-15T08:30:00.000Z",
    latitude: 55.7558260,
    longitude: 37.6172999,
    altitude: 156.4,
    heart_rate: 142,
    temperature: 24,
    cadence: 88
  },
  */

  const results = [];

  [...myTable.querySelectorAll("tbody>tr:has(input[data-key='point']:checked)")].forEach((tr) => {
    const tds = [...tr.querySelectorAll(`td:has(input:checked)`)];
    const timestampTd = tr.querySelector(`td[data-timestamp]`);
    const res = {
      timestamp: timestampTd?.dataset?.timestamp,
      latitude: null,
      longitude: null,
      altitude: null,
      heart_rate: null,
      temperature: null,
      cadence: null,
    };
    tds.forEach((td) => {
      if (td.dataset.latitude) res.latitude = +td.dataset.latitude;
      if (td.dataset.longitude) res.longitude = +td.dataset.longitude;
      if (td.dataset.altitude && Number.isFinite(+td.dataset.altitude))
        res.altitude = +td.dataset.altitude;

      if (Number.isFinite(+td.dataset.heart_rate))
        res.heart_rate = +td.dataset.heart_rate;
      if (Number.isFinite(+td.dataset.temperature))
        res.temperature = +td.dataset.temperature;
      if (Number.isFinite(+td.dataset.cadence))
        res.cadence = +td.dataset.cadence;
    });
    res.timestamp && results.push(res);
  });

  console.log({ results });

  resultLayer.clearLayers();

  const polyline1 = new L.polyline(
    results
      .filter((r) => [r.latitude, r.longitude].every(Number.isFinite))
      .map((r) => [r.latitude, r.longitude]),
    {
      color: "red",
      weight: 5,
      opacity: 1,
      smoothFactor: 1,
    },
  );

  resultLayer.addLayer(polyline1);
  myMap.fitBounds(resultLayer.getBounds(), { padding: [100, 100] });
  withDownload && downloadGpx(results);
  return results;
}

document.getElementById("fileInput").addEventListener("change", async (e) => {
  const files = [...e.target.files];
  const datesStrSet = new Set();
  const map = {};

  myTable.append(
    crEl(
      "thead",
      {},
      crEl(
        "tr",
        crEl("th", { rowspan: 2 }, "Дата"),
        files.map((f, i) =>
          crEl(
            "th",
            {
              colspan: cols.length,
              s: { backgroundColor: getColorByIndex(i, files.length) },
            },
            f.name,
            crEl(
              "span",
              { s: { color: getColorByIndex(i, files.length, 30) } },
              " ━ ",
            ),
          ),
        ),
      ),
      crEl(
        "tr",
        {},
        ...files.map((f, i) => [
          ...cols.map((col) => {
            return crEl(
              "th",
              { s: { backgroundColor: getColorByIndex(i, files.length) } },
              col.label,
              crEl("input", {
                type: "checkbox",
                s: { float: "left" },
                e: {
                  change: (e) => {
                    [
                      ...document.querySelectorAll(
                        `.chk_${col.key}_for_file_${i}`,
                      ),
                    ].forEach((chk) => (chk.checked = e.target.checked));
                  },
                },
              }),
            );
          }),
        ]),
      ),
    ),
  );

  const processRows = (rows, fileIndex) => {
    rows.forEach((row) => {
      const key = new Date(row.timestamp).toLocaleString();
      datesStrSet.add(key);

      if (!map[key]) map[key] = new Array(files.length).fill({});
      map[key][fileIndex] = row;
    });

    const polyline1 = new L.polyline(
      rows
        .filter((r) => [r.latitude, r.longitude].every(Number.isFinite))
        .map((r) => [r.latitude, r.longitude]),
      {
        color: getColorByIndex(fileIndex, files.length, 30),
        weight: 3,
        opacity: 1,
        smoothFactor: 1,
      },
    );

    polylinesLayer.addLayer(polyline1);
  };

  for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
    const file = files[fileIndex];
    if (file.name.toLowerCase().endsWith("gpx")) {
      const gpxRows = await parseGPX(file, fileIndex);
      console.log("gpx file content", gpxRows);
      processRows(gpxRows, fileIndex);
    } else if (file.name.toLowerCase().endsWith("fit")) {
      const fitRows = await parseFIT(file);
      processRows(fitRows, fileIndex);
      console.log("fit file content");
    }
  }

  myMap.fitBounds(polylinesLayer.getBounds(), { padding: [100, 100] });

  myTable.append(
    crEl(
      "tbody",
      {},
      [...datesStrSet].sort().map((rowKey, ri) => {
        return crEl(
          "tr",
          {},
          crEl(
            "td",
            {
              d: { timestamp: map[rowKey].find((x) => x.timestamp)?.timestamp },
            },
            rowKey,
          ),
          ...map[rowKey].map((fileRow, fi) => {
            return [
              ...cols.map((col) => {
                return crEl(
                  "td",
                  {
                    c: `td_for_${col.key}_${fi}`,
                    s: { backgroundColor: getColorByIndex(fi, files.length) },
                    e: {
                      ...(col?.getAdditionalEvents
                        ? col?.getAdditionalEvents(fileRow)
                        : {}),
                    },

                    d: col.setValues
                      ? col.setValues.reduce((acc, val) => {
                          acc[val] = fileRow[val];
                          return acc;
                        }, {})
                      : { [col.key]: fileRow[col.key] },
                  },
                  col.val
                    ? col.val(fileRow)
                    : fileRow[col.key]
                      ? fileRow[col.key].toString()
                      : "",

                  (col.hasValue ? col.hasValue(fileRow) : !!fileRow[col.key]) &&
                    crEl("input", {
                      type: "checkbox",
                      d: { index: ri, file: fi, key: col.key },
                      c: `chk_${col.key}_for_file_${fi}`,
                      s: { float: "left" },
                      e: {
                        contextmenu: (e) => {
                          e.preventDefault();
                          const cols = document.querySelectorAll(
                            `.td_for_${col.key}_${fi}`,
                          );

                          if (lastCheckbox) {
                            [...cols].forEach((c) =>
                              c.classList.remove("active"),
                            );
                            const lastCheckboxIndex =
                              +lastCheckbox.dataset.index;

                            if (lastCheckboxIndex < ri) {
                              for (let i = lastCheckboxIndex; i <= ri; i++) {
                                const targetCheckbox = document.querySelector(
                                  `input[type='checkbox'][data-key='${col.key}'][data-file='${fi}'][data-index='${i}']`,
                                );
                                if (targetCheckbox) {
                                  targetCheckbox.checked = lastCheckbox.checked;
                                  if (!e.ctrlKey && !e.altKey) {
                                    [
                                      ...targetCheckbox
                                        .closest("tr")
                                        .querySelectorAll(
                                          `input[type='checkbox']`,
                                        ),
                                    ].forEach(
                                      (n) => (n.checked = lastCheckbox.checked),
                                    );
                                  }
                                }
                              }
                            } else {
                              for (let i = lastCheckboxIndex; i >= ri; i--) {
                                const targetCheckbox = document.querySelector(
                                  `input[type='checkbox'][data-key='${col.key}'][data-file='${fi}'][data-index='${i}']`,
                                );
                                if (targetCheckbox) {
                                  targetCheckbox.checked = lastCheckbox.checked;
                                  if (!e.ctrlKey && !e.altKey) {
                                    [
                                      ...targetCheckbox
                                        .closest("tr")
                                        .querySelectorAll(
                                          `input[type='checkbox']`,
                                        ),
                                    ].forEach(
                                      (n) => (n.checked = lastCheckbox.checked),
                                    );
                                  }
                                }
                              }
                            }
                            lastCheckbox = null;
                          } else {
                            [...cols].forEach((c) => c.classList.add("active"));
                            lastCheckbox = e.target;
                            e.target.checked = !e.target.checked;
                          }
                        },
                      },
                    }),
                );
              }),
            ];
          }),
        );
      }),
    ),
  );
});
