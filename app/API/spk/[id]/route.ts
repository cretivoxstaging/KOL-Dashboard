import { NextResponse } from "next/server";

const API_URL = process.env.SPK_URL; 
const AUTH_TOKEN = process.env.SPK_TOKEN;

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const body = await req.json();

    console.log(`--- PROSES UPDATE ID: ${id} ---`);
    console.log("Data Baru:", body.talent_name, "| Brand:", body.brand_name);

    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { 
        Authorization: `Bearer ${AUTH_TOKEN}`, 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify(body),
    });
    
    const data = await res.json();
    console.log("Hasil dari Database Pusat:", data);
    
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE tetap sama seperti yang udah jalan
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
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