export function displayProjects(projects, selectProjectCallback, deleteProjectCallback) {
    const projectsContainer = document.querySelector("#projects");

    projectsContainer.innerHTML = '';

    projects.forEach((project, index) => {
        const projectElement = document.createElement("div");
        projectElement.classList.add("project-item");
        
        const projectName = document.createElement("span");
        projectName.textContent = project.name;
        projectName.addEventListener("click", () => selectProjectCallback(project));
        
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "×"; 
        deleteBtn.classList.add("delete-project-btn");
        deleteBtn.addEventListener("click", (e) => {
            e.stopPropagation(); 
            deleteProjectCallback(index);
        });

        projectElement.appendChild(projectName);
        projectElement.appendChild(deleteBtn);
        projectsContainer.appendChild(projectElement);
    });
}

export function displayTodos(todos, title, project, editTodoCallback, deleteTodoCallback, toggleCompletedCallback, isCompletedFilter = false) {
    const container = document.querySelector(".mainContainer");
    
    const existingList = container.querySelector('.todo-list');
    if (existingList) existingList.remove();

    // Update or create title
    let headerTitle = container.querySelector('.project-title');
    if (!headerTitle) {
        headerTitle = document.createElement("h2");
        headerTitle.classList.add("project-title");
        container.appendChild(headerTitle);
    }
    headerTitle.textContent = title;

    // Create the todo list
    const todoList = document.createElement("ul");
    todoList.classList.add("todo-list");

    todos.forEach((todo, index) => {
        if (!isCompletedFilter && todo.completed) {
            return; // Skip completed todos unless it's the Completed filter
        }

        const todoItem = document.createElement("li");
        todoItem.classList.add("todo-item");
        todoItem.innerHTML = `
            <div class="todo-content">
                <div class="todo-main">
                    <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                    <span class="todo-title ${todo.completed ? 'completed' : ''}">${todo.title}</span>
                </div>
                <div class="todo-details">
                    <span class="todo-due-date">${todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : 'No due date'}</span>
                    <span class="todo-priority">Priority: ${todo.priority}</span>
                    <span class="todo-project">Project: ${todo.project}</span>
                </div>
            </div>
            <div class="todo-actions">
                <button class="edit-todo-btn">Edit</button>
                <button class="delete-todo-btn">Delete</button>
            </div>
        `;
        
        // Add event listeners for edit and delete buttons
        const editBtn = todoItem.querySelector('.edit-todo-btn');
        const deleteBtn = todoItem.querySelector('.delete-todo-btn');
        
        if (editTodoCallback) {
            editBtn.addEventListener('click', () => editTodoCallback(index));
        }
        
        if (deleteTodoCallback) {
            deleteBtn.addEventListener('click', () => deleteTodoCallback(index));
        }

        // Add event listener for the checkbox
        const checkbox = todoItem.querySelector('.todo-checkbox');
        checkbox.addEventListener('change', () => {
            if (toggleCompletedCallback) {
                toggleCompletedCallback(index);
                if (!isCompletedFilter) {
                    todoItem.remove(); // Remove the item from the display
                } else {
                    todoItem.querySelector('.todo-title').classList.toggle('completed', todo.completed);
                }
            }
        });

        todoList.appendChild(todoItem);
    });

    container.appendChild(todoList);
}

export function initializeFilters(projects, displayTodosCallback) {
    const filtersContainer = document.querySelector('#filters');
    filtersContainer.innerHTML = `
        <button id="showAllTodos">Show all to dos</button>
        <button id="showDueToday">Due today</button>
        <button id="showCompleted">Show completed</button>
    `;
    
    document.getElementById('showAllTodos').addEventListener('click', () => showAllTodos(projects, displayTodosCallback));
    document.getElementById('showDueToday').addEventListener('click', () => showDueToday(projects, displayTodosCallback));
    document.getElementById('showCompleted').addEventListener('click', () => showCompleted(projects, displayTodosCallback));
}

function showAllTodos(projects, displayTodosCallback) {
    const allTodos = projects.flatMap(project => project.getTodos());
    displayTodosCallback(allTodos, 'All To-Dos');
}

function showDueToday(projects, displayTodosCallback) {
    const today = new Date().toISOString().split('T')[0];
    const dueTodayTodos = projects.flatMap(project => 
        project.getTodos().filter(todo => todo.dueDate === today)
    );
    displayTodosCallback(dueTodayTodos, 'Due Today');
}

function showCompleted(projects, displayTodosCallback) {
    const completedTodos = projects.flatMap(project => 
        project.getTodos().filter(todo => todo.completed)
    );
    displayTodosCallback(completedTodos, 'Completed Tasks', null, null, null, null, true);
}

