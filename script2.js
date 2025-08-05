alert("this website is to plan your work and tasks");
document.addEventListener("DOMContentLoaded", () => {
    const taskInput = document.querySelector(".companyname");
    const timeInput = document.querySelector(".position");
    const submitBtn = document.getElementById("submitBtn");
    const taskList = document.getElementById("taskList");
    const dateTimeInput = document.getElementById('taskDateTime');

    // Set min value of datetime-local to now
    if (dateTimeInput) {
        const now = new Date();
        const pad = n => n.toString().padStart(2, '0');
        const localNow = now.getFullYear() + '-' +
            pad(now.getMonth() + 1) + '-' +
            pad(now.getDate()) + 'T' +
            pad(now.getHours()) + ':' +
            pad(now.getMinutes());
        dateTimeInput.min = localNow;
    }

    // Load tasks from localStorage
    let tasks = [];
    if (localStorage.getItem('tasks')) {
        try {
            tasks = JSON.parse(localStorage.getItem('tasks'));
        } catch (e) {
            tasks = [];
        }
    }

    // Helper for ordinal
    function ordinal(n) {
        if (n > 3 && n < 21) return n + "th";
        switch (n % 10) {
            case 1: return n + "st";
            case 2: return n + "nd";
            case 3: return n + "rd";
            default: return n + "th";
        }
    }

    // Render all tasks
    function renderTasks() {
        taskList.innerHTML = "";
        tasks.forEach(taskObj => {
            let displayText = taskObj.text;
            if (taskObj.dateTime) {
                const dateObj = new Date(taskObj.dateTime);
                const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                const day = days[dateObj.getDay()];
                const date = dateObj.getDate();
                const month = months[dateObj.getMonth()];
                displayText = `${taskObj.text} - ${day} - ${ordinal(date)} ${month}`;
            }
            const li = document.createElement("li");
            li.textContent = displayText;
            li.addEventListener("click", () => {
                // Remove from tasks array and update storage
                tasks = tasks.filter(t => !(t.text === taskObj.text && t.dateTime === taskObj.dateTime));
                localStorage.setItem('tasks', JSON.stringify(tasks));
                li.remove();
            });
            taskList.appendChild(li);
        });
    }

    renderTasks();

    // Schedule notifications for future tasks
    tasks.forEach(taskObj => {
        if (taskObj.dateTime) {
            const notifyTime = new Date(taskObj.dateTime);
            if (notifyTime > new Date()) {
                scheduleNotification(taskObj.text, taskObj.dateTime);
            }
        }
    });

    submitBtn.addEventListener("click", () => {
        const taskText = taskInput.value.trim();
        const timeText = timeInput.value.trim();
        const dateTimeText = dateTimeInput.value;

        if (taskText === "") {
            alert("Please enter a task.");
            return;
        }

        // Save to tasks array and localStorage
        const taskObj = { text: taskText, dateTime: dateTimeText || null };
        tasks.push(taskObj);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();

        // Clear input fields
        taskInput.value = "";
        timeInput.value = "";
        dateTimeInput.value = "";

        if (dateTimeText) {
            scheduleNotification(taskText, dateTimeText);
        }
    });

    function scheduleNotification(task, dateTimeStr) {
        // dateTimeStr is in "YYYY-MM-DDTHH:MM"
        const notifyTime = new Date(dateTimeStr);
        const now = new Date();
        if (notifyTime <= now) return;

        const timeout = notifyTime - now;
        setTimeout(() => {
            if (window.Notification && Notification.permission === "granted") {
                new Notification("Task Reminder", { body: task });
            } else if (window.Notification && Notification.permission !== "denied") {
                Notification.requestPermission().then(permission => {
                    if (permission === "granted") {
                        new Notification("Task Reminder", { body: task });
                    } else {
                        alert("Task Reminder: " + task);
                    }
                });
            } else {
                alert("Task Reminder: " + task);
            }
        }, timeout);
    }

    // Request notification permission on load
    if (window.Notification && Notification.permission !== "granted") {
        Notification.requestPermission();
    }
});
