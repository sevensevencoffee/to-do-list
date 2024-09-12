import { Todo } from "./todo";
import { Project } from "./projects";
import { displayTodos, displayProjects, initializeFilters } from "./tododisplay";

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
        this.updateProjects();
        this.initializeProjectDialog();
        initializeFilters(this.projects, this.displayFilteredTodos.bind(this));
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

        this.cancelBtn.addEventListener('click', () => this.hideInputForm());
    }

    initializeFilters() {
        const filtersContainer = document.createElement('div');
        filtersContainer.id = 'filters';
        filtersContainer.innerHTML = `
            <button id="showAllTodos">Show all to dos</button>
            <button id="showDueToday">Due today</button>
        `;
        
        const sideBar = document.querySelector('.sideBar');
        sideBar.insertBefore(filtersContainer, document.getElementById('projects'));

        document.getElementById('showAllTodos').addEventListener('click', () => this.showAllTodos());
        document.getElementById('showDueToday').addEventListener('click', () => this.showDueToday());
    }

    showAllTodos() {
        const allTodos = this.projects.flatMap(project => project.getTodos());
        this.displayFilteredTodos(allTodos, 'All To-Dos');
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
        displayTodos(
            completedTodos,
            'Completed Tasks',
            null,
            null,
            null,
            (index) => {
                const [project, todoIndex] = this.findTodoProjectAndIndex(completedTodos[index]);
                if (project) {
                    this.toggleTodoCompleted(todoIndex, project);
                }
            },
            true 
        );
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

    displayFilteredTodos(todos, title) {
        displayTodos(
            todos,
            title,
            null,
            null,
            null,
            (index) => {
                const [project, todoIndex] = this.findTodoProjectAndIndex(todos[index]);
                if (project) {
                    this.toggleTodoCompleted(todoIndex, project);
                }
            },
            title === 'Completed Tasks' 
        );
    }

    addProject(name) {
        const newProject = new Project(name);
        this.projects.push(newProject);
        this.updateProjects();
        this.saveToLocalStorage();
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
        this.saveToLocalStorage();
    }

    editTodo(index) {
        const todo = this.currentProject.getTodos()[index];
        this.titleInput.value = todo.title;
        this.dueDateInput.value = todo.dueDate;
        this.priorityInput.value = todo.priority;

        this.editIndex = index;
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

    deleteTodo(index) {
        if (this.currentProject && index >= 0 && index < this.currentProject.getTodos().length) {
            const deletedTodo = this.currentProject.getTodos()[index];
            this.currentProject.deleteTodo(index);
            this.updateToDos();
            this.removeTodoFromLocalStorage(this.currentProject.name, deletedTodo.title);
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
    }

    updateToDos() {
        const container = document.querySelector(".mainContainer");
        container.innerHTML = ""; 

        if (this.currentProject) {
            try {
                const addTodoBtn = document.createElement("button");
                addTodoBtn.id = "askForInput";
                addTodoBtn.textContent = "+ Add a new task";
                addTodoBtn.addEventListener('click', () => this.showInputForm());
                container.appendChild(addTodoBtn);

                container.appendChild(this.inputContainer);

                displayTodos(
                    this.currentProject.getTodos(),
                    this.currentProject.name,
                    this.currentProject,
                    (index) => this.editTodo(index),
                    (index) => this.deleteTodo(index),
                    (index) => this.toggleTodoCompleted(index),
                    false 
                );
            } catch (error) {
                console.error("Error in displayTodos:", error);
                container.innerHTML += "<p>Error displaying todos. Please try again.</p>";
            }
        } else {
            container.innerHTML = "<p>Select a project to view todos</p>";
        }
    }

    toggleTodoCompleted(index) {
        const todo = this.currentProject.getTodos()[index];
        todo.completed = !todo.completed;
        this.currentProject.updateTodo(index, todo);
        this.updateToDos();
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
        this.currentProject = project;
        this.updateToDos();
        this.saveToLocalStorage();
    }
}