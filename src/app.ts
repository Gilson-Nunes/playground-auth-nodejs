import Fastify, { type FastifyServerOptions } from 'fastify';
import { getDbPool } from './providers/database';
import { apiRoutes } from './routes/apiRoutes';
import { authRoutes } from './routes/authRoutes';

export function serverBuild(opts: FastifyServerOptions = {}) {
	const app = Fastify(opts);

	app.decorate('db', getDbPool());

	app.register(authRoutes);
	app.register(apiRoutes);

	return app;
}
