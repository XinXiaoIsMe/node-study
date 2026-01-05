import { type TodoRepository } from "./repository";

export class TodoService {
    constructor(private readonly _db: TodoRepository) {}

    getTodos() {
        return this._db.getTodos();
    }

    createTodo(text: string) {
        return this._db.createTodo(text);
    }

    patchTodo(id: string, patch: { text?: string; completed?: boolean }) {
        return this._db.patchTodo(id, patch);
    }

    deleteTodo(id: string) {
        return this._db.deleteTodo(id);
    }
}
