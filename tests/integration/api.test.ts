import { serverBuild } from '@/app';

const app = serverBuild();

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
});
