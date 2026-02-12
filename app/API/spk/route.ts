import { NextResponse } from "next/server";

const API_URL = process.env.SPK_URL;
const AUTH_TOKEN = process.env.SPK_TOKEN;

// LOGIKA GET (Ambil Data untuk Tabel)
export async function GET() {
  try {
    const res = await fetch(`${API_URL}`, {
      headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!API_URL || !AUTH_TOKEN) {
      return NextResponse.json({ error: "Env Gagal Terbaca" }, { status: 500 });
    }

    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
