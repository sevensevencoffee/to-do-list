import { Todo } from './todo';

export class TodoManager {
    constructor(projectManager) {
        this.projectManager = projectManager;
    }

    addTodo(title, dueDate, priority) {
        const currentProject = this.projectManager.currentProject;
        if (!currentProject) {
            throw new Error("No project selected");
        }
        const todo = new Todo(title, dueDate, priority, currentProject.name);
        currentProject.addTodo(todo);
        this.projectManager.saveToLocalStorage();
        return todo;
    }

    editTodo(index, updatedTodo) {
        const currentProject = this.projectManager.currentProject;
        if (!currentProject) {
            throw new Error("No project selected");
        }
        currentProject.updateTodo(index, updatedTodo);
        this.projectManager.saveToLocalStorage();
    }

    deleteTodo(index) {
        const currentProject = this.projectManager.currentProject;
        if (!currentProject) {
            throw new Error("No project selected");
        }
        currentProject.deleteTodo(index);
        this.projectManager.saveToLocalStorage();
    }

    toggleTodoCompleted(index) {
        const currentProject = this.projectManager.currentProject;
        if (!currentProject) {
            throw new Error("No project selected");
        }
        const todo = currentProject.getTodos()[index];
        todo.completed = !todo.completed;
        currentProject.updateTodo(index, todo);
        this.projectManager.saveToLocalStorage();
    }

    getAllTodos() {
        return this.projectManager.projects.flatMap(project => project.getTodos());
    }

    getDueTodayTodos() {
        const today = new Date().toISOString().split('T')[0];
        return this.getAllTodos().filter(todo => todo.dueDate === today);
    }

    getCompletedTodos() {
        return this.getAllTodos().filter(todo => todo.completed);
    }
}
