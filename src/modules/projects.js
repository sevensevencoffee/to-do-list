export class Project {
    constructor(name) {
        this.name = name;
        this.todos = [];
    }

    getTodos() {
        return this.todos || [];
    }

    addTodo(todo) {
        this.todos.push(todo);
    }

    deleteTodo(index) {
        if (index >= 0 && index < this.todos.length) {
            this.todos.splice(index, 1);
        }
    }

    updateTodo(index, updatedTodo) {
        if (index >= 0 && index < this.todos.length) {
            this.todos[index] = updatedTodo;
        }
    }
}