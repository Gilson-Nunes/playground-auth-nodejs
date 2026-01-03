import { serverBuild } from './app';

const app = serverBuild({ logger: process.env.NODE_ENV === 'development' });

app.listen({ port: Number(process.env.PORT) }, (err, address) => {
	if (err) {
		app.log.error(err);
		process.exit(1);
	}
	app.log.info(`Server listening at ${address}`);
});
