import { Widget } from "../widget.js";

export class RadioWidget extends Widget {
  constructor() {
    super(import.meta.url, "RadioWidget");
  }

  init() {
    const radioHeader = this.shadowRoot.getElementById("radioHeader");
    const radioAudio = this.shadowRoot.getElementById("radioAudio");
    const addDialog = this.shadowRoot.getElementById("addDialog");
    const addForm = this.shadowRoot.getElementById("addForm");
    const radioBody = this.shadowRoot.getElementById("radioBody");
    const radioSelected = this.shadowRoot.getElementById("radioSelected");
    const radioOutput = this.shadowRoot.getElementById("radioOutput");
    const volumeInp = this.shadowRoot.getElementById("volumeInp");

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
        await radioAudio.setSinkId(selectedAudioOutputDevice.deviceId); // или audioElement.setSinkId(deviceId)
      } else {
        console.warn("Браузер не поддерживает выбор аудиоустройства.");
      }

      const val = this.storage.getValue("volume") ?? 50;
      radioAudio.volume = val / 100;
      volumeInp.value = val;
    };

    const render = async () => {
      const list = this.storage.getValue("list") ?? [];
      radioBody.innerHTML = "";

      radioBody.append(
        crEl(
          "div",
          { c: "radio-select" },
          crEl(
            "select",
            {
              e: {
                change: (e) => {
                  const target = list.find((x) => x.id === e.target.value);
                  this.storage.setValue("selectedRadio", target);
                  
                  renderSelected();
                  radioAudio.play();
                },
              },
            },
            list.map((li) => {
              return crEl("option", { value: li.id }, li.name);
            }),
          ),
        ),
      );

      renderSelected();
    };

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

      render();
    };

    render();

    const devicesListSelect = crEl("select");

    const initOutDevices = async () => {
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const devices = await navigator.mediaDevices.enumerateDevices();

      const audioOutputDevices = devices.filter(
        (device) => device.kind === "audiooutput",
      );

      console.log("xneek", { audioOutputDevices });
      devicesListSelect.innerHTML = "";
      audioOutputDevices.forEach((d) => {
        devicesListSelect.append(
          crEl("option", { value: d.deviceId }, d.label),
        );
      });
      devicesListSelect.onchange = async (e) => {
        if (typeof radioAudio.sinkId !== "undefined") {
          const deviceId = e.target.value;
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
        radioOutput.innerHTML = "";
        radioOutput.append(
          crEl(
            "div",
            { c: "out-device-container" },
            crEl(
              "small",
              this.storage.getValue("selectedOutputDevice").label ??
                "Устройство вывода",
            ),
            crEl("button", { e: { click: initOutDevices } }, "✎"),
          ),
        );
      };
      radioOutput.innerHTML = "";
      radioOutput.append(
        crEl("div", { c: "out-device-container" }, devicesListSelect),
      );
    };

    radioOutput.append(
      crEl(
        "div",
        { c: "out-device-container" },
        crEl(
          "small",
          this.storage.getValue("selectedOutputDevice").label ??
            "Устройство вывода",
        ),
        crEl("button", { e: { click: initOutDevices } }, "✎"),
      ),
    );

    radioHeader.append(
      crEl(
        "button",
        {
          c: "fab fab-add",
          e: {
            click: () => {
              addOrEditRadio({
                id: self.crypto.randomUUID(),
                name: "",
                url: "",
              });
            },
          },
        },
        "+",
      ),
    );

    volumeInp.oninput = (e) => {
      radioAudio.volume = e.target.value / 100;
      this.storage.setValue("volume", e.target.value);
    };
  }
}
customElements.define("widget-radio", RadioWidget);
