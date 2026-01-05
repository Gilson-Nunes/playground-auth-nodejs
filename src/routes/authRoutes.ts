import bcrypt from 'bcrypt';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { DatabaseError } from 'pg';

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
};
