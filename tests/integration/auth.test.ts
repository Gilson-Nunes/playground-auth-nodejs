import bcrypt from 'bcrypt';
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

	describe('POST /login', () => {
		it('should login a registered user', async () => {
			const saltRounds = 10;
			const salt = await bcrypt.genSalt(saltRounds);
			const hashPassword = await bcrypt.hash('password', salt);
			const client = getDbPool();
			await client.query(
				'INSERT INTO users (username, password) VALUES ($1, $2)',
				['username', hashPassword],
			);

			const response = await app.inject({
				method: 'POST',
				url: '/login',
				payload: {
					username: 'username',
					password: 'password',
				},
			});

			expect(response.statusCode).toBe(200);
			expect(response.json()).toStrictEqual({ data: 'User logged' });
			console.log(response.headers.authorization);
			// expect(response.headers.authorization).toBeDefined();
		});

		it('should not login a not registered user', async () => {
			const response = await app.inject({
				method: 'POST',
				url: '/login',
				payload: {
					username: 'username',
					password: 'password',
				},
			});

			expect(response.statusCode).toBe(400);
			expect(response.json()).toStrictEqual({ data: 'Login error' });
		});
	});
});
