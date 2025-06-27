document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const newTaskInput = document.getElementById('new-task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const newStatusInput = document.getElementById('new-status-input');
    const addStatusBtn = document.getElementById('add-status-btn');

    let tasks = [];
    let statuses = [];

    function loadData() {
        const storedTasks = localStorage.getItem('todo_tasks');
        const storedStatuses = localStorage.getItem('todo_statuses');

        if (storedStatuses) {
            statuses = JSON.parse(storedStatuses);
        } else {
            statuses = ['TODO', 'In Progress', 'Done'];
        }

        if (storedTasks) {
            tasks = JSON.parse(storedTasks);
        } else {
            tasks = [
                { id: 1, text: 'デザインをレビューする', status: 'TODO' },
                { id: 2, text: '開発環境をセットアップする', status: 'In Progress' },
                { id: 3, text: '要件定義書を作成する', status: 'Done' },
            ];
        }
    }

    function saveData() {
        localStorage.setItem('todo_tasks', JSON.stringify(tasks));
        localStorage.setItem('todo_statuses', JSON.stringify(statuses));
    }

    function renderBoard() {
        board.innerHTML = '';

        statuses.forEach(status => {
            const column = document.createElement('div');
            column.className = 'status-column';
            column.dataset.status = status;

            const title = document.createElement('h2');
            title.textContent = status;
            column.appendChild(title);

            const taskList = document.createElement('div');
            taskList.className = 'task-list';
            
            const filteredTasks = tasks.filter(task => task.status === status);

            filteredTasks.forEach(task => {
                const taskElement = document.createElement('div');
                taskElement.className = 'task';
                const textSpan = document.createElement('span');
                textSpan.textContent = task.text;
                taskElement.appendChild(textSpan);
                taskElement.draggable = true;
                taskElement.dataset.taskId = task.id;

                taskElement.addEventListener('dragstart', handleDragStart);
                taskElement.addEventListener('dragend', handleDragEnd);
                taskElement.addEventListener('click', () => enableEditing(taskElement, task));

                taskList.appendChild(taskElement);
            });

            column.appendChild(taskList);
            board.appendChild(column);
        });

        addDragAndDropListeners();
    }
    
    function handleDragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.dataset.taskId);
        setTimeout(() => {
            e.target.classList.add('dragging');
        }, 0);
    }

    function handleDragEnd(e) {
        e.target.classList.remove('dragging');
    }

    function addDragAndDropListeners() {
        const columns = document.querySelectorAll('.status-column');
        columns.forEach(column => {
            column.addEventListener('dragover', handleDragOver);
            column.addEventListener('dragleave', handleDragLeave);
            column.addEventListener('drop', handleDrop);
        });
    }

    function handleDragOver(e) {
        e.preventDefault();
        this.classList.add('drag-over');
    }

    function handleDragLeave(e) {
        this.classList.remove('drag-over');
    }

    function handleDrop(e) {
        e.preventDefault();
        this.classList.remove('drag-over');

        const taskId = e.dataTransfer.getData('text/plain');
        const newStatus = this.dataset.status;

        const task = tasks.find(t => t.id == taskId);
        if (task) {
            task.status = newStatus;
            saveData();
            renderBoard();
        }
    }

    function addTask() {
        const text = newTaskInput.value.trim();
        if (text && statuses.length > 0) {
            const newTask = {
                id: Date.now(),
                text: text,
                status: statuses[0]
            };
            tasks.push(newTask);
            saveData();
            renderBoard();
            newTaskInput.value = '';
        }
    }

    function addStatus() {
        const statusName = newStatusInput.value.trim();
        if (statusName && !statuses.includes(statusName)) {
            statuses.push(statusName);
            saveData();
            renderBoard();
            newStatusInput.value = '';
        }
    }

    addTaskBtn.addEventListener('click', addTask);
    addStatusBtn.addEventListener('click', addStatus);

    function enableEditing(taskElement, task) {
        const textSpan = taskElement.querySelector('span') || taskElement;
        const currentText = task.text;

        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.className = 'edit-task-input';

        input.addEventListener('blur', () => updateTask(task, input.value));
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                input.blur();
            }
        });

        taskElement.innerHTML = '';
        taskElement.appendChild(input);
        input.focus();
    }

    function updateTask(task, newText) {
        task.text = newText.trim() || task.text;
        saveData();
        renderBoard();
    }

    // Initial Load
    loadData();
    renderBoard();
});
