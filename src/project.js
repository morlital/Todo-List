
class Project {
    constructor(name) {
        this.id = generateUUID(); 
        this.name = name;
        this.todos = [];
    }

    addTodo(todo) {
        this.todos.push(todo);
    }

    removeTodo(index) {
        if (index >= 0 && index < this.todos.length) {
            this.todos.splice(index, 1);
        }
    }

    getTodos() {
        return this.todos;
    }

    getTodo(index) {
        return this.todos[index];
    }

}

function generateUUID() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

export { Project };