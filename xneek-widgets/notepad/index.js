import { Widget } from "../widget.js";
import { WidgetHeader } from "../components/widget-header/index.js";

export class NotepadWidget extends Widget {
  constructor() {
    super(import.meta.url, "NotepadWidget");

  }

  init() {
    this.header = new WidgetHeader();
    this.shadowRoot.prepend(this.header.getNode());
    this.header.setTitle('Блокнот');
    this.header.addMenuItem(crEl('button', {
      e: {
        click: () => {
          const text = this.storage.getValue("text") ?? [];

          saveTextAsFile(notepadTextarea.value, `${notepadTextarea.value.split(/\s+/).map(s => s.replaceAll(/[^A-я]+/g, '')).slice(0, 3).join('_')}_${new Date().toISOString()}.txt`);
        },
      }
    }, 'Сохранить как файл'));

    const notepadTextarea = this.shadowRoot.getElementById("notepadTextarea");
    function saveTextAsFile(
      text,
      filename = "file.txt",
      mimeType = "text/plain",
    ) {
      const blob = new Blob([text], { type: mimeType });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();

      // Clean up
      URL.revokeObjectURL(url);
    }
    let debounce;

    const changeText = (text) => {
      debounce && clearTimeout(debounce);
      debounce = setTimeout(() => {
        this.storage.setValue("text", text);
      }, 300);
    };

    notepadTextarea.onchange = (e) => {
      changeText(e.target.value);
    };

    notepadTextarea.value = this.storage.getValue("text") ?? "";


  }
}
customElements.define("widget-notepad", NotepadWidget);
