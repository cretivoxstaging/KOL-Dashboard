import { NextResponse } from "next/server";

const API_URL = process.env.TALENT_URL;
const AUTH_TOKEN = process.env.TALENT_TOKEN;

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { id } = await params;
  const body = await req.json();
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${AUTH_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { id } = await params;
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
  });
  const data = await res.json();
  return NextResponse.json(data);
}