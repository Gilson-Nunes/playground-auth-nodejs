import bcrypt from 'bcrypt';
import { getDbPool } from '@/providers/database';
import { app } from './setup';

describe('Api routes', () => {
	describe('GET /', () => {
		it('should show message "Home" and status code 200', async () => {
			const response = await app.inject({
				method: 'GET',
				url: '/',
			});

			expect(response.statusCode).toBe(200);
			expect(response.json()).toStrictEqual({ data: 'Home' });
		});
	});

	describe('GET /protected', () => {
		it('should show the message "Content protected" and status code 200 when use application token', async () => {
			const response = await app.inject({
				method: 'GET',
				url: '/protected',
				headers: {
					authorization: `Basic ${Buffer.from(
						'username:password',
						'utf8',
					).toString('base64')}`,
				},
			});

			expect(response.statusCode).toBe(200);
			expect(response.json()).toStrictEqual({ data: 'Content protected' });
		});

		it('should show the message "Content protected" and status code 200 when use user token', async () => {
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
			const token = loginResponse.headers.authorization;

			const response = await app.inject({
				method: 'GET',
				url: '/protected',
				headers: {
					authorization: token,
				},
			});

			expect(response.statusCode).toBe(200);
			expect(response.json()).toStrictEqual({ data: 'Content protected' });
		});

		it('should show the message "Access denied" and status code 401', async () => {
			const response = await app.inject({
				method: 'GET',
				url: '/protected',
			});

			expect(response.statusCode).toBe(401);
			expect(response.json()).toStrictEqual({ data: 'Access denied' });
		});
	});
});
