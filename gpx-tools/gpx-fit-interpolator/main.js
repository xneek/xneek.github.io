const parser = new DOMParser();

let dom;

/*
  timestamp: "2025-06-15T08:30:00.000Z",
  latitude: 55.7558260,
  longitude: 37.6172999,
  altitude: 156.4,
  heart_rate: 142,
  temperature: 24,
  cadence: 88

  point?:[lat, lon, alt?]
  type?: pauseStart | pauseEnd | time

*/

let fitData;

let gpxStartDate;
let gpxEndDate;

let fitStartDate;
let fitEndDate;
let selectedTrackPoint = null;
let selectedChartItem = null;
let resultsArr = [];

let trackName = '';

function save() {
  console.log({ fitData });

  const trkpts = [...dom.querySelectorAll("trkpt")].map((r) => [
    +r.getAttribute("lat"),
    +r.getAttribute("lon"),
    +r.querySelector("ele").textContent,
  ]);

  fitData[0].point = trkpts[0];
  fitData[fitData.length - 1].point = trkpts[trkpts.length - 1];

  const segments = [];
  let lastSegment = [];
  let trkptStartIndex = 0;

  for (let i = 0; i < fitData.length; i++) {
    const isPauseStart = fitData[i]?.type === "pauseStart";
    const isPauseEnd = fitData[i]?.type === "pauseEnd";

    if (isPauseStart) {
      let lastPointIndex = trkpts.findIndex(
        (x) => x[0] === fitData[i].point[0] && x[1] === fitData[i].point[1],
      );
      if (lastPointIndex === -1)
        console.warn("NOT FOUND POINT ", fitData[i].point, "in", trkpts);

      segments.push({
        segment: lastSegment,
        points: trkpts.slice(trkptStartIndex, lastPointIndex + 1),
      });
      trkptStartIndex = lastPointIndex;
      lastSegment = [];
      lastSegment.push(fitData[i]);
    } else if (isPauseEnd) {
      lastSegment.push(fitData[i]);
      let lastPointIndex = trkpts.findIndex(
        (x) => x[0] === fitData[i].point[0] && x[1] === fitData[i].point[1],
      );
      if (lastPointIndex === -1)
        console.warn("NOT FOUND POINT ", fitData[i].point, "in", trkpts);
      segments.push({
        isPause: true,
        segment: lastSegment,
        points: trkpts.slice(trkptStartIndex, lastPointIndex - 1),
      });
      trkptStartIndex = lastPointIndex;
      lastSegment = [];
    } else {
      lastSegment.push(fitData[i]);
    }
  }

  segments.push({
    segment: lastSegment,
    points: trkpts.slice(trkptStartIndex),
  });
  console.log({ segments });

  // погнали

  const resSegs = [];

  segments
    .filter((s) => !s.isPause)
    .forEach((s) => {
      const cumDist = [0];
      for (let i = 1; i < s.points.length; i++) {
        cumDist.push(
          cumDist[i - 1] +
            haversineDistanceMeters(s.points[i - 1], s.points[i]),
        );
      }
      const totalDist = cumDist[cumDist.length - 1] || 1;
      const times = s.segment.map((t) => new Date(t.timestamp).getTime());
      const tStart = times[0];
      const tEnd = times[times.length - 1];
      const tSpan = tEnd - tStart || 1;

      const result = [];
      for (let i = 0; i < times.length; i++) {
        const progress = (times[i] - tStart) / tSpan; // 0..1
        const p = pointAtDistance(s.points, cumDist, progress * totalDist);
        s.segment[i].latitude = p[0];
        s.segment[i].longitude = p[1];
        s.segment[i].altitude = p[2];
        result.push(p);
      }

      resSegs.push(result);
    });

  console.log({ resSegs });

  const filledSegments = segments
    .filter((s) => !s.isPause)
    .map((x, i) => x.segment);
  console.log({ filledSegments });
  downloadGpx(filledSegments, trackName);
}

function bindToFit(lat, lng) {
  selectedTrackPoint = [lat, lng];
  bindPointDialog.showModal();
}

document.getElementById("gpxInput").addEventListener("change", async (e) => {
  const goodFile = e.target.files[0];
  if (!goodFile) return;
  console.log(`Good file is ${goodFile.name} ${goodFile.size}`);

  const goodDocDom = await new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = function (evt) {
      const gpxString = evt.target.result;
      const xmlDoc = parser.parseFromString(gpxString, "text/xml");
      res(xmlDoc);
    };
    reader.readAsText(goodFile);
  });

  gpxStartDate = new Date(goodDocDom.querySelector("trkpt>time").textContent);
  gpxEndDate = new Date(
    goodDocDom.querySelector("trkpt:last-child>time").textContent,
  );

  dom = goodDocDom;

  step1.classList.add("hiddenStep");
  step2.classList.remove("hiddenStep");

  trackName = goodDocDom.querySelector("name").textContent

  res1.innerHTML = `<p>
            Отлично! Твой трек «<strong>${trackName}</strong>» что надо, 
            <br> в нем аж ${goodDocDom.querySelectorAll("trkpt").length} точек
          </p>
          <p>Сейчас мы наложим на координаты твоего трека данные из fit файла,<br>такие как время, пульс и каденс и все будет пучком)</p>
          
          `;

  window.trackPolyline = new L.polyline(
    [...goodDocDom.querySelectorAll("trkpt")].map((r) => [
      +r.getAttribute("lat"),
      +r.getAttribute("lon"),
    ]),
    {
      color: "red",
      weight: 2,
      opacity: 1,
      smoothFactor: 1,
    },
  );

  resultLayer.addLayer(window.trackPolyline);

  myMap.fitBounds(resultLayer.getBounds(), { padding: [8, 8] });

  function updatePolylinePoints() {
    const currentZoom = myMap.getZoom();
    const maxZoom = myMap.getMaxZoom();

    markersLayer.clearLayers();

    const bounds = myMap.getBounds();

    if (currentZoom >= maxZoom - 2) {
      console.log("maxZoom");
      window.trackPolyline.getLatLngs().forEach((latlng) => {
        if (bounds.contains(latlng)) {
          L.circleMarker(latlng, {
            radius: 3,
            color: "yellow",
            fillColor: "#ff3",
            fillOpacity: 0.5,
          })
            .addTo(markersLayer)
            .on("click", () => bindToFit(latlng.lat, latlng.lng));
          //markersLayer.bringToBack();
        }
      });
    }
  }

  // Listen for zoom and pan changes
  map.on("moveend", updatePolylinePoints);
});

function savePoint(type = "time") {
  if (!selectedTrackPoint) return alert("Не выбрана точка трека");
  if (!selectedChartItem) return alert("Не выбрана точка на графике");

  const s = new Date(selectedChartItem.timestamp).toLocaleTimeString(
    "default",
    { timeStyle: "short" },
  );
  L.circleMarker(selectedTrackPoint, {
    radius: 3,
    color: { time: "green", pauseStart: "black", pauseEnd: "blue" }[type],
    fillColor: "lime",
    fillOpacity: 0.5,
  })
    .addTo(resultLayer)
    .bindTooltip(s, {
      permanent: true,
      direction: { time: "top", pauseStart: "left", pauseEnd: "right" }[type], //"right", // Options: 'right', 'left', 'top', 'bottom', 'center'
      className: type, // Optional: custom CSS class
    })
    .openTooltip();

  resultLayer.bringToFront();

  const targetFitDataIndex = fitData.findIndex(
    (fd) => fd.timestamp === selectedChartItem.timestamp,
  );
  if (targetFitDataIndex) {
    fitData[targetFitDataIndex].point = selectedTrackPoint;
    fitData[targetFitDataIndex].type = type;
    console.info(
      `fit data with index ${targetFitDataIndex} updated `,
      fitData[targetFitDataIndex],
    );
  } else {
    console.warn(`NO FOUND ${selectedChartItem.timestamp} in`, fitData);
  }
  saveBtn.disabled = false;
  selectedTrackPoint = null;
  selectedChartItem = null;
}

document.getElementById("saveBtn").onclick = () => save();

document.getElementById("fitInput").addEventListener("change", async (e) => {
  const fitFile = e.target.files[0];
  if (!fitFile) return;
  console.log(`fit file is ${fitFile.name} ${fitFile.size}`);

  fitData = await parseFIT(fitFile);
  console.log(`fitData`, fitData);

  fitStartDate = new Date(fitData[0].timestamp);
  fitEndDate = new Date(fitData[fitData.length - 1].timestamp);

  const chartHeight = 150;
  const minHR = Math.min(...fitData.map((x) => x.heart_rate));
  const maxHR = Math.min(...fitData.map((x) => x.heart_rate));

  let lastMinutes = new Date(fitData[0].timestamp).getMinutes();

  step2.classList.add("hiddenStep");
  step3.classList.remove("hiddenStep");

  res2.innerHTML = `
          <p>Отлично! В твоем fit файле целых ${fitData.length}-записей <br>
            в диапазоне дат с ${fitStartDate.toLocaleString()} до ${new Date(fitEndDate).toLocaleString()}</p>

          `;

  bindPointDialog.innerHTML = ``;
  bindPointDialog.append(
    crEl(
      "div",
      {},
      crEl(
        "p",
        {},

        crEl(
          "button",
          {
            s: { float: "right" },
            e: {
              click: () => {
                if (confirm("Галя, у нас отмена?")) {
                  selectedTrackPoint = null;
                  selectedChartItem = null;
                  modalFooter.style.display = "none";
                  bindPointDialog.close();
                }
              },
            },
          },
          "×",
        ),
        "Это график пульса и времени с твоего fit файла",
      ),
      crEl("small", {}, "Веди по графику и кликай на подходящее время"),
      crEl(
        "div",
        { c: "chartWrapper" },
        crEl(
          "div",
          {
            c: "chartCanvas",
            s: { height: `${chartHeight}px` },
            e: {
              click: (e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left; // X pixels relative to element
                const data = fitData[+x];
                if (!data) return;

                selectedChartItem = data;

                selPoint.innerHTML = "";
                selPoint.append(
                  crEl(
                    "div",
                    crEl("div", "Выбранная точка"),
                    new Date(data.timestamp).toLocaleString(),
                    crEl("div", " HR: " + data.heart_rate),
                  ),
                );

                modalFooter.style.display = "block";
              },

              mousemove: (e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left; // X pixels relative to element
                const data = fitData[+x];
                if (!data) return;
                curPoint.innerHTML = "";
                curPoint.append(
                  crEl(
                    "div",
                    new Date(data.timestamp).toLocaleString(),
                    crEl("div", " HR: " + data.heart_rate),
                  ),
                );
              },
            },
          },
          ...fitData.map((f, i) => {
            const d = new Date(f.timestamp);
            const m = d.getMinutes();
            let additional = "";
            if (m !== lastMinutes) {
              additional = crEl("small", {
                c: "timeLabel",
                d: {
                  time: d.toLocaleTimeString("default", {
                    timeStyle: "short",
                  }),
                },
              });
              lastMinutes = m;
            }

            return crEl(
              "div",
              {
                c: "chartItem",
                s: { height: `${f.heart_rate / 2}px` },
              },
              additional,
            );
          }),
        ),
      ),
      crEl(
        "div",
        { s: { display: "flex", justifyContent: "space-between" } },
        crEl("div", { id: "curPoint" }),
        crEl(
          "div",
          { id: "selPoint", s: { color: "red" } },
          "Клик на графике для выбора точки",
        ),
      ),
      crEl(
        "footer",
        {
          id: "modalFooter",
          s: { display: "none", maxWidth: "480px" },
        },
        "Сохранить точку как:",
        crEl(
          "div",
          { s: { display: "flex", gap: "8px" } },

          // crEl(
          //   "button",
          //   {
          //     e: {
          //       click: () => {
          //         savePoint("time");
          //         modalFooter.style.display = "none";
          //         bindPointDialog.close();
          //       },
          //     },
          //   },
          //   "Точка с известным временем",
          // ),
          crEl(
            "button",
            {
              e: {
                click: () => {
                  savePoint("pauseStart");
                  modalFooter.style.display = "none";
                  bindPointDialog.close();
                },
              },
            },
            "Начало паузы",
          ),
          crEl(
            "button",
            {
              e: {
                click: () => {
                  savePoint("pauseEnd");
                  modalFooter.style.display = "none";
                  bindPointDialog.close();
                },
              },
            },
            "Конец паузы",
          ),
        ),
      ),
    ),
  );
});
