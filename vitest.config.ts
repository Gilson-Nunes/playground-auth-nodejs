import { loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => ({
	test: {
		globals: true,
		environment: 'node',
		clearMocks: true,
		pool: 'threads',
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			reportsDirectory: './coverage',
			all: true,
			include: ['src/**/*.ts'],
			exclude: ['tests/**/*.ts'],
		},
		passWithNoTests: false,
		env: loadEnv(mode, process.cwd(), ''),
	},
	plugins: [tsconfigPaths()],
	esbuild: {
		sourcemap: true,
	},
}));
