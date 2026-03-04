import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.SPK_URL; 
const AUTH_TOKEN = process.env.SPK_TOKEN;

export async function PUT(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const spkNumber = decodeURIComponent(id);

    console.log(`--- PROSES UPDATE SPK NUMBER: ${spkNumber} ---`);

    const res = await fetch(`${API_URL}/number?spk_number=${spkNumber}`, {
      method: "PUT",
      headers: { 
        Authorization: `Bearer ${AUTH_TOKEN}`, 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify(body),
    });
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}