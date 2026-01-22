import { NextResponse } from "next/server";

export async function GET(req: Request) {
  // 1. Cek Auth Sederhana agar tidak sembarang orang bisa nembak API ini
  const { searchParams } = new URL(req.url);
  if (searchParams.get("key") !== "rahasia_ipb_2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2. Ambil 50 data paling lama dari Database Pusat lo
    const resAll = await fetch(`${process.env.TALENT_URL}`, {
      headers: { Authorization: `Bearer ${process.env.TALENT_TOKEN}` }
    });
    const allData = await resAll.json();
    
    // Sort berdasarkan last_update paling lama, ambil 50
    const batch = allData.data
      .sort((a: any, b: any) => new Date(a.last_update).getTime() - new Date(b.last_update).getTime())
      .slice(0, 50);

    let updated = 0;

    for (const talent of batch) {
      try {
        // 3. Scraping Instagram
        const username = talent.instagram_username.replace("@", "");
        const igRes = await fetch(`https://www.instagram.com/${username}/`, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" }
        });
        const html = await igRes.text();
        const metaRegex = /<meta content="([\d,.]+[KMB]?)\s?(Followers|Pengikut)/i;
        const match = html.match(metaRegex);

        if (match) {
          let val = parseFloat(match[1].replace(/,/g, ''));
          if (match[1].includes('K')) val *= 1000;
          if (match[1].includes('M')) val *= 1000000;

          // 4. Update ke Database Pusat
          await fetch(`${process.env.TALENT_URL}/${talent.id}`, {
            method: "PUT",
            headers: { 
              Authorization: `Bearer ${process.env.TALENT_TOKEN}`,
              "Content-Type": "application/json" 
            },
            body: JSON.stringify({
              ...talent,
              instagram_followers: String(Math.floor(val)),
              last_update: new Date().toISOString() // Update timestamp
            })
          });
          updated++;
        }
        // Jeda 2 detik biar gak kena ban
        await new Promise(r => setTimeout(r, 2000));
      } catch (e) {
        console.error(`Gagal update @${talent.instagram_username}`);
      }
    }

    return NextResponse.json({ message: `Siklus selesai. ${updated} talent diperbarui.` });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}