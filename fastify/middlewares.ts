import type { FastifyInstance } from 'fastify';

export interface CorsOptions {
  origin?: '*' | string | string[] | ((origin: string | undefined) => string | false);
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

function resolveOrigin(
  originOption: CorsOptions['origin'],
  requestOrigin: string | undefined,
): string | false {
  if (!originOption || originOption === '*')
    return '*';
  if (typeof originOption === 'string')
    return originOption;
  if (Array.isArray(originOption))
    return requestOrigin && originOption.includes(requestOrigin) ? requestOrigin : false;
  return originOption(requestOrigin);
}

export function registerCorsMiddleware(fastify: FastifyInstance, options: CorsOptions = {}) {
  const methods = (options.methods ?? ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS']).map(m => m.toUpperCase());
  const allowedHeaders = options.allowedHeaders;
  const exposedHeaders = options.exposedHeaders;
  const credentials = options.credentials ?? false;
  const maxAge = options.maxAge ?? 86400;

  fastify.addHook('onRequest', async (request, reply) => {
    const requestOrigin = typeof request.headers.origin === 'string' ? request.headers.origin : undefined;
    const allowOrigin = resolveOrigin(options.origin, requestOrigin);

    if (allowOrigin) {
      reply.header('Access-Control-Allow-Origin', allowOrigin);
      if (allowOrigin !== '*')
        reply.header('Vary', 'Origin');
      if (credentials)
        reply.header('Access-Control-Allow-Credentials', 'true');
      if (exposedHeaders?.length)
        reply.header('Access-Control-Expose-Headers', exposedHeaders.join(', '));
    }

    if (request.method === 'OPTIONS') {
      if (allowOrigin === false) {
        reply.code(403);
        return { message: 'CORS origin denied' };
      }

      const requestHeaders = typeof request.headers['access-control-request-headers'] === 'string'
        ? request.headers['access-control-request-headers']
        : undefined;

      reply.header('Access-Control-Allow-Methods', methods.join(', '));
      if (allowedHeaders?.length) {
        reply.header('Access-Control-Allow-Headers', allowedHeaders.join(', '));
      }
      else if (requestHeaders) {
        reply.header('Access-Control-Allow-Headers', requestHeaders);
      }
      else {
        reply.header('Access-Control-Allow-Headers', 'content-type');
      }

      reply.header('Access-Control-Max-Age', String(maxAge));
      reply.code(204).send();
    }
  });
}
