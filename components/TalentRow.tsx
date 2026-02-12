import React, { useEffect } from "react";
import { Eye, Instagram } from "lucide-react";
import { Talent, getSourceStyle } from "../types";

interface TalentRowProps {
  t: Talent;
  index: number;
  indexOfFirstItem: number;
  onDetailClick: (t: Talent) => void;
}

const TalentRow: React.FC<TalentRowProps> = ({ t, index, indexOfFirstItem, onDetailClick }) => {
  const followers = t.igFollowers || 0;

  useEffect(() => {
    const autoSync = async () => {
      const lastUpdate = t.last_update ? new Date(t.last_update).getTime() : 0;
      const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
      const isStale = Date.now() - lastUpdate > threeDaysInMs;
      if (isStale && t.igAccount && t.igAccount !== "-") {
        try {
          const username = t.igAccount.replace("@", "");
          await fetch(
            `/API/instagram?username=${username}&id=${t.id}&last_update=${t.last_update || ""}`
          );
        } catch (err) {
          console.error("Auto-sync failed for", t.name, err);
        }
      }
    };
    const delay = Math.floor(Math.random() * 10000);
    const timeout = setTimeout(autoSync, delay);
    return () => clearTimeout(timeout);
  }, [t.id, t.igAccount, t.last_update]);

  return (
    <tr className="border-t border-slate-50 hover:bg-slate-50 transition-colors">
      <td className="p-5 text-center font-bold text-slate-800">
        {indexOfFirstItem + index + 1}
      </td>
      <td className="p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#1B3A5B] flex items-center justify-center font-bold text-white text-xs border border-slate-200">
            {t.name[0]}
          </div>
          <div>
            <p className="font-bold text-slate-800">{t.name}</p>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
              <Instagram size={10} className="text-pink-500" /> {t.igAccount}
            </div>
          </div>
        </div>
      </td>
      <td className="">
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${getSourceStyle(t.source)}`}>
          {t.source || "Unknown"}
        </span>
      </td>
      <td className="p-5 text-center border-r border-slate-50">
        <div className="flex flex-col items-center justify-center">
          <span className="font-bold text-slate-700">
            {Number(t.igFollowers || 0).toLocaleString()}
          </span>
        </div>
      </td>
      <td className="p-5 text-center">
        <div className="flex flex-col items-center justify-center">
          <span className="font-bold text-slate-700">
            {Number(t.tiktokFollowers || 0).toLocaleString()}
          </span>
        </div>
      </td>
      <td className="p-5 text-center">
        <div className="flex flex-col gap-1 items-center">
          <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 text-[9px] font-bold uppercase border border-purple-100">
            IG: {t.tier_ig || t.tier_ig}
          </span>
          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[9px] font-bold uppercase border border-blue-100">
            TT: {t.tier_tiktok || "Nano"}
          </span>
        </div>
      </td>
      <td className="p-5 text-center">
        <span className={`px-3 py-1 rounded-full text-[9px] font-extrabold uppercase ${t.status === "Active" ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"}`}>
          {t.status}
        </span>
      </td>
      <td className="p-5 text-center">
        <button
          onClick={() => onDetailClick(t)}
          className="flex items-center gap-1 mx-auto bg-slate-100 hover:bg-[#1B3A5B] hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border border-slate-200 shadow-sm"
        >
          <Eye size={12} /> Detail
        </button>
      </td>
    </tr>
  );
};

export default TalentRow;
