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
			const expectedToken = `Basic ${Buffer.from(
				`username:${hashPassword}`,
				'utf8',
			).toString('base64')}`;
			expect(response.headers.authorization).toBe(expectedToken);

			expect(response.cookies).toHaveLength(1);
			const cookie = response.cookies[0];
			expect(cookie.name).toBe('accessToken');
			expect(cookie.value).toBe(expectedToken);
			expect(cookie.path).toBe('/');
			expect(cookie.httpOnly).toBe(true);
			expect(cookie.sameSite).toBe('Strict');
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

	describe('GET /logout', () => {
		it('should logout a logged user', async () => {
			const saltRounds = 10;
			const salt = await bcrypt.genSalt(saltRounds);
			const hashPassword = await bcrypt.hash('password', salt);
			const client = getDbPool();
			await client.query(
				'INSERT INTO users (username, password) VALUES ($1, $2)',
				['username', hashPassword],
			);
			const loginResponse = await app.inject({
				method: 'POST',
				url: '/login',
				payload: {
					username: 'username',
					password: 'password',
				},
			});
			const loginToken = loginResponse.headers.authorization;
			const loginCookie = loginResponse.cookies[0];

			const logoutResponse = await app.inject({
				method: 'GET',
				url: '/logout',
				headers: {
					authorization: loginToken,
				},
				cookies: {
					accessToken: loginCookie.value,
				},
			});

			expect(logoutResponse.statusCode).toBe(204);
			const logoutToken = logoutResponse.headers.authorization;
			expect(logoutToken).toBeUndefined();

			expect(logoutResponse.cookies).toHaveLength(1);
			const logoutCookie = logoutResponse.cookies[0];
			expect(logoutCookie.name).toBe('accessToken');
			expect(logoutCookie.value).toBe('');
			expect(logoutCookie.maxAge).toBe(0);

			const protectedResponse = await app.inject({
				method: 'GET',
				url: '/protected',
				headers: logoutToken ? { authorization: logoutToken } : undefined,
			});

			expect(protectedResponse.statusCode).toBe(401);
			expect(protectedResponse.json()).toStrictEqual({ data: 'Access denied' });
		});
	});
});
