"use client";
import React, { useState } from "react";
import {
  FileText,
  Plus,
  Trash2,
  ChevronLeft,
  Building2,
  User,
  BadgeDollarSign,
  Download,
  Calendar,
} from "lucide-react";

export default function SPKView() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const EXTERNAL_CALCULATOR_URL = "https://tax-kol-calculator.vercel.app/";

  const [jangkaMode, setJangkaMode] = useState<"bulan" | "tanggal">("bulan");

  // Dummy data buat tabel awal
  const [spkList, setSpkList] = useState([
    {
      id: 1,
      noSpk: "001/SPK/KOL/2024",
      talentName: "Ariel Tatum",
      brand: "L'Oreal",
      date: "2024-01-25",
      status: "Draft",
    },
  ]);

  if (isFormOpen) {
    return (
      <div className="animate-in slide-in-from-right duration-500">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setIsFormOpen(false)}
            className="p-2 hover:bg-slate-100 rounded-full transition-all"
          >
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-2xl font-bold text-[#1B3A5B]">Buat SPK Baru</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* KOLOM KIRI: FORM SPK */}
          <div className="col-span-1 lg:col-span-7 space-y-6">
            <div className="bg-white p-4 sm:p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
              {/* BAGIAN I: IDENTITAS PERUSAHAAN */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-blue-600 border-b pb-2">
                  <Building2 size={18} />
                  <h4 className="font-bold text-sm uppercase tracking-wider">
                    Bagian I: Identitas Perusahaan
                  </h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InputGroup
                    label="Nama Penandatangan"
                    placeholder="Budi Santoso"
                  />
                  <InputGroup
                    label="Jabatan Penandatangan"
                    placeholder="Chief Excecutive Officer"
                  />
                </div>
              </section>

              {/* BAGIAN II: IDENTITAS VENDOR */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-indigo-600 border-b pb-2">
                  <User size={18} />
                  <h4 className="font-bold text-sm uppercase tracking-wider">
                    Bagian II: Identitas Vendor
                  </h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InputGroup label="Nama Talent" placeholder="Nama Lengkap" />
                  <InputGroup
                    label="NIK"
                    placeholder="Nomor Induk Kependudukan"
                  />
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block">
                      Alamat KTP
                    </label>
                    <textarea
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/10 outline-none"
                      rows={2}
                    />
                  </div>
                  <InputGroup
                    label="Bertindak Sebagai"
                    placeholder="Contoh: Influencer"
                  />
                </div>
              </section>

              {/* BAGIAN III: KETENTUAN KOMERSIAL */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-600 border-b pb-2">
                  <BadgeDollarSign size={18} />
                  <h4 className="font-bold text-sm uppercase tracking-wider">
                    Bagian III: Ketentuan Komersial
                  </h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InputGroup
                    label="Merek yang dipromosikan"
                    placeholder="Nama Brand"
                  />
                  <InputGroup
                    label="Jenis Perusahaan"
                    placeholder="Contoh: PT"
                  />
                  <InputGroup
                    label="Jenis Kerjasama"
                    placeholder="Contoh: Paid Promote"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <InputGroup label="Tanggal Mulai Kampanye" type="date" />
                    <InputGroup label="Tanggal Selesai Kampanye" type="date" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">
                      Sifat Kerjasama
                    </label>
                    <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/10 outline-none bg-white">
                      <option>Eksklusif</option>
                      <option>Non-Eksklusif</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-4">
                  <h5 className="text-[10px] font-bold text-slate-500 uppercase italic">
                    Detail Pembayaran
                  </h5>
                  <div className="grid grid-cols-3 gap-4">
                    <InputGroup
                      label="Project Fee"
                      placeholder="Rp"
                      type="number"
                    />
                    <InputGroup
                      label="PPh 23 (2%)"
                      placeholder="Rp"
                      type="number"
                    />
                    <InputGroup
                      label="Grand Total"
                      placeholder="Rp"
                      type="number"
                    />
                    <InputGroup label="Bank" placeholder="Nama Bank" />
                    <InputGroup label="No. Rekening" placeholder="0000000" />
                    <InputGroup label="Cabang" placeholder="0000000" />
                  </div>
                    <div className="col-span-2">
                      <InputGroup
                        label="Nama Akun Bank"
                        placeholder="Atas Nama"
                      />
                    </div>
                </div>
              </section>

              <button className="w-full py-4 bg-[#1B3A5B] text-white rounded-2xl font-bold shadow-xl hover:scale-[1.02] transition-all">
                Simpan & Generate SPK
              </button>
            </div>
          </div>

          {/* KOLOM KANAN: TAX CALCULATOR (STICKY) */}
          <div className="col-span-1 lg:col-span-5 relative mt-8 lg:mt-0">
            <div className="lg:sticky lg:top-8 space-y-4">
              <div className="bg-white p-2 sm:p-4 rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] xl:h-[800px] 2xl:h-[100vh] 2xl:w-130">
                <div className="flex items-center justify-between mb-2 sm:mb-4 px-2">
                  <h3 className="font-bold text-slate-700 text-xs sm:text-sm">
                    Tax Calculator
                  </h3>
                </div>
                <div className="flex-1">
                  <iframe
                    src={EXTERNAL_CALCULATOR_URL}
                    className="w-full h-full rounded-2xl"
                    style={{ minHeight: 250, height: '100%', border: 'none' }}
                    title="Tax Calculator"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#1B3A5B]">
            Surat Perjanjian Kerja
          </h2>
          <p className="text-sm text-slate-500">
            Manage and generate talent contracts
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 bg-[#1B3A5B] text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:scale-105 transition-all"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              <th className="p-2 sm:p-5">No. SPK</th>
              <th className="p-2 sm:p-5">Talent</th>
              <th className="p-2 sm:p-5">Brand</th>
              <th className="p-2 sm:p-5">Date</th>
              <th className="p-2 sm:p-5 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="text-xs sm:text-sm">
            {spkList.map((item) => (
              <tr
                key={item.id}
                className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
              >
                <td className="p-2 sm:p-5 font-bold text-[#1B3A5B]">{item.noSpk}</td>
                <td className="p-2 sm:p-5 font-semibold">{item.talentName}</td>
                <td className="p-2 sm:p-5 text-slate-500">{item.brand}</td>
                <td className="p-2 sm:p-5 text-slate-500">{item.date}</td>
                <td className="p-2 sm:p-5">
                  <div className="flex justify-center gap-2 flex-wrap">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                      <FileText size={16} className="sm:size-6" />
                    </button>
                    <button className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all">
                      <Trash2 size={16} className="sm:size-6" />
                    </button>
                    <button className="p-2 text-green-500 hover:bg-green-50 rounded-xl transition-all">
                      <Download size={16} className="sm:size-6" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Helper Component buat Input agar kode bersih
function InputGroup({ label, placeholder, type = "text" }: any) {
  return (
    <div className="flex flex-col w-full">
      <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-300 bg-white"
      />
    </div>
  );
}
