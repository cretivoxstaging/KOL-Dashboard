import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // 1. Cek apakah URL API sudah di-set di Vercel
    const loginUrl = process.env.LOGIN_URL;
    if (!loginUrl) {
      return NextResponse.json(
        { success: false, message: "LOGIN_URL belum di-set di Environment Variables Vercel" },
        { status: 500 }
      );
    }

    const { username, password } = await request.json();

    // 2. Tembak ke Backend
    const res = await fetch(loginUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    // --- STRATEGI SKAKMAT MULAI DI SINI ---
    
    // Kita ambil sebagai TEXT dulu, jangan langsung .json()
    const rawText = await res.text(); 
    
    let data;
    try {
      // Coba ubah teks tadi jadi JSON
      data = JSON.parse(rawText);
    } catch (parseError) {
      // KALAU GAGAL (Artinya isinya HTML error atau teks aneh)
      
      return NextResponse.json({
        success: false,
        message: "Server Backend tidak mengirim data JSON (Mungkin error 404/502/504)",
        // Kita kirim 150 karakter pertama biar lo bisa liat di Inspect Element (Network Tab)
        debug_preview: rawText.substring(0, 150), 
        status_code: res.status
      }, { status: 502 });
    }

    // 3. Jika berhasil dapet JSON, cek status response-nya
    if (res.ok) {
      // Cari token (Smart Token Finder)
      const token = data.token || 
                    data.access_token || 
                    data.data?.token || 
                    data.data?.access_token;

      if (!token) {
        return NextResponse.json({
          success: false,
          message: "Login Berhasil, tapi Token tidak ditemukan di dalam JSON",
          debug_json: data // Kita intip isi JSON-nya
        }, { status: 502 });
      }

      // 4. Set Cookie jika token ketemu
      const response = NextResponse.json({ success: true, token });
      response.cookies.set("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 // 24 jam
      });

      return response;

    } else {
      // Jika res.ok FALSE (401 Unauthorized, dsb) tapi dapet JSON
      return NextResponse.json({
        success: false,
        message: data.message || "Username atau Password salah",
        status_code: res.status
      }, { status: res.status });
    }

  } catch (err: any) {
    console.error("💥 CRITICAL ERROR:", err.message);
    return NextResponse.json({
      success: false,
      message: "Internal Server Error di API Route",
      error: err.message
    }, { status: 500 });
  }
}