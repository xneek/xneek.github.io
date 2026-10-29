
import { Menu } from "../../components/menu/index.js";
import { Widget } from "../../widget.js";

const { firstDay, weekend } = new Intl.Locale(
  navigator.language,
).getWeekInfo();

function getFirstDayOfWeek(date = new Date(), startOfWeek = firstDay) {
  const result = new Date(date);
  const day = result.getDay();

  // Вычисляем разницу до нужного дня недели
  const diff = (day < startOfWeek ? 7 : 0) + day - startOfWeek;
  result.setDate(result.getDate() - diff);

  return result;
}

export class TodosWidget extends Widget {
  constructor() {
    super(import.meta.url, "TodosWidget");
  }

  init() {
    this.header.setTitle();

    const todosHeader = this.shadowRoot.getElementById("todosHeader");
    const todosBody = this.shadowRoot.getElementById("todosBody");
    const todosFooter = this.shadowRoot.getElementById("todosFooter");




    // period - all, week, today
    // type -  all, completed, uncompleted
    const getFilteredList = (filterPeriod = 'all', filterType = 'all') => {
      const list = this.storage.getValue("list") ?? [];
      const fd = getFirstDayOfWeek();
      const now = new Date();

      return list.filter((li) => {

        if (filterType === 'completed' && !li.completed) return false;
        if (filterType === 'uncompleted' && li.completed) return false;


        const liCreatedDate = new Date(li.createdAt);
        if (filterPeriod === 'week' && liCreatedDate < fd) return false;
        if (filterPeriod === 'today' && liCreatedDate.toLocaleDateString?.() !== now.toLocaleDateString()) return false;


        return true;
      })
    }

    const renderHeader = () => {
      todosHeader.innerHTML = '';
      const cur = this.storage.getValue('isFilterPanelOn') ?? false;
      if (!cur) return;

      const filterPeriod = this.storage.getValue("filterPeriod") ?? 'all'; // all, week, today
      const filterType = this.storage.getValue("filterType") ?? 'all'; // all, completed, uncompleted

      console.log(`xneek`, 'renderHeader', filterPeriod, filterType);

      let countAll = getFilteredList('all', filterType).length;
      let countWeek = getFilteredList('week', filterType).length;
      let countToday = getFilteredList('today', filterType).length;

      let countTypeAll = getFilteredList(filterPeriod, 'all').length;
      let countTypeCompleted = getFilteredList(filterPeriod, 'completed').length;
      let countTypeUncompleted = getFilteredList(filterPeriod, 'uncompleted').length;

      const toggle = (type, val) => e => {
        e.preventDefault();
        type === 'period' && this.storage.setValue("filterPeriod", val);
        type === 'type' && this.storage.setValue("filterType", val);
        update();
      }

      todosHeader.append(
        crEl('section', { c: 'header-wrapper' },
          crEl('div',
            crEl('small', {}, 'По времени:'),
            crEl('a', {
              href: '#', c: filterPeriod === 'all' ? 'active' : '', d: { count: countAll },
              e: { click: toggle('period', 'all') }
            }, 'Все время'),
            crEl('a', {
              href: '#', c: filterPeriod === 'week' ? 'active' : '', d: { count: countWeek },
              e: { click: toggle('period', 'week') }
            }, 'Неделя'),
            crEl('a', {
              href: '#', c: filterPeriod === 'today' ? 'active' : '', d: { count: countToday },
              e: { click: toggle('period', 'today') }
            }, 'Сегодня'),
          ),
          crEl('div',
            crEl('small', {}, 'По типу:'),
            crEl('a', {
              href: '#', c: filterType === 'all' ? 'active' : '', d: { count: countTypeAll },
              e: { click: toggle('type', 'all') }
            }, 'Все'),
            crEl('a', {
              href: '#', c: filterType === 'completed' ? 'active' : '', d: { count: countTypeCompleted },
              e: { click: toggle('type', 'completed') }
            }, 'Завершенные'),
            crEl('a', {
              href: '#', c: filterType === 'uncompleted' ? 'active' : '', d: { count: countTypeUncompleted },
              e: { click: toggle('type', 'uncompleted') }
            }, 'Не завершенные'),
          )
        )
      );
    }

    const update = ({ focusOnId } = {}) => {
      todosBody.innerHTML = "";
      const filterPeriod = this.storage.getValue("filterPeriod") ?? 'all'; // all, week, today
      const filterType = this.storage.getValue("filterType") ?? 'all'; // all, completed, uncompleted

      const list = getFilteredList(filterPeriod, filterType);

      if (list.length === 0) {
        todosBody.append(crEl('div', { c: 'placeholder' },
          'Все дела переделаны',
          crEl('small', 'Снизу можно добавить еще')
        ))
      }

      list.forEach((n) => todosBody.append(ToDoItem(n)));

      if (focusOnId) {
        const el = todosBody.querySelector(`.todo-item[data-id='${focusOnId}']`);
        el?.focus?.();
      } else {
        todosBody.scroll({ behavior: "smooth", top: 99999 });
      }

      renderHeader();
    };

    const filterBtn = crEl('button', {
      s: { background: 'transparent', border: '0' },
      e: {
        click: () => {
          const cur = this.storage.getValue('isFilterPanelOn') ?? false;
          this.storage.setValue('isFilterPanelOn', !cur);

          renderHeader();
        }
      }
    }, 'F');

    filterBtn.innerHTML = `⛉`

    this.header.addAsideItem(filterBtn)

    const changeTodo = (n, updates) => {

      if (updates === null && confirm(`Удалить?`)) {
        const list = this.storage.getValue("list") ?? [];
        this.storage.setValue(
          "list",
          list.filter((l) => l.id !== n.id),
        );
        update();
        return true;
      }

      const list = this.storage.getValue("list") ?? [];
      this.storage.setValue(
        "list",
        list.map((l) =>
          l.id === n.id ? { ...n, updatedAt: new Date().toISOString(), ...updates } : l,
        ),
      );

      update({ focusOnId: n.id });
    };

    const ToDoItem = (n) => {
      const { id, name } = n;

      return crEl("div", {
        c: "todo-item" + (n.completed ? ' completed' : ''),
        d: { id: id },


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
          crEl('small', name),

        ),
        crEl('div', { s: { marginLeft: 'auto' } },
          new Menu(crypto.randomUUID(), "•••",
            crEl('button', {
              e: {
                click: () => {
                  changeTodo(n, { name: prompt('Название', name) });
                  update({ focusOnId: n.id });
                }
              }
            }, 'Редактировать'),
            crEl('button', {
              e: {
                click: () => {
                  changeTodo(n, null);
                  update();
                }
              }
            }, 'Удалить')
          ).getEl()
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
