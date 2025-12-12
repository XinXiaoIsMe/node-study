import 'reflect-metadata';
import express from 'express';
import { Container } from 'inversify';
import { InversifyExpressHttpAdapter } from '@inversifyjs/http-express';
import { UserService } from './src/user/service';
import { TYPES } from './src/constants/types';

import './src/user/controller';

const container = new Container();
container.bind<UserService>(TYPES.UserService).to(UserService);

const adapter = new InversifyExpressHttpAdapter(container);
const app = await adapter.build();

// server.setConfig(() => {
//     app.use(express.json());
//     app.use(express.urlencoded({
//         extended: true
//     }));
// });

app.listen(3000, () => {
    console.log('Server is running on 3000...');
});
