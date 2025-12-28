import { createMpcHederaAccount } from "../controllers/accountController.ts";

export async function accountRoutes(app: any) {
  app.post("/mpc/account", createMpcHederaAccount);
}