import 'reflect-metadata';
import 'dotenv/config';
import express from 'express';
import { InversifyExpressHttpAdapter } from '@inversifyjs/http-express';
import { container } from './container';

async function bootstrap() {
    const adapter = new InversifyExpressHttpAdapter(container);
    const app = await adapter.build();

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.listen(3000, () => {
        console.log('Server is running on 3000...');
    });
}

bootstrap();
