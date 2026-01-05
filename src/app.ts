import Fastify, { type FastifyServerOptions } from 'fastify';
import { getDbPool } from './providers/database';
import { apiRoutes } from './routes/apiRoutes';

export function serverBuild(opts: FastifyServerOptions = {}) {
	const app = Fastify(opts);

	app.decorate('db', getDbPool());

	app.register(apiRoutes);

	return app;
}
