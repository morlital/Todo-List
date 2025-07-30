import "./style.css";
import { Project } from "./project.js";
import { renderProjects, renderTodos, manager } from "./dom.js";

manager.load();

if (manager.getAllProjects().length === 0) {
  const defaultProject = new Project('General');
  manager.addProject(defaultProject);
}

window.addEventListener("DOMContentLoaded", function () {
  renderProjects();
  renderTodos();
});
