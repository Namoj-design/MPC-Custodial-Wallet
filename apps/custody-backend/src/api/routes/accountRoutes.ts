import { createMpcHederaAccount } from "../controllers/accountController";

export async function accountRoutes(app: any) {
  app.post("/mpc/account", createMpcHederaAccount);
}