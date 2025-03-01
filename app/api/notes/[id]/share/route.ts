import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/app/lib/prisma";
import { authOptions } from "@/app/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const note = await prisma.note.findUnique({
      where: { id: params.id },
      include: {
        sharedWith: true,
      },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    if (note.authorId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userToShare = await prisma.user.findUnique({
      where: { email },
    });

    if (!userToShare) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if note is already shared with the user
    const isAlreadyShared = note.sharedWith.some(
      (share) => share.userId === userToShare.id
    );

    if (isAlreadyShared) {
      return NextResponse.json(
        { error: "Note already shared with this user" },
        { status: 400 }
      );
    }

    const sharedNote = await prisma.sharedNote.create({
      data: {
        noteId: note.id,
        userId: userToShare.id,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(sharedNote);
  } catch (error) {
    console.error("Error sharing note:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const note = await prisma.note.findUnique({
      where: { id: params.id },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    if (note.authorId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userToRemove = await prisma.user.findUnique({
      where: { email },
    });

    if (!userToRemove) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    await prisma.sharedNote.delete({
      where: {
        noteId_userId: {
          noteId: note.id,
          userId: userToRemove.id,
        },
      },
    });

    return NextResponse.json({ message: "Share removed successfully" });
  } catch (error) {
    console.error("Error removing share:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 