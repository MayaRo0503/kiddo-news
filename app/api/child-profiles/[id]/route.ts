import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const updatedChildProfile = await prisma.childProfile.update({
      where: { id: params.id },
      data: {
        timeLimit: data.timeLimit,
      },
    });
    return NextResponse.json(updatedChildProfile);
  } catch (error) {
    console.error("Error updating child profile:", error);
    return NextResponse.json(
      { error: "Failed to update child profile" },
      { status: 500 }
    );
  }
}
