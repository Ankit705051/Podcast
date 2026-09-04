import type { User } from "@prisma/client";

declare module "socket.io" {
  interface Socket {
    user: Pick<User, "id" | "email" | "name">;
  }
}