import 'reflect-metadata';
import express from 'express';
import { Container } from 'inversify';
import { InversifyExpressServer } from 'inversify-express-utils';
import { UserService } from './src/user/service';
import { TYPES } from './src/constants/types';

import './src/user/controller';

const container = new Container();
container.bind<UserService>(TYPES.UserService).to(UserService);

const server = new InversifyExpressServer(container);
const app = server.build();

server.setConfig(() => {
    app.use(express.json());
    app.use(express.urlencoded({
        extended: true
    }));
});

app.listen(3000, () => {
    console.log('Server is running on 3000...');
});
