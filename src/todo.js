import { v4 as uuidv4 } from 'uuid';

class Todo {
    constructor(title, description, dueDate, priority, checklist = []) {
        this.id = uuidv4();
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.priority = priority;
        this.checklist = checklist;
        this.isComplete = false;
    }

    toggleComplete() {
        this.isComplete = !this.isComplete;
    }

    addChecklistItem(text) {
        this.checklist.push({text: text, done: false});
    }

    toggleChecklistItem(index) {
        if(this.checklist[index]) {
            this.checklist[index].done = !this.checklist[index].done;
        }
    }

    removeChecklistItem(index) {
        this.checklist.splice(index, 1);
    }
}

export { Todo };