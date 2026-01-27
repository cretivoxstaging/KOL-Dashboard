import { NextResponse } from "next/server";

// Fungsi helper untuk menentukan Tier berdasarkan jumlah followers
const calculateTier = (followers: number) => {
  if (followers >= 1000000) return "Mega";
  if (followers >= 100000) return "Macro";
  if (followers >= 10000) return "Micro";
  return "Nano";
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username")?.replace("@", "").trim();
  const id = searchParams.get("id");

  // 1. Validasi Input
  if (!username) {
    return NextResponse.json({ error: "Username wajib ada!" }, { status: 400 });
  }

  // 2. Ambil Config dari ENV
  const RAPID_KEY = process.env.RAPIDAPI_KEY;
  const DB_URL = process.env.TALENT_URL;
  const DB_TOKEN = process.env.TALENT_TOKEN;

  if (!RAPID_KEY) {
    return NextResponse.json({ error: "RAPIDAPI_KEY belum di-set di .env.local" }, { status: 500 });
  }

  try {
    // 3. Tembak RapidAPI menggunakan endpoint Profile by URL
    const targetUrl = `https://www.instagram.com/${username}/`;
    
    const apiRes = await fetch(
      `https://instagram-statistics-api.p.rapidapi.com/community?url=${encodeURIComponent(targetUrl)}`,
      {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": RAPID_KEY,
          "X-RapidAPI-Host": "instagram-statistics-api.p.rapidapi.com",
        },
        next: { revalidate: 0 }, // Pastikan tidak ambil cache lama
      }
    );

    const result = await apiRes.json();

    // 4. Ambil angka followers dari field 'usersCount' (berdasarkan debug sebelumnya)
    const followersCount = result.data?.usersCount || result.usersCount;

    if (followersCount !== undefined && followersCount !== null) {
      const finalFollowers = Math.floor(Number(followersCount));
      const newTier = calculateTier(finalFollowers);

      // 5. Update ke Database Pusat lo (TALENT_URL) jika ada parameter 'id'
      if (id && id !== "undefined" && DB_URL) {
        try {
          const updateRes = await fetch(`${DB_URL}/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${DB_TOKEN}`,
            },
            body: JSON.stringify({
              instagram_followers: String(finalFollowers),
              tier_ig: newTier,
              tier: newTier, // Menyamakan tier utama dengan tier IG
              last_update: new Date().toISOString(),
              source: "RapidAPI",
            }),
          });

          if (!updateRes.ok) {
            console.error("Gagal update ke Database Pusat");
          }
        } catch (dbErr) {
          console.error("DB Error:", dbErr);
        }
      }

      // 6. Respon balik ke Frontend
      return NextResponse.json({
        success: true,
        username: username,
        followers: finalFollowers,
        tier: newTier,
        source: "RapidAPI",
        last_update: new Date().toISOString()
      });
    }

    // Jika JSON dapet tapi field usersCount ga ada
    return NextResponse.json(
      { error: "Data followers tidak ditemukan", received_json: result },
      { status: 404 }
    );

  } catch (error: any) {
    console.error("RapidAPI Router Error:", error.message);
    return NextResponse.json({ error: "Server error: " + error.message }, { status: 500 });
  }
}