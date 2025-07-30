import { Project } from "./project";
import { Todo } from "./todo";

class ProjectManager {
    constructor() {
        this.projects = [];
        this.selectedProjectId = null;
    }

    addProject(project) {
        this.projects.push(project);
        if (!this.selectedProjectId) {
            this.selectedProjectId = project.id;
        }
    }

    removeProject(id) {
        this.projects = this.projects.filter(project => project.id !== id);
        if (this.selectedProjectId === id) {
            // If you delete the selected project, fall back to another
            this.selectedProjectId = this.projects.length ? this.projects[0].id : null;
        }
    }

    selectProject(id) {
        if (this.getProject(id)) {
            this.selectedProjectId = id;
        }
    }

    getSelectedProject() {
        return this.getProject(this.selectedProjectId);
    }

    getProject(id) {
        return this.projects.find(project => project.id === id);
    }

    getAllProjects() {
        return this.projects;
    }

    save() {
        localStorage.setItem('projects', JSON.stringify(this.projects));
        localStorage.setItem('selectedProjectId', this.selectedProjectId);
    }

    load() {
        const savedProjects = localStorage.getItem('projects');
        const savedSelectedId = localStorage.getItem('selectedProjectId');

        if(savedProjects) {
            this.projects = JSON.parse(savedProjects).map(projectDate => {
                const project = new Project(projectDate.name, projectDate.isAbleToDelete);
                project.id = projectDate.id;
                project.todos = projectDate.todos.map(todoData => {
                    const todo = new Todo(
                        todoData.title,
                        todoData.description,
                        todoData.dueDate,
                        todoData.priority,
                        todoData.checklist,
                        todoData.completed
                    );
                    return todo;
                });
                return project;
            });
        }

        if (savedSelectedId) {
            this.selectedProjectId = savedProjects;
        }
    }
}

export { ProjectManager };