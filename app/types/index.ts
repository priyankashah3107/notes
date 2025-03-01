import { User as PrismaUser } from "@prisma/client";

export type SafeUser = Omit<PrismaUser, "password">;

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
    };
  }
}

export interface SharedNote {
  userId: string;
  noteId: string;
  user?: PrismaUser;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  author?: PrismaUser;
  sharedWith?: SharedNote[];
} 