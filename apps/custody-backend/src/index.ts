import 'dotenv/config';
import { createServer } from './api/server.js';
import { MPCWebSocketServer } from './mpc/ws.js';
import { intentRepo, auditRepo, orchestrator } from './services/container.js';

/**
 * Main application entry point
 */
async function main(): Promise<void> {
    console.log('🚀 Starting MPC Custody Backend...');

    // Validate environment
    validateEnvironment();

    // Start REST API server
    const port = parseInt(process.env.PORT || '3001', 10);
    const host = process.env.HOST || '0.0.0.0';

    const server = await createServer();

    try {
        await server.listen({ port, host });
        console.log(`✅ REST API server listening on ${host}:${port}`);
    } catch (error) {
        console.error('❌ Failed to start REST API server:', error);
        process.exit(1);
    }

    // Start WebSocket MPC server
    const wsPort = port; // Use same port for WebSocket (can be different)
    try {
        const mpcServer = new MPCWebSocketServer(wsPort, intentRepo, auditRepo);
        orchestrator.setMPCServer(mpcServer);
        console.log(`✅ MPC WebSocket server listening on port ${wsPort}`);
    } catch (error) {
        console.error('❌ Failed to start MPC WebSocket server:', error);
        process.exit(1);
    }

    console.log('✨ MPC Custody Backend is ready!');
    console.log(`   REST API: http://${host}:${port}`);
    console.log(`   WebSocket: ws://${host}:${wsPort}/mpc`);
    console.log(`   Health: http://${host}:${port}/health`);

    // Graceful shutdown
    const shutdown = async (signal: string) => {
        console.log(`\n📋 Received ${signal}, shutting down gracefully...`);
        await server.close();
        console.log('✅ Server closed');
        process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
}

/**
 * Validate required environment variables
 */
function validateEnvironment(): void {
    const required = [
        'HEDERA_NETWORK',
        'HEDERA_OPERATOR_ID',
        'HEDERA_OPERATOR_KEY',
        'HEDERA_MPC_ACCOUNT_ID'
    ];

    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
        console.error('❌ Missing required environment variables:');
        missing.forEach(key => console.error(`   - ${key}`));
        console.error('\n💡 Copy .env.example to .env and fill in the values');
        process.exit(1);
    }

    console.log('✅ Environment variables validated');
}

// Start the application
main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});
