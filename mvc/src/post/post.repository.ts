import { inject, injectable } from "inversify";
import { TYPES } from "../constants/types";
import { PrismaDb } from "../db";
import { IPostRepository } from "./types";
import { CreatePostDTO, UpdatePostDTO } from './post.dto';

@injectable()
export class PostRepository implements IPostRepository {
    constructor(
        @inject(TYPES.PrismaDb)
        private readonly db: PrismaDb
    ) {}

    findById(id: number): Promise<any> {
        return this.db.prisma.post.findUnique({
            where: {
                id
            }
        });
    }

    findManyByAuthor(authorId: number): Promise<any[]> {
        return this.db.prisma.post.findMany({
            where: {
                authorId
            }
        });
    }

    create(data: CreatePostDTO): Promise<any> {
        return this.db.prisma.post.create({
            data
        });
    }

    delete(id: number): Promise<any> {
        return this.db.prisma.post.delete({
            where: {
                id
            }
        });
    }

    update(id: number, data: UpdatePostDTO): Promise<any> {
        return this.db.prisma.post.update({
            where: {
                id
            },
            data
        });
    }
}