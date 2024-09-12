
export class Todo {
    constructor(title, dueDate, priority, project, completed = false) {
        this.title = title;
        this.dueDate = dueDate;
        this.priority = priority;
        this.project = project;
        this.completed = completed;
    }
}


