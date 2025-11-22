import { createServer } from "./server";

const app = createServer();
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[API] MPC Wallet backend listening on port ${PORT}`);
});

export default app;