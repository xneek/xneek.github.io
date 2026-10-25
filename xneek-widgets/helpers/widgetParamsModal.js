import { Storage } from "../widget.js";

export const showWidgetParamsModal = ({ id, name, description }, cb) => {
  const dialog = crEl('dialog');
  document.body.append(dialog);

  const storage = new Storage(`widgets_common_${id}`);
  const curChanges = storage.getValue('changes');

  dialog.append(crEl('form', {
    e: {
      submit: (e) => {
        e.preventDefault();
        const res = {
          name: e.currentTarget.elements.name.value,
          order: +e.currentTarget.elements.order.value
        }
        storage.setValue('changes', res);
        cb?.(res);
        dialog.close();
      }
    }
  },
    crEl('p',
      crEl('label', {},
        'Название',
        crEl('input', { name: 'name', value: curChanges?.name ?? name })
      ),

    ),
    crEl('p',
      crEl('label', {},
        'Индекс сортировки',
        crEl('input', { type: 'number', name: 'order', value: curChanges?.order ?? '' })
      ),
    ),
    crEl('input', { type: 'submit' })
  ))

  dialog.onclose = () => {
    dialog.remove();
  }
  dialog.showModal();
}