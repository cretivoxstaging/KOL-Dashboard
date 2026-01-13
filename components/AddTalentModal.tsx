"use client";
import React, { useState, useEffect } from "react";
import { X, User, Share2, Briefcase, Heart } from "lucide-react";

// 1. Tambahkan initialData di interface props
export default function AddTalentModal({
  onClose,
  onSave,
  initialData,
}: {
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any; // Data lama untuk diedit
}) {
  // 2. Inisialisasi state dengan initialData jika ada, jika tidak pakai default
  const [formData, setFormData] = useState({
    name: "",
    domisili: "",
    igAccount: "",
    igFollowers: 0,
    tiktokAccount: "",
    tiktokFollowers: 0,
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
    tier: "Nano",
    rateCard: 0,
    color: "#1B4D66",
    monthlyImpressions: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  });

  const ZODIAC_OPTIONS = [
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
  ];

  const RELIGION_OPTIONS = [
    "Islam",
    "Kristen",
    "Katolik",
    "Hindu",
    "Buddha",
    "Khonghucu",
    "Other",
  ];


  // 3. Gunakan useEffect untuk update formData jika initialData berubah
useEffect(() => {
  if (initialData) {
    setFormData({
      ...initialData,
      tier: initialData.tier || "", 
      domisili: initialData.domisili || "",
      igAccount: initialData.igAccount || "",
    });
  } else {
    setFormData({
      name: "",
      domisili: "",
      igAccount: "",
      igFollowers: 0,
      tiktokAccount: "",
      tiktokFollowers: 0,
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
      tier: "Nano",
      rateCard: 0,
      color: "#1B4D66",
      monthlyImpressions: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    }); 
  }
}, [initialData]);

  const handleSubmit = () => {
    if (!formData.name) return alert("Nama wajib diisi!");
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[15px] w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* HEADER - Judul dinamis */}
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
              {/* Tambahkan value={formData.xxx} agar data lama muncul */}
              <Input
                label="Full Name"
                value={formData.name}
                placeholder="Ahmad..."
                onChange={(v: string) => setFormData({ ...formData, name: v })}
              />
              <Input
                label="Age"
                type="number"
                value={formData.umur}
                placeholder="20"
                onChange={(v: string) => setFormData({ ...formData, umur: v })}
              />
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
            </div>
          </section>

          {/* SECTION 2: BACKGROUND & EDUCATION */}
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

          {/* SECTION 3: SOCIAL MEDIA & BUSINESS */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-[#1B3A5B] mb-2">
              <Share2 size={18} className="text-pink-500" />
              <h4 className="font-bold uppercase text-xs tracking-widest">
                Social Media & Business
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Instagram Account"
                value={formData.igAccount}
                placeholder="@username"
                onChange={(v: string) =>
                  setFormData({ ...formData, igAccount: v })
                }
              />
              <Input
                label="IG Followers"
                type="number"
                value={formData.igFollowers}
                placeholder="10000"
                onChange={(v: string) =>
                  setFormData({ ...formData, igFollowers: parseInt(v) })
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
                label="TikTok Followers"
                type="number"
                value={formData.tiktokFollowers}
                placeholder="50000"
                onChange={(v: string) =>
                  setFormData({ ...formData, tiktokFollowers: parseInt(v) })
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
                label="Rate Card (Rp)"
                type="number"
                value={formData.rateCard}
                placeholder="1500000"
                onChange={(v: string) =>
                  setFormData({ ...formData, rateCard: parseInt(v) })
                }
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Category"
                value={formData.category}
                options={["Beauty", "Gaming", "Food", "Finance", "Tech"]}
                onChange={(v: string) =>
                  setFormData({ ...formData, category: v })
                }
              />
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Talent Tier
                </label>
                <select
                  className="w-full px-4 py-2.5 border-2 border-slate-100 rounded-xl focus:border-[#1B3A5B] outline-none transition-all text-sm bg-white"
                  value={formData.tier}
                  onChange={(e) =>
                    setFormData({ ...formData, tier: e.target.value })
                  }
                  required
                >
                  <option value="">Select Tier</option>
                  {["Mega", "Macro", "Micro", "Nano"].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* SECTION 4: MOTIVATION */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-[#1B3A5B] mb-2">
              <Heart size={18} className="text-red-500" />
              <h4 className="font-bold uppercase text-xs tracking-widest">
                Talent Motivation
              </h4>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                reasons to be a talent
              </label>
              <textarea
                value={formData.alasan}
                className="w-full border border-slate-200 rounded-2xl px-4 py-3 mt-1 focus:ring-2 focus:ring-blue-500/20 outline-none min-h-[100px] text-sm"
                placeholder="Ceritakan alasan singkat..."
                onChange={(e) =>
                  setFormData({ ...formData, alasan: e.target.value })
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
            className="flex-1 py-4 bg-[#1B3A5B] text-white rounded-2xl font-bold shadow-xl shadow-blue-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            {initialData ? "Update Talent" : "Save Talent Data"}
          </button>
        </div>
      </div>
    </div>
  );
}

// 4. Update Helper Components untuk menerima props 'value'
function Input({ label, type = "text", placeholder, value, onChange }: any) {
  return (
    <div>
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value} // Data akan muncul otomatis di kotak input
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
        value={value} // Dropdown akan terpilih sesuai data lama
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 mt-1 text-sm outline-none"
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
