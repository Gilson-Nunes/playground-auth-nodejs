import Fastify, { type FastifyServerOptions } from 'fastify';

export function serverBuild(opts: FastifyServerOptions = {}) {
	const app = Fastify(opts);
	return app;
}
