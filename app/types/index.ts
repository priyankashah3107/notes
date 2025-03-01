import { User } from "@prisma/client";

export type SafeUser = Omit<User, "password">;

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
    };
  }
}

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
}

export interface SharedNote {
  userId: string;
  noteId: string;
  user?: User;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  author?: User;
  sharedWith?: SharedNote[];
} 