import { Todo } from "./todo";
import { Project } from "./projects";
import { displayTodos, displayProjects } from "./uiHelpers.js";

export class mainContentDom {
    constructor() {
        console.log("Initializing mainContentDom");
        this.addTodoBtn = document.querySelector("#askForInput");
        this.inputContainer = document.querySelector("#inputContainer");
        this.form = document.querySelector('#toDoForm');
        this.titleInput = document.querySelector("#title");
        this.dueDateInput = document.querySelector("#dueDate");
        this.priorityInput = document.querySelector("#priority");
        this.projectInput = document.querySelector("#project");
        this.cancelBtn = document.querySelector("#cancelBtn");
        this.confirmBtn = document.querySelector("#confirmBtn");

        this.projects = [];
        this.currentProject = null;
        this.editIndex = null;

        this.addProjectBtn = document.querySelector("#addProjectBtn");
        this.projectDialog = document.querySelector("#projectDialog");
        this.projectForm = document.querySelector("#projectForm");
        this.cancelProjectBtn = document.querySelector("#cancelProjectBtn");

        this.loadFromLocalStorage();
        if (this.projects.length === 0) {
            this.initializeWelcomeProject();
        }
        this.initializeEventListeners();
        this.initializeFilters();
        this.updateProjects();
        this.initializeProjectDialog();

        // Display all todos when the application loads or refreshes
        this.showAllTodos();
    }

    initializeWelcomeProject() {
        const welcomeProject = new Project('Welcome');

        const welcomeTodo = new Todo(
            "Start adding your to do items!",
            new Date().toISOString().split('T')[0], 
            "Medium",
            "Welcome",
            false
        );

        welcomeProject.addTodo(welcomeTodo);

        this.projects.push(welcomeProject);

        this.currentProject = welcomeProject;

        this.updateProjects();
        this.updateToDos();
    }

    initializeProjectDialog() {
        this.addProjectBtn.addEventListener('click', () => {
            this.projectDialog.showModal();
        });

        this.projectForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const projectName = document.querySelector("#projectName").value.trim();
            if (projectName) {
                this.addProject(projectName);
                this.projectDialog.close();
                this.projectForm.reset();
            }
        });

        this.cancelProjectBtn.addEventListener('click', () => {
            this.projectDialog.close();
            this.projectForm.reset();
        });
    }

    initializeProjectForm() {
        const projectsContainer = document.querySelector("#projects");
        projectsContainer.addEventListener("submit", (e) => {
            if (e.target.id === "addProjectForm") {
                e.preventDefault();
                const projectInput = document.querySelector("#projectInput");
                const projectName = projectInput.value.trim();
                if (projectName) {
                    this.addProject(projectName);
                    projectInput.value = "";
                }
            }
        });
    }

    initializeEventListeners() {
        this.addTodoBtn.addEventListener('click', () => this.showInputForm());

        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        this.confirmBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        this.cancelBtn.addEventListener('click', () => this.hideInputForm());
    }

    initializeFilters() {
        const filtersContainer = document.querySelector('#filters');
        
        document.getElementById('showAllTodos').addEventListener('click', () => this.showAllTodos());
        document.getElementById('showDueToday').addEventListener('click', () => this.showDueToday());
        document.getElementById('showCompleted').addEventListener('click', () => this.showCompleted());

        this.updateFilterCounts();
    }

    updateFilterCounts() {
        const today = new Date().toISOString().split('T')[0];
        const allOpenTodosCount = this.projects.reduce((sum, project) => 
            sum + project.getTodos().filter(todo => !todo.completed).length, 0);
        const dueTodayCount = this.projects.reduce((sum, project) => 
            sum + project.getTodos().filter(todo => todo.dueDate === today && !todo.completed).length, 0);
        const completedCount = this.projects.reduce((sum, project) => 
            sum + project.getTodos().filter(todo => todo.completed).length, 0);

        document.getElementById('allTodosCount').textContent = allOpenTodosCount;
        document.getElementById('dueTodayCount').textContent = dueTodayCount;
        document.getElementById('completedCount').textContent = completedCount;

        // Update project counts
        this.projects.forEach(project => {
            const uncompletedCount = project.getTodos().filter(todo => !todo.completed).length;
            const projectElement = document.querySelector(`.project-item[data-project="${project.name}"]`);
            if (projectElement) {
                const countElement = projectElement.querySelector('.todo-count');
                if (countElement) {
                    countElement.textContent = uncompletedCount;
                }
            }
        });
    }

    showAllTodos() {
        const allTodos = this.projects.flatMap(project => 
            project.getTodos().filter(todo => !todo.completed)
        );
        this.displayFilteredTodos(allTodos, 'All Open To-Dos');
    }

    showDueToday() {
        const today = new Date().toISOString().split('T')[0];
        const dueTodayTodos = this.projects.flatMap(project => 
            project.getTodos().filter(todo => todo.dueDate === today)
        );
        this.displayFilteredTodos(dueTodayTodos, 'Due Today');
    }

    showCompleted() {
        const completedTodos = this.projects.flatMap(project => 
            project.getTodos().filter(todo => todo.completed)
        );
        this.displayFilteredTodos(completedTodos, 'Completed Tasks', true);
    }

    findTodoProjectAndIndex(todo) {
        for (const project of this.projects) {
            const index = project.getTodos().findIndex(t => t === todo);
            if (index !== -1) {
                return [project, index];
            }
        }
        return [null, -1];
    }

    displayFilteredTodos(todos, title, showCompleted = false) {
        const container = document.querySelector(".mainContainer");
        container.innerHTML = `<h2 class="project-title">${title}</h2>`;
        
        // Display todos
        displayTodos(
            todos,
            title,
            (index) => {
                const [project, todoIndex] = this.findTodoProjectAndIndex(todos[index]);
                if (project) {
                    this.editTodo(todoIndex, project);
                }
            },
            (index) => {
                const [project, todoIndex] = this.findTodoProjectAndIndex(todos[index]);
                if (project) {
                    this.deleteTodo(todoIndex, project);
                }
            },
            (index) => {
                const [project, todoIndex] = this.findTodoProjectAndIndex(todos[index]);
                if (project) {
                    this.toggleTodoCompleted(todoIndex, project);
                    // Remove the todo from the view if it's completed and we're not showing completed tasks
                    if (!showCompleted) {
                        todos.splice(index, 1);
                        this.displayFilteredTodos(todos, title, showCompleted);
                    }
                }
            },
            showCompleted
        );

        // Add the "Add a new task" button and input container only if not showing completed tasks
        if (!showCompleted) {
            if (this.addTodoBtn) {
                container.appendChild(this.addTodoBtn);
            } else {
                const addTaskBtn = document.createElement('button');
                addTaskBtn.id = 'askForInput';
                addTaskBtn.textContent = '+ Add a new task';
                addTaskBtn.addEventListener('click', () => this.showInputForm());
                container.appendChild(addTaskBtn);
                this.addTodoBtn = addTaskBtn;
            }

            if (this.inputContainer) {
                container.appendChild(this.inputContainer);
            }
        }
    }

    addProject(name) {
        const newProject = new Project(name);
        this.projects.push(newProject);
        this.updateProjects();
        this.updateFilterCounts();
        this.saveToLocalStorage();
        
        // Set the current project to the newly added project
        this.selectProject(newProject);
    }

    showInputForm(isEditing = false) {
        this.inputContainer.style.display = "block";
        this.confirmBtn.textContent = isEditing ? "Update" : "Add";
        if (!isEditing) this.clearInputs();
    }

    hideInputForm() {
        this.inputContainer.style.display = "none";
        this.clearInputs();
        this.editIndex = null;
    }

    clearInputs() {
        this.titleInput.value = "";
        this.dueDateInput.value = "";
        this.priorityInput.value = "";
    }

    handleFormSubmit() {
        if (!this.currentProject) {
            alert("Please select a project first.");
            return;
        }

        const todo = new Todo(
            this.titleInput.value,
            this.dueDateInput.value,
            this.priorityInput.value,
            this.currentProject.name,
            false  // Set completed to false by default
        );

        if (this.editIndex !== null) {
            this.currentProject.updateTodo(this.editIndex, todo);
            this.editIndex = null;
        } else {
            this.currentProject.addTodo(todo);
        }

        this.hideInputForm();
        this.updateToDos();
        this.updateFilterCounts();
        this.saveToLocalStorage();
    }

    editTodo(index, project) {
        const todo = project.getTodos()[index];
        this.titleInput.value = todo.title;
        this.dueDateInput.value = todo.dueDate;
        this.priorityInput.value = todo.priority;

        this.editIndex = index;
        this.currentProject = project;
        this.showInputForm(true);
        this.saveToLocalStorage();
    }

    deleteProject(index) {
        if (index >= 0 && index < this.projects.length) {
            const deletedProject = this.projects.splice(index, 1)[0];

            if (this.currentProject === deletedProject) {
                this.currentProject = this.projects[0] || null;
            }

            this.updateProjects();
            this.updateToDos();
            this.removeProjectFromLocalStorage(deletedProject.name);
            this.saveToLocalStorage();
        }
    }

    deleteTodo(index, project) {
        if (project && index >= 0 && index < project.getTodos().length) {
            const deletedTodo = project.getTodos()[index];
            project.deleteTodo(index);
            this.updateToDos();
            this.updateFilterCounts();
            this.removeTodoFromLocalStorage(project.name, deletedTodo.title);
            this.saveToLocalStorage();
        }
    }

    removeProjectFromLocalStorage(projectName) {
        const storedData = JSON.parse(localStorage.getItem('todoAppData'));
        if (storedData && storedData.projects) {
            storedData.projects = storedData.projects.filter(project => project.name !== projectName);
            localStorage.setItem('todoAppData', JSON.stringify(storedData));
        }
    }

    removeTodoFromLocalStorage(projectName, todoTitle) {
        const storedData = JSON.parse(localStorage.getItem('todoAppData'));
        if (storedData && storedData.projects) {
            const projectIndex = storedData.projects.findIndex(project => project.name === projectName);
            if (projectIndex !== -1) {
                storedData.projects[projectIndex].todos = storedData.projects[projectIndex].todos.filter(todo => todo.title !== todoTitle);
                localStorage.setItem('todoAppData', JSON.stringify(storedData));
            }
        }
    }

    updateProjects() {
        displayProjects(
            this.projects, 
            (project) => this.selectProject(project),
            (index) => this.deleteProject(index)
        );
        this.updateFilterCounts();
    }

    updateToDos() {
        console.log("Updating todos for project:", this.currentProject?.name);
        const container = document.querySelector(".mainContainer");
        if (this.currentProject) {
            try {
                container.innerHTML = `<h2 class="project-title">${this.currentProject.name}</h2>`;

                const todos = this.currentProject.getTodos();
                console.log("Number of todos:", todos.length);

                // Display todos first
                displayTodos(
                    todos,
                    this.currentProject.name,
                    (index) => this.editTodo(index, this.currentProject),
                    (index) => this.deleteTodo(index, this.currentProject),
                    (index) => this.toggleTodoCompleted(index, this.currentProject)
                );

                // Then add the "Add a new task" button
                if (this.addTodoBtn) {
                    container.appendChild(this.addTodoBtn);
                } else {
                    const addTaskBtn = document.createElement('button');
                    addTaskBtn.id = 'askForInput';
                    addTaskBtn.textContent = '+ Add a new task';
                    addTaskBtn.addEventListener('click', () => this.showInputForm());
                    container.appendChild(addTaskBtn);
                    this.addTodoBtn = addTaskBtn;
                }

                // Finally, add the input container
                if (this.inputContainer) {
                    container.appendChild(this.inputContainer);
                }
            } catch (error) {
                console.error("Error in displayTodos:", error);
                container.innerHTML += "<p>Error displaying todos. Please try again.</p>";
            }
        } else {
            container.innerHTML = "<p>Select a project to view todos</p>";
        }
    }

    toggleTodoCompleted(index, project) {
        const todo = project.getTodos()[index];
        todo.completed = !todo.completed;
        project.updateTodo(index, todo);
        this.updateToDos();
        this.updateFilterCounts();
        this.saveToLocalStorage();
    }

    saveToLocalStorage() {
        const data = {
            projects: this.projects.map(project => ({
                name: project.name,
                todos: project.getTodos()
            })),
            currentProjectIndex: this.projects.indexOf(this.currentProject)
        };
        localStorage.setItem('todoAppData', JSON.stringify(data));
    }

    loadFromLocalStorage() {
        const data = localStorage.getItem('todoAppData');
        if (data) {
            const parsedData = JSON.parse(data);
            this.projects = parsedData.projects.map(projectData => {
                const project = new Project(projectData.name);
                projectData.todos.forEach(todoData => {
                    const todo = new Todo(
                        todoData.title,
                        todoData.dueDate,
                        todoData.priority,
                        todoData.project,
                        todoData.completed
                    );
                    project.addTodo(todo);
                });
                return project;
            });
            this.currentProject = this.projects[parsedData.currentProjectIndex] || null;
        }
    }

    selectProject(project) {
        console.log("Selecting project:", project.name);
        this.currentProject = project;
        
        // Use requestAnimationFrame for smoother UI updates
        requestAnimationFrame(() => {
            try {
                this.updateToDos();
                this.updateProjectSelection();
                this.saveToLocalStorage();
            } catch (error) {
                console.error("Error in selectProject:", error);
                alert("An error occurred while selecting the project. Please try again.");
            }
        });
    }

    updateProjectSelection() {
        const projectElements = document.querySelectorAll('.project-item');
        projectElements.forEach(element => {
            if (element.getAttribute('data-project') === this.currentProject.name) {
                element.classList.add('selected');
            } else {
                element.classList.remove('selected');
            }
        });
    }
}