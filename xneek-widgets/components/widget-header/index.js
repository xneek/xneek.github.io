import { WidgetHeaderButton } from "../widget-header-button/index.js";

class DDMenu {
  static container;
  static activator;
  static menu;

  constructor(id, activatorEl, ...menuEls) {
    this.id = id;
    this.activator = new WidgetHeaderButton(activatorEl, {
      c: "menu-toggle",
      command: "toggle-popover",
      commandfor: `card-menu-${id}`,
      interestfor: "card-menu",
      s: { anchorName: `--card-${id}` },
    }).getNode();

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
    this.header = crEl('header', { c: 'widget-header' });
    this.title = crEl('h5', { c: 'widget-header-title' });
    this.aside = crEl('aside', { c: 'widget-header-aside' });
  }

  getNode() {
    return this.header
  }


  setTitle(textOrNode) {
    if (!this.header.contains(this.title)) this.header.prepend(this.title);
    if (typeof textOrNode === 'string') {
      this.title.textContent = textOrNode;
    } else {
      this.title.innerHTML = '';
      this.title.append(textOrNode)
    }
  }
  addAsideItem(el) {
    if (!this.header.contains(this.aside)) this.header.append(this.aside);
    this.aside.prepend(crEl('span', { c: 'widget-header-aside-item' }, el));
  }

  addMenuItem(el) {
    if (!this.header.contains(this.aside)) this.header.append(this.aside);
    if (!this.menu) this.menu = new DDMenu(this.id, "•••")
    if (!this.aside.contains(this.menu.container)) this.aside.append(this.menu.container);
    this.menu.menu.append(el);
  }


}