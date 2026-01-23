import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  
  // 1. Auth Check (Wajib biar gak di-spam orang)
  if (searchParams.get("key") !== "rahasia_ipb_2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2. Fetch data dari DB Pusat lo
    const resAll = await fetch(`${process.env.TALENT_URL}`, {
      headers: { Authorization: `Bearer ${process.env.TALENT_TOKEN}` }
    });
    const result = await resAll.json();
    const allTalents = result.data || [];

    if (allTalents.length === 0) return NextResponse.json({ message: "No data" });

    // 3. Logika 15%: Hitung jumlah batch
    // Misal data ada 100, kita cuma ambil 15 talent tertua
    const batchSize = Math.ceil(allTalents.length * 0.25);
    
    const batch = allTalents
      .sort((a: any, b: any) => {
        const timeA = a.last_update ? new Date(a.last_update).getTime() : 0;
        const timeB = b.last_update ? new Date(b.last_update).getTime() : 0;
        return timeA - timeB; // Tertua duluan
      })
      .slice(0, batchSize);

    let updatedCount = 0;

    for (const talent of batch) {
      try {
        if (!talent.instagram_username || talent.instagram_username === "-") continue;

        const username = talent.instagram_username.replace("@", "");
        
        // 4. Scraping dengan User-Agent yang lebih "manusiawi"
        const igRes = await fetch(`https://www.instagram.com/${username}/`, {
          headers: { 
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" 
          },
          next: { revalidate: 0 } // Bypass Next.js cache
        });

        const html = await igRes.text();
        // Regex diperkuat biar lebih akurat nangkep angka
        const metaRegex = /<meta content="([\d,.]+[KMB]?)\s?(Followers|Pengikut)/i;
        const match = html.match(metaRegex);

        if (match) {
          let rawVal = match[1].replace(/,/g, '');
          let val = parseFloat(rawVal);
          
          if (rawVal.includes('K')) val *= 1000;
          else if (rawVal.includes('M')) val *= 1000000;
          else if (rawVal.includes('B')) val *= 1000000000;

          // 5. Update Balik ke DB Pusat
          await fetch(`${process.env.TALENT_URL}/${talent.id}`, {
            method: "PUT",
            headers: { 
              Authorization: `Bearer ${process.env.TALENT_TOKEN}`,
              "Content-Type": "application/json" 
            },
            body: JSON.stringify({
              ...talent,
              instagram_followers: String(Math.floor(val)),
              last_update: new Date().toISOString()
            })
          });
          updatedCount++;
        }
        
        // 6. Jeda 3 detik (Penting!) 
        // Instagram sangat sensitif, 2 detik kadang masih kecepatan buat server-side fetch
        await new Promise(r => setTimeout(r, 3000));

      } catch (err) {
        console.error(`❌ Gagal sync @${talent.instagram_username}`);
      }
    }

    return NextResponse.json({ 
      status: "success", 
      message: `Batch selesai. ${updatedCount}/${batch.length} diperbarui.`,
      next_sync_candidate: batchSize // Informasi untuk log
    });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}