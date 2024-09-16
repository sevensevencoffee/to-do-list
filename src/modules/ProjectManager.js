import { Project } from './projects';

export class ProjectManager {
    constructor() {
        this.projects = [];
        this.currentProject = null;
    }

    addProject(name) {
        const newProject = new Project(name);
        this.projects.push(newProject);
        this.currentProject = newProject;
        this.saveToLocalStorage();
        return newProject;
    }

    deleteProject(index) {
        if (index >= 0 && index < this.projects.length) {
            const deletedProject = this.projects.splice(index, 1)[0];
            if (this.currentProject === deletedProject) {
                this.currentProject = this.projects[0] || null;
            }
            this.saveToLocalStorage();
        }
    }

    selectProject(project) {
        this.currentProject = project;
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
                projectData.todos.forEach(todoData => project.addTodo(todoData));
                return project;
            });
            this.currentProject = this.projects[parsedData.currentProjectIndex] || null;
        }
    }
}
