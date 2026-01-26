import { NextResponse } from "next/server";

// Fungsi Helper untuk hitung Tier (Biar Real-time hitung juga)
const calculateTier = (followers: number) => {
  if (followers >= 1000000) return "Mega";
  if (followers >= 100000) return "Macro";
  if (followers >= 10000) return "Micro";
  return "Nano";
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username")?.replace("@", "");

  if (!username) {
    return NextResponse.json({ error: "Username is required" }, { status: 400 });
  }

  try {
    // nembak langsung ke Instagram
    const igRes = await fetch(`https://www.instagram.com/${username}/`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      next: { revalidate: 0 },
    });

    const html = await igRes.text();
    const metaRegex = /<meta content="([\d,.]+[KMB]?)\s?(Followers|Pengikut)/i;
    const match = html.match(metaRegex);

    if (match) {
      let rawVal = match[1].replace(/,/g, "");
      let val = parseFloat(rawVal);

      if (rawVal.includes("K")) val *= 1000;
      else if (rawVal.includes("M")) val *= 1000000;
      else if (rawVal.includes("B")) val *= 1000000000;

      const followersCount = Math.floor(val);

      return NextResponse.json({
        status: "success",
        data: {
          username,
          followers: followersCount,
          tier: calculateTier(followersCount), // Langsung dapet Tier real-time
          source: "Scraping",
          last_update: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json({ error: "Akun private atau tidak ditemukan" }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: "Gagal nembak Instagram" }, { status: 500 });
  }
}