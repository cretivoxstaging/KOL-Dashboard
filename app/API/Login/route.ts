import { NextResponse } from "next/server";

// --- MEMORY CACHE (Taruh di luar fungsi POST) ---
const ipCache: Record<string, { attempts: number; lockoutUntil: number }> = {};

export async function POST(request: Request) {
  try {
    const now = Date.now();
    
    // Ambil IP Real
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";
    
    // Cek di Cache Server
    const userData = ipCache[ip] || { attempts: 0, lockoutUntil: 0 };

    // 1. Cek apakah IP ini masih dalam masa hukuman
    if (userData.lockoutUntil > now) {
      const retryAfter = Math.ceil((userData.lockoutUntil - now) / 1000);
      return NextResponse.json(
        { success: false, message: "Terlalu banyak percobaan. IP Anda diblokir.", retryAfter, ip },
        { status: 429 }
      );
    }

    const { username, password } = await request.json();
    const res = await fetch(process.env.LOGIN_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (res.ok) {
      // Login Sukses: Reset hukuman untuk IP ini di Server
      delete ipCache[ip];

      const response = NextResponse.json({ success: true, token: data.token });
      response.cookies.set("auth_token", data.token, { httpOnly: true, path: "/" });
      return response;
    } else {
      // Login Gagal: Update hitungan di Server
      userData.attempts += 1;
      
      if (userData.attempts >= 5) {
        userData.lockoutUntil = now + 15 * 60 * 1000; // 15 menit
      }
      
      // Simpan balik ke cache server
      ipCache[ip] = userData;

      return NextResponse.json(
        { success: false, message: "Username or password incorrect", attempts: userData.attempts },
        { status: 401 }
      );
    }
  } catch (err) {
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}