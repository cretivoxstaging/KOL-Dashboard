import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username")?.replace("@", "").trim();
  const id = searchParams.get("id");

  if (!username) return NextResponse.json({ error: "Username wajib!" }, { status: 400 });

  const RAPID_KEY = process.env.RAPIDAPI_KEY?.trim();
  const RAPID_HOST = process.env.RAPIDAPI_HOST?.trim() || "instagram120.p.rapidapi.com";

  try {
    console.log(`[IG Sync] Hunter Mode ON: ${username}`);

    // --- STEP 1: AMBIL DATA PROFILE (Followers) ---
    const profileRes = await fetch(`https://${RAPID_HOST}/api/instagram/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': RAPID_HOST,
        'x-rapidapi-key': RAPID_KEY || ''
      },
      body: JSON.stringify({ username })
    });

    const profData = await profileRes.json();
    const result = profData.result || profData.data || {};

    // Mapping super kuat: Nyari followers di berbagai kemungkinan pintu
    const followers = Number(
      result.follower_count || 
      result.followers || 
      result.details?.follower_count || 
      result.edge_followed_by?.count || 
      0
    );

    console.log(`[DEBUG] Berhasil dapet angka: ${followers}`);

    // --- STEP 2: AMBIL DATA POSTS (Engagement Rate) ---
    const postsRes = await fetch(`https://${RAPID_HOST}/api/instagram/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': RAPID_HOST,
        'x-rapidapi-key': RAPID_KEY || ''
      },
      body: JSON.stringify({ username })
    });

    const postsData = await postsRes.json();
    const postItems = postsData.result?.edges || postsData.data?.edges || [];

    // --- STEP 3: HITUNG ER & TIER ---
    let finalER = "0.00%";
    if (postItems.length > 0 && followers > 0) {
      const sample = postItems.slice(0, 10);
      const totalInteraction = sample.reduce((acc: number, item: any) => {
        const node = item.node || item;
        // Instagram 120 biasanya pake snake_case untuk likes/comments
        const likes = node.like_count || node.edge_liked_by?.count || 0;
        const comments = node.comment_count || node.edge_media_to_comment?.count || 0;
        return acc + likes + comments;
      }, 0);
      
      const avgInteraction = totalInteraction / sample.length;
      finalER = ((avgInteraction / followers) * 100).toFixed(2) + "%";
    }

    const tier = followers >= 1000000 ? "Mega" : followers >= 100000 ? "Macro" : followers >= 10000 ? "Micro" : "Nano";

    // --- STEP 4: UPDATE DATABASE (NOCODEAPI/SHEETS) ---
    if (id && id !== "undefined" && process.env.TALENT_URL) {
      try {
        await fetch(`${process.env.TALENT_URL}/${id}`, {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json", 
            "Authorization": `Bearer ${process.env.TALENT_TOKEN}` 
          },
          body: JSON.stringify({
            instagram_followers: String(followers),
            tier_ig: tier,
            er: finalER,
            last_update: new Date().toISOString()
          })
        });
        console.log(`[DB] Sukses update talent: ${username}`);
      } catch (dbErr) {
        console.error("[DB] Gagal update database");
      }
    }

    return NextResponse.json({
      success: true,
      username,
      followers,
      tier,
      er: finalER,
      // Debug info buat lo liat di browser
      keys_found: Object.keys(result)
    });

  } catch (err: any) {
    console.error("[Fatal Error]:", err.message);
    return NextResponse.json({ error: "API Error", msg: err.message }, { status: 500 });
  }
}