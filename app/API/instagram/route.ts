import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username) return NextResponse.json({ error: "Username wajib!" }, { status: 400 });

  try {
    const response = await fetch(`https://www.instagram.com/${username}/`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      },
      next: { revalidate: 3600 } // Cache hasil scrap selama 1 jam
    });

    const html = await response.text();
    const metaRegex = /<meta content="([\d,.]+[KMB]?)\s?(Followers|Pengikut)/i;
    const match = html.match(metaRegex);

    if (match) {
      const rawValue = match[1].replace(/,/g, '');
      let followerCount = parseFloat(rawValue);
      if (rawValue.includes('K')) followerCount *= 1000;
      if (rawValue.includes('M')) followerCount *= 1000000;

      return NextResponse.json({ followers: Math.floor(followerCount) });
    }

    return NextResponse.json({ error: "Gagal ekstrak" }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}