import Ioredis from 'ioredis';
import { randomUUID } from 'node:crypto';
import { nowISO } from './utils';

interface TodoRepositoryOptions {
    host: string;
    port: number;
}

export interface TodoItem {
    id: string;
    text: string;
    completed: boolean;
    createdAt: string;
    updatedAt: string;
}

const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = 6379;
const TODOS_KEY = 'todos:v1';
export class TodoRepository {
    private readonly _db: Ioredis;
    constructor(options: Partial<TodoRepositoryOptions> = {}) {
        this._db = new Ioredis({
            host: options.host ?? DEFAULT_HOST, //ip
            port: options.port ?? DEFAULT_PORT, //端口
        });
    }

    private async getJson<T>(key: string): Promise<T | null> {
        const raw = await this._db.get(key);
        if (raw == null) return null;
        try {
            return JSON.parse(raw) as T;
        } catch {
            return null;
        }
    }

    private async setJson(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
        const payload = JSON.stringify(value);
        if (ttlSeconds != null) {
            await this._db.set(key, payload, 'EX', ttlSeconds);
            return;
        }
        await this._db.set(key, payload);
    }

    async getTodos(): Promise<TodoItem[]> {
        return (await this.getJson<TodoItem[]>(TODOS_KEY)) ?? [];
    }

    async createTodo(text: string): Promise<TodoItem> {
        const trimmed = text.trim();
        const now = nowISO();
        const todo: TodoItem = {
            id: randomUUID(),
            text: trimmed,
            completed: false,
            createdAt: now,
            updatedAt: now,
        };

        const todos = await this.getTodos();
        todos.unshift(todo);
        await this.setJson(TODOS_KEY, todos);
        return todo;
    }

    async patchTodo(id: string, patch: { text?: string; completed?: boolean }): Promise<TodoItem | null> {
        const todos = await this.getTodos();
        const todo = todos.find((t) => t.id === id);
        if (!todo) return null;

        if (patch.text != null) todo.text = patch.text.trim();
        if (patch.completed != null) todo.completed = patch.completed;
        todo.updatedAt = nowISO();

        await this.setJson(TODOS_KEY, todos);
        return todo;
    }

    async deleteTodo(id: string): Promise<boolean> {
        const todos = await this.getTodos();
        const next = todos.filter((t) => t.id !== id);
        if (next.length === todos.length) return false;
        await this.setJson(TODOS_KEY, next);
        return true;
    }
}
