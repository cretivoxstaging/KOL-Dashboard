/**
 * ============================================
 * SPK FORM COMPONENT
 * ============================================
 *
 * Komponen form besar untuk create/edit SPK
 * Terdiri dari beberapa section:
 * - Section I: Company Identity (Penandatangan Perusahaan)
 * - Section II: Vendor Identity (Data Vendor)
 * - Section III: Commercial Terms (Ketentuan Komersial)
 * - Section IV: Scope of Work (Talent, SOW)
 * - Section V: Competitors (Daftar Kompetitor)
 * - Section VI: Payment & Bank (Pembayaran & Rekening Bank)
 * - Tax Calculator (Iframe eksternal)
 *
 * Props mengontrol semua state dan handler dari parent (SPKView)
 */

"use client";
import React, { useDeferredValue, useState, useCallback, useEffect, useRef, useMemo } from "react";
import {
  Plus,
  Trash2,
  Building2,
  User,
  BadgeDollarSign,
  ListChecks,
  Banknote,
} from "lucide-react";
import { GiStrong } from "react-icons/gi";
import { generateHTML } from "@/src/utils/spkTemplate";

interface SPKFormProps {
  formData: any; // FormDataType dari parent
  onChange: (e: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  editingId: string | number | null;
  activeTalentCount: number;
  setActiveTalentCount: (count: number | ((prev: number) => number)) => void;
  onTalentChange: (id: string, value: string) => void;
  onAddTalent: () => void;
  onRemoveTalent: (id: string) => void;
  activeSowCount: number;
  sowIds: number[];
  onAddSow: () => void;
  onRemoveSow: (index: number) => void;
  activeCompetitorCount: number;
  setActiveCompetitorCount: (
    count: number | ((prev: number) => number),
  ) => void;
  onCompetitorChange: (id: string, value: string) => void;
  onAddCompetitor: () => void;
  onRemoveCompetitor: (id: string) => void;
}

/**
 * ============================================
 * InputGroup Sub-Component
 * ============================================
 * Reusable input wrapper dengan label
 */
function InputGroup({
  label,
  placeholder,
  name,
  value,
  onChange,
  onFocus,
  onBlur,
  type = "text",
}: any) {
  return (
    <div className="flex flex-col w-full">
      <label className="text-[13px] font-bold text-slate-800 uppercase mb-1.5 tracking-wider">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-300 bg-white text-black"
      />
    </div>
  );
}

/**
 * ============================================
 * SPKForm Main Component
 * ============================================
 */
export default function SPKForm({
  formData,
  onChange,
  onSubmit,
  isLoading,
  editingId,
  activeTalentCount,
  setActiveTalentCount,
  onTalentChange,
  onAddTalent,
  onRemoveTalent,
  activeSowCount,
  sowIds,
  onAddSow,
  onRemoveSow,
  activeCompetitorCount,
  setActiveCompetitorCount,
  onCompetitorChange,
  onAddCompetitor,
  onRemoveCompetitor,
}: SPKFormProps) {
  const EXTERNAL_CALCULATOR_URL = "https://tax-kol-calculator.vercel.app/";
  
  // Auto-scroll sync state - isolated dari form updates
  const [activeSection, setActiveSection] = useState<string>("");
  
  // Defer activeSection untuk tidak memicu form re-render
  const deferredActiveSection = useDeferredValue(activeSection);
  
  // Performance optimization: defer preview rendering to avoid input lag
  const deferredFormData = useDeferredValue(formData);
  
  // Scroll position preservation untuk mencegah jumpy saat re-render
  const formScrollRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef<number>(0);
  
  // Debounce timer untuk srcDoc update
  const srcDocTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [debouncedPreviewData, setDebouncedPreviewData] = useState<any>({
    ...deferredFormData,
    activeSection: deferredActiveSection,
  });
  
  // Handle focus change untuk auto-scroll preview (useCallback untuk stabilitas referensi)
  const handleFocusChange = useCallback((sectionId: string) => {
    // Save current scroll position sebelum state update
    if (formScrollRef.current) {
      scrollPositionRef.current = formScrollRef.current.scrollTop;
    }
    setActiveSection(sectionId);
  }, []);
  
  // Handle blur untuk menghilangkan highlight
  const handleBlurChange = useCallback(() => {
    setActiveSection("");
  }, []);
  
  // Debounce srcDoc update: jangan update iframe terlalu sering saat user ngetik
  useEffect(() => {
    // Clear previous timer
    if (srcDocTimerRef.current) {
      clearTimeout(srcDocTimerRef.current);
    }
    
    // Set new timer untuk update srcDoc setelah user berhenti ngetik 150ms
    srcDocTimerRef.current = setTimeout(() => {
      setDebouncedPreviewData({
        ...deferredFormData,
        activeSection: deferredActiveSection,
      });
    }, 150);
    
    return () => {
      if (srcDocTimerRef.current) {
        clearTimeout(srcDocTimerRef.current);
      }
    };
  }, [deferredFormData, deferredActiveSection]);
  
  // Restore scroll position setelah re-render untuk cegah jumpy
  useEffect(() => {
    if (formScrollRef.current && scrollPositionRef.current > 0) {
      // Gunakan requestAnimationFrame agar scroll restore terjadi setelah DOM paint
      requestAnimationFrame(() => {
        if (formScrollRef.current) {
          formScrollRef.current.scrollTop = scrollPositionRef.current;
        }
      });
    }
  }, [activeSection]); // Trigger saat activeSection berubah

  // Reset activeSection jika competitors kosong (misalnya saat switch ke Non-Eksklusif)
  useEffect(() => {
    // Jika collab_nature = Non-Eksklusif dan activeSection masih mengarah ke competitor, reset
    if (
      formData.collab_nature === "Non-Eksklusif" &&
      activeSection.startsWith("preview-competitor")
    ) {
      setActiveSection("");
    }
  }, [formData.collab_nature]);
  
  // Handle form submit dengan filter activeSection
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter out activeSection sebelum submit ke API
    const { activeSection: _, ...cleanData } = formData;
    // Call original onSubmit dengan data yang sudah dibersihkan
    const syntheticEvent = {
      ...e,
      currentTarget: { ...e.currentTarget },
      target: { ...e.target },
    };
    onSubmit(syntheticEvent as React.FormEvent);
  };
  
  // Memoize form content - HANYA re-render jika formData berubah, abaikan activeSection
  const formContent = useMemo(
    () => (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="col-span-1 lg:col-span-7 space-y-6" ref={formScrollRef} style={{ maxHeight: '100vh', overflowY: 'auto', overflowX: 'hidden' }}>
        <form
          onSubmit={handleSubmit}
          className="bg-white p-4  sm:p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8"
        >
          {/* ============================================ */}
          {/* SECTION I: COMPANY IDENTITY */}
          {/* ============================================ */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-blue-600 border-b pb-2">
              <h4 className="font-bold text-sm uppercase tracking-wider">
                Bagian I: Identitas Perusahaan
              </h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InputGroup
                label="Nama Penandatangan"
                name="first_party_signer"
                value={formData.first_party_signer}
                onChange={onChange}
                onFocus={() => handleFocusChange("preview-first-party-signer")}
                onBlur={handleBlurChange}
                placeholder="Andi Pratama"
              />
              <InputGroup
                label="Jabatan Penandatangan"
                name="first_party_position"
                value={formData.first_party_position}
                onChange={onChange}
                onFocus={() => handleFocusChange("preview-first-party-position")}
                onBlur={handleBlurChange}
                placeholder="Director"
              />
            </div>
          </section>

          {/* ============================================ */}
          {/* SECTION II: VENDOR IDENTITY */}
          {/* ============================================ */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 border-b pb-2">
              <h4 className="font-bold text-sm uppercase tracking-wider">
                Bagian II: Identitas Vendor
              </h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InputGroup
                label="Nama Penandatangan"
                name="vendor_name"
                value={formData.vendor_name}
                onChange={onChange}
                onFocus={() => handleFocusChange("preview-vendor-name")}
                onBlur={handleBlurChange}
                placeholder="Rafifata"
              />
              <InputGroup
                label="NIK"
                name="vendor_nik"
                value={formData.vendor_nik}
                onChange={onChange}
                onFocus={() => handleFocusChange("preview-vendor-nik")}
                onBlur={handleBlurChange}
                placeholder="3201290..."
              />
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block">
                  Alamat KTP
                </label>
                <textarea
                  name="vendor_address"
                  value={formData.vendor_address}
                  onChange={onChange}
                  onFocus={() => handleFocusChange("preview-vendor-address")}
                  onBlur={handleBlurChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/10 outline-none text-black bg-white"
                  rows={2}
                />
              </div>
              <InputGroup
                label="Bertindak Sebagai"
                name="vendor_role"
                value={formData.vendor_role}
                onChange={onChange}
                onFocus={() => handleFocusChange("preview-vendor-role")}
                onBlur={handleBlurChange}
                placeholder="Influencer"
              />
              <InputGroup
                label="Nama Perusahaan Vendor"
                name="vendor_company_name"
                value={formData.vendor_company_name}
                onChange={onChange}
                onFocus={() => handleFocusChange("preview-vendor-company-name")}
                onBlur={handleBlurChange}
                placeholder="Andi Studio"
              />
            </div>
          </section>

          {/* ============================================ */}
          {/* SECTION III: COMMERCIAL TERMS */}
          {/* ============================================ */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-600 border-b pb-2">
              <h4 className="font-bold text-sm uppercase tracking-wider">
                Bagian III: Ketentuan Komersial
              </h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InputGroup
                label="Merek Produk"
                name="brand_name"
                value={formData.brand_name}
                onChange={onChange}
                onFocus={() => handleFocusChange("preview-brand-name")}
                onBlur={handleBlurChange}
                placeholder="Nestle"
              />
              <InputGroup
                label="Jenis Perusahaan"
                name="business_type"
                value={formData.business_type}
                onChange={onChange}
                onFocus={() => handleFocusChange("preview-business-type")}
                onBlur={handleBlurChange}
                placeholder="Perbankan Digital"
              />
              <InputGroup
                label="Jenis Kerjasama"
                name="collab_type"
                value={formData.collab_type}
                onChange={onChange}
                onFocus={() => handleFocusChange("preview-collab-type")}
                onBlur={handleBlurChange}
                placeholder="Campaign Digital"
              />
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col w-full">
                  <label className="text-[13px] font-bold text-slate-800 uppercase mb-1.5 tracking-wider">
                    Mulai Kampanye
                  </label>
                  <input
                    type="month"
                    name="campaign_start"
                    value={formData.campaign_start}
                    onChange={onChange}
                    onFocus={() => handleFocusChange("preview-campaign-period")}
                    onBlur={handleBlurChange}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/10 outline-none bg-white text-black"
                  />
                </div>
                <div className="flex flex-col w-full">
                  <label className="text-[13px] font-bold text-slate-800 uppercase mb-1.5 tracking-wider">
                    Selesai Kampanye
                  </label>
                  <input
                    type="month"
                    name="campaign_end"
                    value={formData.campaign_end}
                    onChange={onChange}
                    onFocus={() => handleFocusChange("preview-campaign-period")}
                    onBlur={handleBlurChange}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/10 outline-none bg-white text-black"
                  />
                </div>
              </div>
              <div className="col-span-2">
                <label className="text-[13px] font-bold text-slate-800 uppercase mb-2 block">
                  Sifat Kerjasama
                </label>
                <select
                  name="collab_nature"
                  value={formData.collab_nature}
                  onChange={onChange}
                  onFocus={() => handleFocusChange("preview-collab-nature")}
                  onBlur={handleBlurChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none bg-white text-black"
                >
                  <option value="Eksklusif">Eksklusif</option>
                  <option value="Non-Eksklusif">Non-Eksklusif</option>
                </select>
              </div>
            </div>
          </section>

          {/* ============================================ */}
          {/* SECTION IV: SCOPE OF WORK */}
          {/* ============================================ */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-orange-600 border-b pb-2">
              <h4 className="font-bold text-sm uppercase tracking-wider">
                Bagian IV: Scope of Work
              </h4>
            </div>

            {/* --- SUB-SECTION: TALENT LIST --- */}
            <div className="space-y-4">
              <label className="text-[13px] font-bold text-slate-800 uppercase tracking-widest block">
                Daftar Talent
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {formData.talents?.map((talent: any, index: number) => (
                  <div
                    key={talent.id}
                    className="relative group animate-in fade-in slide-in-from-left-2 duration-300"
                  >
                    <div className="flex flex-col w-full">
                      <label className="text-[13px] font-bold text-slate-800 uppercase mb-1.5 tracking-wider">
                        Talent {index + 1}
                      </label>
                      <input
                        type="text"
                        value={talent.name}
                        onChange={(e) => onTalentChange(talent.id, e.target.value)}
                        onFocus={() => handleFocusChange("sow-1-talent")}
                        onBlur={handleBlurChange}
                        placeholder="Masukkan nama talent..."
                        className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-300 bg-white text-black"
                      />
                    </div>
                    {formData.talents.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveSection("");
                          onRemoveTalent(talent.id);
                        }}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                ))}
                {formData.talents?.length < 5 && (
                  <button
                    type="button"
                    onClick={onAddTalent}
                    className="flex items-center justify-center gap-2 my-6 border-2 border-dashed border-slate-200 rounded-xl h-11.25 text-slate-400 hover:border-[#007AFF] hover:text-[#007AFF] hover:bg-blue-50 transition-all font-bold text-sm"
                  >
                    <Plus size={16} />
                  </button>
                )}
              </div>
            </div>

            <div className="h-px bg-slate-100 my-2"></div>

            {/* --- SUB-SECTION: SOW LIST --- */}
            <div className="space-y-6">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Daftar Scope of Work
              </label>

              {sowIds.map((id, index) => {
                const num = index + 1;
                return (
                  <div
                    key={id}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 relative group animate-in zoom-in-95 duration-300"
                  >
                    <div className="flex justify-between items-center">
                      <span className="bg-[#1B3A5B] text-white text-[10px] font-bold px-3 py-1 rounded-full">
                        SOW {num}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          onRemoveSow(num);
                          // Reset activeSection to prevent scrolling to deleted element
                          setActiveSection("");
                        }}
                        className="text-red-400 hover:text-red-600 transition-colors"
                        title="Hapus SOW"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      <div className="col-span-3">
                        <InputGroup
                          label="DESKRIPSI SOW"
                          name={`sow${num}`}
                          value={formData[`sow${num}`] || ""}
                          onChange={onChange}
                          onFocus={() => handleFocusChange(`sow-${num}-col-desc`)}
                          onBlur={handleBlurChange}
                        />
                      </div>
                      <InputGroup
                        label="JUMLAH"
                        name={`jumlah${num}`}
                        value={formData[`jumlah${num}`] || ""}
                        onChange={onChange}
                        onFocus={() => handleFocusChange(`sow-${num}-col-qty`)}
                        onBlur={handleBlurChange}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <InputGroup
                        label="KET 1"
                        name={`keterangan${num}_1`}
                        value={formData[`keterangan${num}_1`] || ""}
                        onChange={onChange}
                        onFocus={() => handleFocusChange(`sow-${num}-col-1`)}
                        onBlur={handleBlurChange}
                      />
                      <InputGroup
                        label="KET 2"
                        name={`keterangan${num}_2`}
                        value={formData[`keterangan${num}_2`] || ""}
                        onChange={onChange}
                        onFocus={() => handleFocusChange(`sow-${num}-col-2`)}
                        onBlur={handleBlurChange}
                      />
                      <InputGroup
                        label="KET 3"
                        name={`keterangan${num}_3`}
                        value={formData[`keterangan${num}_3`] || ""}
                        onChange={onChange}
                        onFocus={() => handleFocusChange(`sow-${num}-col-3`)}
                        onBlur={handleBlurChange}
                      />
                    </div>
                  </div>
                );
              })}

              {activeSowCount < 10 && (
                <button
                  type="button"
                  onClick={onAddSow}
                  className="w-full py-3 flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all font-bold text-sm"
                >
                  <Plus size={16} />
                </button>
              )}
            </div>
          </section>

          {/* ============================================ */}
          {/* SECTION V: COMPETITORS */}
          {/* ============================================ */}
          {formData.collab_nature === "Eksklusif" ? (
            <section className="space-y-4 p-5 bg-slate-50 rounded-2xl border border-slate-200 animate-in fade-in duration-500">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2 text-slate-600">
                  <h4 className="font-bold text-sm uppercase tracking-wider">
                    Daftar Kompetitor
                  </h4>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {formData.competitors?.length || 0}/10
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {formData.competitors?.map((competitor: any, index: number) => (
                  <div
                    key={competitor.id}
                    className="relative group animate-in zoom-in-95 duration-200"
                  >
                    <input
                      value={competitor.name}
                      onChange={(e) => onCompetitorChange(competitor.id, e.target.value)}
                      onFocus={() => handleFocusChange(`competitor-${competitor.id}`)}
                      onBlur={handleBlurChange}
                      placeholder={`Komp. ${index + 1}`}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-[#007AFF]/20 bg-white transition-all shadow-sm text-black"
                    />

                    {formData.competitors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveSection("");
                          onRemoveCompetitor(competitor.id);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110 z-10"
                      >
                        <Trash2 size={10} />
                      </button>
                    )}
                  </div>
                ))}

                {formData.competitors?.length < 10 && (
                  <button
                    type="button"
                    onClick={onAddCompetitor}
                    className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 rounded-xl py-2 text-slate-400 hover:border-[#007AFF] hover:text-[#007AFF] hover:bg-white transition-all font-bold text-[10px] uppercase shadow-sm"
                  >
                    <Plus size={14} />
                  </button>
                )}
              </div>

              <p className="text-[9px] text-slate-400 italic">
                *Input kompetitor ini akan otomatis digabungkan ke dalam kontrak
                Eksklusif di PDF.
              </p>
            </section>
          ) : (
            <section className="space-y-4 p-5 bg-slate-50 rounded-2xl border border-slate-200 opacity-50 pointer-events-none">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <h4 className="font-bold text-sm uppercase tracking-wider">
                    Daftar Kompetitor
                  </h4>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 italic bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                ⓘ Kompetitor hanya tersedia untuk kerja sama <strong>Eksklusif</strong>. Pilih "Eksklusif" di atas untuk mengatur kompetitor.
              </p>
            </section>
          )}

          {/* ============================================ */}
          {/* SECTION VI: PAYMENT & BANK */}
          {/* ============================================ */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-red-600 border-b pb-2">
              <h4 className="font-bold text-sm uppercase tracking-wider">
                Bagian V: Pembayaran & Bank
              </h4>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <InputGroup
                label="Project Fee"
                name="project_fee"
                value={
                  formData.project_fee
                    ? Number(formData.project_fee).toLocaleString("id-ID")
                    : ""
                }
                onChange={onChange}
                onFocus={() => handleFocusChange("preview-project-fee")}
                onBlur={handleBlurChange}
                placeholder="Rp"
              />
              <InputGroup
                label="PPh 23 (2%)"
                name="pph_23"
                value={
                  formData.pph_23
                    ? Number(formData.pph_23).toLocaleString("id-ID")
                    : ""
                }
                onChange={onChange}
                onFocus={() => handleFocusChange("preview-pph-23")}
                onBlur={handleBlurChange}
                placeholder="Rp"
              />
              <div className="flex flex-col w-full">
                <label className="text-[13px] font-bold text-slate-800 uppercase mb-1.5 tracking-wider">
                  Grand Total (Rp)
                </label>
                <input
                  type="text"
                  name="grand_total"
                  value={
                    formData.grand_total
                      ? Number(formData.grand_total).toLocaleString("id-ID")
                      : ""
                  }
                  onChange={onChange}
                  onFocus={() => handleFocusChange("preview-grand-total")}
                  onBlur={handleBlurChange}
                  placeholder="0"
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/10 outline-none transition-all font-bold text-[#1B3A5B] bg-white"
                />
              </div>
            </div>

            {/* Grand Total Words (Auto-computed) */}
            <div className="flex flex-col w-full">
              <label className="text-[13px] font-bold text-slate-800 uppercase mb-1.5 tracking-wider">
                Terbilang
              </label>
              <div className="px-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-sm text-[#1B3A5B] font-medium min-h-10.5 flex items-center capitalize italic">
                {formData.grand_total_words || "Nol rupiah"}
              </div>
            </div>

            {/* Bank Details */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dashed">
              <InputGroup
                label="Nama Bank"
                name="bank_name"
                value={formData.bank_name}
                onChange={onChange}
                onFocus={() => handleFocusChange("preview-bank-name")}
                onBlur={handleBlurChange}
              />
              <InputGroup
                label="Cabang"
                name="bank_branch"
                value={formData.bank_branch}
                onChange={onChange}
                onFocus={() => handleFocusChange("preview-bank-branch")}
                onBlur={handleBlurChange}
              />
              <InputGroup
                label="Nomor Rekening"
                name="bank_account_number"
                value={formData.bank_account_number}
                onChange={onChange}
                onFocus={() => handleFocusChange("preview-bank-account-number")}
                onBlur={handleBlurChange}
              />
              <InputGroup
                label="Nama Akun"
                name="bank_account_name"
                value={formData.bank_account_name}
                onChange={onChange}
                onFocus={() => handleFocusChange("preview-bank-account-name")}
                onBlur={handleBlurChange}
              />
            </div>

            {/* Payment Date */}
            <div className="grid grid-cols-2 gap-4">
              <InputGroup
                label="Tanggal Pembayaran"
                name="payment_date"
                type="date"
                value={formData.payment_date}
                onChange={onChange}
                onFocus={() => handleFocusChange("preview-payment-date")}
                onBlur={handleBlurChange}
                placeholder="14 Nov 2025"
              />
            </div>
          </section>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-[#007AFF] text-white rounded-2xl font-bold shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 hover:bg-[#007AFF]/80 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Memproses...</span>
              </>
            ) : (
              "Submit"
            )}
          </button>
        </form>
      </div>

      {/* RIGHT COLUMN: SPK DOCUMENT PREVIEW */}
      <div className="col-span-1 lg:col-span-5 relative mt-8 lg:mt-0">
        <div className="lg:sticky lg:top-8 space-y-4">
          {/* SPK Live Preview */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-700 text-sm">
                📄 Live Preview - Dokumen SPK
              </h3>
              <span className="text-xs text-slate-400 italic">
                Real-time
              </span>
            </div>
            <div 
              className="overflow-y-auto rounded-xl border border-slate-200 shadow-lg bg-gray-50"
              style={{ 
                height: 'calc(100vh - 200px)',
                containIntrinsicSize: 'auto 800px'
              }}
            >
              <div className="bg-white" style={{ 
                minHeight: '297mm',
                aspectRatio: '210 / 297',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                transformOrigin: 'top center'
              }}>
                <iframe
                  srcDoc={generateHTML(debouncedPreviewData)}
                  className="w-full h-full border-none"
                  style={{ 
                    minHeight: '297mm',
                    display: 'block'
                  }}
                  title="SPK Document Preview"
                  sandbox="allow-scripts allow-same-origin"
                  tabIndex={-1}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    ),
    [
      formData,
      onChange,
      onSubmit,
      isLoading,
      editingId,
      activeTalentCount,
      setActiveTalentCount,
      activeSowCount,
      sowIds,
      onAddSow,
      onRemoveSow,
      activeCompetitorCount,
      setActiveCompetitorCount,
      debouncedPreviewData,
      handleFocusChange,
      handleSubmit,
    ]
  );

  return formContent;
}
