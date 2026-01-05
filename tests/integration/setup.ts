import {
	PostgreSqlContainer,
	type StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import type { FastifyInstance } from 'fastify';
import { createTestServer } from '../helpers/server';

let container: StartedPostgreSqlContainer;
export let app: FastifyInstance;

export async function startDatabase() {
	container = await new PostgreSqlContainer('postgres:16-alpine')
		.withDatabase('testdb')
		.withUsername('test')
		.withPassword('test')
		.start();

	process.env.DATABASE_URL = container.getConnectionUri();
}

export async function stopDatabase() {
	await container.stop();
}

beforeAll(async () => {
	await startDatabase();
	app = await createTestServer();
}, 60000);

afterAll(async () => {
	await app.close();
	await stopDatabase();
});
