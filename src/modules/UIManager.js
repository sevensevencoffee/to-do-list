import { displayProjects, displayTodos, initializeFilters } from './uiHelpers';

export class UIManager {
    constructor(projectManager, todoManager) {
        this.projectManager = projectManager;
        this.todoManager = todoManager;
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        this.addProjectBtn = document.getElementById('addProjectBtn');
        this.projectDialog = document.getElementById('projectDialog');
        this.projectForm = document.getElementById('projectForm');
        this.cancelProjectBtn = document.getElementById('cancelProjectBtn');
        this.askForInputBtn = document.getElementById('askForInput');
        this.inputContainer = document.getElementById('inputContainer');
        this.toDoForm = document.getElementById('toDoForm');
        this.confirmBtn = document.getElementById('confirmBtn');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.titleInput = document.getElementById('title');
        this.dueDateInput = document.getElementById('dueDate');
        this.priorityInput = document.getElementById('priority');
    }

    attachEventListeners() {
        this.addProjectBtn.addEventListener('click', () => this.showProjectDialog());
        this.projectForm.addEventListener('submit', (e) => this.handleProjectSubmit(e));
        this.cancelProjectBtn.addEventListener('click', () => this.hideProjectDialog());
        this.askForInputBtn.addEventListener('click', () => this.showInputForm());
        this.toDoForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        this.cancelBtn.addEventListener('click', () => this.hideInputForm());
    }

    showProjectDialog() {
        this.projectDialog.showModal();
    }

    hideProjectDialog() {
        this.projectDialog.close();
    }

    handleProjectSubmit(e) {
        e.preventDefault();
        const projectName = document.getElementById('projectName').value;
        const newProject = this.projectManager.addProject(projectName);
        this.hideProjectDialog();
        this.updateProjectList();
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
    }

    clearInputs() {
        this.titleInput.value = "";
        this.dueDateInput.value = "";
        this.priorityInput.value = "";
    }

    handleFormSubmit(e) {
        e.preventDefault();
        const title = this.titleInput.value;
        const dueDate = this.dueDateInput.value;
        const priority = this.priorityInput.value;

        if (this.editIndex !== undefined) {
            this.todoManager.editTodo(this.editIndex, { title, dueDate, priority });
            this.editIndex = undefined;
        } else {
            this.todoManager.addTodo(title, dueDate, priority);
        }

        this.hideInputForm();
        this.updateTodoList();
    }

    updateProjectList() {
        displayProjects(
            this.projectManager.projects,
            (project) => this.selectProject(project),
            (index) => this.deleteProject(index)
        );
    }

    updateTodoList() {
        const currentProject = this.projectManager.currentProject;
        if (currentProject) {
            displayTodos(
                currentProject.getTodos(),
                currentProject.name,
                (index) => this.editTodo(index),
                (index) => this.deleteTodo(index),
                (index) => this.toggleTodoCompleted(index)
            );
        }
    }

    selectProject(project) {
        this.projectManager.selectProject(project);
        this.updateTodoList();
    }

    deleteProject(index) {
        this.projectManager.deleteProject(index);
        this.updateProjectList();
        this.updateTodoList();
    }

    editTodo(index) {
        const todo = this.projectManager.currentProject.getTodos()[index];
        this.titleInput.value = todo.title;
        this.dueDateInput.value = todo.dueDate;
        this.priorityInput.value = todo.priority;
        this.editIndex = index;
        this.showInputForm(true);
    }

    deleteTodo(index) {
        this.todoManager.deleteTodo(index);
        this.updateTodoList();
    }

    toggleTodoCompleted(index) {
        this.todoManager.toggleTodoCompleted(index);
        this.updateTodoList();
    }

    initializeUI() {
        initializeFilters(
            this.projectManager.projects,
            () => this.showAllTodos(),
            () => this.showDueToday(),
            () => this.showCompleted()
        );
    }

    showAllTodos() {
        const allTodos = this.todoManager.getAllTodos();
        displayTodos(allTodos, 'All Open To-Dos');
    }

    showDueToday() {
        const dueTodayTodos = this.todoManager.getDueTodayTodos();
        displayTodos(dueTodayTodos, 'Due Today');
    }

    showCompleted() {
        const completedTodos = this.todoManager.getCompletedTodos();
        displayTodos(completedTodos, 'Completed Tasks', null, null, null, true);
    }
}
