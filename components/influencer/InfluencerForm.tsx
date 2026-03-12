/**
 * ============================================
 * INFLUENCER FORM COMPONENT
 * ============================================
 * 
 * Form khusus untuk menambah/edit Influencer/KOL
 * Source dropdown TIDAK mengandung "Talent" option
 * 
 * Available source options:
 * - Artist/Celebrity
 * - Influencer/KOL
 * - Media
 * - Clippers
 */

"use client";
import React, { useState, useEffect } from "react";
import { X, User, Share2, Briefcase, Heart } from "lucide-react";

export default function InfluencerForm({
  onClose,
  onSave,
  initialData,
}: {
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}) {
  const [formData, setFormData] = useState<any>({
    name: "",
    domisili: "",
    igAccount: "",
    igFollowers: "",
    tiktokAccount: "",
    tiktokFollowers: "",
    contactPerson: "",
    suku: "",
    agama: "",
    alasan: "",
    hobby: "",
    umur: "",
    pekerjaan: "",
    zodiac: "",
    tempatKuliah: "",
    category: "Beauty",
    tier_ig: "Nano",
    tier_tiktok: "Nano",
    er: "0%",
    source: "Artist/Celebrity", // Default ke Artist/Celebrity, bukan Talent
    color: "#1B4D66",
    monthlyImpressions: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    rateCard: "",
    youtube_username: "",
    youtube_subscriber: "",
    email: "",
    hijab: "no",
    gender: "",
  });

  const RELIGION_OPTIONS = [
    "Islam",
    "Kristen",
    "Katolik",
    "Hindu",
    "Buddha",
    "Khonghucu",
    "Other",
  ];

  // Source options untuk Influencer - TIDAK ada "Talent"
  const SOURCE_OPTIONS = [
    "Artist/Celebrity",
    "Influencer/KOL",
    "Media",
    "Clippers",
  ];

  const [isSyncing, setIsSyncing] = useState(false);
  const [showManual, setShowManual] = useState(false);

  useEffect(() => {
    if (!initialData || Object.keys(initialData).length === 0) return;

    // Jika source-nya "talent" atau "Talent", ubah ke "Artist/Celebrity"
    let sourceValue = initialData.source || "Artist/Celebrity";
    if (sourceValue === "talent" || sourceValue === "Talent") {
      sourceValue = "Artist/Celebrity";
    }

    setFormData({
      ...initialData,
      tier_ig: initialData.tier_ig || initialData.tier || "Nano",
      tier_tiktok: initialData.tier_tiktok || "Nano",
      er: initialData.er || "0%",
      source: sourceValue,
      domisili: initialData.domisili || "",
      igAccount: initialData.igAccount || "",
      youtube_username: initialData.youtube_username || "",
      youtube_subscriber: initialData.youtube_subscriber ?? "",
      email: initialData.email || "",
      hijab: initialData.hijab || "no",
      gender: initialData.gender || "",
    });
  }, [initialData]);

  const handleSubmit = async () => {
    if (!formData.name) return alert("Nama wajib diisi!");

    // Ambil username baru dan username lama (bersihkan dari @ dan spasi)
    const newUsername = formData.igAccount?.replace("@", "").trim();
    const oldUsername = initialData?.igAccount?.replace("@", "").trim();

    // CEK: Apakah username-nya berubah?
    if (newUsername && newUsername !== oldUsername) {
      setIsSyncing(true);

      try {
        const syncRes = await fetch(
          `/api/instagram?username=${newUsername}&id=${initialData?.id}`,
        );
        const syncData = await syncRes.json();

        if (syncData.success) {
          const updatedData = {
            ...formData,
            igFollowers: syncData.followers,
            tier_ig: syncData.tier,
            er: syncData.er,
          };
          onSave(updatedData);
          onClose();
          return;
        }
      } catch (err) {
        console.error("Gagal sinkronisasi IG:", err);
      } finally {
        setIsSyncing(false);
      }
    } else {
      // Langsung save
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-100 p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700/80 rounded-[15px] w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* HEADER */}
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-[#1E293B] sticky top-0 z-10">
          <div>
            <h3 className="text-2xl font-bold text-[#1B3A5B] dark:text-slate-100">
              {initialData ? "Edit Influencer Profile" : "Add New Influencer"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 dark:text-slate-300"
          >
            <X size={24} />
          </button>
        </div>

        {/* FORM BODY */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10">
          {/* SECTION 1: PERSONAL IDENTITY */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-[#1B3A5B] dark:text-slate-100 mb-2">
              <User size={18} className="text-blue-500" />
              <h4 className="font-bold uppercase text-xs tracking-widest">
                Personal Identity
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Full Name"
                value={formData.name}
                placeholder="Ahmad..."
                onChange={(v: string) => setFormData({ ...formData, name: v })}
              />
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-200 uppercase">
                  Zodiac
                </label>
                <select
                  className="w-full px-4 py-2.5 border-2 border-slate-100 dark:border-slate-600 rounded-xl focus:border-[#1B3A5B] dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/50 outline-none transition-all text-sm bg-white dark:bg-[#1E293B] text-black dark:text-slate-200"
                  value={formData.zodiac}
                  onChange={(e) =>
                    setFormData({ ...formData, zodiac: e.target.value })
                  }
                >
                  <option value="">Select Zodiac</option>
                  {[
                    "Aries",
                    "Taurus",
                    "Gemini",
                    "Cancer",
                    "Leo",
                    "Virgo",
                    "Libra",
                    "Scorpio",
                    "Sagittarius",
                    "Capricorn",
                    "Aquarius",
                    "Pisces",
                  ].map((z) => (
                    <option key={z} value={z} className="bg-white dark:bg-[#1E293B] text-black dark:text-slate-200">
                      {z}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="Ethnic"
                value={formData.suku}
                placeholder="Jawa"
                onChange={(v: string) => setFormData({ ...formData, suku: v })}
              />
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-200 uppercase">
                  Religion
                </label>
                <select
                  className="w-full px-4 py-2.5 border-2 border-slate-100 dark:border-slate-600 rounded-xl focus:border-[#1B3A5B] dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/50 outline-none transition-all text-sm bg-white dark:bg-[#1E293B] text-black dark:text-slate-200"
                  value={formData.agama}
                  onChange={(e) =>
                    setFormData({ ...formData, agama: e.target.value })
                  }
                  required
                >
                  <option value="">Select Religion</option>
                  {RELIGION_OPTIONS.map((rel) => (
                    <option key={rel} value={rel} className="bg-white dark:bg-[#1E293B] text-black dark:text-slate-200">
                      {rel}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="Domicile"
                value={formData.domisili}
                placeholder="Jakarta"
                onChange={(v: string) =>
                  setFormData({ ...formData, domisili: v })
                }
              />
              <Input
                label="Email Address"
                type="email"
                value={formData.email}
                placeholder="influencer@example.com"
                onChange={(v: string) => setFormData({ ...formData, email: v })}
              />

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-200 uppercase">
                  Gender
                </label>
                <select
                  className="w-full px-4 py-2.5 border-2 border-slate-100 dark:border-slate-600 rounded-xl focus:border-[#1B3A5B] dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/50 outline-none transition-all text-sm bg-white dark:bg-[#1E293B] text-black dark:text-slate-200"
                  value={formData.gender}
                  onChange={(e) => {
                    const selectedGender = e.target.value;
                    setFormData({
                      ...formData,
                      gender: selectedGender,
                      hijab:
                        selectedGender === "Laki-laki" ? "no" : formData.hijab,
                    });
                  }}
                >
                  <option value="">Select Gender</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-200 uppercase">
                  Hijab Status
                </label>
                <select
                  className={`w-full px-4 py-2.5 border-2 border-slate-100 dark:border-slate-600 rounded-xl focus:border-[#1B3A5B] dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/50 outline-none transition-all text-sm bg-white dark:bg-[#1E293B] text-black dark:text-slate-200 ${
                    formData.gender === "Laki-laki"
                      ? "bg-slate-50 dark:bg-slate-800/50 dark:text-slate-500 cursor-not-allowed opacity-70"
                      : ""
                  }`}
                  value={formData.hijab}
                  disabled={formData.gender === "Laki-laki"}
                  onChange={(e) =>
                    setFormData({ ...formData, hijab: e.target.value })
                  }
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
            </div>
          </section>

          {/* SECTION 2: BACKGROUND */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-[#1B3A5B] dark:text-slate-100 mb-2">
              <Briefcase size={18} className="text-orange-500" />
              <h4 className="font-bold uppercase text-xs tracking-widest">
                Background & Education
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Work"
                value={formData.pekerjaan}
                placeholder="Content Creator"
                onChange={(v: string) =>
                  setFormData({ ...formData, pekerjaan: v })
                }
              />
              <Input
                label="College"
                value={formData.tempatKuliah}
                placeholder="Universitas..."
                onChange={(v: string) =>
                  setFormData({ ...formData, tempatKuliah: v })
                }
              />
              <div className="md:col-span-2">
                <Input
                  label="Hobby"
                  value={formData.hobby}
                  placeholder="Gaming, Memasak..."
                  onChange={(v: string) =>
                    setFormData({ ...formData, hobby: v })
                  }
                />
              </div>
            </div>
          </section>

          {/* SECTION 3: SOCIAL MEDIA */}
          <section className="space-y-4">
            <div className="flex items-center justify-between text-[#1B3A5B] dark:text-slate-100 mb-2">
              <div className="flex items-center gap-2">
                <Share2 size={18} className="text-pink-500" />
                <h4 className="font-bold uppercase text-xs tracking-widest">
                  Social Media Accounts
                </h4>
              </div>
              {/* TOMBOL OVERRIDE */}
              <button
                type="button"
                onClick={() => setShowManual(!showManual)}
                className={`text-[10px] font-bold px-3 py-1 rounded-lg border transition-all ${
                  showManual
                    ? "bg-orange-50 text-orange-600 border-orange-200"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 hover:text-slate-600 dark:hover:text-slate-400"
                }`}
              >
                {showManual ? "CLOSE MANUAL OVERRIDE" : "MANUAL DATA OVERRIDE"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Instagram Account"
                value={formData.igAccount}
                placeholder="@username"
                onChange={(v: string) =>
                  setFormData({ ...formData, igAccount: v })
                }
              />
              <Input
                label="TikTok Account"
                value={formData.tiktokAccount}
                placeholder="@username"
                onChange={(v: string) =>
                  setFormData({ ...formData, tiktokAccount: v })
                }
              />
              <Input
                label="YouTube Username"
                value={formData.youtube_username}
                placeholder="@channelname"
                onChange={(v: string) =>
                  setFormData({ ...formData, youtube_username: v })
                }
              />
            </div>

            {/* BAGIAN YANG DISEMBUNYIKAN (AUTO-DATA) */}
            {showManual && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 bg-orange-50/30 border-2 border-dashed border-orange-100 rounded-2xl animate-in zoom-in-95 duration-300">
                <Input
                  label="IG Followers"
                  type="number"
                  value={formData.igFollowers}
                  onChange={(v: string) =>
                    setFormData({
                      ...formData,
                      igFollowers: v === "" ? "" : parseInt(v),
                    })
                  }
                />
                <Input
                  label="TikTok Followers"
                  type="number"
                  value={formData.tiktokFollowers}
                  onChange={(v: string) =>
                    setFormData({
                      ...formData,
                      tiktokFollowers: v === "" ? "" : parseInt(v),
                    })
                  }
                />
                <Input
                  label="YouTube Subs"
                  type="number"
                  value={formData.youtube_subscriber}
                  onChange={(v: string) =>
                    setFormData({
                      ...formData,
                      youtube_subscriber: v === "" ? "" : parseInt(v),
                    })
                  }
                />
                <Input
                  label="Engagement Rate"
                  value={formData.er}
                  placeholder="0.00%"
                  onChange={(v: string) => setFormData({ ...formData, er: v })}
                />
              </div>
            )}

            {/* SOURCE FIELD */}
            <div className="grid grid-cols-1 pt-4 border-t border-slate-50 dark:border-slate-800">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-200 uppercase tracking-widest">
                  Source / Type
                </label>
                <select
                  value={formData.source}
                  onChange={(e) =>
                    setFormData({ ...formData, source: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm focus:ring-2 focus:ring-[#1B3A5B]/10 dark:focus:ring-blue-500/50 outline-none bg-white dark:bg-[#1E293B] shadow-sm transition-all text-black dark:text-slate-200"
                >
                  {SOURCE_OPTIONS.map((opt: string) => (
                    <option key={opt} value={opt} className="bg-white dark:bg-[#1E293B] text-black dark:text-slate-200">
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Contact Person (WA)"
                value={formData.contactPerson}
                placeholder="0812..."
                onChange={(v: string) =>
                  setFormData({ ...formData, contactPerson: v })
                }
              />
              <Input
                label="Category"
                value={formData.category}
                placeholder="Beauty / Gaming / etc"
                onChange={(v: string) =>
                  setFormData({ ...formData, category: v })
                }
              />
            </div>
          </section>
        </div>

        {/* FOOTER ACTION */}
        <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-4 bg-slate-400 text-white rounded-2xl font-bold shadow-xl shadow-blue-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSyncing}
            className="flex-1 py-4 bg-[#007AFF] text-white rounded-2xl font-bold shadow-xl shadow-blue-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSyncing ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Syncing IG...
              </span>
            ) : initialData ? (
              "Update Influencer"
            ) : (
              "Save Influencer Data"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function Input({ label, type = "text", placeholder, value, onChange }: any) {
  const displayValue =
    value === null || value === undefined || (type === "number" && isNaN(value))
      ? ""
      : value;

  return (
    <div>
      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-200 uppercase tracking-widest">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={displayValue}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 mt-1 text-sm focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/50 outline-none transition-all text-black dark:text-slate-200 bg-white dark:bg-[#1E293B] placeholder:text-slate-400 dark:placeholder:text-slate-500"
      />
    </div>
  );
}
