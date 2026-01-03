import type {
	FastifyReply,
	FastifyRequest,
	HookHandlerDoneFunction,
} from 'fastify';

export const basicAuthHook = (
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
};
