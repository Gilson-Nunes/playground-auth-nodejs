import bcrypt from 'bcrypt';
import type {
	FastifyReply,
	FastifyRequest,
	HookHandlerDoneFunction,
} from 'fastify';
import { getDbPool } from '@/providers/database';

export const basicAuthHook = async (
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

	const isTheUsername = username === process.env.BASIC_AUTH_USERNAME;
	const isThePassword = password === process.env.BASIC_AUTH_PASSWORD;
	if (isTheUsername || isThePassword) {
		done();
	}

	const dbPool = getDbPool();
	const findOneByNameQuery = `SELECT * FROM users WHERE username = $1`;
	const { rows } = await dbPool.query(findOneByNameQuery, [username]);
	const user = rows[0];
	if (!user) {
		reply.status(401).send({ data: 'Access denied' });
		return;
	}
	const match = await bcrypt.compare(password, user.password);
	if (!match) {
		reply.status(401).send({ data: 'Access denied' });
		return;
	}
	done();
};
