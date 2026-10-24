import { Widget } from "../widget.js";

export class AnalogClockWidget extends Widget {
  constructor() {
    super(import.meta.url);
  }

  init() {
    const app = this.shadowRoot.getElementById("app");

    const time = new Date();
    const hour = -3600 * (time.getHours() % 12);
    const mins = -60 * (time.getMinutes() % 60);
    const seconds = -1 * time.getSeconds();
    app.style.setProperty("--default-seconds", `${seconds}s`);
    app.style.setProperty("--default-minutes", `${mins}s`);
    app.style.setProperty("--default-hours", `${hour + mins + seconds}s`);
  }
}
customElements.define("widget-analog-clock", AnalogClockWidget);
