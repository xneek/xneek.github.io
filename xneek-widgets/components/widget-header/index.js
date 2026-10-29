import { Menu } from "../menu/index.js";
import { WidgetHeaderButton } from "../widget-header-button/index.js";

export class WidgetHeader {
  static header;
  static title;
  static aside;
  static menu;

  constructor(attrsForSet) {
    this.attrs = attrsForSet;
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
    if (typeof textOrNode === 'undefined') {
      this.title.textContent = this.attrs.name;
      this.title.title = this.attrs.description;
    } else if (typeof textOrNode === 'string') {
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
    if (!this.menu) this.menu = new Menu(this.id, "•••")
    if (!this.aside.contains(this.menu.container)) this.aside.append(this.menu.container);

    el.classList.add('widget-menu-item')
    this.menu.menu.append(el);
  }


}