import { Widget } from "../../widget.js";

export class AnalogClockWidget extends Widget {
  constructor() {
    super(import.meta.url);
  }




  init() {




    const app = this.shadowRoot.getElementById("app");
    const topLabel = this.shadowRoot.getElementById("topLabel");
    const bottomLabel = this.shadowRoot.getElementById("bottomLabel");

    topLabel.textContent = this.storage.getValue("topLabel") ?? ''
    bottomLabel.textContent = this.storage.getValue("bottomLabel") ?? ''

    this.header.addMenuItem(crEl('button', {
      e: {
        click: () => {
          const v = prompt('надпись сверху', this.storage.getValue("topLabel") ?? '')
          this.storage.setValue("topLabel", v);
          topLabel.textContent = v ?? ''

        }
      }
    }, "Задать надпись сверху"));
    this.header.addMenuItem(crEl('button', {
      e: {
        click: () => {
          const v = prompt('надпись снизу', this.storage.getValue("bottomLabel") ?? '')
          this.storage.setValue("bottomLabel", v);
          bottomLabel.textContent = v ?? ''
        }
      }
    }, "Задать надпись снизу"));

    const time = new Date();
    const hour = -3600 * (time.getHours() % 12);
    const mins = -60 * (time.getMinutes() % 60);
    const seconds = -1 * time.getSeconds();
    app.style.setProperty("--default-seconds", `${seconds}s`);
    app.style.setProperty("--default-minutes", `${mins}s`);
    app.style.setProperty("--default-hours", `${hour + mins + seconds}s`);
  }
}
customElements.define("widget-clock", AnalogClockWidget);
