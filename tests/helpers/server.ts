import { serverBuild } from '@/app';

export const createTestServer = async () => {
	const testServer = serverBuild();
	await testServer.ready();
	return testServer;
};
