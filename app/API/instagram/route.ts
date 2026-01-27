import { NextResponse } from "next/server";

const calculateTier = (followers: number) => {
  if (followers >= 1000000) return "Mega";
  if (followers >= 100000) return "Macro";
  if (followers >= 10000) return "Micro";
  return "Nano";
};

const calculateER = (edges: any[], followers: number) => {
  if (!edges || edges.length === 0 || followers === 0) return "0.00%";
  
  const totalInteraction = edges.reduce((acc: number, item: any) => {
    const node = item.node || item;
    // Cek likes & comments di berbagai kemungkinan field API
    const likes = node.edge_media_preview_like?.count || node.edge_liked_by?.count || node.like_count || 0;
    const comments = node.edge_media_to_comment?.count || node.comment_count || 0;
    return acc + likes + comments;
  }, 0);

  const avgInteraction = totalInteraction / edges.length;
  const erValue = (avgInteraction / followers) * 100;
  return erValue.toFixed(2) + "%";
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username")?.replace("@", "").trim();
  const id = searchParams.get("id");

  if (!username) return NextResponse.json({ error: "Username wajib!" }, { status: 400 });

  const RAPID_KEY = process.env.RAPIDAPI_KEY;
  const HOST = 'instagram120.p.rapidapi.com';

  try {
    // 1. Ambil Profile Dulu buat Followers
    const profileRes = await fetch(`https://${HOST}/api/instagram/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-rapidapi-host': HOST, 'x-rapidapi-key': RAPID_KEY || '' },
      body: JSON.stringify({ username }),
      next: { revalidate: 0 }
    });
    const profileData = await profileRes.json();
    // Gunakan path yang sudah terbukti tembus tadi
    const finalFollowers = profileData.result?.edge_followed_by?.count || profileData.result?.user?.edge_followed_by?.count || 0;

    // 2. LOGIC LOOPING 35 POSTS
    let allEdges: any[] = [];
    let nextMaxId = "";
    const targetPosts = 35;

    console.log(`--- Memulai Sync 35 Post untuk: ${username} ---`);

    for (let i = 0; i < 4; i++) {
      const postsRes = await fetch(`https://${HOST}/api/instagram/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-rapidapi-host': HOST, 'x-rapidapi-key': RAPID_KEY || '' },
        body: JSON.stringify({ username, maxId: nextMaxId }),
        next: { revalidate: 0 }
      });
      
      const postsData = await postsRes.json();
      const currentEdges = postsData.result?.edges || postsData.edges || [];
      
      if (currentEdges.length === 0) break;

      allEdges = [...allEdges, ...currentEdges];
      console.log(`Hit ${i + 1}: Dapet ${currentEdges.length} posts. Total: ${allEdges.length}`);
      
      // Ambil token buat page selanjutnya (cursor)
      nextMaxId = postsData.result?.page_info?.end_cursor || postsData.page_info?.end_cursor || "";
      
      if (allEdges.length >= targetPosts || !nextMaxId) break;
    }

    const finalEdges = allEdges.slice(0, targetPosts);
    const finalER = calculateER(finalEdges, finalFollowers);
    const newTier = calculateTier(finalFollowers);

    // 3. UPDATE KE DATABASE PUSAT
    if (id && id !== "undefined" && process.env.TALENT_URL) {
      console.log(`Mengirim ER ${finalER} ke database untuk ID: ${id}`);
      await fetch(`${process.env.TALENT_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.TALENT_TOKEN}`
        },
        body: JSON.stringify({
          instagram_followers: String(finalFollowers),
          tier_ig: newTier,
          tier: newTier, // Master tier
          er: finalER,   // Field ER dimasukkan ke sini
          last_update: new Date().toISOString(),
          source: `RapidAPI (v120 - Sample ${finalEdges.length} Posts)`
        })
      });
    }

    return NextResponse.json({ 
      success: true, 
      followers: finalFollowers, 
      er: finalER, 
      tier: newTier,
      post_sampled: finalEdges.length 
    });

  } catch (error: any) {
    console.error("Route Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}