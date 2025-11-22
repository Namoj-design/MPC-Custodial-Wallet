// backend/auth/roles.ts

export type Role = "USER" | "ADMIN" | "SUPERADMIN";

export const RoleHierarchy: Record<Role, number> = {
  USER: 1,
  ADMIN: 5,
  SUPERADMIN: 10,
};

export function hasRequiredRole(userRole: Role, requiredRole: Role): boolean {
  return RoleHierarchy[userRole] >= RoleHierarchy[requiredRole];
}