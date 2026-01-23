import { NextResponse } from "next/server";

// Ambil dari .env
const API_URL = process.env.TALENT_URL;
const AUTH_TOKEN = process.env.TALENT_TOKEN;

// Logika GET (Ambil Data)
export async function GET() {
  const res = await fetch(`${API_URL}`, {
    headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
    cache: "no-store",
  });
  const data = await res.json();
  return NextResponse.json(data);
}

// Logika POST (Tambah Data)
export async function POST(req: Request) {
  const body = await req.json();
  const res = await fetch(`${API_URL}`, {
    method: "POST",
    headers: { 
      Authorization: `Bearer ${AUTH_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  console.log("LOG DARI DB PUSAT:", data);
  return NextResponse.json(data);
}