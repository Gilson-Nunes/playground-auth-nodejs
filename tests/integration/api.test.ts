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
		it('should show the message "Content protected" and status code 200', async () => {
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
