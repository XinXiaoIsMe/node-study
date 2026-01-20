import type { FastifyInstance } from 'fastify';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { getMySqlPool } from './db.js';

interface TodoRow extends RowDataPacket {
  id: number | string;
  title: string;
  completed: 0 | 1;
}

interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

function toTodo(row: TodoRow): Todo {
  return {
    id: String(row.id),
    title: String(row.title),
    completed: Boolean(row.completed),
  };
}

export function registerTodoRoutes(fastify: FastifyInstance) {
  const pool = getMySqlPool();

  fastify.get('/health', async () => {
    await pool.query('SELECT 1');
    return { status: 'ok' };
  });

  const messageSchema = {
    type: 'object',
    required: ['message'],
    properties: { message: { type: 'string' } },
  } as const;

  fastify.get('/todos', {
    schema: {
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            required: ['id', 'title', 'completed'],
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              completed: { type: 'boolean' },
            },
          },
        },
      },
    },
  }, async () => {
    const [rows] = await pool.query<TodoRow[]>(
      'SELECT id, title, completed FROM todos ORDER BY id DESC',
    );
    return rows.map(toTodo);
  });

  fastify.post('/todos', {
    schema: {
      body: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 255 },
        },
        additionalProperties: false,
      },
      response: {
        200: {
          type: 'object',
          required: ['id', 'title', 'completed'],
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            completed: { type: 'boolean' },
          },
        },
        400: messageSchema,
        500: messageSchema,
      },
    },
  }, async (request, reply) => {
    const { title } = request.body as { title: string };
    const trimmed = title.trim();
    if (!trimmed) {
      reply.code(400);
      return { message: 'title is required' };
    }

    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO todos (title, completed) VALUES (:title, 0)',
      { title: trimmed },
    );

    const [rows] = await pool.query<TodoRow[]>(
      'SELECT id, title, completed FROM todos WHERE id = :id LIMIT 1',
      { id: result.insertId },
    );

    const row = rows[0];
    if (!row) {
      reply.code(500);
      return { message: 'Failed to read created todo' };
    }

    return toTodo(row);
  });

  fastify.patch('/todos/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', minLength: 1 },
        },
      },
      body: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 255 },
          completed: { type: 'boolean' },
        },
        additionalProperties: false,
      },
      response: {
        200: {
          type: 'object',
          required: ['id', 'title', 'completed'],
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            completed: { type: 'boolean' },
          },
        },
        400: messageSchema,
        404: messageSchema,
        500: messageSchema,
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as { title?: string; completed?: boolean };

    const nextTitle = body.title?.trim();
    const hasTitle = typeof body.title !== 'undefined';
    const hasCompleted = typeof body.completed !== 'undefined';

    if (!hasTitle && !hasCompleted) {
      reply.code(400);
      return { message: 'Nothing to update' };
    }
    if (hasTitle && !nextTitle) {
      reply.code(400);
      return { message: 'title must not be empty' };
    }

    const sets: string[] = [];
    const params: Record<string, unknown> = { id };
    if (hasTitle) {
      sets.push('title = :title');
      params.title = nextTitle;
    }
    if (hasCompleted) {
      sets.push('completed = :completed');
      params.completed = body.completed ? 1 : 0;
    }

    const sql = `UPDATE todos SET ${sets.join(', ')} WHERE id = :id`;
    const [result] = await pool.execute<ResultSetHeader>(sql, params);

    if (result.affectedRows === 0) {
      reply.code(404);
      return { message: 'Todo not found' };
    }

    const [rows] = await pool.query<TodoRow[]>(
      'SELECT id, title, completed FROM todos WHERE id = :id LIMIT 1',
      { id },
    );
    const row = rows[0];
    if (!row) {
      reply.code(500);
      return { message: 'Failed to read updated todo' };
    }
    return toTodo(row);
  });

  fastify.delete('/todos/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', minLength: 1 },
        },
      },
      response: {
        204: { type: 'null' },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    await pool.execute('DELETE FROM todos WHERE id = :id', { id });
    reply.code(204).send();
  });
}
