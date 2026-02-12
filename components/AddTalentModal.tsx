"use client";
import React, { useState, useEffect } from "react";
import { X, User, Share2, Briefcase, Heart } from "lucide-react";

export default function AddTalentModal({
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
    status: "Active",
    tempatKuliah: "",
    category: "Beauty",
    tier_ig: "Nano",
    tier_tiktok: "Nano",
    er: "0%",
    source: "Manual",
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

  const calculateTier = (followers: number) => {
    if (followers >= 1000000) return "Mega";
    if (followers >= 100000) return "Macro";
    if (followers >= 10000) return "Micro";
    return "Nano";
  };
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        tier_ig: initialData.tier_ig || initialData.tier || "Nano",
        tier_tiktok: initialData.tier_tiktok || "Nano",
        er: initialData.er || "0%",
        source: initialData.source || "Manual",
        domisili: initialData.domisili || "",
        igAccount: initialData.igAccount || "",
        status: initialData.status || "Active",
        youtube_username: initialData.youtube_username || "",
        youtube_subscriber: initialData.youtube_subscriber ?? "",
        email: initialData.email || "",
        hijab: initialData.hijab || "no",
        gender: initialData.gender || "",
      });
    }
  }, [initialData]);

const handleSubmit = async () => {
  if (!formData.name) return alert("Nama wajib diisi!");

  // Ambil username baru dan username lama (bersihkan dari @ dan spasi)
  const newUsername = formData.igAccount?.replace("@", "").trim();
  const oldUsername = initialData?.igAccount?.replace("@", "").trim();

  // CEK: Apakah username-nya berubah? 
  // Kalau berubah DAN tidak kosong, baru kita nembak API
  if (newUsername && newUsername !== oldUsername) {
    setIsSyncing(true);
    console.log("Username berubah! Nembak API IG untuk:", newUsername);

    try {
      const syncRes = await fetch(`/API/instagram?username=${newUsername}&id=${initialData?.id}`);
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
    // Kalau username-nya SAMA atau KOSONG, langsung save aja tanpa nembak API
    console.log("Username tidak berubah, langsung save.");
    onSave(formData);
  }
};
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-100 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[15px] w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* HEADER */}
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h3 className="text-2xl font-bold text-[#1B3A5B]">
              {initialData ? "Edit Talent Profile" : "Add New Talent"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
          >
            <X size={24} />
          </button>
        </div>

        {/* FORM BODY */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10">
          {/* SECTION 1: PERSONAL IDENTITY */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-[#1B3A5B] mb-2">
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
              {/* <Input
                label="Age"
                type="number"
                value={formData.umur}
                placeholder="20"
                onChange={(v: string) => setFormData({ ...formData, umur: v })}
              /> */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Zodiac
                </label>
                <select
                  className="w-full px-4 py-2.5 border-2 border-slate-100 rounded-xl focus:border-[#1B3A5B] outline-none transition-all text-sm bg-white"
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
                    <option key={z} value={z}>
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
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Religion
                </label>
                <select
                  className="w-full px-4 py-2.5 border-2 border-slate-100 rounded-xl focus:border-[#1B3A5B] outline-none transition-all text-sm bg-white"
                  value={formData.agama}
                  onChange={(e) =>
                    setFormData({ ...formData, agama: e.target.value })
                  }
                  required
                >
                  <option value="">Select Religion</option>
                  {RELIGION_OPTIONS.map((rel) => (
                    <option key={rel} value={rel}>
                      {rel}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="domicile"
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
                placeholder="talent@example.com"
                onChange={(v: string) => setFormData({ ...formData, email: v })}
              />

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Gender
                </label>
                <select
                  className="w-full px-4 py-2.5 border-2 border-slate-100 rounded-xl focus:border-[#1B3A5B] outline-none transition-all text-sm bg-white"
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                >
                  <option value="">Select Gender</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Hijab Status
                </label>
                <select
                  className="w-full px-4 py-2.5 border-2 border-slate-100 rounded-xl focus:border-[#1B3A5B] outline-none transition-all text-sm bg-white"
                  value={formData.hijab}
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
            <div className="flex items-center gap-2 text-[#1B3A5B] mb-2">
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
                label="college"
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
            <div className="flex items-center gap-2 text-[#1B3A5B] mb-2">
              <Share2 size={18} className="text-pink-500" />
              <h4 className="font-bold uppercase text-xs tracking-widest">
                Social Media & Business
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* INSTAGRAM ACCOUNT + SYNC BUTTON */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Instagram Account
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.igAccount}
                    placeholder="@username"
                    onChange={(e) =>
                      setFormData({ ...formData, igAccount: e.target.value })
                    }
                    className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  {/* <button
                    type="button"
                    disabled={!formData.igAccount}
                    className="bg-blue-50 text-blue-600 px-4 rounded-xl text-xs font-bold hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={async () => {
                      try {
                        const userOnly = formData.igAccount.replace("@", "");
                        const res = await fetch(
                          `/API/Instagram?username=${userOnly}`
                        );
                        const data = await res.json();

                        if (data.followers) {
                          const numFollowers = data.followers;

                          // Kalkulasi Tier Otomatis
                          let newTier = "Nano";
                          if (numFollowers >= 1000000) newTier = "Mega";
                          else if (numFollowers >= 100000) newTier = "Makro";
                          else if (numFollowers >= 10000) newTier = "Mikro";
                          else if (numFollowers >= 1000) newTier = "Nano";

                          setFormData({
                            ...formData,
                            igFollowers: numFollowers,
                            tier: newTier,
                          });
                          alert(
                            `Sync Berhasil! Followers: ${numFollowers.toLocaleString()}`
                          );
                        } else {
                          alert(
                            "Error: " + (data.error || "User tidak ditemukan")
                          );
                        }
                      } catch (err) {
                        alert("Gagal koneksi ke API");
                      }
                    }}
                  >
                    Sync
                  </button> */}
                </div>
              </div>

              {/* IG FOLLOWERS */}
              <Input
                label="IG Followers"
                type="number"
                value={formData.igFollowers}
                placeholder="10000"
                onChange={(v: string) => {
                  const val = v === "" ? "" : parseInt(v);
                  const numForTier = typeof val === "number" ? val : 0;

                  // Gunakan Macro & Micro (pake 'c') biar sinkron sama CSS/styling
                  let newTier = "Nano";
                  if (numForTier >= 1000000) newTier = "Mega";
                  else if (numForTier >= 100000) newTier = "Macro";
                  else if (numForTier >= 10000) newTier = "Micro";
                  else if (numForTier >= 1000) newTier = "Nano";

                  setFormData({
                    ...formData,
                    igFollowers: val,
                    tier_ig: newTier,
                  });
                }}
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
                label="TikTok Followers"
                type="number"
                value={formData.tiktokFollowers}
                placeholder="50000"
                onChange={(v: string) => {
                  const val = v === "" ? "" : parseInt(v);
                  const numForTier = typeof val === "number" ? val : 0;
                  const newTier = calculateTier(numForTier);

                  setFormData({
                    ...formData,
                    tiktokFollowers: val,
                    tier_tiktok: newTier,
                  });
                }}
              />
              <Input
                label="YouTube Username"
                value={formData.youtube_username}
                placeholder="@channelname"
                onChange={(v: string) =>
                  setFormData({ ...formData, youtube_username: v })
                }
              />
              <Input
                label="YouTube Subscribers"
                type="number"
                placeholder="50000"
                value={formData.youtube_subscriber}
                onChange={(v: string) =>
                  setFormData({
                    ...formData,
                    youtube_subscriber: v === "" ? "" : parseInt(v),
                  })
                }
              />
              <Input
                label="Contact Person (WA)"
                value={formData.contactPerson}
                placeholder="0812..."
                onChange={(v: string) =>
                  setFormData({ ...formData, contactPerson: v })
                }
              />
              <Input
                label="Engagement Rate (ER)"
                value={formData.er}
                placeholder="2.5%"
                onChange={(v: string) => setFormData({ ...formData, er: v })}
              />
              <Input
                label="Category"
                value={formData.category}
                placeholder="Beauty / Gaming / Food / Finance / Tech"
                onChange={(v: string) =>
                  setFormData({ ...formData, category: v })
                }
              />
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Status Talent
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 text-sm focus:border-[#1B3A5B] outline-none bg-white shadow-sm transition-all"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Source"
                value={formData.source}
                options={[
                  "Artist/Celebrity",
                  "Influencer/KOL",
                  "Talent",
                  "Media",
                  "Clippers",
                ]}
                onChange={(v: string) =>
                  setFormData({ ...formData, source: v })
                }
              />
              {/* TAMPILAN TIER OTOMATIS (READ ONLY) */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Calculated Tier
                </label>
                <div className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-[#1B3A5B]">
                  {formData.tier_ig}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* FOOTER ACTION */}
        <div className="p-8 border-t border-slate-100 bg-slate-50 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-4 font-bold text-slate-400 hover:text-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSyncing}
            className="flex-1 py-4 bg-[#1B3A5B] text-white rounded-2xl font-bold shadow-xl shadow-blue-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSyncing ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Syncing IG...
              </span>
            ) : initialData ? (
              "Update Talent"
            ) : (
              "Save Talent Data"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function Input({ label, type = "text", placeholder, value, onChange }: any) {
  // Proteksi mutlak agar tidak mengirim NaN atau null ke atribut value
  const displayValue =
    value === null || value === undefined || (type === "number" && isNaN(value))
      ? ""
      : value;

  return (
    <div>
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={displayValue}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 mt-1 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
      />
    </div>
  );
}

function Select({ label, options, value, onChange }: any) {
  return (
    <div>
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 mt-1 text-sm outline-none bg-white"
      >
        {options.map((opt: string) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
