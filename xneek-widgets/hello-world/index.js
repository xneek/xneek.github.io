import { Widget } from "../widget.js";

export class HelloWorldWidget extends Widget {
  static observedAttributes = ["color", "size"];
  constructor() {
    super(import.meta.url);
  }

    attributeChangedCallback(name, oldValue, newValue) {
    console.log(`Attribute ${name} has changed.`);

    this.color = newValue;
  }

  init() {
    this.shadowRoot.querySelector('h1').style.color = this.color
  }
}
customElements.define('widget-hello-world', HelloWorldWidget);