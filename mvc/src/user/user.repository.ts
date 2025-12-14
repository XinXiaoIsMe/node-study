import { inject, injectable } from 'inversify';
import { TYPES } from '../constants/types';
import { IUserRepository } from './types';
import { PrismaDb } from '../db';
import { CreateUserDTO, UpdateUserDTO } from './user.dto';

@injectable()
export class UserRepository implements IUserRepository {
    constructor(
        @inject(TYPES.PrismaDb)
        private readonly db: PrismaDb
    ) {}

    findOne(id: number): Promise<any> {
        return this.db.prisma.user.findUnique({
            where: {
                id
            }
        });
    }

    findAll(): Promise<any[]> {
        return this.db.prisma.user.findMany();
    }

    create(data: CreateUserDTO): Promise<any> {
        return this.db.prisma.user.create({ data });
    }

    update(id: number, data: UpdateUserDTO): Promise<any> {
        return this.db.prisma.user.update({
            where: { id },
            data
        })
    }

    delete(id: number): Promise<any> {
        return this.db.prisma.user.delete({
            where: { id }
        });
    }
}