import { getDbPool } from '@/providers/database';
import { app } from './setup';

describe('Auth routes', () => {
	describe('POST /register', () => {
		it('should register a new user', async () => {
			const response = await app.inject({
				method: 'POST',
				url: '/register',
				payload: {
					username: 'username',
					password: 'password',
				},
			});

			expect(response.statusCode).toBe(201);
			expect(response.json()).toStrictEqual({ data: 'User registered' });

			const client = getDbPool();
			const result = await client.query('SELECT * FROM users');
			expect(result.rows).toHaveLength(1);
		});

		it('should not register a new user when user already exists', async () => {
			const client = getDbPool();
			await client.query(
				"INSERT INTO users (username, password) VALUES ('existing-username', 'password')",
			);

			const response = await app.inject({
				method: 'POST',
				url: '/register',
				payload: {
					username: 'existing-username',
					password: 'password',
				},
			});

			expect(response.statusCode).toBe(400);
			expect(response.json()).toStrictEqual({ data: 'Error registering user' });

			const result = await client.query('SELECT * FROM users');
			expect(result.rows).toHaveLength(1);
		});
	});
});
