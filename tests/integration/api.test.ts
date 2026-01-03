import { app } from '../helpers/server';

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

	describe('GET /', () => {
		it('should show the message "Access denied" and status code 200', async () => {
			const response = await app.inject({
				method: 'GET',
				url: '/protected',
			});

			expect(response.statusCode).toBe(401);
			expect(response.json()).toStrictEqual({ data: 'Access denied' });
		});
	});
});
