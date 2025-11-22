// backend/auth/authService.ts

import { hashPassword, verifyPassword } from "./password";
import { signToken } from "./jwt";
import { Role } from "./roles";

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
}

// Temporary in-memory DB (replace with PostgreSQL or Mongo later)
const users = new Map<string, UserRecord>();

export class AuthService {
  async signup(email: string, password: string, role: Role = "USER") {
    const existing = [...users.values()].find((u) => u.email === email);
    if (existing) throw new Error("Email already registered");

    const passwordHash = await hashPassword(password);

    const user: UserRecord = {
      id: `user_${Date.now()}`,
      email,
      passwordHash,
      role,
    };

    users.set(user.id, user);
    return user;
  }

  async login(email: string, password: string) {
    const user = [...users.values()].find((u) => u.email === email);
    if (!user) throw new Error("Invalid credentials");

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) throw new Error("Invalid credentials");

    const token = signToken({
      userId: user.id,
      role: user.role,
    });

    return { token, user };
  }

  async getUserById(id: string): Promise<UserRecord | undefined> {
    return users.get(id);
  }
}