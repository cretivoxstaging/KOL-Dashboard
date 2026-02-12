import { NextResponse } from "next/server";

// Pastikan variabel env ini sesuai dengan yang lo pake di route utama
const API_URL = process.env.SPK_URL; 
const AUTH_TOKEN = process.env.SPK_TOKEN;

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params; // Langsung dapet dari folder [id]
    const body = await req.json();

    const res = await fetch(`${API_URL}/${id}`, {
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

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params; // Tambahkan await buat jaga-jaga di Next.js versi baru

    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
    });
    
    const data = await res.json();
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.log("ERROR DELETE:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}