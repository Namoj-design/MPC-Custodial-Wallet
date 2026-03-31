import { FastifyRequest } from 'fastify';

export interface JwtPayload {
    userId: string;
    role: 'CLIENT' | 'WEALTH_MANAGER';
    dfnsUserId?: string;
}

declare module 'fastify' {
    interface FastifyRequest {
        user?: JwtPayload;
    }
}

// Keep the old export for compatibility, or just map it 
export type ApiRequest = FastifyRequest;
