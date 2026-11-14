export type Role = "user" | "host" | "admin";

export interface JwtUser {
  id: string;
  email: string;
  userName?: string | null;
  name?: string | null;
  role: Role;
  avatar?: string | null;
}
