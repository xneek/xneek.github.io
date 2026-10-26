import { WidgetHeaderButton } from "../../components/widget-header-button/index.js";
import { WidgetHeader } from "../../components/widget-header/index.js";
import { Widget } from "../../widget.js";

export class RadioWidget extends Widget {
  constructor() {
    super(import.meta.url, "RadioWidget");
  }

  init() {

    const radioAudio = this.shadowRoot.getElementById("radioAudio");
    const addDialog = this.shadowRoot.getElementById("addDialog");
    const addForm = this.shadowRoot.getElementById("addForm");
    const radioBody = this.shadowRoot.getElementById("radioBody");
    const radioSelected = this.shadowRoot.getElementById("radioSelected");
    const radioOutput = this.shadowRoot.getElementById("radioOutput");
    const volumeInp = this.shadowRoot.getElementById("volumeInp");




    this.header.setTitle();



    const playPauseBtn = crEl("button", {
      c: "play-pause-btn play",
      e: {
        click: (e) => {
          if (e.altKey) {
            const s = radioAudio.src;
            radioAudio.src = null;
            requestAnimationFrame(() => {
              radioAudio.src = s;
              radioAudio.play();
            });
            return;
          }
          if (radioAudio.paused) {
            radioAudio.play();
          } else {
            radioAudio.pause();
          }
        },
      },
    });

    radioAudio.onpause = () => {
      playPauseBtn.classList.add("play");
      playPauseBtn.classList.remove("pause");
    };

    radioAudio.onplay = () => {
      playPauseBtn.classList.add("pause");
      playPauseBtn.classList.remove("play");
    };

    const renderSelected = async () => {
      const selected = this.storage.getValue("selectedRadio");
      radioSelected.innerHTML = "";
      if (!selected) return;

      radioSelected.append(
        crEl("section", {}, crEl("h5", selected.name), playPauseBtn),
      );
      radioAudio.src = selected.url;


      const selectedAudioOutputDevice = this.storage.getValue(
        "selectedOutputDevice",
      );

      if (
        selectedAudioOutputDevice &&
        typeof radioAudio.sinkId !== "undefined"
      ) {
        radioOutput.textContent = selectedAudioOutputDevice.label;
        await radioAudio.setSinkId(selectedAudioOutputDevice.deviceId); // или audioElement.setSinkId(deviceId)
      } else {
        console.warn("Браузер не поддерживает выбор аудиоустройства.");
      }

      const val = this.storage.getValue("volume") ?? 50;
      radioAudio.volume = val / 100;
      volumeInp.value = val;
    };

    const render = async () => {

      radioBody.innerHTML = "";



      renderSelected();
    };

    const showSelectList = ({ onSelect } = {}) => {
      const list = this.storage.getValue("list") ?? [];
      const selected = this.storage.getValue("selectedRadio");

      const listDialog = this.shadowRoot.getElementById("listDialog");
      listDialog.innerHTML = '';
      listDialog.append(crEl(
        "div",
        { c: "radio-select-modal" },
        crEl('h5', {}, 'Список радиостанций'),
        crEl('ul',
          list.map((li) => {
            return crEl("li", { value: li.id, selected: selected.id === li.id }, crEl('button', {
              e: {
                click: () => {

                  this.storage.setValue("selectedRadio", li);

                  onSelect?.(li);

                  renderSelected();
                  radioAudio.play();
                  listDialog.close();
                }
              }
            },
              crEl('div',
                crEl('strong', li.name),
                crEl('small', li.url),
              ), crEl('aside',
                new WidgetHeaderButton('Edit', {
                  e: {
                    click: (e) => {
                      e.stopPropagation();
                      addOrEditRadio(li);
                    }
                  }
                }).getNode()
              )

            ));
          })
        ),
        crEl({ s: { marginTop: '12px' } }),
        crEl('button', {
          e: {
            click: () => {
              addOrEditRadio({
                id: self.crypto.randomUUID(),
                name: "",
                url: "",
              });
              listDialog.close();
            }
          }
        }, 'Добавить новую')
      ));
      listDialog.showModal();
    }

    const addOrEditRadio = (data) => {
      addForm.elements.name.value = data.name;
      addForm.elements.url.value = data.url;
      addForm.elements.id.value = data.id;

      addDialog.showModal();
    };

    addForm.onsubmit = (e) => {
      e.preventDefault();
      const model = {
        id: addForm.elements.id.value,
        name: addForm.elements.name.value,
        url: addForm.elements.url.value,
      };

      const list = this.storage.getValue("list") ?? [];
      const isExist = list.find((li) => li.id === model.id);

      if (isExist) {
        this.storage.setValue(
          "list",
          list.map((li) =>
            li.id === model.id
              ? { ...li, ...model, updatedAt: new Date().toISOString() }
              : li,
          ),
        );
      } else {
        this.storage.setValue("list", [
          ...list,
          { ...model, createdAt: new Date().toISOString() },
        ]);
      }
      addDialog.close()
      render();

      renderSelected();
    };

    addForm.onreset = () => addDialog.close()

    render();



    volumeInp.oninput = (e) => {
      radioAudio.volume = e.target.value / 100;
      this.storage.setValue("volume", e.target.value);
    };


    const selectOutDevice = async () => {
      const outDeviceSelectDialog = this.shadowRoot.getElementById("outDeviceSelectDialog");
      const outDeviceSelectForm = this.shadowRoot.getElementById("outDeviceSelectForm");
      const outputDevicesSelect = this.shadowRoot.getElementById("outputDevicesSelect");


      await navigator.mediaDevices.getUserMedia({ audio: true });

      const devices = await navigator.mediaDevices.enumerateDevices();

      const audioOutputDevices = devices.filter(
        (device) => device.kind === "audiooutput",
      );


      outputDevicesSelect.innerHTML = "";
      audioOutputDevices.forEach((d) => {
        outputDevicesSelect.append(
          crEl("option", { value: d.deviceId }, d.label),
        );
      });
      audioOutputDevices.onchange = async (e) => {
        await radioAudio.setSinkId(e.target.value); // или audioElement.setSinkId(deviceId)
      }



      const selectedAudioOutputDevice = this.storage.getValue(
        "selectedOutputDevice",
      );

      if (selectedAudioOutputDevice) {
        outputDevicesSelect.value = selectedAudioOutputDevice.deviceId;
      }

      outDeviceSelectForm.onsubmit = async (e) => {
        e.preventDefault();
        const deviceId = outputDevicesSelect.value;

        if (typeof radioAudio.sinkId !== "undefined") {

          await radioAudio.setSinkId(deviceId); // или audioElement.setSinkId(deviceId)

          const targetDevice = audioOutputDevices.filter(
            (x) => x.deviceId === deviceId,
          );
          if (targetDevice.length) {
            this.storage.setValue("selectedOutputDevice", targetDevice[0]);
          } else {
            console.warn(
              "devices has no ",
              e.target.value,
              "deviceId",
              devices,
            );
          }
        } else {
          console.warn("Браузер не поддерживает выбор аудиоустройства.");
        }

        render();

        outDeviceSelectDialog.close();
      }

      outDeviceSelectForm.onreset = (e) => {
        e.preventDefault();
        outDeviceSelectDialog.close();

      }

      outDeviceSelectDialog.showModal();
    }

    this.header.addMenuItem(crEl('button', {
      e: {
        click: () => {
          selectOutDevice();
        }
      }
    }, 'Выбрать устройство воспроизведения'));
    this.header.addMenuItem(crEl('button', {
      e: {
        click: () => {
          showSelectList();
        }
      }
    }, "Список радиостанций"));

    this.header.addMenuItem(crEl('button', {
      e: {
        click: () => {
          addOrEditRadio({
            id: self.crypto.randomUUID(),
            name: "",
            url: "",
          });
        }
      }
    }, 'Добавить'));


  }
}
customElements.define("widget-radio", RadioWidget);
