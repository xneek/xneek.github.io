import { WidgetHeader } from "../../components/widget-header/index.js";
import { Widget } from "../../widget.js";
const iconCodes = {
  "01d": "☀️",
  "02d": "⛅",
  "03d": "☁️",
  "04d": "☁️",
  "09d": "🌦️",
  "10d": "🌧️",
  "11d": "⛈️",
  "13d": "❄️",
  "50d": "🌫️",
  "01n": "🌙",
  "02n": "☁️",
  "03n": "☁️",
  "04n": "☁️",
  "09n": "🌦️",
  "10n": "🌧️",
  "11n": "⛈️",
  "13n": "❄️",
  "50n": "🌫️",
};

export class CurrentWeatherWidget extends Widget {
  constructor() {
    super(import.meta.url, "CurrentWeatherWidget");
  }

  init() {

    this.header = new WidgetHeader();
    this.shadowRoot.prepend(this.header.getNode());
    this.header.setTitle('Погода');



    const weatherHeader = this.shadowRoot.getElementById("weatherHeader");
    const weatherBody = this.shadowRoot.getElementById("weatherBody");

    const apiKey = "0ceb02f93d6f36b3ea504d54f7cc3c68";
    const lsKey = "xneek-start-page-weather-point";

    const getForecastMoreData = (data) => {
      return crEl(
        "section",
        { c: 'weather-more' },
        crEl("div", { s: 'font-size: 6em' }, iconCodes[data.weather[0].icon]),
        crEl("div", { s: { color: 'var(--brand)' } }, data?.dt ? new Date(data.dt * 1000).toLocaleString('default', {
          timeStyle: 'full',
          dateStyle: 'full',
        }) : ''),
        crEl('h5', { c: 'accent', s: 'margin:0; text-transform: uppercase' }, data.weather[0].description),
        crEl("div", crEl('small', 'Облачность: ', crEl('b', data.clouds.all.toString()))),
        crEl("div", crEl('small', 'Ветер: ', crEl('b', `${data.wind.speed}м/с, порывы: ${data.wind.gust}м/с. Направление: ${data.wind.deg}°`))),
        crEl("div", crEl('small', 'Температура: ', crEl('b', `${data.main.temp}°C, ощущается: ${data.main.feels_like}°C`))),
        crEl("div", crEl('small', 'Давление: ', crEl('b', `${data.main.pressure}`))),
        crEl("div", crEl('small', 'Точка росы: ', crEl('b', `${data.main.dew_point}`))),
      );
    };

    const update = async () => {
      const rawCoords = this.storage.getValue(lsKey);

      if (!rawCoords) {
        weatherHeader.innerHTML = "";

        weatherHeader.append(crEl('div', { c: 'start' },
          crEl('p', 'Отображение текущей погоды'),
          crEl('p', 'и прогноза на 5 дней'),
          crEl('button', {
            e: {
              click: () => {
                updateCurrentPosition();
                update();
              }
            }
          }, 'Текущая позиция')
        ));
      }

      const [latitude, longitude] = rawCoords.split(",").map(Number);

      const rawData = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?units=metric&lang=${navigator.language}&lat=${latitude}&lon=${longitude}&appid=${apiKey}`,
      );
      const data = await rawData.json();

      const rawForecastData = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?units=metric&lang=${navigator.language}&lat=${latitude}&lon=${longitude}&appid=${apiKey}`,
      );
      const forecastData = await rawForecastData.json();

      console.log({ data, forecastData });

      weatherBody.innerHTML = "";
      const today = new Date().toLocaleDateString();
      weatherBody.append(
        crEl(
          "div",
          { c: "weather-wrapper" },
          crEl("div", {
            c: "weatherIcon",
            d: { icon: iconCodes[data.weather[0].icon] },
          }),
          crEl(
            "div",
            { c: "current-forecast" },
            crEl("div", { c: "accent" }, data.weather[0].description),
            crEl(
              "div",
              { title: `Ощущается как ${data.main.feels_like}` },
              `${Math.round(data.main.temp)}°C`,
            ),
            crEl(
              "div",
              {},
              crEl(
                "small",
                { c: "place" },
                data.name,
                crEl(
                  "span",
                  { s: "rotate: -45deg; display: inline-block; opacity: 0.5" },
                  "➤",
                ),
              ),
            ),
          ),
          crEl(
            "div",
            { c: "forecast" },
            forecastData.list.map((s) => {
              const date = new Date(s.dt * 1000);
              return crEl(
                "button",
                {
                  c: "fc",
                  interestfor: `tt-${s.dt}`,
                  s: { anchorName: `--tt-${s.dt}` },
                  tabindex: 0,
                  role: "button",
                },
                crEl(
                  "i",
                  { c: "fc-icon", title: s.weather[0].description },
                  iconCodes[s.weather[0].icon],
                ),
                crEl(
                  "div",
                  { c: "fc-temp", title: `Ощущается как ${s.main.feels_like}` },
                  `${Math.round(s.main.temp)}°C`,
                ),
                crEl(
                  "small",
                  { c: "fc-time" },

                  date.toLocaleTimeString("default", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                  crEl(
                    "small",
                    {},
                    today === date.toLocaleDateString()
                      ? "сегодня"
                      : date.toLocaleDateString("default", {
                        day: "numeric",
                        month: "short",
                      }),
                  ),
                ),
                crEl(
                  "div",
                  {
                    popover: "hint",
                    id: `tt-${s.dt}`,
                    s: { positionAnchor: `--tt-${s.dt}` },
                    c: "fc-tooltip",
                  },
                  getForecastMoreData(s)
                ),
              );
            }),
          ),
        ),
      );



    };
    const setCurrentPositionManually = () => {
      try {
        const [latitude, longitude] = prompt(
          "Координаты в формате latitude, longitude",
          "53.143799, 45.015387",
        )
          .split(",")
          .map(Number);
        if (!Number.isFinite(latitude)) throw new Error("Wrong latitude");
        if (!Number.isFinite(longitude)) throw new Error("Wrong longitude");

        if (Number(latitude) > 90) throw new Error("Wrong latitude > 90");
        if (Number(latitude) < -90) throw new Error("Wrong latitude < 90");

        if (Number(longitude) > 90) throw new Error("Wrong longitude > 90");
        if (Number(longitude) < -90) throw new Error("Wrong longitude < 90");

        this.storage.setValue(lsKey, [latitude, longitude].join(","));
        update();
      } catch (error) {
        alert("Ошибка ввода геопозиции: " + "\n" + error.message);
        confirm("Попробовать еще раз?") && setCurrentPositionManually();
      }
    };

    const updateCurrentPosition = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Широта:", position.coords.latitude);
          console.log("Долгота:", position.coords.longitude);
          console.log("Точность (м):", position.coords.accuracy);

          this.storage.setValue(
            lsKey,
            [position.coords.latitude, position.coords.longitude].join(","),
          );
          update();
        },
        (error) => {
          alert(
            "Ошибка получения геопозиции: " + error.code + "\n" + error.message,
          );
          console.error(
            "Ошибка получения геопозиции:",
            error.code,
            error.message,
          );
          confirm("Ввести вручную?") && setCurrentPositionManually();
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 0,
        },
      );
    };

    update();
    this.header.addMenuItem(crEl('button', { e: { click: () => update() } }, 'Обновить'));
    this.header.addMenuItem(crEl('button', {
      title: "Уточнить местоположение.\nAlt+Click - задать вручную",
      e: {
        click: (e) => {
          if (e.altKey) {
            setCurrentPositionManually();
          } else {
            updateCurrentPosition();
          }

          update();
        }
      }
    }, 'Уточнить местоположение'));

    setTimeout(() => {
      update();
    }, 30e3);
  }


}
customElements.define("widget-weather", CurrentWeatherWidget);
