import { WidgetHeader } from "../components/widget-header/index.js";
import { Widget } from "../widget.js";

export class MonthCalendarWidget extends Widget {
  constructor() {
    super(import.meta.url);
  }

  init() {
    const calendarTable = this.shadowRoot.getElementById("calendarTable");
    const calendarHeader = this.shadowRoot.getElementById("calendarHeader");
    const yearDialog = this.shadowRoot.getElementById("yearDialog");


    this.header = new WidgetHeader();
    this.shadowRoot.prepend(this.header.getNode());
    this.header.setTitle('Блокнот');


    let currentDate = new Date();

    const { firstDay, weekend } = new Intl.Locale(
      navigator.language,
    ).getWeekInfo();

    let weekdayInc = firstDay;

    const weekDays = [weekdayInc];
    while (weekDays.length < 7) {
      const next = ++weekdayInc;
      weekDays.push(next > 6 ? 0 : next);
    }

    const renderMonth = (date = new Date()) => {
      const thead = crEl("thead");
      const tbody = crEl("thead");

      const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth());
      const lastDayOfMonth = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0,
      );

      let nearestFirstDay = firstDayOfMonth;
      while (nearestFirstDay.getDay() !== firstDay) {
        nearestFirstDay = new Date(nearestFirstDay.getTime() - 86400000);
      }

      let cur = nearestFirstDay;

      let trh = document.createElement("tr");

      weekDays.forEach((w) => {
        nearestFirstDay = new Date(nearestFirstDay.getTime() + 86400000);
        const d = new Date(nearestFirstDay.getTime() - 86400000);
        const th = document.createElement("th");
        th.textContent = d.toLocaleString("default", { weekday: "short" });

        if (weekend.includes(d.getDay() || 7)) {
          th.classList.add("weekend");
        }

        trh.append(th);
      });

      thead.append(trh);

      let tr = document.createElement("tr");

      const day = (d) => {
        const div = document.createElement("div");
        div.classList.add("day");
        if (d.toLocaleDateString() === new Date().toLocaleDateString()) {
          div.classList.add("today");
        }
        div.textContent = d.getDate();
        return div;
      };

      while (cur <= lastDayOfMonth) {
        if (cur.getMonth() !== date.getMonth()) {
          const td = document.createElement("td");
          tr.append(td);
        } else {
          const td = document.createElement("td");

          if (weekend.includes(cur.getDay() || 7)) {
            td.classList.add("weekend");
          }
          td.append(day(cur));

          tr.append(td);
        }
        if (cur.getDay() === weekDays.at(-1)) {
          tbody.append(tr);
          tr = document.createElement("tr");
        }
        cur = new Date(cur.getTime() + 86400000);
      }
      tbody.append(tr);

      return crEl("table", {}, thead, tbody);
    };

    const showYearModal = (y) => {
      const article = crEl('article')
      const content = crEl(
        crEl('header', crEl('h2', y.toString())),
        article
      );

      let cur = new Date(y, 0, 1);
      while (cur.getFullYear() === y) {
        article.append(
          crEl(
            "div",
            crEl(
              "strong",
              cur.toLocaleString("default", {
                month: "long",
              }),
            ),
            renderMonth(cur),
          ),
        );
        cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
      }

      yearDialog.append(content);
      yearDialog.showModal();
    };

    const curHeader = crEl("div");

    const renderCurHeader = () => {
      curHeader.innerHTML = "";

      const el = crEl('div', { c: 'calendarHeader' },
        currentDate.toLocaleString("default", {
          month: "long",
        }),
        ' ',
        crEl(
          "a",
          {
            href: "#",
            e: {
              click: (e) => {
                e.preventDefault();
                showYearModal(currentDate.getFullYear());
              },
            },
          },
          currentDate.getFullYear().toString(),
        ),
      )

      curHeader.append(el);

      this.header.setTitle(el)
    };

    this.header.addAsideItem(crEl(
      "button",
      {
        e: {
          click: () => {
            currentDate = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth() + 1,
              1,
            );
            calendarTable.innerHTML = "";
            calendarTable.append(renderMonth(currentDate));
            renderCurHeader();
          },
        },
      },
      ">",
    ))

    this.header.addAsideItem(crEl(
      "button",
      {
        e: {
          click: () => {
            currentDate = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth() - 1,
              1,
            );
            calendarTable.innerHTML = "";
            calendarTable.append(renderMonth(currentDate));
            renderCurHeader();
          },
        },
      },
      "<",
    ));


    calendarHeader.innerHTML = "";

    calendarTable.innerHTML = "";
    calendarTable.append(renderMonth());
    renderCurHeader();
  }
}
customElements.define("widget-month-calendar", MonthCalendarWidget);
