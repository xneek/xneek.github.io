import styles from './widget-header.css' with { type: "css" }


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

export class WidgetHeader {
  static header;
  static title;
  static aside;
  static menu;

  constructor(id, parent) {
    this.id = crypto.randomUUID();
    this.header = crEl('header', { c: 'header' });
    this.title = crEl('h5', { c: 'header-title' });
    this.aside = crEl('aside', { c: 'header-aside' });


    const sheet = new CSSStyleSheet();
    sheet.replaceSync(styles)
    //someShadowRoot.adoptedStyleSheets = [ sheet ];
    if (!document.adoptedStyleSheets.includes(sheet)) {
      document.adoptedStyleSheets.push(sheet)
    }

    //document.adoptedStyleSheets.push(styles);


  }

  getNode() {
    return this.header
  }


  setTitle(text) {
    if (!this.title?.parentNode !== this.header) this.header.append(this.title)
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


}