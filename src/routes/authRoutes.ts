import type { FastifyInstance } from 'fastify';
import { loginController } from '@/controllers/auth/loginController';
import { logoutController } from '@/controllers/auth/logoutController';
import { registerController } from '@/controllers/auth/registerController';
import { basicAuthHook } from '@/hooks/basicAuthHook';

export const authRoutes = (app: FastifyInstance) => {
	app.post('/register', registerController);

	app.post('/login', loginController);

	app.get('/logout', { onRequest: basicAuthHook }, logoutController);
};
