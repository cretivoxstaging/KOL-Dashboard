/**
 * ============================================
 * ADD TALENT MODAL - FORM COMPONENT
 * ============================================
 * 
 * Modal untuk menambahkan talent baru atau edit talent yang sudah ada
 * 
 * Fitur:
 * - Dynamic form dengan 15+ fields (text, url, select, date)
 * - Client-side validation
 * - Loading state saat submit
 * - Success/error handling
 * - Auto-clear form setelah submit
 * 
 * Fields:
 * - Profile: full_name, source, instagram, tiktok, twitter, youtube, etc
 * - Demographics: jenis_kelamin, umur, agama, domisili
 * - Status: tier, status, follower
 * - Metadata: username, hp, email, bank_account
 */

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
    source: "Artist/Celebrity",
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
  const [showManual, setShowManual] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        tier_ig: initialData.tier_ig || initialData.tier || "Nano",
        tier_tiktok: initialData.tier_tiktok || "Nano",
        er: initialData.er || "0%",
        source: initialData.source || "Artist/Celebrity",
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
                  onChange={(e) => {
                    const selectedGender = e.target.value;
                    setFormData({
                      ...formData,
                      gender: selectedGender,
                      // Jika pilih Laki-laki, otomatis set hijab ke "no"
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
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Hijab Status
                </label>
                <select
                  className={`w-full px-4 py-2.5 border-2 border-slate-100 rounded-xl focus:border-[#1B3A5B] outline-none transition-all text-sm bg-white ${
                    formData.gender === "Laki-laki"
                      ? "bg-slate-50 cursor-not-allowed opacity-70"
                      : ""
                  }`}
                  value={formData.hijab}
                  disabled={formData.gender === "Laki-laki"} // Lock kalau laki-laki
                  onChange={(e) =>
                    setFormData({ ...formData, hijab: e.target.value })
                  }
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
                {formData.gender === "Laki-laki" && (
                  <p className="text-[10px] text-slate-400 italic"></p>
                )}
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
            <div className="flex items-center justify-between text-[#1B3A5B] mb-2">
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
                    : "bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-600"
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
            {/* LANJUTAN SECTION 3: STATUS & SOURCE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-50">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Status Talent
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#1B3A5B]/10 outline-none bg-white shadow-sm transition-all"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

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
            className="flex-1 py-4 bg-[#007AFF] text-white rounded-2xl font-bold shadow-xl shadow-blue-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
