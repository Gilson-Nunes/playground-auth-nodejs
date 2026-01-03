import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

export const apiRoutes = (app: FastifyInstance) => {
	app.get('/', async (_request: FastifyRequest, reply: FastifyReply) => {
		reply.status(200).send({ data: 'Home' });
	});

	app.get(
		'/protected',
		{
			onRequest: (_request: FastifyRequest, reply: FastifyReply) =>
				reply.status(401).send({ data: 'Access denied' }),
		},
		async (_request: FastifyRequest, reply: FastifyReply) => {
			reply.status(200).send({ data: 'Content protected' });
		},
	);
};
