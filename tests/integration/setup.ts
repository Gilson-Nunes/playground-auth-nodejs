import {
	PostgreSqlContainer,
	type StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import type { FastifyInstance } from 'fastify';
import type { Pool } from 'pg';
import { getDbPool } from '@/providers/database';
import { createTestServer } from '../helpers/server';

let container: StartedPostgreSqlContainer;
let dbPool: Pool;
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
	await dbPool.end();
	await container.stop();
}

beforeAll(async () => {
	await startDatabase();
	dbPool = getDbPool();
	app = await createTestServer();
}, 60000);

afterAll(async () => {
	await app.close();
	await stopDatabase();
});
