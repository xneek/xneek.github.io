import { Storage } from "./widget.js";
import { widgetsResource } from "./widgets/index.js";

const selectedWidgetsStorage = new Storage('selectedWidgets');
const settingsStorage = new Storage('settings');

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

(() => {

  const storedSettings = settingsStorage.getValue('settings') ?? {};
  !!(storedSettings.brand) && document.documentElement.style.setProperty('--brand', storedSettings.brand)
  !!(storedSettings.accent) && document.documentElement.style.setProperty('--accent', storedSettings.accent)

})()

document.getElementById('settingsBtn').onclick = () => {

  const dialog = crEl('dialog');
  dialog.onclose = () => {
    dialog.remove();
  }

  dialog.append(crEl('form', {
    s: { display: 'flex', flexDirection: 'column', gap: 'var(--dimension2)' },
    e: {
      submit: e => {
        e.preventDefault();

      }
    }
  },
    crEl('label', {},
      crEl('small', 'Основной цвет'),
      crEl('input', {
        type: 'color',
        value: window.getComputedStyle(document.documentElement).getPropertyValue('--brand'),
        e: {
          input: (e) => {
            document.documentElement.style.setProperty('--brand', e.target.value);
            const storedSettings = settingsStorage.getValue('settings') ?? {};
            settingsStorage.setValue('settings', { ...storedSettings, brand: e.target.value })
          }
        }
      })
    ),
    crEl('label', {},
      crEl('small', 'Акцентный цвет'),
      crEl('input', {
        type: 'color',
        value: window.getComputedStyle(document.documentElement).getPropertyValue('--accent'),
        e: {
          input: (e) => {
            document.documentElement.style.setProperty('--accent', e.target.value);
            const storedSettings = settingsStorage.getValue('accent') ?? {};
            settingsStorage.setValue('settings', { ...storedSettings, accent: e.target.value })
          }
        }
      })
    )

  ))
  document.body.append(dialog)
  dialog.showModal();

}