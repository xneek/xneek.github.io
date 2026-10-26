
import { Widget } from "../../widget.js";

export class TodosWidget extends Widget {
  constructor() {
    super(import.meta.url, "TodosWidget");
  }

  init() {
    this.header.setTitle();

    const todosHeader = this.shadowRoot.getElementById("todosHeader");
    const todosBody = this.shadowRoot.getElementById("todosBody");
    const todosFooter = this.shadowRoot.getElementById("todosFooter");

    const update = ({ focusOnId } = {}) => {
      todosBody.innerHTML = "";
      const list = this.storage.getValue("list") ?? [];

      list.forEach((n) => todosBody.append(ToDoItem(n)));

      if (focusOnId) {
        const el = todosBody.querySelector(`.todo-item[data-id='${focusOnId}']`);
        el.focus();
      } else {
        todosBody.scroll({ behavior: "smooth", top: 99999 });
      }
    };

    const changeTodo = (n, updates) => {

      if (updates === null && confirm(`Удалить?`)) {
        const list = this.storage.getValue("list") ?? [];
        this.storage.setValue(
          "list",
          list.filter((l) => l.id !== n.id),
        );
        return true;
      }

      const list = this.storage.getValue("list") ?? [];
      this.storage.setValue(
        "list",
        list.map((l) =>
          l.id === n.id ? { ...n, updatedAt: new Date().toISOString(), ...updates } : l,
        ),
      );
    };

    const ToDoItem = (n) => {
      const { id, name } = n;

      return crEl("div", {
        c: "todo-item" + (n.completed ? ' completed' : ''),
        d: { id: id },
        e: {
          dblclick: (e) => {
            changeTodo(n, { name: prompt('Название', name) });
          },
        },

      },
        crEl('label', { title: JSON.stringify(n, null, '  ') },
          crEl('input', {
            type: 'checkbox', checked: !!n.completed, e: {

              change: (e) => {
                changeTodo(n, { completed: e.currentTarget.checked });
                e.currentTarget.closest('.todo-item').classList[e.currentTarget.checked ? 'add' : 'remove']('completed')
              }
            }
          }),
          crEl('small', name)
        )
      );
    };

    todosFooter.append(
      crEl(
        "form",
        {
          c: 'todo-add-form',
          e: {
            submit: (e) => {
              e.preventDefault();

              const list = this.storage.getValue("list") ?? [];
              const newTodo = {
                id: crypto.randomUUID(),
                createdAt: new Date().toISOString(),
                name: e.target.elements.todo.value,
              };

              this.storage.setValue("list", [...list, newTodo]);
              update({ focusOnId: newTodo.id });
              e.target.reset()
            }
          },
        },
        crEl('input', { name: 'todo', required: 'true', placeholder: 'Введите и нажмите энтер чтобы добавить' }),
      ),
    );

    update();
  }
}
customElements.define("widget-todos", TodosWidget);
