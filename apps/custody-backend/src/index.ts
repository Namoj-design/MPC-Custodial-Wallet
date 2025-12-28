import { buildServer } from "./api/server.ts";

const start = async () => {
  const app = await buildServer();

  await app.listen({
    port: 3001,
    host: "0.0.0.0",
  });

  console.log("Custody backend running on port 3001");
};

start().catch((err) => {
  console.error(err);
  process.exit(1);
});