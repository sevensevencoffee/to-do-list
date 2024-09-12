export function displayProjects(projects, selectProjectCallback, deleteProjectCallback) {
    const projectsContainer = document.querySelector("#projects");

    projectsContainer.innerHTML = '';

    projects.forEach((project, index) => {
        const projectElement = document.createElement("div");
        projectElement.classList.add("project-item");
        
        const projectInfo = document.createElement("div");
        projectInfo.style.display = "flex";
        projectInfo.style.alignItems = "center";
        projectInfo.style.flexGrow = "1";

        const projectName = document.createElement("span");
        projectName.textContent = `#\u00A0\u00A0${project.name}`;
        projectName.addEventListener("click", () => selectProjectCallback(project));
        
        projectInfo.appendChild(projectName);
        projectElement.appendChild(projectInfo);

        const rightSection = document.createElement("div");
        rightSection.style.display = "flex";
        rightSection.style.alignItems = "center";

        const todoCount = document.createElement("span");
        todoCount.textContent = project.getTodos().length;
        todoCount.classList.add("todo-count");

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "×"; 
        deleteBtn.classList.add("delete-project-btn");
        deleteBtn.addEventListener("click", (e) => {
            e.stopPropagation(); 
            deleteProjectCallback(index);
        });

        rightSection.appendChild(todoCount);
        rightSection.appendChild(deleteBtn);
        projectElement.appendChild(rightSection);

        projectsContainer.appendChild(projectElement);
    });
}

export function displayTodos(todos, title, project, editTodoCallback, deleteTodoCallback, toggleCompletedCallback, isCompletedFilter = false) {
    const container = document.querySelector(".mainContainer");
    
    const existingList = container.querySelector('.todo-list');
    if (existingList) existingList.remove();

    // Remove the title creation from here, as it will be handled by the calling function

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
        <div class="filter-item">
            <span>Show all to dos</span>
            <span class="todo-count">${projects.reduce((sum, project) => sum + project.getTodos().length, 0)}</span>
        </div>
        <div class="filter-item">
            <span>Due today</span>
            <span class="todo-count" id="dueTodayCount">0</span>
        </div>
        <div class="filter-item">
            <span>Show completed</span>
            <span class="todo-count" id="completedCount">0</span>
        </div>
    `;
    
    const filterItems = filtersContainer.querySelectorAll('.filter-item');
    filterItems[0].addEventListener('click', () => showAllTodos(projects, displayTodosCallback));
    filterItems[1].addEventListener('click', () => showDueToday(projects, displayTodosCallback));
    filterItems[2].addEventListener('click', () => showCompleted(projects, displayTodosCallback));

    updateFilterCounts(projects);
}

function updateFilterCounts(projects) {
    const today = new Date().toISOString().split('T')[0];
    const dueTodayCount = projects.reduce((sum, project) => 
        sum + project.getTodos().filter(todo => todo.dueDate === today).length, 0);
    const completedCount = projects.reduce((sum, project) => 
        sum + project.getTodos().filter(todo => todo.completed).length, 0);

    document.getElementById('dueTodayCount').textContent = dueTodayCount;
    document.getElementById('completedCount').textContent = completedCount;
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