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

async function initializeDatabase() {
	dbPool = getDbPool();
	await dbPool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(30) NOT NULL UNIQUE,
      password VARCHAR(60) NOT NULL
    );
  `);
}

export async function stopDatabase() {
	await dbPool.end();
	await container.stop();
}

beforeAll(async () => {
	await startDatabase();
	await initializeDatabase();
	app = await createTestServer();
}, 60000);

afterEach(async () => {
	await dbPool.query(`
		DO $$
		DECLARE
			r RECORD;
		BEGIN
			FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
				EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' RESTART IDENTITY CASCADE';
			END LOOP;
		END $$;
	`);
});

afterAll(async () => {
	await app.close();
	await stopDatabase();
});
