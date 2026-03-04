import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });

  // Cara hapus cookie: set expired ke masa lalu atau maxAge ke 0
  response.cookies.set("auth_token", "", {
    httpOnly: true,
    expires: new Date(0), // Langsung kadaluarsa sekarang juga
    path: "/",
  });

  return response;
}