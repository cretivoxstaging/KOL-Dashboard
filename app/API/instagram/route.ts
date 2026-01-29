import { NextResponse } from "next/server";

const calculateTier = (followers: number) => {
  if (followers >= 1000000) return "Mega";
  if (followers >= 100000) return "Macro";
  if (followers >= 10000) return "Micro";
  return "Nano";
};

const calculateER = (edges: any[], followers: number) => {
  if (!edges || edges.length === 0 || !followers || followers === 0) return "0.00%";
  const totalInteraction = edges.reduce((acc: number, item: any) => {
    const node = item.node || item;
    // Mapping likes & comments buat provider 120
    const likes = node.like_count || node.edge_liked_by?.count || node.likes || 0;
    const comments = node.comment_count || node.edge_media_to_comment?.count || node.comments || 0;
    return acc + likes + comments;
  }, 0);
  const avgInteraction = totalInteraction / edges.length;
  const erValue = (avgInteraction / followers) * 100;
  return isNaN(erValue) ? "0.00%" : erValue.toFixed(2) + "%";
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username")?.replace("@", "").trim();
  const id = searchParams.get("id");

  if (!username) return NextResponse.json({ error: "Username wajib!" }, { status: 400 });

  const RAPID_KEY = process.env.RAPIDAPI_KEY;

  // --- CONFIG PROVIDER 120 (Endpoint Info & Posts Harus Beda) ---
  const p120 = {
    name: "Instagram 120",
    host: "instagram120.p.rapidapi.com",
    profileUrl: "https://instagram120.p.rapidapi.com/api/instagram/user/info",
    postsUrl: "https://instagram120.p.rapidapi.com/api/instagram/posts"
  };

  try {
    console.log(`[IG Sync] Mencoba ${p120.name} untuk: ${username}`);

    // 1. AMBIL PROFILE (Buat dapet Followers)
    const profileRes = await fetch(p120.profileUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': p120.host,
        'x-rapidapi-key': RAPID_KEY || ''
      },
      body: JSON.stringify({ username: username }),
    });

    if (!profileRes.ok) {
      console.error(`[IG Sync] Profile 120 Fail: ${profileRes.status}`);
      return NextResponse.json({ error: "API 120 Profile Limit/Error" }, { status: profileRes.status });
    }

    const profData = await profileRes.json();
    
    // Debugging struktur data (liat di terminal)
    // console.log("Raw Data 120:", JSON.stringify(profData).substring(0, 500));

    // Parsing Followers 120 (Biasanya ada di result atau data)
    const userData = profData.result || profData.data || profData;
    const followers = Number(userData?.follower_count || userData?.followers || 0);

    if (followers === 0) {
      return NextResponse.json({ error: "Followers tidak ditemukan di 120" }, { status: 404 });
    }

    // 2. AMBIL POSTS (Buat dapet ER)
    let allEdges: any[] = [];
    const postsRes = await fetch(p120.postsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': p120.host,
        'x-rapidapi-key': RAPID_KEY || ''
      },
      body: JSON.stringify({ username: username }),
    });

    if (postsRes.ok) {
      const postsData = await postsRes.json();
      allEdges = postsData.result?.edges || postsData.edges || postsData.data?.edges || [];
    }

    const finalER = calculateER(allEdges, followers);
    const newTier = calculateTier(followers);

    // 3. Update Database Pusat
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
            tier_ig: newTier,
            er: finalER,
            last_update: new Date().toISOString()
          })
        });
      } catch (e) { console.error("DB Update Fail"); }
    }

    return NextResponse.json({ 
      success: true, 
      followers, 
      er: finalER, 
      tier: newTier, 
      provider: p120.name 
    });

  } catch (err: any) {
    console.error("[IG Sync] Fatal Error:", err.message);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}