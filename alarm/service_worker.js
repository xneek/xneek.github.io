    this.ontask = function(task) {
        alert(task.data.message);
        console.log("Task scheduled at: " + new Date(task.time));
        // From here on we can write the data to IndexedDB, send it to any open windows,
        // display a notification, etc.
    }

    // https://example.com/webapp.js
    function onTaskAdded(task) {
        console.log("Task successfully scheduled.");
    }

    function onError(error) {
        alert("Sorry, couldn't set the alarm: " + error);
    }

    navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
        serviceWorkerRegistration.taskScheduler.add(Date.now() + (1 * 60000), {
            message: "It's been 1 minutes, your soup is ready!"
        }).then(onTaskAdded, onError);
    });