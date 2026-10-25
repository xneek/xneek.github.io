import { WidgetHeader } from './components/widget-header/index.js';
import { showWidgetParamsModal } from './helpers/widgetParamsModal.js';
import styles from './widget.css' with { type: "css" }
export class Storage {
  constructor(name) {
    this.prefix = name;
  }

  getValue(key) {
    return JSON.parse(
      localStorage.getItem([this.prefix, key].join("__")) ?? "null",
    );
  }

  setValue(key, value) {
    localStorage.setItem([this.prefix, key].join("__"), JSON.stringify(value));
  }

  deleteValue() {
    localStorage.removeItem([this.prefix, key].join("__"));
  }
}

export class Widget extends HTMLElement {
  static baseUrl = "";
  static storage;

  static observedAttributes = ["id", "name", "description"];

  static attrs = {}


  constructor(bu, name) {
    super();
    this.baseUrl = bu;
    this.attrs = {};

    this.storage = new Storage(name ?? decodeURIComponent(bu));

    this.attachShadow({ mode: "open" });
  }

  attributeChangedCallback(name, oldValue, newValue) {

    this.attrs[name] = newValue
  }

  async connectedCallback() {

    this.shadowRoot.adoptedStyleSheets.push(styles);
    ///this.shadowRoot.append(this.header.getEl());
    const x = document.createElement("div");
    x.classList.add("loading");
    x.textContent = "Loading...";

    const sheet = new CSSStyleSheet();
    const template = document.createElement("template");

    const assetsLoaded = (baseUrl) =>
      Promise.all([
        fetch(
          new URL(
            "./template.html" + `?h=${encodeURIComponent(baseUrl)}`,
            baseUrl,
          ),
        ).then((res) => res.text()),
        fetch(
          new URL("styles.css" + `?h=${encodeURIComponent(baseUrl)}`, baseUrl),
        ).then((res) => res.text()),
      ])
        .then(([htmlText, cssText]) => {
          template.innerHTML = htmlText;
          return sheet.replace(cssText);
        })
        .catch((e) => console.error("assets load error", e));

    this.shadowRoot.append(x);
    await assetsLoaded(this.baseUrl);
    this.shadowRoot.removeChild(x);


    this.shadowRoot.append(template.content.cloneNode(true));

    this.shadowRoot.adoptedStyleSheets.push(sheet);

    const storage = new Storage(`widgets_common_${this.attrs.id}`);
    const curChanges = storage.getValue('changes');


    this.header = new WidgetHeader({ ...this.attrs, ...(curChanges ?? {}) });
    this.shadowRoot.prepend(this.header.getNode());
    this.header.addMenuItem(crEl('button', {
      e: {
        click: (e) => {
          showWidgetParamsModal(this.attrs, (up) => {
            this.attrs = { ...this.attrs, ...up };
            this.init(this.shadowRoot);

            sheet.insertRule(`
    .widget {
        order: ${up.order};
    }
`)
          });
        }
      }
    }, 'Параметры виджета'));
    this.init(this.shadowRoot);
  }
}
