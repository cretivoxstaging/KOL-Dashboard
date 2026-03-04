import { NextRequest, NextResponse } from "next/server";

// Cache untuk rate limiting (akan reset jika serverless restart)
const ipCache: Record<string, { attempts: number; lockoutUntil: number }> = {};

export async function POST(request: NextRequest) {
  try {
    // 1. Validasi LOGIN_URL
    if (!process.env.LOGIN_URL) {
      console.error("❌ LOGIN_URL is not defined in environment variables");
      return NextResponse.json(
        { success: false, message: "Server configuration error: LOGIN_URL not set" },
        { status: 500 }
      );
    }

    const now = Date.now();
    
    // 2. Ambil IP (Gunakan 'as any' untuk menghindari error TS di property .ip)
    const ip = (request as any).ip || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
    
    // 3. Rate Limiting Logic
    const userData = ipCache[ip] || { attempts: 0, lockoutUntil: 0 };

    if (userData.lockoutUntil > now) {
      const retryAfter = Math.ceil((userData.lockoutUntil - now) / 1000);
      return NextResponse.json(
        { success: false, message: "Terlalu banyak percobaan. IP Anda diblokir sementara.", retryAfter },
        { status: 429 }
      );
    }

    const { username, password } = await request.json();
    
    // 4. Fetch ke Backend API
    console.log(`📡 Attempting login to: ${process.env.LOGIN_URL}`);
    const res = await fetch(process.env.LOGIN_URL, {
      method: "POST", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    // 5. Parse Response JSON
    let data;
    try {
      data = await res.json();
    } catch (parseError) {
      console.error("❌ Failed to parse response as JSON:", parseError);
      return NextResponse.json(
        { success: false, message: "Invalid response from authentication server" },
        { status: 502 }
      );
    }

    // 6. Handle Success Response
    if (res.ok) {
      delete ipCache[ip];

      // --- SMART TOKEN FINDER ---
      // Mencari token di berbagai kemungkinan field yang sering dipakai API
      const token = data.token || 
                    data.access_token || 
                    data.data?.token || 
                    data.data?.access_token ||
                    data.result?.token;

      if (!token) {
        console.error("❌ Authentication succeeded but NO TOKEN found in response:", data);
        return NextResponse.json(
          { 
            success: false, 
            message: "Login berhasil di server, tapi token tidak ditemukan.",
            debug: process.env.NODE_ENV === "development" ? data : undefined 
          },
          { status: 502 }
        );
      }

      console.log("✅ Login successful for:", username);
      const response = NextResponse.json({ success: true, token: token });
      
      // 7. Set Secure Cookie
      response.cookies.set("auth_token", token, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === "production", // Wajib true di Vercel (HTTPS)
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 // 24 jam
      });
      
      return response;

    } else {
      // 8. Handle Gagal Login (401, dsb)
      userData.attempts += 1;
      if (userData.attempts >= 5) {
        userData.lockoutUntil = now + 15 * 60 * 1000; // Blokir 15 menit
      }
      ipCache[ip] = userData;

      return NextResponse.json(
        { 
          success: false, 
          message: data.message || "Username atau password salah", 
          attempts: userData.attempts 
        },
        { status: 401 }
      );
    }

  } catch (err: any) {
    // 9. Global Error Catch
    console.error("💥 Critical Login Error:", err.message);
    return NextResponse.json(
      { 
        success: false, 
        message: "Internal Server Error",
        error: process.env.NODE_ENV === "development" ? err.message : undefined
      }, 
      { status: 500 }
    );
  }
}