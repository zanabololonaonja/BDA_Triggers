import { NextResponse } from "next/server";
import { getSession } from "../../../../lib/auth";

export async function GET() {
  const session = await getSession();
  
  if (!session || !session.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  return NextResponse.json({ user: session.user }, { status: 200 });
}
