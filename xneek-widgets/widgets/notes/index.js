import { WidgetHeader } from "../../components/widget-header/index.js";
import { Widget } from "../../widget.js";

export class NotesWidget extends Widget {
  constructor() {
    super(import.meta.url, "NotesWidget");
  }

  init() {

    this.header = new WidgetHeader();
    this.shadowRoot.prepend(this.header.getNode());
    this.header.setTitle('Заметки');
    this.header.addMenuItem(crEl('button', {
      e: {
        click: () => {
          const list = this.storage.getValue("list") ?? [];
          const newNote = {
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            content: "\u200B",
            bg: colors[Math.floor(Math.random() * colors.length)],
            paperRotate: -4 + (Math.random() * 8),
            textRotate: -4 + (Math.random() * 8),
          };

          this.storage.setValue("list", [...list, newNote]);
          update({ focusOnId: newNote.id });
        }
      }
    }, 'Добавить'));

    const notesHeader = this.shadowRoot.getElementById("notesHeader");
    const notesBody = this.shadowRoot.getElementById("notesBody");

    let debounce;

    const colors = ["#ffc", "#cfc", "#ccf"];

    const update = ({ focusOnId } = {}) => {
      notesBody.innerHTML = "";
      const list = this.storage.getValue("list") ?? [];

      list.forEach((n) => notesBody.append(note(n)));

      if (focusOnId) {
        const el = notesBody.querySelector(`.note[data-id='${focusOnId}']`);
        el.focus();
      } else {
        notesBody.scroll({ behavior: "smooth", top: 99999 });
      }
    };

    const changeNote = (n, newContent) => {
      console.info(n.id, newContent);

      if (newContent === null && confirm(`Удалить?`)) {
        const list = this.storage.getValue("list") ?? [];
        this.storage.setValue(
          "list",
          list.filter((l) => l.id !== n.id),
        );
        return true;
      }

      debounce && clearTimeout(debounce);
      debounce = setTimeout(() => {
        const list = this.storage.getValue("list") ?? [];
        this.storage.setValue(
          "list",
          list.map((l) =>
            l.id === n.id ? { ...n, content: newContent.trim() } : l,
          ),
        );
      }, 300);
    };

    const note = (n) => {
      const { id, content } = n;

      const el = crEl("div", {
        c: "note",
        d: { id: id },
        s: { rotate: `${n.textRotate}deg` },
        contentEditable: true,
        e: {
          input: (e) => {
            changeNote(n, e.target.innerHTML);
          },
        },
      });

      el.innerHTML = content;

      return crEl(
        "div",
        { c: "note-wrapper", s: { background: n.bg ?? colors[0], rotate: `${n.paperRotate}deg` }, },
        el,
        crEl(
          "div",
          { c: "note-toolbar" },
          crEl(
            "button",
            {
              c: "menu-toggle",
              command: "toggle-popover",
              commandfor: `card-menu-${n.id}`,
              interestfor: "card-menu",
              s: { anchorName: `--card-${n.id}` },
            },
            "•••",
          ),
          crEl(
            "menu",
            {
              popover: "hint",
              id: `card-menu-${n.id}`,
              s: { positionAnchor: `--card-${n.id}` },
            },
            crEl(
              "div",
              crEl(
                "button",
                {
                  e: {
                    click: (e) => {
                      alert(JSON.stringify(n, null, '  '));
                    },
                  },
                },
                "Инфо",
              ),
            ),
            crEl(
              "div",
              crEl(
                "button",
                {
                  e: {
                    click: (e) => {
                      changeNote(n, null) &&
                        e.target.closest(".note-wrapper").remove();
                    },
                  },
                },
                "Удалить",
              ),
            ),
          ),
        ),
      );
    };

    notesHeader.append(
      crEl(
        "button",
        {
          c: 'fab fab-add',
          e: {
            click: () => {
              const list = this.storage.getValue("list") ?? [];
              const newNote = {
                id: crypto.randomUUID(),
                createdAt: new Date().toISOString(),
                content: "\u200B",
                bg: colors[Math.floor(Math.random() * colors.length)],
                paperRotate: -4 + (Math.random() * 8),
                textRotate: -4 + (Math.random() * 8),
              };

              this.storage.setValue("list", [...list, newNote]);
              update({ focusOnId: newNote.id });
            },
          },
        },
        "+",
      ),
    );

    update();
  }
}
customElements.define("widget-notes", NotesWidget);
