import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/app/lib/prisma";
import { authOptions } from "@/app/lib/auth";
import { sendShareNoteEmail } from "@/app/lib/email";

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

    // Find the user to share with
    const userToShare = await prisma.user.findUnique({
      where: { email },
    });

    if (!userToShare) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Find the note
    const note = await prisma.note.findUnique({
      where: { id: params.id },
      include: {
        sharedWith: true,
        author: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!note) {
      return NextResponse.json(
        { error: "Note not found" },
        { status: 404 }
      );
    }

    // Check if user is already shared with
    const alreadyShared = note.sharedWith.some(
      (share) => share.userId === userToShare.id
    );

    if (alreadyShared) {
      return NextResponse.json(
        { error: "Note already shared with this user" },
        { status: 400 }
      );
    }

    // Create share record
    await prisma.sharedNote.create({
      data: {
        userId: userToShare.id,
        noteId: note.id,
      },
    });

    // Send email notification
    const noteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/notes/${note.id}`;
    await sendShareNoteEmail(
      email,
      session.user.email,
      note.title,
      noteUrl
    );

    return NextResponse.json({ message: "Note shared successfully" });
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