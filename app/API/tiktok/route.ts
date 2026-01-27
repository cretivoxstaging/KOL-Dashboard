import { NextResponse } from "next/server";

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

  if (!username) return NextResponse.json({ error: "Username wajib!" }, { status: 400 });

  const RAPID_KEY = process.env.RAPIDAPI_KEY;

  // --- KONFIGURASI PROVIDER ---
  const providers = [
    {
      name: "TikTok Scraper (Priority - 20/day)",
      host: "tiktok-scraper2.p.rapidapi.com",
      url: (user: string) => `https://tiktok-scraper2.p.rapidapi.com/user/info?unique_id=${user}`,
    },
    {
      name: "TikTok Scraper 7 (Backup 1)",
      host: "tiktok-scraper7.p.rapidapi.com",
      url: (user: string) => `https://tiktok-scraper7.p.rapidapi.com/user/info?unique_id=${user}`,
    },
    {
      name: "TikTok API 23 (Backup 2)",
      host: "tiktok-api23.p.rapidapi.com",
      url: (user: string) => `https://tiktok-api23.p.rapidapi.com/api/user/info?uniqueId=${user}`, // Note: API 23 pake uniqueId (pake 'I' gede)
    }
  ];

  let successData = null;

  for (const provider of providers) {
    try {
      console.log(`[TikTok Sync] Mencoba provider: ${provider.name}`);
      
      const res = await fetch(provider.url(username), {
        method: 'GET',
        headers: {
          'x-rapidapi-key': RAPID_KEY || '',
          'x-rapidapi-host': provider.host
        },
        next: { revalidate: 0 }
      });

      // Jika limit abis (429), lanjut ke provider berikutnya
      if (res.status === 429) {
        console.warn(`[Limit Out] ${provider.name} habis kuota, pindah...`);
        continue;
      }

      if (!res.ok) continue;

      const result = await res.json();
      
      // MAPPING DATA: Karena tiap API strukturnya bisa beda dikit
      // Kita coba tangkap semua kemungkinan path followers
      const followers = 
        result.data?.stats?.followerCount ||     // Struktur tiktok-scraper2
        result.userInfo?.stats?.followerCount || // Struktur tiktok-api23
        result.user?.stats?.followerCount ||     // Struktur tiktok-scraper7
        0;

      if (followers > 0) {
        successData = { followers: Math.floor(Number(followers)), providerName: provider.name };
        break; // Berhasil! Keluar dari loop
      }
    } catch (err: any) {
      console.error(`Error di ${provider.name}:`, err.message);
      continue;
    }
  }

  // JIKA SEMUA GAGAL
  if (!successData) {
    return NextResponse.json({ error: "Semua provider TikTok limit abis!" }, { status: 503 });
  }

  const { followers, providerName } = successData;
  const newTier = calculateTier(followers);

  // --- PUSH KE DATABASE PUSAT ---
  if (id && id !== "undefined" && process.env.TALENT_URL) {
    await fetch(`${process.env.TALENT_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.TALENT_TOKEN}`
      },
      body: JSON.stringify({
        tiktok_followers: String(followers),
        tier_tiktok: newTier,
        last_update: new Date().toISOString(),
        source: `Multi-Provider: ${providerName}`
      })
    });
  }

  return NextResponse.json({ 
    success: true, 
    followers: followers, 
    tier: newTier,
    provider: providerName
  });
}