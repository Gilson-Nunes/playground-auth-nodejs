import type { FastifyReply, FastifyRequest } from 'fastify';

export async function logoutController(
	_request: FastifyRequest,
	reply: FastifyReply,
) {
	reply.clearCookie('accessToken', { path: '/' });
	reply.status(204).send();
}
