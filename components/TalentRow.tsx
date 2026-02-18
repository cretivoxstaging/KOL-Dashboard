import React, { useEffect, useState } from "react";
import {
  Eye,
  Instagram,
  ChevronDown,
  RefreshCw,
  Pencil,
  Trash2,
} from "lucide-react";
import { Talent, getSourceStyle } from "../types";

interface TalentRowProps {
  t: Talent;
  index: number;
  indexOfFirstItem: number;
  onDetailClick: (t: Talent) => void;
  onUpdate: (t: Talent) => void;
  setTalentToDelete: (t: Talent) => void;
}

const TalentRow: React.FC<TalentRowProps> = ({
  t,
  index,
  indexOfFirstItem,
  onDetailClick,
  onUpdate,
  setTalentToDelete,
}) => {
  const [openDropdown, setOpenDropdown] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleManualSync = async () => {
    // Cek minimal salah satu account ada, biar nggak sync kosong
    if (
      (!t.igAccount || t.igAccount === "-") &&
      (!t.tiktokAccount || t.tiktokAccount === "-")
    ) {
      alert("Username IG & TikTok kosong, nggak ada yang bisa di-sync.");
      return;
    }

    setIsSyncing(true);
    try {
      const syncTasks = [];

      if (t.igAccount && t.igAccount !== "-") {
        const igUser = t.igAccount.replace("@", "").trim();
        syncTasks.push(
          fetch(
            `/api/instagram?username=${igUser}&id=${t.id}&last_update=${t.last_update || ""}`,
          ),
        );
      }

      if (t.tiktokAccount && t.tiktokAccount !== "-") {
        const ttUser = t.tiktokAccount.replace("@", "").trim();
        syncTasks.push(fetch(`/api/tiktok?username=${ttUser}&id=${t.id}`));
      }

      console.log(`[Sync] Menjalankan ${syncTasks.length} task sync...`);
      const results = await Promise.all(syncTasks);

      results.forEach((res, i) => {
        if (!res.ok)
          console.error(`Task ke-${i + 1} gagal dengan status ${res.status}`);
      });

      // Berhasil semua/sebagian, hajar reload
      window.location.reload();
    } catch (err) {
      console.error("Manual sync failed", err);
      alert("Ada error pas sync, cek koneksi atau limit API.");
    } finally {
      setIsSyncing(false);
      setOpenDropdown(false);
    }
  };

  // Logic Auto-Sync lo yang lama (Tetep gue pertahanin)
  useEffect(() => {
    const autoSync = async () => {
      const lastUpdate = t.last_update ? new Date(t.last_update).getTime() : 0;
      const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
      const isStale = Date.now() - lastUpdate > threeDaysInMs;
      if (isStale && t.igAccount && t.igAccount !== "-") {
        try {
          const username = t.igAccount.replace("@", "");
          await fetch(
            `/API/instagram?username=${username}&id=${t.id}&last_update=${t.last_update || ""}`,
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
    <tr className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
      <td className="p-2 text-center font-bold text-slate-800">
        {indexOfFirstItem + index + 1}
      </td>
      <td className="p-4">
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
      <td>
        <span
          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${getSourceStyle(t.source)}`}
        >
          {t.source || "Unknown"}
        </span>
      </td>
      <td className="p-5 text-center border-r border-slate-50">
        <span className="font-bold text-slate-700">
          {Number(t.igFollowers || 0).toLocaleString()}
        </span>
      </td>
      <td className="p-5 text-center">
        <span className="font-bold text-slate-700">
          {Number(t.tiktokFollowers || 0).toLocaleString()}
        </span>
      </td>
      <td className="p-5 text-center">
        <div className="flex flex-col gap-1 items-center">
          <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 text-[9px] font-bold uppercase border border-purple-100">
            IG: {t.tier_ig}
          </span>
          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[9px] font-bold uppercase border border-blue-100">
            TT: {t.tier_tiktok || "Nano"}
          </span>
        </div>
      </td>
      <td className="p-5 text-center">
        <span
          className={`px-3 py-1 rounded-full text-[9px] font-extrabold uppercase ${t.status === "Active" ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"}`}
        >
          {t.status}
        </span>
      </td>

      {/* DROPDOWN ACTION */}
      <td className="p-5 text-center">
        <div className="relative inline-block text-left">
          <button
            onClick={() => setOpenDropdown(!openDropdown)}
            className="flex items-center gap-2 bg-[#1B3A5B] text-white px-4 py-2 rounded-lg text-[10px] font-bold transition-all shadow-sm hover:bg-[#254d75]"
          >
            Action{" "}
            <ChevronDown
              size={12}
              className={`transition-transform ${openDropdown ? "rotate-180" : ""}`}
            />
          </button>

          {openDropdown && (
            <>
              {/* Backdrop buat nutup dropdown kalo klik luar */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setOpenDropdown(false)}
              ></div>

              <div className="absolute top-full mt-2 right-0 w-40 bg-white border border-slate-100 rounded-xl shadow-xl z-20 py-2 animate-in fade-in zoom-in duration-200">
                <button
                  onClick={() => {
                    onDetailClick(t);
                    setOpenDropdown(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <Eye size={14} className="text-blue-500" /> Detail
                </button>

                <button
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  <RefreshCw
                    size={14}
                    className={`text-emerald-500 ${isSyncing ? "animate-spin" : ""}`}
                  />
                  {isSyncing ? "Syncing..." : "Sync Data"}
                </button>

                <button
                  onClick={() => {
                    onUpdate(t);
                    setOpenDropdown(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <Pencil size={14} className="text-amber-500" /> Edit
                </button>

                <div className="h-px bg-slate-100 my-1 mx-2"></div>

                <button
                  onClick={() => {
                    setTalentToDelete(t);
                    setOpenDropdown(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

export default TalentRow;
