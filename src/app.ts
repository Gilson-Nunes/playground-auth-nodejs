import Fastify, { type FastifyServerOptions } from 'fastify';

export function serverBuild(opts: FastifyServerOptions = {}) {
	const app = Fastify(opts);

	app.get('/', async (_request, reply) => {
		reply.status(200).send({ data: 'Home' });
	});

	return app;
}
