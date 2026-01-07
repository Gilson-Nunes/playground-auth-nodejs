import bcrypt from 'bcrypt';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { DatabaseError } from 'pg';
import { basicAuthHook } from '@/hooks/basicAuthHook';

export const authRoutes = (app: FastifyInstance) => {
	app.post(
		'/register',
		async (
			request: FastifyRequest<{
				Body: {
					username: string;
					password: string;
				};
			}>,
			reply: FastifyReply,
		) => {
			const { username, password } = request.body;

			try {
				const saltRounds = 10;
				const salt = await bcrypt.genSalt(saltRounds);
				const hashPassword = await bcrypt.hash(password, salt);
				const insertOneQuery = `INSERT INTO users (username, password)VALUES ($1, $2)`;
				await app.db.query(insertOneQuery, [username, hashPassword]);
				reply.status(201).send({ data: 'User registered' });
			} catch (error) {
				if (error instanceof DatabaseError && error.code === '23505') {
					reply.status(400).send({ data: 'Error registering user' });
					return;
				}
				throw error;
			}
		},
	);

	app.post(
		'/login',
		async (
			request: FastifyRequest<{
				Body: {
					username: string;
					password: string;
				};
			}>,
			reply: FastifyReply,
		) => {
			const { username, password } = request.body;

			try {
				const findOneByNameQuery = `SELECT * FROM users WHERE username = $1`;
				const { rows } = await app.db.query(findOneByNameQuery, [username]);
				if (!rows.length) {
					reply.status(400).send({ data: 'Login error' });
					return;
				}
				const user = rows[0];
				const match = await bcrypt.compare(password, user.password);
				if (!match) {
					reply.status(400).send({ data: 'Login error' });
					return;
				}
				const token = `Basic ${Buffer.from(
					`${user.username}:${user.password}`,
					'utf8',
				).toString('base64')}`;
				reply.header('Authorization', token);
				reply.setCookie('accessToken', token, {
					path: '/',
					secure: process.env.NODE_ENV === 'production',
					httpOnly: true,
					sameSite: 'strict',
					maxAge: 1800,
				});

				reply.status(200).send({ data: 'User logged' });
			} catch (error) {
				if (error instanceof DatabaseError) {
					reply.status(500).send({ data: 'Internal Server Error' });
					return;
				}
				throw error;
			}
		},
	);

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
