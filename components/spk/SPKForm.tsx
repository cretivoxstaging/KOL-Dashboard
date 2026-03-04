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
import React from "react";
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

interface SPKFormProps {
  formData: any; // FormDataType dari parent
  onChange: (e: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  editingId: number | null;
  activeTalentCount: number;
  setActiveTalentCount: (count: number | ((prev: number) => number)) => void;
  activeSowCount: number;
  sowIds: number[];
  onAddSow: () => void;
  onRemoveSow: (index: number) => void;
  activeCompetitorCount: number;
  setActiveCompetitorCount: (
    count: number | ((prev: number) => number)
  ) => void;
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
        placeholder={placeholder}
        className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-300 bg-white"
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
  activeSowCount,
  sowIds,
  onAddSow,
  onRemoveSow,
  activeCompetitorCount,
  setActiveCompetitorCount,
}: SPKFormProps) {
  const EXTERNAL_CALCULATOR_URL = "https://tax-kol-calculator.vercel.app/";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="col-span-1 lg:col-span-7 space-y-6">
        <form
          onSubmit={onSubmit}
          className="bg-white p-4 sm:p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8"
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
                placeholder="Bryan Josep..."
              />
              <InputGroup
                label="Jabatan Penandatangan"
                name="first_party_position"
                value={formData.first_party_position}
                onChange={onChange}
                placeholder="Creative Director"
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
                placeholder="Nama Lengkap"
              />
              <InputGroup
                label="NIK"
                name="vendor_nik"
                value={formData.vendor_nik}
                onChange={onChange}
                placeholder="Nomor Induk Kependudukan"
              />
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block">
                  Alamat KTP
                </label>
                <textarea
                  name="vendor_address"
                  value={formData.vendor_address}
                  onChange={onChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/10 outline-none"
                  rows={2}
                />
              </div>
              <InputGroup
                label="Bertindak Sebagai"
                name="vendor_role"
                value={formData.vendor_role}
                onChange={onChange}
                placeholder="Contoh: Influencer"
              />
              <InputGroup
                label="Nama Perusahaan Vendor"
                name="vendor_company_name"
                value={formData.vendor_company_name}
                onChange={onChange}
                placeholder="Contoh: Andi Studio"
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
                placeholder="Nama Brand"
              />
              <InputGroup
                label="Jenis Perusahaan"
                name="business_type"
                value={formData.business_type}
                onChange={onChange}
                placeholder="Perbankan Digital"
              />
              <InputGroup
                label="Jenis Kerjasama"
                name="collab_type"
                value={formData.collab_type}
                onChange={onChange}
                placeholder="Contoh: Campaign Digital"
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
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/10 outline-none bg-white"
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
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/10 outline-none bg-white"
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
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none bg-white"
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
                {Array.from({ length: activeTalentCount }).map((_, index) => {
                  const num = index + 1;
                  return (
                    <div
                      key={`talent-wrapper-${num}`}
                      className="relative group animate-in fade-in slide-in-from-left-2 duration-300"
                    >
                      <InputGroup
                        label={`Talent ${num}`}
                        name={`talent_name${num}`}
                        value={formData[`talent_name${num}`] || ""}
                        onChange={onChange}
                        placeholder="Masukkan nama talent..."
                      />
                      {activeTalentCount > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newData = { ...formData };
                            for (let i = num; i < activeTalentCount; i++) {
                              newData[`talent_name${i}`] =
                                formData[`talent_name${i + 1}`];
                            }
                            newData[`talent_name${activeTalentCount}`] = "";
                            // Note: This should be handled by parent state
                            // For now, we'll need to pass handler from parent
                            setActiveTalentCount((prev) => prev - 1);
                          }}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  );
                })}

                {activeTalentCount < 5 && (
                  <button
                    type="button"
                    onClick={() => setActiveTalentCount((prev) => prev + 1)}
                    className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-xl py-2 text-slate-400 hover:border-[#007AFF] hover:text-[#007AFF] hover:bg-blue-50 transition-all font-bold text-xs"
                  >
                    <Plus size={14} />
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
                        onClick={() => onRemoveSow(num)}
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
                        />
                      </div>
                      <InputGroup
                        label="JUMLAH"
                        name={`jumlah${num}`}
                        value={formData[`jumlah${num}`] || ""}
                        onChange={onChange}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <InputGroup
                        label="KET 1"
                        name={`keterangan${num}_1`}
                        value={formData[`keterangan${num}_1`] || ""}
                        onChange={onChange}
                      />
                      <InputGroup
                        label="KET 2"
                        name={`keterangan${num}_2`}
                        value={formData[`keterangan${num}_2`] || ""}
                        onChange={onChange}
                      />
                      <InputGroup
                        label="KET 3"
                        name={`keterangan${num}_3`}
                        value={formData[`keterangan${num}_3`] || ""}
                        onChange={onChange}
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
          <section className="space-y-4 p-5 bg-slate-50 rounded-2xl border border-slate-200 animate-in fade-in duration-500">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2 text-slate-600">
                <h4 className="font-bold text-sm uppercase tracking-wider">
                  Daftar Kompetitor
                </h4>
              </div>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                {activeCompetitorCount}/10
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Array.from({ length: activeCompetitorCount }).map(
                (_, index) => {
                  const num = index + 1;
                  return (
                    <div
                      key={`comp-wrapper-${num}`}
                      className="relative group animate-in zoom-in-95 duration-200"
                    >
                      <input
                        name={`competitor${num}`}
                        value={formData[`competitor${num}`] || ""}
                        onChange={onChange}
                        placeholder={`Komp. ${num}`}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-[#007AFF]/20 bg-white transition-all shadow-sm"
                      />

                      {activeCompetitorCount > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newData = { ...formData };
                            for (let i = num; i < 10; i++) {
                              newData[`competitor${i}`] =
                                formData[`competitor${i + 1}`];
                            }
                            newData[`competitor10`] = "";
                            setActiveCompetitorCount((prev) => prev - 1);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110 z-10"
                        >
                          <Trash2 size={10} />
                        </button>
                      )}
                    </div>
                  );
                }
              )}

              {activeCompetitorCount < 10 && (
                <button
                  type="button"
                  onClick={() =>
                    setActiveCompetitorCount((prev) => prev + 1)
                  }
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
                  placeholder="0"
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/10 outline-none transition-all font-bold text-[#1B3A5B]"
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
              />
              <InputGroup
                label="Cabang"
                name="bank_branch"
                value={formData.bank_branch}
                onChange={onChange}
              />
              <InputGroup
                label="Nomor Rekening"
                name="bank_account_number"
                value={formData.bank_account_number}
                onChange={onChange}
              />
              <InputGroup
                label="Nama Akun"
                name="bank_account_name"
                value={formData.bank_account_name}
                onChange={onChange}
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

      {/* RIGHT COLUMN: TAX CALCULATOR */}
      <div className="col-span-1 lg:col-span-5 relative mt-8 lg:mt-0">
        <div className="lg:sticky lg:top-8 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-screen w-full">
            <h3 className="font-bold text-slate-700 text-sm mb-4">
              Tax Calculator
            </h3>
            <div className="flex-1 overflow-hidden rounded-2xl relative bg-white">
              <iframe
                src={EXTERNAL_CALCULATOR_URL}
                className="absolute inset-0 w-full h-full border-none overflow-hidden"
                style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
                allow="clipboard-write"
                sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups allow-presentation allow-clipboard-write"
                title="Tax Calculator"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
