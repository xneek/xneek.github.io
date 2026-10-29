import { WidgetHeaderButton } from "../widget-header-button/index.js";

export class Menu {
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
      }, ...menuEls.map(el => { el.classList.add('widget-menu-item'); return el }));

    this.container = crEl('span', { c: 'menu-main-item' });

    this.container.append(this.activator)
    this.container.append(this.menu)
  }

  getEl() {
    return this.container;
  }

}