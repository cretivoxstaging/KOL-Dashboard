"use client";
import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  ChevronLeft,
  ChevronDown,
  Building2,
  User,
  BadgeDollarSign,
  Download,
  ListChecks,
  Banknote,
  Pencil,
} from "lucide-react";

interface SPKViewProps {
  spkList: any[];
  fetchSPK: () => void;
}

export default function SPKView({
  spkList: propsSpkList,
  fetchSPK,
}: SPKViewProps) {
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const EXTERNAL_CALCULATOR_URL = "https://tax-kol-calculator.vercel.app/";
  const [activeSowCount, setActiveSowCount] = useState(1);
  const [sowIds, setSowIds] = useState([Date.now()]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedYear, setSelectedYear] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    item: any | null;
  }>({
    open: false,
    item: null,
  });
  const [confirmText, setConfirmText] = useState("");

  // Buat helper untuk generate initial SOW 1-10
  const initialSows: { [key: string]: string } = Array.from({
    length: 10,
  }).reduce((acc: { [key: string]: string }, _, i) => {
    const n = i + 1;
    acc[`sow${n}`] = "";
    acc[`jumlah${n}`] = "";
    acc[`keterangan${n}_1`] = "";
    acc[`keterangan${n}_2`] = "";
    acc[`keterangan${n}_3`] = "";
    return acc;
  }, {});

  const filteredAndSortedSPK = propsSpkList
    .filter((item) => {
      const searchTerm = searchQuery.toLowerCase();
      const matchesSearch =
        item.talent?.toLowerCase().includes(searchTerm) ||
        item.brand?.toLowerCase().includes(searchTerm) ||
        item.number?.toLowerCase().includes(searchTerm);

      const dateParts = item.date ? item.date.split("/") : [];
      const itemMonth = dateParts[1];
      const itemYear = dateParts[2];

      const matchesMonth =
        selectedMonth === "all" || itemMonth === selectedMonth;
      const matchesYear = selectedYear === "all" || itemYear === selectedYear;

      return matchesSearch && matchesMonth && matchesYear;
    })
    .sort((a, b) => {
      const parseDate = (dateStr: string) => {
        const [d, m, y] = dateStr.split("/");
        return new Date(`${y}-${m}-${d}`).getTime();
      };
      const dateA = parseDate(a.date);
      const dateB = parseDate(b.date);
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

  const totalPages = Math.ceil(filteredAndSortedSPK.length / rowsPerPage);
  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentItems = filteredAndSortedSPK.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedMonth, selectedYear]);
  const formatTanggalIndo = (dateStr: string) => {
    if (!dateStr) return "";

    const bulanIndo = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    const parts = dateStr.split("-");

    if (parts.length === 3) {
      // Format YYYY-MM-DD (untuk payment_date)
      return `${parseInt(parts[2])} ${bulanIndo[parseInt(parts[1]) - 1]} ${parts[0]}`;
    } else if (parts.length === 2) {
      // Format YYYY-MM (untuk campaign_period)
      return `${bulanIndo[parseInt(parts[1]) - 1]} ${parts[0]}`;
    }

    return dateStr;
  };

  const [formData, setFormData] = useState({
    // Bagian I: Identitas Perusahaan [cite: 8]
    first_party_signer: "",
    first_party_position: "",

    // Bagian II: Identitas Vendor [cite: 9]
    vendor_name: "",
    vendor_nik: "",
    vendor_address: "",
    vendor_role: "",
    vendor_company_name: "",

    // Bagian III: Ketentuan Komersial
    brand_name: "",
    business_type: "",
    collab_type: "",
    campaign_start: "", // Input bulan mulai
    campaign_end: "", // Input bulan selesai
    campaign_period: "", // Gabungan untuk PDF <%= campaign_period %>
    collab_nature: "Eksklusif",

    // Bagian IV: Scope of Work
    talent_name: "",
    ...initialSows, // Spread hasil helper yang sudah jelas tipenya

    // Bagian V: Pembayaran & Bank
    project_fee: "",
    pph_23: "",
    grand_total: "",
    grand_total_words: "",
    bank_name: "",
    bank_branch: "",
    bank_account_number: "",
    bank_account_name: "",
    payment_date: "", // <%= payment_date %>
  });

  const handleRemoveSpecificSow = (indexToRemove: number) => {
    if (activeSowCount > 1) {
      setFormData((prev: any) => {
        const newData = { ...prev };
        // Narik data bawah ke atas
        for (let i = indexToRemove; i < activeSowCount; i++) {
          const next = i + 1;
          newData[`sow${i}`] = prev[`sow${next}`];
          newData[`jumlah${i}`] = prev[`jumlah${next}`];
          newData[`keterangan${i}_1`] = prev[`keterangan${next}_1`];
          newData[`keterangan${i}_2`] = prev[`keterangan${next}_2`];
          newData[`keterangan${i}_3`] = prev[`keterangan${next}_3`];
        }
        // Kosongin slot terakhir
        const last = activeSowCount;
        newData[`sow${last}`] = "";
        newData[`jumlah${last}`] = "";
        newData[`keterangan${last}_1`] = "";
        newData[`keterangan${last}_2`] = "";
        newData[`keterangan${last}_3`] = "";
        return newData;
      });

      setSowIds((prev) => prev.filter((_, i) => i !== indexToRemove - 1));
      setActiveSowCount((prev) => prev - 1);
    }
  };

  const handleAddSow = () => {
    if (sowIds.length < 10) {
      setSowIds((prev) => [...prev, Date.now()]); // Kasih ID unik pake timestamp
      setActiveSowCount((prev) => prev + 1);
    }
  };

  // Fungsi buat buka modal
  const openDeleteModal = (item: any) => {
    setDeleteModal({ open: true, item: item });
    setConfirmText(""); // Reset text setiap buka modal baru
  };

  // Fungsi eksekusi hapus (Gantiin isi handleDelete lo yang lama)
  const executeDelete = async () => {
    if (confirmText.toLowerCase() !== "delete") return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/spk/${deleteModal.item.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // Gak perlu alert lagi biar modern, langsung fetch aja
        fetchSPK();
        setDeleteModal({ open: false, item: null });
      } else {
        alert("Gagal menghapus SPK");
      }
    } catch (error) {
      console.error("Error delete:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEdit = (item: any) => {
    // 1. Simpan ID-nya biar pas disubmit sistem tau ini mode "Update"
    setEditingId(item.id);

    // 2. Kosongin Form biar lo bisa ngetik dari nol (Re-Generate)
    // Tapi nomor SPK-nya lo isi otomatis biar lo gak capek ngetik ulang
    setFormData({
      ...initialSows, // Reset SOW
      first_party_signer: "",
      first_party_position: "",
      vendor_name: "",
      vendor_nik: "",
      vendor_address: "",
      vendor_role: "",
      vendor_company_name: "",
      brand_name: "",
      business_type: "",
      collab_type: "",
      campaign_start: "",
      campaign_end: "",
      campaign_period: "",
      collab_nature: "Eksklusif",
      talent_name: item.number, // Tips: Sementara taro nomor SPK lama di sini biar lo tau lagi edit nomor berapa
      project_fee: "",
      pph_23: "",
      grand_total: "",
      grand_total_words: "",
      bank_name: "",
      bank_branch: "",
      bank_account_number: "",
      bank_account_name: "",
      payment_date: "",
    });

    setIsFormOpen(true); // Buka form-nya
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const campaign_period = `${formatTanggalIndo(formData.campaign_start)} - ${formatTanggalIndo(formData.campaign_end)}`;
    const formattedPaymentDate = formatTanggalIndo(formData.payment_date);

    const payload = {
      ...formData,
      number: editingId
        ? propsSpkList.find((i) => i.id === editingId)?.number
        : formData.brand_name,
      talent: formData.talent_name,
      brand: formData.brand_name,
      campaign_period: campaign_period,
      payment_date: formattedPaymentDate,
      project_fee: Number(formData.project_fee).toLocaleString("id-ID"),
      pph_23: Number(formData.pph_23).toLocaleString("id-ID"),
      grand_total: Number(formData.grand_total).toLocaleString("id-ID"),
    };

    const url = editingId ? `/api/spk/${editingId}` : "/api/spk";
    const method = editingId ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log("Update Success! Meminta tabel refresh...");

        await new Promise((resolve) => setTimeout(resolve, 2500));

        await fetchSPK();
        setIsFormOpen(false);
        setEditingId(null);
        alert("PDF Berhasil Diperbarui dengan Nomor yang Sama!");
      } else {
        alert("Gagal update data.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    // Cek kalau ini kolom uang
    if (["project_fee", "pph_23", "grand_total"].includes(name)) {
      // 1. Hapus semua selain angka
      const cleanValue = value.replace(/\D/g, "");

      // 2. Update state dengan angka murni (string)
      setFormData((prev) => ({
        ...prev,
        [name]: cleanValue,
      }));
    } else {
      // Field lainnya normal
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  useEffect(() => {
    // Ambil angka dari grand_total yang lu input manual
    const nominal = Number(formData.grand_total) || 0;

    // Update field grand_total_words otomatis
    setFormData((prev) => ({
      ...prev,
      grand_total_words: nominal > 0 ? `${angkaKeTerbilang(nominal)}` : "",
    }));
  }, [formData.grand_total]); // Hanya jalan pas kolom Grand Total berubah

  const availableYears = [
    ...new Set(
      propsSpkList.map((item) => {
        if (!item.date) return "";
        const parts = item.date.split("/"); // Pecah 12/02/2026
        return parts[2]; // Ambil 2026
      }),
    ),
  ]
    .filter(Boolean)
    .sort((a, b) => b.localeCompare(a)); // Urutin tahun terbaru

  if (isFormOpen) {
    return (
      <div className="animate-in slide-in-from-right duration-500 pb-20">
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
          <div className="col-span-1 lg:col-span-7 space-y-6">
            <form
              onSubmit={handleSubmit}
              className="bg-white p-4 sm:p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8"
            >
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
                    name="first_party_signer"
                    value={formData.first_party_signer}
                    onChange={handleChange}
                    placeholder="Bryan Josep..."
                  />
                  <InputGroup
                    label="Jabatan Penandatangan"
                    name="first_party_position"
                    value={formData.first_party_position}
                    onChange={handleChange}
                    placeholder="Creative Director"
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
                  <InputGroup
                    label="Nama Talent"
                    name="vendor_name"
                    value={formData.vendor_name}
                    onChange={handleChange}
                    placeholder="Nama Lengkap"
                  />
                  <InputGroup
                    label="NIK"
                    name="vendor_nik"
                    value={formData.vendor_nik}
                    onChange={handleChange}
                    placeholder="Nomor Induk Kependudukan"
                  />
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block">
                      Alamat KTP
                    </label>
                    <textarea
                      name="vendor_address"
                      value={formData.vendor_address}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/10 outline-none"
                      rows={2}
                    />
                  </div>
                  <InputGroup
                    label="Bertindak Sebagai"
                    name="vendor_role"
                    value={formData.vendor_role}
                    onChange={handleChange}
                    placeholder="Contoh: Influencer"
                  />
                  <InputGroup
                    label="Nama Perusahaan Vendor"
                    name="vendor_company_name"
                    value={formData.vendor_company_name}
                    onChange={handleChange}
                    placeholder="Contoh: Andi Studio"
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
                    label="Merek Produk"
                    name="brand_name"
                    value={formData.brand_name}
                    onChange={handleChange}
                    placeholder="Nama Brand"
                  />
                  <InputGroup
                    label="Jenis Bisnis"
                    name="business_type"
                    value={formData.business_type}
                    onChange={handleChange}
                    placeholder="Perbankan Digital"
                  />
                  <InputGroup
                    label="Jenis Kerjasama"
                    name="collab_type"
                    value={formData.collab_type}
                    onChange={handleChange}
                    placeholder="Contoh: Campaign Digital"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col w-full">
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">
                        Mulai Kampanye
                      </label>
                      <input
                        type="month"
                        name="campaign_start"
                        value={formData.campaign_start}
                        onChange={handleChange}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/10 outline-none bg-white"
                      />
                    </div>
                    <div className="flex flex-col w-full">
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">
                        Selesai Kampanye
                      </label>
                      <input
                        type="month"
                        name="campaign_end"
                        value={formData.campaign_end}
                        onChange={handleChange}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/10 outline-none bg-white"
                      />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">
                      Sifat Kerjasama
                    </label>
                    <select
                      name="collab_nature"
                      value={formData.collab_nature}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none bg-white"
                    >
                      <option value="Eksklusif">Eksklusif</option>
                      <option value="Non-Eksklusif">Non-Eksklusif</option>
                    </select>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                {/* HEADER TETAP DI ATAS */}
                <div className="flex items-center gap-2 text-orange-600 border-b pb-2">
                  <ListChecks size={18} />
                  <h4 className="font-bold text-sm uppercase tracking-wider">
                    Bagian IV: Scope of Work
                  </h4>
                </div>

                <InputGroup
                  label="Nama Talent"
                  name="talent_name"
                  value={formData.talent_name}
                  onChange={handleChange}
                  placeholder="Nama Talent"
                />

                {/* LIST SOW YANG DINAMIS */}
                <div className="space-y-6">
                  {sowIds.map((id, index) => {
                    const num = index + 1;
                    return (
                      <div
                        key={id}
                        className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4"
                      >
                        <div className="flex justify-between items-center">
                          <span className="bg-[#1B3A5B] text-white text-[10px] font-bold px-3 py-1 rounded-full">
                            SOW {num}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSpecificSow(num)}
                            className="text-red-500 font-bold text-[10px] uppercase flex items-center gap-1"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                          <div className="col-span-3">
                            <InputGroup
                              label="DESKRIPSI SOW"
                              name={`sow${num}`}
                              value={
                                formData[
                                  `sow${num}` as keyof typeof formData
                                ] || ""
                              }
                              onChange={handleChange}
                            />
                          </div>
                          <InputGroup
                            label="JUMLAH"
                            name={`jumlah${num}`}
                            value={
                              formData[
                                `jumlah${num}` as keyof typeof formData
                              ] || ""
                            }
                            onChange={handleChange}
                          />
                        </div>

                        {/* Keterangan 1, 2, 3 juga sama... */}
                        <div className="grid grid-cols-3 gap-3">
                          <InputGroup
                            label="KET 1"
                            name={`keterangan${num}_1`}
                            value={
                              formData[
                                `keterangan${num}_1` as keyof typeof formData
                              ] || ""
                            }
                            onChange={handleChange}
                          />
                          <InputGroup
                            label="KET 2"
                            name={`keterangan${num}_2`}
                            value={
                              formData[
                                `keterangan${num}_2` as keyof typeof formData
                              ] || ""
                            }
                            onChange={handleChange}
                          />
                          <InputGroup
                            label="KET 3"
                            name={`keterangan${num}_3`}
                            value={
                              formData[
                                `keterangan${num}_3` as keyof typeof formData
                              ] || ""
                            }
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* TOMBOL TAMBAH DI BAWAH LIST SOW */}
                {activeSowCount < 10 && (
                  <button
                    type="button"
                    onClick={handleAddSow}
                    className="w-full py-3 flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all font-bold text-sm"
                  >
                    <Plus size={16} />
                  </button>
                )}
              </section>

              {/* BAGIAN V: PEMBAYARAN (TAMBAHAN PDF PAGE 3) */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-red-600 border-b pb-2">
                  <Banknote size={18} />
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
                    onChange={handleChange}
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
                    onChange={handleChange}
                    placeholder="Rp"
                  />
                  <div className="flex flex-col w-full">
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">
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
                      onChange={handleChange}
                      placeholder="0"
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/10 outline-none transition-all font-bold text-[#1B3A5B]"
                    />
                  </div>
                </div>

                {/* Kolom Terbilang Tetap Otomatis Menampilkan Hasil */}
                <div className="flex flex-col w-full">
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">
                    Terbilang
                  </label>
                  <div className="px-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-sm text-[#1B3A5B] font-medium min-h-10.5 flex items-center capitalize italic">
                    {formData.grand_total_words || "Nol rupiah"}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dashed">
                  <InputGroup
                    label="Nama Bank"
                    name="bank_name"
                    value={formData.bank_name}
                    onChange={handleChange}
                  />
                  <InputGroup
                    label="Cabang"
                    name="bank_branch"
                    value={formData.bank_branch}
                    onChange={handleChange}
                  />
                  <InputGroup
                    label="Nomor Rekening"
                    name="bank_account_number"
                    value={formData.bank_account_number}
                    onChange={handleChange}
                  />
                  <InputGroup
                    label="Nama Akun"
                    name="bank_account_name"
                    value={formData.bank_account_name}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InputGroup
                    label="Tanggal Pembayaran"
                    name="payment_date"
                    type="date"
                    value={formData.payment_date}
                    onChange={handleChange}
                    placeholder="14 Nov 2025"
                  />
                </div>
              </section>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-[#1B3A5B] text-white rounded-2xl font-bold shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
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

          {/* KOLOM KANAN: TAX CALCULATOR */}
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
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      <h2 className="text-2xl font-bold mb-8 text-[#1B3A5B]">SPK Management</h2>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
        {/* Grup Filter (Search + Month + Sort) */}
        <div className="flex flex-wrap items-center gap-2 flex-1 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-sm">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <svg
                className="w-4 h-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search talent or brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/10 outline-none transition-all shadow-sm"
            />
          </div>

          {/* Filter Tahun */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 h-11 border font-bold border-slate-200 rounded-2xl bg-white text-sm outline-none shadow-sm focus:ring-2 focus:ring-blue-500/10 transition-all cursor-pointer text-[#1B3A5B]"
          >
            <option value="all">All Year</option>
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          {/* Filter Bulan */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 h-11 border font-bold border-slate-200 rounded-2xl bg-white text-sm outline-none shadow-sm focus:ring-2 focus:ring-blue-500/10 transition-all cursor-pointer"
          >
            <option value="all">All Month</option>
            <option value="01">January</option>
            <option value="02">February</option>
            <option value="03">March</option>
            <option value="04">April</option>
            <option value="05">May</option>
            <option value="06">June</option>
            <option value="07">July</option>
            <option value="08">August</option>
            <option value="09">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
          </select>
        </div>

        {/* Tombol Tambah (Action Utama) */}
        <button
          onClick={() => {
            setEditingId(null); // Pastikan reset edit state kalau mau buat baru
            setIsFormOpen(true);
          }}
          className="flex items-center gap-2 bg-[#1B3A5B] text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:scale-105 transition-all w-full md:w-auto justify-center"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left min-w-200">
          <thead className="bg-slate-200 border-b border-slate-100">
            <tr className="text-[10px] sm:text-[11px] font-bold text-slate-800 uppercase tracking-widest">
              <th className="p-2 sm:p-5">No. SPK</th>
              <th className="p-2 sm:p-5">Talent</th>
              <th className="p-2 sm:p-5">Brand</th>
              <th
                className="p-2 sm:p-5 cursor-pointer hover:bg-slate-300 transition-colors group"
                onClick={() =>
                  setSortOrder(sortOrder === "desc" ? "asc" : "desc")
                }
              >
                <div className="flex items-center gap-1">
                  <span>Date</span>
                  <div className="flex flex-col -space-y-1 opacity-40 group-hover:opacity-100 transition-opacity">
                    {/* Icon Panah Atas & Bawah */}
                    <svg
                      className={`w-2.5 h-2.5 ${sortOrder === "asc" ? "text-[#1B3A5B] opacity-100" : ""}`}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 4l-8 8h16l-8-8z" />
                    </svg>
                    <svg
                      className={`w-2.5 h-2.5 ${sortOrder === "desc" ? "text-[#1B3A5B] opacity-100" : ""}`}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 20l8-8H4l8 8z" />
                    </svg>
                  </div>
                </div>
              </th>
              <th className="p-2 sm:p-5 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="text-xs sm:text-sm">
            {currentItems.length > 0 ? (
              currentItems.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                >
                  <td className="p-2 sm:p-5 font-bold text-[#1B3A5B]">
                    {item.number}
                  </td>
                  <td className="p-2 sm:p-5 font-semibold">{item.talent}</td>
                  <td className="p-2 sm:p-5 text-slate-500">{item.brand}</td>
                  <td className="p-2 sm:p-5 text-slate-500">{item.date}</td>
                  <td className="p-5 text-center">
                    <div className="relative inline-block text-left">
                      <button
                        onClick={() =>
                          setOpenActionId(
                            openActionId === item.id ? null : item.id,
                          )
                        }
                        className="flex items-center gap-2 bg-[#1B3A5B] text-white px-4 py-2 rounded-lg text-[10px] font-bold transition-all shadow-sm hover:bg-[#254d75]"
                      >
                        Action
                        <ChevronDown
                          size={12}
                          className={`transition-transform ${openActionId === item.id ? "rotate-180" : ""}`}
                        />
                      </button>

                      {openActionId === item.id && (
                        <>
                          {/* Backdrop untuk nutup kalau klik di luar */}
                          <div
                            className="fixed inset-0 z-10 animate-in fade-in duration-300"
                            onClick={() => setOpenActionId(null)}
                          ></div>

                          {/* Dropdown Menu - Posisinya right-0 biar sejajar ujung tombol */}
                          <div className="absolute top-full mt-2 right-0 w-44 bg-white border border-slate-100 rounded-2xl shadow-2xl z-20 py-2 origin-top-right transition-all animate-in fade-in zoom-in-95 duration-200">
                            {/* Menu Edit */}
                            <button
                              onClick={() => {
                                handleOpenEdit(item);
                                setOpenActionId(null);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                              <Pencil size={14} className="text-amber-500" />
                              Edit
                            </button>

                            {/* Menu Download/View PDF */}
                            <button
                              onClick={() => {
                                window.open(item.url, "_blank");
                                setOpenActionId(null);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                              <Download
                                size={14}
                                className="text-emerald-500"
                              />
                              Download PDF
                            </button>

                            <div className="h-px bg-slate-100 my-1 mx-2"></div>

                            {/* Menu Delete */}
                            <button
                              onClick={() => {
                                openDeleteModal(item);
                                setOpenActionId(null);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="p-10 text-center text-slate-400 italic"
                >
                  {searchQuery
                    ? `Data "${searchQuery}" tidak ditemukan...`
                    : "Belum ada data SPK."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {/* MODAL DELETE PREMIUM */}
        {deleteModal.open && (
          <div className="fixed inset-0 z-200 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-300">
              <div className="p-8 space-y-6">
                <div className="flex items-center gap-3 text-red-600">
                  <div className="p-3 bg-red-50 rounded-2xl">
                    <Trash2 size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-[#1B3A5B]">
                    Delete SPK
                  </h3>
                </div>

                <div className="bg-red-50 border border-red-100 p-4 rounded-2xl">
                  <p className="text-red-800 text-xs leading-relaxed">
                    <span className="font-bold">Warning:</span> This action
                    cannot be undone. Data for <b>{deleteModal.item?.talent}</b>{" "}
                    on brand <b>{deleteModal.item?.brand}</b> will be
                    permanently removed.
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-700">
                    Type <span className="text-red-600">delete</span> to
                    confirm:
                  </label>
                  <input
                    type="text"
                    placeholder="Type 'delete' here..."
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-red-500/5 focus:border-red-200 transition-all text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => setDeleteModal({ open: false, item: null })}
                    className="py-3.5 rounded-2xl font-bold text-slate-500 border border-slate-200 hover:bg-slate-50 transition-all text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={
                      confirmText.toLowerCase() !== "delete" || isLoading
                    }
                    onClick={executeDelete}
                    className="py-3.5 rounded-2xl font-bold bg-red-500 hover:bg-red-600 text-white disabled:opacity-30 disabled:grayscale transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-red-200"
                  >
                    <Trash2 size={18} />
                    {isLoading ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-col md:flex-row items-center justify-between p-1 border-t border-slate-50 gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-slate-500">
            Rows per page:
          </span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-blue-500/10 shadow-sm cursor-pointer"
          >
            {[10, 20, 50, 100,].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span className="text-xs text-slate-400">
            Showing {filteredAndSortedSPK.length > 0 ? indexOfFirstItem + 1 : 0}{" "}
            to {Math.min(indexOfLastItem, filteredAndSortedSPK.length)} of{" "}
            {filteredAndSortedSPK.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Prev
          </button>

          <div className="flex items-center gap-1 mx-2">
            {[...Array(totalPages)].map((_, i) => {
              const pageNum = i + 1;
              // Logic Sembunyikan page kalo kebanyakan (sama kayak talent)
              if (
                totalPages > 5 &&
                Math.abs(pageNum - currentPage) > 1 &&
                pageNum !== 1 &&
                pageNum !== totalPages
              ) {
                if (pageNum === 2 || pageNum === totalPages - 1)
                  return (
                    <span key={pageNum} className="text-slate-300">
                      ...
                    </span>
                  );
                return null;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    currentPage === pageNum
                      ? "bg-[#1B3A5B] text-white shadow-md shadow-[#1B3A5B]/20"
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

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
      <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">
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
function angkaKeTerbilang(n: number): string {
  if (n === 0) return "";
  const units = [
    "",
    "satu",
    "dua",
    "tiga",
    "empat",
    "lima",
    "enam",
    "tujuh",
    "delapan",
    "sembilan",
    "sepuluh",
    "sebelas",
  ];
  let hasil = "";

  if (n < 12) hasil = units[n];
  else if (n < 20) hasil = angkaKeTerbilang(n - 10) + " belas";
  else if (n < 100)
    hasil = angkaKeTerbilang(Math.floor(n / 10)) + " puluh " + units[n % 10];
  else if (n < 200) hasil = "seratus " + angkaKeTerbilang(n - 100);
  else if (n < 1000)
    hasil =
      angkaKeTerbilang(Math.floor(n / 100)) +
      " ratus " +
      angkaKeTerbilang(n % 100);
  else if (n < 2000) hasil = "seribu " + angkaKeTerbilang(n - 1000);
  else if (n < 1000000)
    hasil =
      angkaKeTerbilang(Math.floor(n / 1000)) +
      " ribu " +
      angkaKeTerbilang(n % 1000);
  else if (n < 1000000000)
    hasil =
      angkaKeTerbilang(Math.floor(n / 1000000)) +
      " juta " +
      angkaKeTerbilang(n % 1000000);
  else if (n < 1000000000000)
    hasil =
      angkaKeTerbilang(Math.floor(n / 1000000000)) +
      " miliar " +
      angkaKeTerbilang(n % 1000000000);

  return hasil.replace(/\s+/g, " ").trim();
}
