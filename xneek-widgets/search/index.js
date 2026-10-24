import { Widget } from "../widget.js";


export class SearchWidget extends Widget {
  constructor() {
    super(import.meta.url, "SearchWidget");
  }

  init() {


  }
}
customElements.define("widget-search", SearchWidget);
