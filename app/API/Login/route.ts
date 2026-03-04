import { NextRequest, NextResponse } from "next/server"; // Gunakan NextRequest

// Cache ini tetap di luar fungsi
const ipCache: Record<string, { attempts: number; lockoutUntil: number }> = {};

export async function POST(request: NextRequest) { // Tambah tipe NextRequest
  try {
    const now = Date.now();
    
    // Cara ambil IP yang lebih stabil di Vercel
    const ip = (request as any).ip || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
    
    const userData = ipCache[ip] || { attempts: 0, lockoutUntil: 0 };

    if (userData.lockoutUntil > now) {
      const retryAfter = Math.ceil((userData.lockoutUntil - now) / 1000);
      return NextResponse.json(
        { success: false, message: "Terlalu banyak percobaan. IP Anda diblokir.", retryAfter },
        { status: 429 }
      );
    }

    const { username, password } = await request.json();
    
    // Pastikan LOGIN_URL sudah diinput di Settings Vercel
    const res = await fetch(process.env.LOGIN_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    // Cek dulu apakah response-nya beneran JSON
    const data = await res.json();

    if (res.ok) {
      delete ipCache[ip];

      const response = NextResponse.json({ success: true, token: data.token });
      
      // PERBAIKAN UTAMA: Flag cookie agar terbaca di Vercel (HTTPS)
      response.cookies.set("auth_token", data.token, { 
        httpOnly: true, 
        secure: true,    // WAJIB TRUE untuk HTTPS/Vercel
        sameSite: "lax", // Aman dari CSRF tapi tetap bisa buat redirect
        path: "/",
        maxAge: 60 * 60 * 24 // Expired dalam 24 jam
      });
      
      return response;
    } else {
      userData.attempts += 1;
      
      if (userData.attempts >= 5) {
        userData.lockoutUntil = now + 15 * 60 * 1000; 
      }
      
      ipCache[ip] = userData;

      return NextResponse.json(
        { success: false, message: "Username atau password salah", attempts: userData.attempts },
        { status: 401 }
      );
    }
  } catch (err) {
    console.error("Login Error:", err);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}