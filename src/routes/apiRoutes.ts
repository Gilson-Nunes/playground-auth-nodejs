import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { basicAuthHook } from '@/hooks/basicAuthHook';

export const apiRoutes = (app: FastifyInstance) => {
	app.get('/', async (_request: FastifyRequest, reply: FastifyReply) => {
		reply.status(200).send({ data: 'Home' });
	});

	app.get(
		'/protected',
		{
			onRequest: basicAuthHook,
		},
		async (_request: FastifyRequest, reply: FastifyReply) => {
			reply.status(200).send({ data: 'Content protected' });
		},
	);
};
