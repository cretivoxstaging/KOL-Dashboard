export interface Talent {
  id: number;
  name: string;
  tier_ig: string;
  tier_tiktok: string;
  er: string;
  source: string;
  domisili: string;
  igAccount: string;
  igFollowers: number;
  tiktokAccount: string;
  tiktokFollowers: number;
  youtube_username: string;
  youtube_subscriber: number;
  totalFollowers: number;
  contactPerson: string;
  suku: string;
  agama: string;
  alasan: string;
  hobby: string;
  umur: string;
  pekerjaan: string;
  zodiac: string;
  tempatKuliah: string;
  category: string;
  rateCard: number;
  status: string;
  monthlyImpressions?: number[];
  tier: string;
  last_update?: string;
  email?: string;
  hijab?: string;
  gender?: string;
}

export const getSourceStyle = (source: string) => {
  switch (source) {
    case "Artist/Celebrity":
      return "bg-purple-100 text-purple-700 border-purple-200";
    case "Influencer/KOL":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "Talent":
      return "bg-green-100 text-green-700 border-green-200";
    case "Media":
      return "bg-orange-100 text-orange-700 border-orange-200";
    case "Clippers":
      return "bg-pink-100 text-pink-700 border-pink-200";
    default:
      if (source?.includes("Multi-Provider"))
        return "bg-slate-100 text-slate-600 border-slate-200";
      return "bg-gray-100 text-gray-600 border-gray-200";
  }
};

export const formatDate = (dateString?: string) => {
  if (!dateString || dateString === "null" || dateString === "")
    return "Never";

  try {
    const parts = dateString.split("-");

    let date;
    if (parts.length === 3) {
      const day = parts[0];
      const month = parts[1];
      const yearWithTime = parts[2];

      const formattedForJS = `${yearWithTime.split(" ")[0]}-${month}-${day} ${yearWithTime.split(" ")[1]}`;
      date = new Date(formattedForJS);
    } else {
      date = new Date(dateString);
    }

    if (isNaN(date.getTime())) return "Never";

    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch (e) {
    return "Never";
  }
};
