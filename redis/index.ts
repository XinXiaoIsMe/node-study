import express, { type Express } from 'express';
import cors from 'cors';
import { TodoController } from './controller';
import { TodoService } from './service';
import { TodoRepository } from './repository';

interface AppOptions {
    port: number;
    baseUrl: string;
}

class App {
    private readonly app: Express;
    private readonly port: number;
    private readonly baseUrl: string;
    private readonly controller: TodoController;
    constructor(options: Partial<AppOptions> = {}) {
        this.app = express();
        this.port = options.port ?? 3000;
        this.baseUrl = options.baseUrl ?? '/api';
        this.controller = new TodoController(new TodoService(new TodoRepository()));
        this.app.use(express.json());
        this._setCors();
        this.app.use(this.baseUrl, this.controller.getRouter());
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`Server is listening on ${this.port}`);
        });
    }

    private _setCors () {
        this.app.use(cors({
            origin: '*'
        }));
    }
}

function bootstrap() {
    const app = new App();
    app.start();
}

bootstrap();
