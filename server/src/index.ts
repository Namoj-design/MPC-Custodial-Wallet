import 'dotenv/config';
import { buildServer } from './server';
import { initWebSocket } from './services/websocketService';

const PORT = Number(process.env.PORT) || 3001;

async function run() {
    try {
        const app = await buildServer();
        await app.listen({ port: PORT, host: '0.0.0.0' });
        initWebSocket();
        app.log.info(`Server running on port ${PORT}`);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
