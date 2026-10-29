
import { WidgetHeaderButton } from "../../components/widget-header-button/index.js";
import { Widget } from "../../widget.js";


export class HabitsWidget extends Widget {
  constructor() {
    super(import.meta.url, "HabitsWidget");
  }

  init() {
    this.header.setTitle();

    const habitsBody = this.shadowRoot.getElementById("habitsBody");
    const addFormDialog = this.shadowRoot.getElementById("addFormDialog");
    const addForm = this.shadowRoot.getElementById("addForm");


    const defaultData = {
      name: "",
      isTimer: false,
      isEnable: true,
      day1: false,
      day2: false,
      day3: false,
      day4: false,
      day5: false,
      day6: false,
      day0: false,
      targetMinutes: "1",
      id: ""
    };

    const addOrEdit = (data = defaultData) => {
      const form = addForm;
      form.elements.id.value = data.id;
      form.elements.name.value = data.name;
      form.elements.isEnable.checked = data.isEnable;
      form.elements.isTimer.checked = data.isTimer;
      form.elements.day1.checked = data.day1;
      form.elements.day2.checked = data.day2;
      form.elements.day3.checked = data.day3;
      form.elements.day4.checked = data.day4;
      form.elements.day5.checked = data.day5;
      form.elements.day6.checked = data.day6;
      form.elements.day0.checked = data.day0;
      form.elements.targetMinutes.value = data.targetMinutes;

      addFormDialog.showModal();
    };




    const getWeek = (date = new Date()) => {
      const { firstDay, weekend } = new Intl.Locale(
        navigator.language,
      ).getWeekInfo();

      const normalizeWeekDay = (d) => (d === 7 ? 0 : d);

      const normalizedWeekend = weekend.map(normalizeWeekDay);

      const week = [];
      let cur = new Date(date.getTime() - 86400e3 * 6);
      const today = new Date();

      let isStarted = false;
      while (week.length < 7) {
        if (cur.getDay() === normalizeWeekDay(firstDay)) {
          isStarted = true;
        }

        if (isStarted)
          week.push({
            date: cur,
            isToday: cur.toDateString() === today.toDateString(),
            isPast:
              cur <
              new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate(),
                0,
                0,
              ),
            isFuture:
              cur >
              new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate(),
                23,
                59,
              ),
            isWeekend: normalizedWeekend.includes(cur.getDay()),
          });
        cur = new Date(cur.getTime() + 86400e3);
      }
      return week;
    };

    let lastRendered = new Date();

    const renderHeaders = (w,) => {
      return crEl(
        "article", { c: 'habits-header' },
        crEl(
          "section",
          { c: "habit-item habit-header" },
          w.map((x) =>
            crEl(
              "div",
              {
                title: x.date.toLocaleDateString(),
                c: [
                  "day",
                  x.isToday && "today",
                  x.isPast && "past",
                  x.isFuture && "future",
                  x.isWeekend && "weekend",
                ]
                  .filter(Boolean)
                  .join(" "),
              },

              x.date.toLocaleString("default", { weekday: "short" }),
              crEl(
                "small",
                x.date.toLocaleString("default", {
                  day: "2-digit",
                  month: "2-digit",
                }),
              ),
            ),
          ),
        ),
      );
    };

    const renderRow = (w, data) => {
      return crEl(
        "article", { c: 'habits-list-item' },
        crEl("header", { s: { display: 'flex' } },
          data.name,
          crEl('button', { e: { click: () => addOrEdit(data) } }, 'e')
        ),
        crEl(
          "section",
          { c: "habit-item" },
          w.map((x) =>
            crEl(
              "div",
              {
                title: x.date.toLocaleDateString(),
                c: [
                  "day",
                  x.isToday && "today",
                  x.isPast && "past",
                  x.isFuture && "future",
                  x.isWeekend && "weekend",
                ]
                  .filter(Boolean)
                  .join(" "),
              },
              !data.isTimer && data[`day${x.date.getDay()}`] ? crEl('input', { type: 'checkbox', disabled: x.isFuture }) : null
            ),
          ),
        ),
      );
    };

    const renderWeek = (dd) => {
      const w = getWeek(dd);

      habitsBody.innerHTML = "";

      const storedDate = this.storage.getValue("list") ?? [];


      habitsBody.append(
        crEl("main", { c: "list" }, [
          renderHeaders(w),
          ...storedDate.map(x => renderRow(w, x),)
        ]),
      );

      lastRendered = dd;
    };



    this.header.addAsideItem(
      new WidgetHeaderButton('>', {
        e: {
          click: () => {
            renderWeek(new Date(lastRendered.getTime() + 86400e3 * 7));
          },
        },
        s: { marginRight: 'var(--dimension3)' }
      }).getNode()
    )

    this.header.addAsideItem(new WidgetHeaderButton(
      "<",
      {
        e: {
          click: () => {
            renderWeek(new Date(lastRendered.getTime() - 86400e3 * 7));
          },
        },
      },

    ).getNode());


    this.header.addMenuItem(crEl('button', {
      e: {
        click: () => {
          addOrEdit();
        },
      }
    }, 'Добавить'));


    addForm.onsubmit = (e) => {
      e.preventDefault();
      const form = e.target;

      const data = {
        name: form.elements.name.value,
        isTimer: form.elements.isTimer.checked,
        isEnable: form.elements.isEnable.checked,

        day1: form.elements.day1.checked,
        day2: form.elements.day2.checked,
        day3: form.elements.day3.checked,
        day4: form.elements.day4.checked,
        day5: form.elements.day5.checked,
        day6: form.elements.day6.checked,
        day0: form.elements.day0.checked,

        targetMinutes: form.elements.targetMinutes.value,
        id: form.elements.id.value,
      };
      console.log(data);

      const storedDate = this.storage.getValue("list") ?? [];


      const dataForSave = data.id.length
        ? storedDate.map((x) =>
          x.id === data.id ? data : { ...defaultData, ...x },
        )
        : [...storedDate, { ...data, id: self.crypto.randomUUID() }];

      this.storage.setValue("list", dataForSave);

      console.log({ dataForSave });


      addFormDialog.close();
      renderWeek(lastRendered);
    };

    renderWeek(lastRendered);
  }
}
customElements.define("widget-habits", HabitsWidget);
