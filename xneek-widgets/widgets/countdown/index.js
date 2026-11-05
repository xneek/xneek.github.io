
import { WidgetHeaderButton } from "../../components/widget-header-button/index.js";
import { Widget } from "../../widget.js";


export class CountdownWidget extends Widget {
  constructor() {
    super(import.meta.url, "CountdownWidget");
  }

  init() {
    this.header.setTitle();

    const countdownsBody = this.shadowRoot.getElementById("countdownsBody");
    const addFormDialog = this.shadowRoot.getElementById("addFormDialog");
    const addForm = this.shadowRoot.getElementById("addForm");


    const defaultData = {
      name: "",
      date: "",
      id: ""
    };

    const addOrEdit = (data = defaultData) => {
      const form = addForm;
      form.elements.id.value = data.id;
      form.elements.name.value = data.name;
      form.elements.date.value = data.date;

      addFormDialog.showModal();
    };

    const renderRow = (data) => {
      const d = new Date(data.date);
      const now = new Date();
      const diff = d - now;

      if (diff < 0) return null;

      const diffDate = new Date(diff + now.getTimezoneOffset() * 60000);

      return crEl("div",
        {
          title: data.date,
          c: "countdown-list-item"
        },
        crEl('div', { c: 'name-and-date' },
          data.name, crEl('small', d.toLocaleString('default', { timeStyle: 'short', dateStyle: 'short' }))
        ),
        crEl('div', { c: 'name-and-date' }, crEl('small', { s: { opacity: '0.5' } }, 'Через: '), crEl('code', {}, [
          diffDate.getMonth() + '\u2009мес',
          (diffDate.getDate() - 1) + '\u2009дн'
        ].filter(x => (/^[1-9]/.test(x))).join(' ') + '\u00a0' + diffDate.toLocaleTimeString()))
      )

    };

    const renderList = () => {
      const storedData = this.storage.getValue("list") ?? [];
      countdownsBody.innerHTML = "";
      countdownsBody.append(
        crEl("main", { c: "list" }, [
          ...storedData.map(x => renderRow(x),).filter(Boolean)
        ]),
      );
    }


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
        date: form.elements.date.value,
        id: form.elements.id.value,
      };
      console.log(data);

      const storedData = this.storage.getValue("list") ?? [];


      const dataForSave = data.id.length
        ? storedData.map((x) =>
          x.id === data.id ? data : { ...defaultData, ...x },
        )
        : [...storedData, { ...data, id: self.crypto.randomUUID() }];

      this.storage.setValue("list", dataForSave);

      console.log({ dataForSave });


      addFormDialog.close();
      renderList();
    };

    renderList();
    setInterval(() => renderList(), 1000);
  }
}
customElements.define("widget-countdown", CountdownWidget);
