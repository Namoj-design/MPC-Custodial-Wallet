// backend/src/api/index.ts
import "dotenv/config";
import { createServer } from "./server";

const port = process.env.PORT || 4000;

const app = createServer();

app.listen(port, () => {
  console.log(` Backend API running on http://localhost:${port}`);
});