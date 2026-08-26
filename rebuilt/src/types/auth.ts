
export type Role = "user" | "host" | "admin";

export interface JwtUser {
  id: string;
  email: string;
  role: Role;
}