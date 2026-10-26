import { Storage } from "./widget.js";
import { widgetsResource } from "./widgets/index.js";

const selectedWidgetsStorage = new Storage('selectedWidgets');

const render = () => {
  const selectedWidgets = selectedWidgetsStorage.getValue('list') ?? [];

  mainEl.innerHTML = ''
  widgetsResource.forEach((w, i) => {
    if (!selectedWidgets.includes(w.id)) return;

    import(`./widgets/${w.id}/index.js`).then(() => {


      const storage = new Storage(`widgets_common_${w.id}`);
      const curChanges = storage.getValue('changes');

      const widgetEl = document.createElement(`widget-${w.id}`);
      widgetEl.classList.add('widget');
      Object.entries(w).forEach(([k, v]) => {
        widgetEl.setAttribute(k, curChanges?.[k] ?? v);
      })
      widgetEl.style.order = curChanges?.order ?? i;
      mainEl.append(widgetEl);
    })
  })
}

render()

addBtn.onclick = () => {
  const selectedWidgets = selectedWidgetsStorage.getValue('list') ?? [];


  const dialog = crEl('dialog');
  dialog.onclose = () => {
    dialog.remove();
  }

  dialog.append(crEl('div', { s: { display: 'flex', flexDirection: 'column' } },
    widgetsResource.map((w, i) => {
      if (selectedWidgets.includes(w.id)) return null;

      return crEl('button', {
        e: {
          click: () => {
            selectedWidgetsStorage.setValue('list', [...selectedWidgets, w.id])
            dialog.close();
            render();
          }
        }
      }, w.name)
    }).filter(Boolean)
  ))
  document.body.append(dialog)
  dialog.showModal();

}