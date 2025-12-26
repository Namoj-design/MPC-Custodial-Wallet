import Fastify from "fastify";
import dotenv from "dotenv";

dotenv.config();

const app = Fastify({ logger: true });

app.get("/health", async (request, reply) => {
  return { status: "ok", service: "custody-backend" };
});

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

if (isNaN(PORT)) {
  throw new Error("Invalid PORT environment variable");
}

const startServer = async () => {
  try {
    await app.listen({ port: PORT });
    app.log.info(`Custody backend running on port ${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

startServer();