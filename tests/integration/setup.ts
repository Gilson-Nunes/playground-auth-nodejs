import {
	PostgreSqlContainer,
	type StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { afterAll, beforeAll } from 'vitest';

let container: StartedPostgreSqlContainer;

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
});

afterAll(async () => {
	await stopDatabase();
});
