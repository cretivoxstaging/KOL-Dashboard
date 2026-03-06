"use client";

import React, { useEffect, useState } from "react";
import { X, User, Share2, Briefcase, Video } from "lucide-react";
import { Talent } from "@/types";

interface EditTalentModalProps {
  isOpen: boolean;
  talent: Talent | null;
  onClose: () => void;
  onUpdate: (talent: Talent, event?: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

const EditTalentModal: React.FC<EditTalentModalProps> = ({
  isOpen,
  talent,
  onClose,
  onUpdate,
  isLoading,
}) => {
  const [formData, setFormData] = useState<Talent | null>(null);

  const RELIGION_OPTIONS = [
    "-",
    "Islam",
    "Kristen",
    "Katolik",
    "Hindu",
    "Buddha",
    "Konghucu",
    "Other",
  ];

  const STATUS_OPTIONS = ["Available", "Taken"];

  useEffect(() => {
    if (talent) {
      setFormData({ ...talent });
    }
  }, [talent]);

  if (!isOpen || !formData) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!formData) return;
    if (!formData.name) {
      alert("Nama wajib diisi!");
      return;
    }
    onUpdate(formData, event);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[15px] w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* HEADER */}
        <div className="p-8 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h3 className="text-2xl font-bold text-slate-800">
              Edit Talent Profile
            </h3>
            <p className="text-white/80 text-sm mt-1">
              Perbarui data talent internal
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* FORM BODY */}
        <form
          id="talent-edit-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-8 space-y-10"
        >
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
              <Input
                label="Age"
                type="number"
                value={formData.umur}
                placeholder="24"
                onChange={(v: string) => setFormData({ ...formData, umur: v })}
              />
              <Input
                label="Ethnic"
                value={formData.suku}
                placeholder="Jawa"
                onChange={(v: string) => setFormData({ ...formData, suku: v })}
              />
              <Select
                label="Religion"
                value={formData.agama}
                onChange={(v: string) => setFormData({ ...formData, agama: v })}
                options={RELIGION_OPTIONS}
                placeholder="Select Religion"
              />
              <Input
                label="Domicile"
                value={formData.domisili}
                placeholder="Jakarta"
                onChange={(v: string) =>
                  setFormData({ ...formData, domisili: v })
                }
              />
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
            <div className="flex items-center gap-2 text-[#1B3A5B] mb-2">
              <Share2 size={18} className="text-pink-500" />
              <h4 className="font-bold uppercase text-xs tracking-widest">
                Social Media & Contact
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
                label="Contact Person (WA)"
                value={formData.contactPerson}
                placeholder="0812..."
                onChange={(v: string) =>
                  setFormData({ ...formData, contactPerson: v })
                }
              />
              <Select
                label="Status"
                value={formData.status}
                onChange={(v: string) =>
                  setFormData({ ...formData, status: v })
                }
                options={STATUS_OPTIONS}
                placeholder="Select Status"
              />
            </div>

            {/* ALASAN - Full Width */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Alasan Jadi Talent
              </label>
              <textarea
                value={formData.alasan || ""}
                onChange={(e) =>
                  setFormData({ ...formData, alasan: e.target.value })
                }
                rows={4}
                placeholder="Tuliskan alasan jadi talent..."
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1B3A5B]/20 outline-none transition-all text-black bg-white resize-none"
              />
            </div>
          </section>
        </form>

        {/* FOOTER ACTION */}
        <div className="p-8 border-t border-slate-100 bg-slate-50 flex gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-4 bg-slate-400 text-white rounded-2xl font-bold shadow-xl shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              const formElement = document.getElementById(
                "talent-edit-form",
              ) as HTMLFormElement | null;
              formElement?.requestSubmit();
            }}
            disabled={isLoading}
            style={{ backgroundColor: "#007AFF" }}
            className="flex-1 py-4 text-white rounded-2xl font-bold shadow-xl shadow-blue-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Updating...
              </span>
            ) : (
              "Update Talent"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Custom Input Component
function Input({ label, type = "text", placeholder, value, onChange }: any) {
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
        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 mt-1 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-black bg-white"
      />
    </div>
  );
}

// Custom Select Component
function Select({ label, value, onChange, options, placeholder }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        {label}
      </label>
      <select
        className="w-full px-4 py-2.5 border-2 border-slate-100 rounded-xl focus:border-[#1B3A5B] outline-none transition-all text-sm bg-white text-black capitalize"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt: string) => (
          <option key={opt} value={opt} className="capitalize">
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

export default EditTalentModal;
