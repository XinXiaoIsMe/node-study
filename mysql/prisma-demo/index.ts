import "dotenv/config";
import express, { Request, Response } from 'express';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from './generated/prisma/client';

const app = express();
const adapter = new PrismaMariaDb({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    connectionLimit: 5
});
const prisma = new PrismaClient({
    adapter
});
const PORT = '3001';

app.use(express.json());
app.use(express.urlencoded());

app.get('/', async (req: Request, res: Response) => {
    const data = await prisma.user.findMany({
        include: {
            posts: true
        }
    });
    res.send(data);
});

app.get('/user/:id', async (req: Request, res: Response) => {
    const row = await prisma.user.findMany({
        where: {
            id: Number(req.params.id)
        }
    });
    res.send(row);
});

app.post('/create', async (req: Request, res: Response) => {
    const { name, email } = req.body;
    const data = await prisma.user.create({
        data: {
            name,
            email,
            posts: {
                create: {
                    title: '标题',
                    publish: true
                }
            }
        }
    });
    res.send(data);
});

app.post('/update', async (req: Request, res: Response) => {
    const { id, name, email } = req.body;
    const data = await prisma.user.update({
        where: {
            id: Number(id)
        },
        data: {
            name,
            email
        }
    });
    res.send(data);
});

app.post('/delete', async (req: Request, res: Response) => {
    const { id } = req.body;
    await prisma.post.deleteMany({
        where: {
            authorId: Number(id)
        }
    });
    const data = await prisma.user.delete({
        where: {
            id: Number(id)
        }
    });
    res.send(data);
})

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}...`);
});
