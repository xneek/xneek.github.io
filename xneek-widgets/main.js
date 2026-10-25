import { widgetsResource } from "./widgets/index.js";

widgetsResource.forEach((w, i) => {
  import(`./widgets/${w.id}/index.js`).then(() => {
    const widgetEl = document.createElement(`widget-${w.id}`);
    widgetEl.classList.add('widget');
    Object.entries(w).forEach(([k, v]) => {
      widgetEl.setAttribute(k, v);
    })
    widgetEl.style.order = i;
    mainEl.append(widgetEl);
  })
})