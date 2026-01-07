import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { loginController } from '@/controllers/auth/loginController';
import { registerController } from '@/controllers/auth/registerController';
import { basicAuthHook } from '@/hooks/basicAuthHook';

export const authRoutes = (app: FastifyInstance) => {
	app.post('/register', registerController);

	app.post('/login', loginController);

	app.get(
		'/logout',
		{
			onRequest: basicAuthHook,
		},
		async (_request: FastifyRequest, reply: FastifyReply) => {
			reply.clearCookie('accessToken', { path: '/' });
			reply.status(204).send();
		},
	);
};
