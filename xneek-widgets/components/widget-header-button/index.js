

export class WidgetHeaderButton {
  static button;

  constructor(content, opts = {}) {
    this.button = crEl('button', { ...opts, c: ["widget-header-button", opts.c].filter(Boolean).join(' ') }, content);

  }

  getNode() {
    return this.button
  }
}