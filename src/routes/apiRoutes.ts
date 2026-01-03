import type {
	FastifyInstance,
	FastifyReply,
	FastifyRequest,
	HookHandlerDoneFunction,
} from 'fastify';

export const apiRoutes = (app: FastifyInstance) => {
	app.get('/', async (_request: FastifyRequest, reply: FastifyReply) => {
		reply.status(200).send({ data: 'Home' });
	});

	app.get(
		'/protected',
		{
			onRequest: (
				request: FastifyRequest,
				reply: FastifyReply,
				done: HookHandlerDoneFunction,
			) => {
				const { authorization } = request.headers;
				if (!authorization || !authorization.startsWith('Basic ')) {
					reply.status(401).send({ data: 'Access denied' });
					return;
				}

				const token = authorization.split(' ')[1];
				const [username, password] = Buffer.from(token, 'base64')
					.toString('utf-8')
					.split(':');

				const notTheUsername = username !== process.env.BASIC_AUTH_USERNAME;
				const notThePassword = password !== process.env.BASIC_AUTH_PASSWORD;
				if (notTheUsername || notThePassword) {
					reply.status(401).send({ data: 'Access denied' });
					return;
				}
				done();
			},
		},
		async (_request: FastifyRequest, reply: FastifyReply) => {
			reply.status(200).send({ data: 'Content protected' });
		},
	);
};
