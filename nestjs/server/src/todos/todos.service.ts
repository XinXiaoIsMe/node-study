import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { TodoEntity } from './todo.entity';

// Todo 业务逻辑（CRUD）
@Injectable()
export class TodosService {
  constructor(
    @InjectRepository(TodoEntity)
    private readonly todoRepository: Repository<TodoEntity>,
  ) {}

  async create(createTodoDto: CreateTodoDto): Promise<TodoEntity> {
    const todo = this.todoRepository.create({
      title: createTodoDto.title,
      completed: false,
    });
    return this.todoRepository.save(todo);
  }

  async findAll(): Promise<TodoEntity[]> {
    return this.todoRepository.find({
      order: {
        id: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<TodoEntity> {
    const todo = await this.todoRepository.findOne({
      where: { id },
    });
    if (!todo) {
      throw new NotFoundException('Todo 不存在');
    }
    return todo;
  }

  async update(id: number, updateTodoDto: UpdateTodoDto): Promise<TodoEntity> {
    const todo = await this.todoRepository.preload({
      id,
      ...updateTodoDto,
    });
    if (!todo) {
      throw new NotFoundException('Todo 不存在');
    }
    return this.todoRepository.save(todo);
  }

  async remove(id: number): Promise<void> {
    const todo = await this.findOne(id);
    await this.todoRepository.remove(todo);
  }
}
