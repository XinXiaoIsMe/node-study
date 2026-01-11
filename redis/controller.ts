import express, { Request, Response, type Router } from "express";
import { type TodoService } from "./service";

export class TodoController {
    private router: Router;
    constructor (private readonly service: TodoService) {
        this.router = express.Router();
        this.addRouter();
    }

    getRouter() {
        return this.router;
    }

    private addRouter() {
        this.router.get('/todos', this.getTodos.bind(this));
        this.router.post('/todos', this.createTodo.bind(this));
        this.router.patch('/todos/:id', this.patchTodo.bind(this));
        this.router.delete('/todos/:id', this.deleteTodo.bind(this));
    }

    private async getTodos(req: Request, res: Response) {
        const todos = await this.service.getTodos();
        res.send(todos);
    }

    private async createTodo(req: Request, res: Response) {
        const text = typeof req.body?.text === 'string' ? req.body.text : '';
        const trimmed = text.trim();
        if (!trimmed) {
            res.status(400).send({ message: 'text is required' });
            return;
        }

        const todo = await this.service.createTodo(trimmed);
        res.status(201).send([todo]);
    }

    private async patchTodo(req: Request, res: Response) {
        const id = String(req.params.id ?? '');
        if (!id) {
            res.status(400).send({ message: 'id is required' });
            return;
        }

        const hasText = Object.prototype.hasOwnProperty.call(req.body ?? {}, 'text');
        const hasCompleted = Object.prototype.hasOwnProperty.call(req.body ?? {}, 'completed');
        if (!hasText && !hasCompleted) {
            res.status(400).send({ message: 'patch must include text or completed' });
            return;
        }

        const patch: { text?: string; completed?: boolean } = {};
        if (hasText) {
            const text = typeof req.body?.text === 'string' ? req.body.text : '';
            const trimmed = text.trim();
            if (!trimmed) {
                res.status(400).send({ message: 'text must be non-empty' });
                return;
            }
            patch.text = trimmed;
        }
        if (hasCompleted) {
            patch.completed = Boolean(req.body?.completed);
        }

        const todo = await this.service.patchTodo(id, patch);
        if (!todo) {
            res.status(404).send({ message: 'todo not found' });
            return;
        }
        res.send([todo]);
    }

    private async deleteTodo(req: Request, res: Response) {
        const id = String(req.params.id ?? '');
        if (!id) {
            res.status(400).send({ message: 'id is required' });
            return;
        }
        await this.service.deleteTodo(id);
        res.status(204).send();
    }
}
