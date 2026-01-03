import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

export const apiRoutes = (app: FastifyInstance) => {
	app.get('/', async (_request: FastifyRequest, reply: FastifyReply) => {
		reply.status(200).send({ data: 'Home' });
	});
};
