import Fastify, { type FastifyServerOptions } from 'fastify';
import { apiRoutes } from './routes/apiRoutes';

export function serverBuild(opts: FastifyServerOptions = {}) {
	const app = Fastify(opts);

	app.register(apiRoutes);

	return app;
}
