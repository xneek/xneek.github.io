function debug(str){
    document.getElementById('debug').textContent = str.toString();
}
window.addEventListener('DOMContentLoaded', function () {
    if (!('mediaDevices' in navigator &&
        'getUserMedia' in navigator.mediaDevices &&
        'Worker' in window)) {
        alert('Sorry, your browser is not compatible with this app.');
        return;
    }

    const snapshotCanvas = document.getElementById('snapshot');
    const snapshotContext = snapshotCanvas.getContext('2d');
    const video = document.getElementById('camera');
    const flipCameraButton = document.getElementById("flipCamera");
    const overlay = document.getElementById('snapshotLimitOverlay');
    const snapshotSize = 300;

    let snapshotSquare;
    function calculateSquare() {
        let snapshotSize = overlay.offsetWidth;
        snapshotSquare = {
            x: +((video.videoWidth - snapshotSize)/2),
            y: +((video.videoHeight - snapshotSize)/2),
            size: +(snapshotSize)
        };

        snapshotCanvas.width = snapshotSquare.size;
        snapshotCanvas.height = snapshotSquare.size;
    }

    snapshotCanvas.width = snapshotSquare.size;
    snapshotCanvas.height = snapshotSquare.size;

    function scanCode(){
        snapshotContext.drawImage(
            video,
            snapshotSquare.x,
            snapshotSquare.y,
            snapshotSquare.size,
            snapshotSquare.size,
            0,
            0,
            snapshotSquare.size,
            snapshotSquare.size
        );
        const imageData = snapshotContext.getImageData(0, 0, snapshotSquare.size, snapshotSquare.size);
        const code = jsQR(imageData.data, snapshotSquare.size, snapshotSquare.size, {inversionAttempts: false});
        if(code){
            debug('Прочитано'+code.data)
        } else {
            debug('Ничего не прочитано')
        }
    }


    let currentDeviceId;
    function initVideoStream () {
        let config = {
            audio: false,
            video: {}
        };
        config.video = currentDeviceId ? {deviceId: currentDeviceId} : {facingMode: "environment"};
        stopStream();

        navigator.mediaDevices.getUserMedia(config).then(function (stream) {
            video.srcObject = stream;
            video.oncanplay = function(){
                calculateSquare();
                scanCode();
            }


        }).catch(function (error) {
            alert(error.name + ": " + error.message);
        });
    }

    function stopStream() {
        if (video.srcObject) {
            video.srcObject.getTracks()[0].stop();
        }
    }

    initVideoStream()

    // add flip camera button if necessary
    navigator.mediaDevices.enumerateDevices()
        .then(function(devices) {
            devices = devices.filter(function (device) {
                return device.kind === 'videoinput';
            });
            if (devices.length > 1) {
                // add a flip camera button
                flipCameraButton.style.display = "block";
                currentDeviceId = devices[0].deviceId;

                flipCameraButton.addEventListener('click', function() {
                    let targetDevice;
                    for (let i = 0; i < devices.length; i++) {
                        if (devices[i].deviceId === currentDeviceId) {
                            targetDevice = (i + 1 < devices.length) ? devices[i+1] : devices[0];
                            break;
                        }
                    }
                    currentDeviceId = targetDevice.deviceId;
                    initVideoStream();
                });
            }
        });

    document.addEventListener("visibilitychange", function() {
        if (document.hidden) {
            stopStream();
        } else {
            initVideoStream();
        }
    });

})