import styles from './widget.css' with { type: "css" }
class Storage {
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

class DDMenu {
  static container;
  static activator;
  static menu;

  constructor(id, activatorEl, ...menuEls) {
    this.id = id;
    this.activator = crEl('button', {
      c: "menu-toggle",
      command: "toggle-popover",
      commandfor: `card-menu-${id}`,
      interestfor: "card-menu",
      s: { anchorName: `--card-${id}` },
    }, activatorEl);

    this.menu = crEl(
      "menu",
      {
        c: 'menu',
        popover: "auto",
        id: `card-menu-${id}`,
        s: { positionAnchor: `--card-${id}` },
        e: {
          click: e => e.currentTarget.hidePopover()
        }
      }, ...menuEls);

    this.container = crEl('span', { c: 'menu-main-item' });

    this.container.append(this.activator)
    this.container.append(this.menu)
  }

  getEl() {
    return this.container;
  }

}

class Test {
  constructor() {
    this.ololo = 'trololo'
  }

}

class Header {
  static header;
  static title;
  static aside;
  static menu;

  constructor(id, parent) {
    this.id = id;
    this.header = crEl('header', { c: 'header' });
    this.title = crEl('h5', { c: 'header-title' });
    this.aside = crEl('aside', { c: 'header-aside' });
  }


  setTitle(text) {
    if (!this.header.contains(this.title)) this.header.append(this.title)
    this.title.textContent = text;
  }
  addAsideItem(el) {
    if (!this.header.contains(this.aside)) this.header.append(this.aside);
    this.aside.prepend(crEl('span', { c: 'aside-item' }, el));
  }

  addMenuItem(el) {
    if (!this.header.contains(this.aside)) this.header.append(this.aside);
    if (!this.menu) this.menu = new DDMenu(this.id, "•••")
    if (!this.aside.contains(this.menu.container)) this.aside.append(this.menu.container);
    this.menu.menu.append(el);
  }

  getEl() {
    return this.header;
  }
}

export class Widget extends HTMLElement {
  static baseUrl = "";
  static storage;

  constructor(bu, name) {
    super();
    this.baseUrl = bu;

    this.storage = new Storage(name ?? decodeURIComponent(bu));

    this.attachShadow({ mode: "open" });
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
    this.init(this.shadowRoot);
  }
}
