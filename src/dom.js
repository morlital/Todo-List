import { Project } from "./project.js";
import { Todo } from "./todo.js";
import { ProjectManager } from "./projectManager.js";
import { isToday, parseISO } from 'date-fns'; // Make sure date-fns is installed


const manager = new ProjectManager();

const todayTab = document.querySelector(".today-tab");

todayTab.addEventListener("click", () => {
  manager.selectedProjectId = null; // Deselect any project
  renderProjects();
  renderTodos("today");
});

// DOM Elements
const projectForm = document.getElementById("project-form");
const projectInput = document.getElementById("project-name");
const todoForm = document.getElementById("todo-form");
const todoListContainer = document.querySelector(".todo-list");
const projectListContainer = document.querySelector(".project-list");

const renderProjects = () => {
  projectListContainer.innerHTML = "";

  manager.getAllProjects().forEach((project) => {
    const div = document.createElement("div");
    div.classList.add("project-item");

    if (project.id === manager.selectedProjectId) {
      div.classList.add("selected");
    }

    const nameSpan = document.createElement("span");
    nameSpan.textContent = project.name;
    nameSpan.addEventListener("dblclick", () => {
      const newName = prompt("Rename project:", project.name);
      if (newName) {
        project.name = newName;
        manager.save();
        renderProjects();
      }
    });
    nameSpan.addEventListener("click", () => {
      manager.selectProject(project.id);
      renderProjects();
      renderTodos();
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑️";
    deleteBtn.classList.add("delete-project");
    deleteBtn.addEventListener("click", () => {
      manager.removeProject(project.id);
      manager.save();
      renderProjects();
      renderTodos();
    }); 

    div.appendChild(nameSpan);
    div.appendChild(deleteBtn);
    projectListContainer.appendChild(div);
  });
};

const renderTodos = (mode = null, expandedTodoId = null) => {
  todoListContainer.innerHTML = "";
  let todosToRender = [];

  if (todoForm) {
    todoForm.style.display = mode === "today" ? "none" : "flex";
  }
  
  if (mode === "today") {
    manager.getAllProjects().forEach(project => {
      project.getTodos().forEach(todo => {
        if (isToday(parseISO(todo.dueDate))) {
          todosToRender.push({ todo, project });
        }
      });
    });
  } else {
    const project = manager.getSelectedProject();
    if (!project) return;

    todosToRender = project.getTodos().map(todo => ({ todo, project }));
  }

  if (todosToRender.length === 0) {
    todoListContainer.innerHTML = "<p>No todos to show.</p>";
    return;
  }

  todosToRender.forEach(({ todo, project }, index) => {
    const div = document.createElement("div");
    div.classList.add("todo-item", `priority-${todo.priority}`);
    if (todo.completed) div.classList.add("completed");

    // --- Header Section ---
    const header = document.createElement("div");
    header.classList.add("todo-header");

    const completeCheckbox = document.createElement("input");
    completeCheckbox.type = "checkbox";
    completeCheckbox.checked = todo.completed;
    completeCheckbox.title = "Mark as complete";
    completeCheckbox.addEventListener("change", () => {
      todo.completed = completeCheckbox.checked;
      manager.save();
      renderTodos(mode, expandedTodoId);
    });

    const title = document.createElement("strong");
    title.textContent = todo.title;

    const due = document.createElement("em");
    due.textContent = ` - ${todo.dueDate}`;

    header.appendChild(completeCheckbox);
    header.appendChild(title);
    header.appendChild(due);

    if (mode === "today") {
      const projectLabel = document.createElement("span");
      projectLabel.textContent = `📁 ${project.name}`;
      projectLabel.classList.add("project-tag");
      header.appendChild(projectLabel);
    }

    // Toggle button is only shown if NOT in "today" mode
    const toggleBtn = document.createElement("button");
    if (mode !== "today") {
      toggleBtn.textContent = "Details ▼";
      header.appendChild(toggleBtn);
    }

    div.appendChild(header);

    // --- Details Section (hidden if mode === 'today') ---
    if (mode !== "today") {
      const details = document.createElement("div");
      details.classList.add("todo-details");

      let isExpanded = (todo.id === expandedTodoId);
      details.style.display = isExpanded ? "block" : "none";
      toggleBtn.textContent = isExpanded ? "Hide ▲" : "Details ▼";

      toggleBtn.addEventListener("click", () => {
        renderTodos(mode, isExpanded ? null : todo.id);
      });

      // Editable Fields
      const inputSection = document.createElement("div");
      inputSection.className = "input-section";

      const titleInput = document.createElement("input");
      titleInput.value = todo.title;
      titleInput.placeholder = "Title";

      const descriptionInput = document.createElement("textarea");
      descriptionInput.value = todo.description;
      descriptionInput.placeholder = "Description";

      const dueDateInput = document.createElement("input");
      dueDateInput.type = "date";
      dueDateInput.value = todo.dueDate;

      const prioritySelect = document.createElement("select");
      ["low", "medium", "high"].forEach((level) => {
        const option = document.createElement("option");
        option.value = level;
        option.textContent = level.charAt(0).toUpperCase() + level.slice(1);
        if (todo.priority === level) option.selected = true;
        prioritySelect.appendChild(option);
      });

      const saveBtn = document.createElement("button");
      saveBtn.textContent = "Save";
      saveBtn.addEventListener("click", () => {
        todo.title = titleInput.value.trim();
        todo.description = descriptionInput.value.trim();
        todo.dueDate = dueDateInput.value;
        todo.priority = prioritySelect.value;
        manager.save();
        renderTodos(mode, todo.id);
      });

      // Checklist
      const checklistContainer = document.createElement("div");
      checklistContainer.classList.add("checklist");

      const sortedChecklist = [...todo.checklist].sort((a, b) => a.done - b.done);
      sortedChecklist.forEach((item) => {
        const originalIndex = todo.checklist.indexOf(item);
        const li = document.createElement("div");
        li.classList.add("checklist-item");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = item.done;
        checkbox.addEventListener("change", () => {
          todo.toggleChecklistItem(originalIndex);
          manager.save();
          renderTodos(mode, todo.id);
        });

        const label = document.createElement("span");
        label.textContent = item.text || "[Untitled]";
        if (item.done) label.style.textDecoration = "line-through";

        const removeBtn = document.createElement("button");
        removeBtn.textContent = "❌";
        removeBtn.addEventListener("click", () => {
          todo.removeChecklistItem(originalIndex);
          manager.save();
          renderTodos(mode, todo.id);
        });

        li.appendChild(checkbox);
        li.appendChild(label);
        li.appendChild(removeBtn);
        checklistContainer.appendChild(li);
      });

      const checklistInput = document.createElement("input");
      checklistInput.type = "text";
      checklistInput.placeholder = "Add checklist item";
      checklistInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && checklistInput.value.trim()) {
          todo.addChecklistItem(checklistInput.value.trim());
          checklistInput.value = "";
          manager.save();
          renderTodos(mode, todo.id);
        }
      });

      checklistContainer.appendChild(checklistInput);

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "🗑️ Delete Todo";
      deleteBtn.addEventListener("click", () => {
        project.removeTodo(index);
        manager.save();
        renderTodos(mode);
      });

      inputSection.appendChild(titleInput);
      inputSection.appendChild(descriptionInput);
      inputSection.appendChild(dueDateInput);
      inputSection.appendChild(prioritySelect);
      inputSection.appendChild(saveBtn);

      details.appendChild(inputSection);
      details.appendChild(document.createElement("hr"));
      details.appendChild(checklistContainer);
      details.appendChild(deleteBtn);

      div.appendChild(details);
    }

    todoListContainer.appendChild(div);
  });
};


// Event Listeners
projectForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = projectInput.value.trim();
  if (!name) return;

  const newProject = new Project(name);
  manager.addProject(newProject);
  manager.save();
  projectInput.value = "";
  renderProjects();
  renderTodos();
});

todoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = document.getElementById("todo-title").value.trim();
  const description = document.getElementById("todo-description").value.trim();
  const dueDate = document.getElementById("todo-dueDate").value;
  const priority = document.getElementById("todo-priority").value;

  if (!title || !dueDate) return;

  const newTodo = new Todo(title, description, dueDate, priority);
  manager.getSelectedProject().addTodo(newTodo);
  manager.save();
  todoForm.reset();
  renderTodos();
});

export { renderProjects, renderTodos, manager };
