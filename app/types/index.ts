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

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  author?: {
    name: string;
    email: string;
  };
  sharedWith: SharedNote[];
}

export interface SharedNote {
  id: string;
  noteId: string;
  userId: string;
  createdAt: Date;
  user: {
    name: string;
    email: string;
  };
} 