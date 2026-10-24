import { Widget } from "../widget.js";

export class NotificationsWidget extends Widget {
  constructor() {
    super(import.meta.url, "NotificationsWidget");
  }

  init() {
    const notificationsHeader = this.shadowRoot.getElementById(
      "notificationsHeader",
    );
    const notificationsBody =
      this.shadowRoot.getElementById("notificationsBody");

    const addForm = this.shadowRoot.getElementById("addForm");
    const addFormDialog = this.shadowRoot.getElementById("addFormDialog");

    const checkPermissions = () => {
      if (Notification?.permission === "granted") return;
      // Check if the browser supports notifications
      if (!("Notification" in window)) {
        notificationsHeader.innerHTML =
          "This browser does not support notifications.";
        return;
      }
      Notification.requestPermission().then((permission) => {
        // set the button to shown or hidden, depending on what the user answers
        notificationsHeader.innerHTML =
          permission === "granted" ? "Ok!" : "block";
      });
    };

    notificationsHeader.innerHTML = "";

    const showNotification = (data) => {
      let notification = new Notification(data.title, {
        body: data.text,
        icon: data.icon,
        navigate: data.url,
        requireInteraction: true,
      });
      if (data.url) {
        notification.onclick = () => {
          window.open("https://ya.ru", "_blank");
        };
      }

      if (data.timeout.length) {
        setTimeout(() => {
          notification.close();
        }, +data.timeout);
      }
    };

    const btn1 = document.createElement("button");


    const weekdays = [
      new Date(2026, 9, 5),
      new Date(2026, 9, 6),
      new Date(2026, 9, 7),
      new Date(2026, 9, 8),
      new Date(2026, 9, 9),
      new Date(2026, 9, 10),
      new Date(2026, 9, 11)
    ].map(d => d.toLocaleString("default", { weekday: "short" }));


    const formatRepeatDays = (days) => {
      const parts = [];
      let lastPart = [];
      for(let i = 0; i< days.length; i++) {
        if (days[i]) {
          lastPart.push(weekdays[i]);
        } else {
          parts.push([...lastPart]);
          lastPart = [];
        }
      }

      parts.push(lastPart);

      const filteredParts = parts.filter(a => a.length).map(x=> {
        if (x.length === 1) return x[0];
        if (x.length === 2) return x.join(',');
        if (x.length > 2) return [x.at(0), x.at(-1)].join('-');
      })

      return filteredParts.join(',');
    };

    const listItem = (data) => {
      const div = document.createElement("div");
      div.classList.add(
        "list-item-data",
        data.isEnable ? "enabled" : "disabled",
      );
      const div1 = document.createElement("div");
      div1.classList.add("div1");
      const strong = document.createElement("strong");
      strong.textContent = data.name;

      div1.append(strong);

      const small = document.createElement("small");
      small.textContent =
        (data.isRepeat
          ? formatRepeatDays([
              data.day1,
              data.day2,
              data.day3,
              data.day4,
              data.day5,
              data.day6,
              data.day0,
            ])
          : data.date) +
        " " +
        data.time;

      div1.append(small);

      div.append(div1);
      const div2 = document.createElement("div");
      const em = document.createElement("em");
      em.textContent = data.title;
      div2.append(em);
      div.append(div2);
      div.oncontextmenu = (e) => {
        e.preventDefault();
        addOrEdit(data);
      };
      div.ondblclick = () => showNotification(data);
      return div;
    };

    const drawList = () => {
      notificationsBody.innerHTML = "";

      const storedDate = this.storage.getValue("list") ?? [];
      storedDate.forEach((x) => {
        const li = document.createElement("li");
        li.classList.add("list-item");
        li.append(listItem(x));
        notificationsBody.append(li);
      });
    };

    const defaultData = {
      name: "",
      date: new Date().toISOString().substring(0, 10),
      time: String(new Date().getHours() + 1).padStart(2, "0") + ":00",
      isRepeat: false,
      isEnable: true,
      day1: false,
      day2: false,
      day3: false,
      day4: false,
      day5: false,
      day6: false,
      day0: false,

      title: "",
      text: "",
      icon: "",
      url: "",
      id: "",
      timeout: "",
    };

    const addOrEdit = (data = defaultData) => {
      const form = addForm;
      form.elements.name.value = data.name;
      form.elements.date.value = data.date;
      form.elements.time.value = data.time;
      form.elements.isEnable.checked = data.isEnable;
      form.elements.isRepeat.checked = data.isRepeat;
      form.elements.day1.checked = data.day1;
      form.elements.day2.checked = data.day2;
      form.elements.day3.checked = data.day3;
      form.elements.day4.checked = data.day4;
      form.elements.day5.checked = data.day5;
      form.elements.day6.checked = data.day6;
      form.elements.day0.checked = data.day0;
      form.elements.title.value = data.title;
      form.elements.text.value = data.text;
      form.elements.icon.value = data.icon;
      form.elements.url.value = data.url;
      form.elements.id.value = data.id;
      form.elements.timeout.value = data.timeout;

      addFormDialog.showModal();
    };

    btn1.onclick = () => {
      addOrEdit();
    };

    btn1.classList.add("addBtn");

    btn1.textContent = "Добавить напоминание";
    notificationsHeader.append(btn1);

    checkPermissions();

    addForm.onsubmit = (e) => {
      e.preventDefault();
      const form = e.target;

      const data = {
        name: form.elements.name.value,
        date: form.elements.date.value,
        time: form.elements.time.value,
        isRepeat: form.elements.isRepeat.checked,
        isEnable: form.elements.isEnable.checked,

        day1: form.elements.day1.checked,
        day2: form.elements.day2.checked,
        day3: form.elements.day3.checked,
        day4: form.elements.day4.checked,
        day5: form.elements.day5.checked,
        day6: form.elements.day6.checked,
        day0: form.elements.day0.checked,

        title: form.elements.title.value,
        text: form.elements.text.value,
        icon: form.elements.icon.value,
        url: form.elements.url.value,
        id: form.elements.id.value,
        timeout: form.elements.timeout.value,
      };
      console.log(data);

      const storedDate = this.storage.getValue("list") ?? [];
      console.log(storedDate);

      const dataForSave = data.id.length
        ? storedDate.map((x) =>
            x.id === data.id ? data : { ...defaultData, ...x },
          )
        : [...storedDate, { ...data, id: self.crypto.randomUUID() }];

      this.storage.setValue("list", dataForSave);

      console.log({ dataForSave });
      drawList();

      addFormDialog.close();
    };

    drawList();

    const filterActual = () => {};

    const already = [];
    const tick = () => {
      const storedDate = this.storage.getValue("list") ?? [];
      const enabledData = storedDate.filter((x) => x.isEnable);

      const actualData = enabledData.filter((x) => {
        if (already.includes(x.id)) return false;
        const dateOk = x.date === new Date().toISOString().substring(0, 10);
        const timeOk = x.time === new Date().toTimeString().substring(0, 5);
        const weekdayOk = x[`day${new Date().getDay()}`];
        if (!x.isRepeat && dateOk && timeOk) return true;
        if (x.isRepeat && timeOk && weekdayOk) return true;

        return false;
      });

      actualData.forEach((x) => {
        already.push(x.id);
        showNotification(x);
      });

      console.log({ storedDate, enabledData, actualData });
    };

    setInterval(() => tick(), 5000);
  }
}
customElements.define("widget-notifications", NotificationsWidget);
