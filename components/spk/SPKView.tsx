/**
 * ============================================
 * SPK VIEW - MAIN ORCHESTRATOR COMPONENT
 * ============================================
 *
 * Main component yang mengelola:
 * - Data fetching dan state management global
 * - Form submission logic dan validation
 * - Filtering, sorting, dan pagination
 * - Orchestration antar sub-component (SPKFilter, SPKTable, SPKForm, SPKDeleteModal)
 *
 * Sub-components yang digunakan:
 * - SPKFilter: Search dan filter controls
 * - SPKTable: Data display dengan pagination
 * - SPKForm: Create/edit form giant
 * - SPKDeleteModal: Modal konfirmasi delete
 *
 * State Structure:
 * - UI State: isFormOpen, isLoading, editingId
 * - Filter State: searchQuery, selectedMonth, selectedYear, sortOrder
 * - Pagination State: currentPage, rowsPerPage
 * - Form State: formData dengan struktur lengkap
 * - Dynamic Counters: activeTalentCount, activeSowCount, activeCompetitorCount
 * - Delete Modal State: deleteModal, confirmText
 */

"use client";
import React, { useState, useEffect } from "react";
import { Plus, ChevronLeft, RefreshCw } from "lucide-react";

// ============================================
// IMPORT SUB-COMPONENTS
// ============================================
import SPKFilter from "./SPKFilter";
import SPKTable from "./SPKTable";
import SPKForm from "./SPKForm";
import SPKDeleteModal from "./SPKDeleteModal";

// ============================================
// IMPORT HELPER FUNCTIONS
// ============================================
import {
  formatTanggalIndo,
  angkaKeTerbilang,
  generateInitialSows,
  generateInitialTalents,
  generateInitialCompetitors,
  bulanIndoArray,
  formatToMonthInput,
  bulanIndo,
} from "./spk-helpers";

/**
 * ============================================
 * INTERFACE DEFINITIONS
 * ============================================
 */

interface SPKViewProps {
  spkList: any[];
  fetchSPK: () => void;
}

interface FormDataType {
  // Section I: Company Identity
  first_party_signer: string;
  first_party_position: string;

  // Section II: Vendor Identity
  vendor_name: string;
  vendor_nik: string;
  vendor_address: string;
  vendor_role: string;
  vendor_company_name: string;

  // Section III: Commercial Terms
  brand_name: string;
  business_type: string;
  collab_type: string;
  campaign_start: string;
  campaign_end: string;
  campaign_period: string;
  collab_nature: "Eksklusif" | "Non-Eksklusif";

  // Section IV: Scope of Work (Talents as Array with unique IDs)
  talents: Array<{ id: string; name: string }>;
  
  // Section IV: SOWs - Keep dynamic for now as SOW structure is more complex
  [key: string]: any; // Dynamic fields for sow1-10, etc

  // Section V: Competitors (Array with unique IDs)
  competitors: Array<{ id: string; name: string }>;

  // Section VI: Payment & Bank
  project_fee: string;
  pph_23: string;
  grand_total: string;
  grand_total_words: string;
  bank_name: string;
  bank_branch: string;
  bank_account_number: string;
  bank_account_name: string;
  payment_date: string;
  payment_terms: string;
}

/**
 * ============================================
 * SPKView Main Component
 * ============================================
 */
export default function SPKView({
  spkList: propsSpkList,
  fetchSPK,
}: SPKViewProps) {
  /**
   * ============================================
   * STATE MANAGEMENT SECTION
   * ============================================
   */

  // === UI State ===
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("spk_form_open") === "true";
    }
    return false;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("spk_editing_id");
      return saved || null;
    }
    return null;
  });

  // === Filter & Pagination State ===
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // === Dynamic Form Counters ===
  const [activeTalentCount, setActiveTalentCount] = useState(1);
  const [activeSowCount, setActiveSowCount] = useState(1);
  const [activeCompetitorCount, setActiveCompetitorCount] = useState(1);
  const [sowIds, setSowIds] = useState([Date.now()]);

  // === Delete Modal State ===
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    item: any | null;
  }>({
    open: false,
    item: null,
  });
  const [confirmText, setConfirmText] = useState("");

  // === Exit Confirmation Modal State ===
  const [showExitModal, setShowExitModal] = useState(false);

  // === Form Data State ===
  const initialSows = generateInitialSows();
  const initialTalents = generateInitialTalents();
  const initialCompetitors = generateInitialCompetitors();

  const [formData, setFormData] = useState<FormDataType>({
    // Section I: Company Identity
    first_party_signer: "",
    first_party_position: "",

    // Section II: Vendor Identity
    vendor_name: "",
    vendor_nik: "",
    vendor_address: "",
    vendor_role: "",
    vendor_company_name: "",

    // Section III: Commercial Terms
    brand_name: "",
    business_type: "",
    collab_type: "",
    campaign_start: "",
    campaign_end: "",
    campaign_period: "",
    collab_nature: "Eksklusif",

    // Section IV: Scope of Work
    talents: initialTalents,
    ...initialSows,

    // Section V: Competitors
    competitors: initialCompetitors,

    // Section VI: Payment & Bank
    project_fee: "",
    pph_23: "",
    grand_total: "",
    grand_total_words: "",
    bank_name: "",
    bank_branch: "",
    bank_account_number: "",
    bank_account_name: "",
    payment_date: "",
    payment_terms: "14 hari",
  } as FormDataType);

  // === Constants ===
  const EXTERNAL_CALCULATOR_URL = "https://tax-kol-calculator.vercel.app/";

  /**
   * ============================================
   * HANDLER FUNCTIONS SECTION
   * ============================================
   */

  /**
   * resetForm - Reset form data ke state initial
   * Digunakan saat:
   * - Menutup form
   * - Membuka form create baru (agar data edit tidak nyangkut)
   * 
   * Cleaned up localStorage keys:
   * - spk_form_draft: Simpan formData
   * - spk_editing_id: Simpan ID yang sedang diedit
   * - spk_active_talent/sow/comp: Simpan counter
   */
  const resetForm = () => {
    localStorage.removeItem("spk_form_draft");
  localStorage.removeItem("spk_editing_id");
  localStorage.removeItem("spk_active_talent");
  localStorage.removeItem("spk_active_sow");
  localStorage.removeItem("spk_active_comp");
  localStorage.removeItem("spk_form_open");
    setEditingId(null);
    setFormData({
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
      talents: generateInitialTalents(),
      ...initialSows,
      competitors: generateInitialCompetitors(),
      project_fee: "",
      pph_23: "",
      grand_total: "",
      grand_total_words: "",
      bank_name: "",
      bank_branch: "",
      bank_account_number: "",
      bank_account_name: "",
      payment_date: "",
      payment_terms: "14 hari",
    } as FormDataType);

    setActiveSowCount(1);
    setActiveTalentCount(1);
    setActiveCompetitorCount(1);
    setSowIds([Date.now()]);
  };

/**
 * ============================================
 * HYDRATION SYSTEM (AUTO-LOAD DRAFT)
 * ============================================
 * Saat component pertama kali mount, cek apakah ada draft di localStorage
 * Jika ada, restore formData, counters, dan editingId
 * Jalankan hanya 1x saat component mount
 */
useEffect(() => {
  if (typeof window === "undefined") return;

  const savedDraft = localStorage.getItem("spk_form_draft");
  const savedEditingId = localStorage.getItem("spk_editing_id");

  if (savedDraft) {
    try {
      const parsed = JSON.parse(savedDraft);
      if (Object.keys(parsed).length > 0) {
        console.log("✓ Draft ditemukan, melakukan restore...");
        
        // Convert flat structure to array structure if needed
        if (!parsed.talents || !Array.isArray(parsed.talents)) {
          const talentsArray: Array<{ id: string; name: string }> = [];
          for (let i = 1; i <= 5; i++) {
            const talentName = parsed[`talent_name${i}`];
            if (talentName && talentName.trim() !== "") {
              talentsArray.push({ id: crypto.randomUUID(), name: talentName });
            }
          }
          if (talentsArray.length === 0) {
            talentsArray.push({ id: crypto.randomUUID(), name: "" });
          }
          parsed.talents = talentsArray;
        }

        if (!parsed.competitors || !Array.isArray(parsed.competitors)) {
          const competitorsArray: Array<{ id: string; name: string }> = [];
          for (let i = 1; i <= 10; i++) {
            const compName = parsed[`competitor${i}`];
            if (compName && compName.trim() !== "") {
              competitorsArray.push({ id: crypto.randomUUID(), name: compName });
            }
          }
          if (competitorsArray.length === 0) {
            competitorsArray.push({ id: crypto.randomUUID(), name: "" });
          }
          parsed.competitors = competitorsArray;
        }
        
        // Restore formData
        setFormData(parsed);
        
        // Restore counters - derive from arrays if available
        setActiveTalentCount(parsed.talents?.length || 1);
        setActiveCompetitorCount(parsed.competitors?.length || 1);
        
        const sowCount = localStorage.getItem("spk_active_sow");
        if (sowCount) setActiveSowCount(Number(sowCount));
        
        // Restore editingId jika ada (keep as string untuk nomor SPK)
        if (savedEditingId) {
          setEditingId(savedEditingId);
        }
        
        // Buka form otomatis
        setIsFormOpen(true);
        
        console.log("✓ Draft berhasil di-restore: form terbuka kembali");
      }
    } catch (error) {
      console.error("Failed to parse draft:", error);
    }
  }
}, []); // Jalankan sekali saat mount

  /**
   * handleChange - Handle input change untuk semua field
   * Special handling untuk field uang (remove non-digits)
   * Note: Auto-save to localStorage dilakukan di useEffect terpisah
   */
  const handleChange = (e: any) => {
    const { name, value } = e.target;

    if (["project_fee", "pph_23", "grand_total"].includes(name)) {
      // Hapus semua karakter bukan angka
      const cleanValue = value.replace(/\D/g, "");
      setFormData((prev) => ({
        ...prev,
        [name]: cleanValue,
      }));
    } else if (name === "collab_nature" && value === "Non-Eksklusif") {
      // Jika user memilih "Non-Eksklusif", kosongkan competitor array
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        competitors: [{ id: crypto.randomUUID(), name: "" }],
      }));
      // Reset competitor count to 1
      setActiveCompetitorCount(1);
    } else {
      // Field lainnya normal
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  /**
   * handleTalentChange - Update talent name by ID
   * @param {string} id - Unique ID of the talent
   * @param {string} value - New name value
   */
  const handleTalentChange = (id: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      talents: prev.talents.map((talent) =>
        talent.id === id ? { ...talent, name: value } : talent
      ),
    }));
  };

  /**
   * handleAddTalent - Add new talent (max 5)
   */
  const handleAddTalent = () => {
    if (formData.talents.length < 5) {
      setFormData((prev) => ({
        ...prev,
        talents: [...prev.talents, { id: crypto.randomUUID(), name: "" }],
      }));
      setActiveTalentCount((prev) => prev + 1);
    }
  };

  /**
   * handleRemoveTalent - Remove talent by ID
   * @param {string} id - Unique ID of the talent to remove
   */
  const handleRemoveTalent = (id: string) => {
    if (formData.talents.length > 1) {
      setFormData((prev) => ({
        ...prev,
        talents: prev.talents.filter((talent) => talent.id !== id),
      }));
      setActiveTalentCount((prev) => prev - 1);
    }
  };

  /**
   * handleCompetitorChange - Update competitor name by ID
   * @param {string} id - Unique ID of the competitor
   * @param {string} value - New name value
   */
  const handleCompetitorChange = (id: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      competitors: prev.competitors.map((comp) =>
        comp.id === id ? { ...comp, name: value } : comp
      ),
    }));
  };

  /**
   * handleAddCompetitor - Add new competitor (max 10)
   */
  const handleAddCompetitor = () => {
    if (formData.competitors.length < 10) {
      setFormData((prev) => ({
        ...prev,
        competitors: [...prev.competitors, { id: crypto.randomUUID(), name: "" }],
      }));
      setActiveCompetitorCount((prev) => prev + 1);
    }
  };

  /**
   * handleRemoveCompetitor - Remove competitor by ID
   * @param {string} id - Unique ID of the competitor to remove
   */
  const handleRemoveCompetitor = (id: string) => {
    if (formData.competitors.length > 1) {
      setFormData((prev) => ({
        ...prev,
        competitors: prev.competitors.filter((comp) => comp.id !== id),
      }));
      setActiveCompetitorCount((prev) => prev - 1);
    }
  };

  /**
   * handleAddSow - Tambah baris SOW baru (max 10)
   */
  const handleAddSow = () => {
    if (sowIds.length < 10) {
      setSowIds((prev) => [...prev, Date.now()]);
      setActiveSowCount((prev) => prev + 1);
    }
  };

  /**
   * handleRemoveSpecificSow - Hapus baris SOW tertentu
   * @param {number} indexToRemove - Index baris yang akan dihapus (1-indexed)
   *
   * Logic:
   * 1. Shift data dari bawah ke atas
   * 2. Kosongkan slot terakhir
   * 3. Update state counter
   */
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

  /**
   * handleRealTimeRefresh - Refresh data SPK dari server
   * Fungsi async yang fetch ulang data terbaru
   */
  const handleRealTimeRefresh = async () => {
    setIsLoading(true);
    try {
      await fetchSPK();
      console.log("✓ Data SPK berhasil diperbarui");
    } catch (error) {
      console.error("✗ Gagal refresh data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * openDeleteModal - Buka modal konfirmasi delete
   * @param {any} item - Item SPK yang akan dihapus
   */
  const openDeleteModal = (item: any) => {
    setDeleteModal({ open: true, item: item });
    setConfirmText("");
  };

  /**
   * executeDelete - Eksekusi delete ke server
   * Memastikan user confirm dengan mengetik "delete"
   */
  const executeDelete = async () => {
    if (confirmText.toLowerCase() !== "delete") return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/spk/${deleteModal.item.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setDeleteModal({ open: false, item: null });
        setConfirmText("");
        await fetchSPK();
      }
    } catch (error) {
      console.error("Error delete:", error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * handleOpenEdit - Open form dengan data item yang akan diedit
   * @param {any} item - Item SPK dari database
   *
   * Logic:
   * 1. Detect jumlah baris aktif untuk talent, sow, competitor
   * 2. Reset semua variabel dinamis dulu (1-10)
   * 3. Map data dari database ke form
   * 4. Set form open
   */
  const handleOpenEdit = (item: any) => {
const idToEdit = item.spk_number || item.number;
  setEditingId(idToEdit);

  localStorage.setItem("spk_editing_id", idToEdit.toString());
  localStorage.setItem("spk_form_open", "true");

    // ===== STEP 1: Parse Campaign Period =====
    const period = item.campaign_period || "";
    let rawStart = "",
      rawEnd = "";

    if (period.includes(" – ")) {
      const s = period.split(" – ");
      rawStart = s[0];
      rawEnd = s[1];
    } else if (period.includes(" - ")) {
      const s = period.split(" - ");
      rawStart = s[0];
      rawEnd = s[1];
    } else {
      rawStart = period;
      rawEnd = period;
    }

    // ===== STEP 2: Detect Active Row Counts =====
    // For talents and competitors, count from arrays after conversion
    
    let lastSowIndex = 1;
    for (let i = 1; i <= 10; i++) {
      if (item[`sow${i}`] && item[`sow${i}`] !== "") lastSowIndex = i;
    }
    setActiveSowCount(lastSowIndex);
    setSowIds(Array.from({ length: lastSowIndex }, (_, i) => Date.now() + i));

    // ===== STEP 3: Reset All Dynamic Fields =====
    const resetData: Record<string, string> = {};
    for (let i = 1; i <= 10; i++) {
      resetData[`competitor${i}`] = "";
      resetData[`sow${i}`] = "";
      resetData[`jumlah${i}`] = "";
      resetData[`keterangan${i}_1`] = "";
      resetData[`keterangan${i}_2`] = "";
      resetData[`keterangan${i}_3`] = "";
      if (i <= 5) resetData[`talent_name${i}`] = "";
    }

    // ===== STEP 4: Map Data from Database =====
    const sowData = Array.from({ length: 10 }).reduce<Record<string, string>>(
      (acc, _, i) => {
        const n = i + 1;
        acc[`sow${n}`] = item[`sow${n}`] || "";
        acc[`jumlah${n}`] = item[`jumlah${n}`] || "";
        acc[`keterangan${n}_1`] = item[`keterangan${n}_1`] || "";
        acc[`keterangan${n}_2`] = item[`keterangan${n}_2`] || "";
        acc[`keterangan${n}_3`] = item[`keterangan${n}_3`] || "";
        return acc;
      },
      {},
    );

    // Convert flat talent structure to array with IDs
    const talentsArray: Array<{ id: string; name: string }> = [];
    for (let i = 1; i <= 5; i++) {
      const talentName = item[`talent_name${i}`];
      if (talentName && talentName.trim() !== "") {
        talentsArray.push({ id: crypto.randomUUID(), name: talentName });
      }
    }
    // Ensure at least one empty talent
    if (talentsArray.length === 0) {
      talentsArray.push({ id: crypto.randomUUID(), name: "" });
    }
    setActiveTalentCount(talentsArray.length);

    // Convert flat competitor structure to array with IDs
    const competitorsArray: Array<{ id: string; name: string }> = [];
    for (let i = 1; i <= 10; i++) {
      const compName = item[`competitor${i}`];
      if (compName && compName.trim() !== "") {
        competitorsArray.push({ id: crypto.randomUUID(), name: compName });
      }
    }
    // Ensure at least one empty competitor
    if (competitorsArray.length === 0) {
      competitorsArray.push({ id: crypto.randomUUID(), name: "" });
    }
    setActiveCompetitorCount(competitorsArray.length);

    // ===== STEP 5: Set Form Data (Order Matters!) =====
    setFormData({
      ...formData,
      ...resetData, // FORCE kosong dulu
      talents: talentsArray, // Fill talent array dari DB
      ...sowData, // Fill SOW dari DB
      competitors: competitorsArray, // Fill competitor array dari DB
      first_party_signer: item.first_party_signer || "",
      first_party_position: item.first_party_position || "",
      vendor_name: item.vendor_name || "",
      vendor_nik: item.vendor_nik || "",
      vendor_address: item.vendor_address || "",
      vendor_role: item.vendor_role || "",
      vendor_company_name: item.vendor_company_name || "",
      brand_name: item.brand_name || "",
      business_type: item.business_type || "",
      collab_type: item.collab_type || "",
      campaign_start: formatToMonthInput(rawStart),
      campaign_end: formatToMonthInput(rawEnd),
      collab_nature: item.collab_nature?.toUpperCase().includes("NON-EKSLUSIF")
        ? "Non-Eksklusif"
        : "Eksklusif",
      project_fee: (item.project_fee || "").toString().replace(/\D/g, ""),
      pph_23: (item.pph_23 || "").toString().replace(/\D/g, ""),
      grand_total: (item.grand_total || "").toString().replace(/\D/g, ""),
      grand_total_words: item.grand_total_words || "",
      bank_name: item.bank_name || "",
      bank_branch: item.bank_branch || "",
      bank_account_number: item.bank_account_number || "",
      bank_account_name: item.bank_account_name || "",
      payment_date: item.payment_date_raw || "",
      payment_terms: item.payment_terms || "14 hari",
    } as FormDataType);

    setIsFormOpen(true);
  };

  /**
   * handleSubmit - Submit form create atau update
   * @param {React.FormEvent} e - Form event
   *
   * Logic:
   * 1. Format campaign period dari start/end
   * 2. Build competitor list untuk PDF
   * 3. Construct payload dengan hanya field yang diperlukan
   * 4. Filter talent, sow, competitor yang aktif
   * 5. POST ke /api/spk atau PUT ke /api/spk/:id
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // ===== STEP 1: Format Campaign Period =====
      const startFormat = formatTanggalIndo(formData.campaign_start);
      const endFormat = formatTanggalIndo(formData.campaign_end);
      const campaign_period =
        startFormat === endFormat
          ? startFormat
          : `${startFormat} - ${endFormat}`;

      // ===== STEP 2: Build Competitor Text =====
      const activeCompetitorsList = [];
      // Support both new array structure and old flat structure
      if (formData.competitors && Array.isArray(formData.competitors)) {
        formData.competitors.forEach((comp: any) => {
          if (comp.name && comp.name.trim() !== "") {
            activeCompetitorsList.push(comp.name.trim());
          }
        });
      } else {
        // Fallback for old structure
        for (let i = 1; i <= 10; i++) {
          const val = formData[`competitor${i}` as keyof FormDataType];
          if (
            i <= activeCompetitorCount &&
            val &&
            (val as string).trim() !== ""
          ) {
            activeCompetitorsList.push((val as string).trim());
          }
        }
      }
      const listCompetitorText = activeCompetitorsList.join(", ");

      // ===== STEP 3: Collab Nature Text =====
      const eksklusifText = `Eksklusif`;
      const nonEksklusifText = "Non Eksklusif";
      // ===== STEP 4: Build Payload =====
      const payload: any = {
        // Section I: Company Identity
        first_party_signer: formData.first_party_signer,
        first_party_position: formData.first_party_position,

        // Section II: Vendor Identity
        vendor_name: formData.vendor_name,
        vendor_nik: formData.vendor_nik,
        vendor_address: formData.vendor_address,
        vendor_role: formData.vendor_role,
        vendor_company_name: formData.vendor_company_name,

        // Section III: Commercial Terms
        brand_name: formData.brand_name,
        business_type: formData.business_type,
        collab_type: formData.collab_type,
        campaign_period: campaign_period,
        collab_nature:
          formData.collab_nature === "Non-Eksklusif"
            ? nonEksklusifText
            : eksklusifText,

        // Section VI: Payment & Bank
        project_fee: Number(formData.project_fee).toLocaleString("id-ID"),
        pph_23: Number(formData.pph_23).toLocaleString("id-ID"),
        grand_total: Number(formData.grand_total).toLocaleString("id-ID"),
        grand_total_words: formData.grand_total_words,
        bank_name: formData.bank_name,
        bank_branch: formData.bank_branch,
        bank_account_number: formData.bank_account_number,
        bank_account_name: formData.bank_account_name,
        payment_date: formatTanggalIndo(formData.payment_date),
        payment_terms: "14 hari",
        created_at: new Date().toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      };

      // ===== STEP 5: Add Active SOWs =====
      for (let i = 1; i <= 10; i++) {
        if (i <= activeSowCount) {
          payload[`sow${i}`] =
            formData[`sow${i}` as keyof FormDataType] || null;
          payload[`jumlah${i}`] =
            formData[`jumlah${i}` as keyof FormDataType] || null;
          payload[`keterangan${i}_1`] =
            formData[`keterangan${i}_1` as keyof FormDataType] || null;
          payload[`keterangan${i}_2`] =
            formData[`keterangan${i}_2` as keyof FormDataType] || null;
          payload[`keterangan${i}_3`] =
            formData[`keterangan${i}_3` as keyof FormDataType] || null;
        } else {
          payload[`sow${i}`] =
            payload[`jumlah${i}`] =
            payload[`keterangan${i}_1`] =
            payload[`keterangan${i}_2`] =
            payload[`keterangan${i}_3`] =
              null;
        }
      }

      // ===== STEP 6: Add Active Talents =====
      // Convert new array structure to flat structure for API
      if (formData.talents && Array.isArray(formData.talents)) {
        formData.talents.forEach((talent: any, index: number) => {
          const i = index + 1;
          payload[`talent_name${i}`] = talent.name && talent.name.trim() !== "" ? talent.name : null;
        });
        // Fill remaining slots with null
        for (let i = formData.talents.length + 1; i <= 5; i++) {
          payload[`talent_name${i}`] = null;
        }
      } else {
        // Fallback for old structure
        for (let i = 1; i <= 5; i++) {
          const val = formData[`talent_name${i}` as keyof FormDataType];
          payload[`talent_name${i}`] =
            i <= activeTalentCount && val && (val as string).trim() !== ""
              ? val
              : null;
        }
      }

      // ===== STEP 7: Add Active Competitors =====
      // Convert new array structure to flat structure for API
      if (formData.competitors && Array.isArray(formData.competitors)) {
        formData.competitors.forEach((comp: any, index: number) => {
          const i = index + 1;
          payload[`competitor${i}`] = comp.name && comp.name.trim() !== "" ? comp.name : null;
        });
        // Fill remaining slots with null
        for (let i = formData.competitors.length + 1; i <= 10; i++) {
          payload[`competitor${i}`] = null;
        }
      } else {
        // Fallback for old structure
        for (let i = 1; i <= 10; i++) {
          const val = formData[`competitor${i}` as keyof FormDataType];
          payload[`competitor${i}`] =
            i <= activeCompetitorCount && val && (val as string).trim() !== ""
              ? val
              : null;
        }
      }

      console.log("📤 FINAL PAYLOAD:", payload);

      // ===== STEP 8: Execute API =====
      const targetId = editingId ? encodeURIComponent(String(editingId)) : "";
      const url = editingId ? `/api/spk/${targetId}` : "/api/spk";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchSPK();
        setIsFormOpen(false);
        resetForm();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || "Gagal menyimpan data"}`);
      }
    } catch (error) {
      console.error("Submit Error:", error);
      alert("Koneksi ke server terputus.");
    } finally {
      setIsLoading(false);
    }
  };
  /**
   * ============================================
   * PERSISTENCE SYSTEM (AUTO-SAVE DRAFT)
   * ============================================
   * Setiap kali formData atau counters berubah, simpan ke localStorage
   * Key: 'spk_form_draft' untuk formData
   * Dilakukan dengan debounce 500ms untuk performance
   */
  useEffect(() => {
    if (!isFormOpen) return; // Jangan save jika form tidak terbuka

    const timeoutId = setTimeout(() => {
      if (typeof window !== "undefined") {
        try {
          // Save formData
          localStorage.setItem("spk_form_draft", JSON.stringify(formData));
          
          // Save counters
          localStorage.setItem("spk_active_talent", activeTalentCount.toString());
          localStorage.setItem("spk_active_sow", activeSowCount.toString());
          localStorage.setItem("spk_active_comp", activeCompetitorCount.toString());
          
          // Save editingId
          if (editingId) {
            localStorage.setItem("spk_editing_id", editingId.toString());
          }
          
          console.log("✓ Draft tersimpan otomatis ke localStorage");
        } catch (error) {
          console.error("Failed to save draft:", error);
        }
      }
    }, 500); // Debounce 500ms

    // Cleanup: clear timeout jika component unmount atau deps berubah
    return () => clearTimeout(timeoutId);
  }, [formData, activeTalentCount, activeSowCount, activeCompetitorCount, editingId, isFormOpen]);

  /**
   * ============================================
   * AUTO-COMPUTE: Grand Total Words
   * ============================================
   * Setiap kali grand_total berubah, update grand_total_words otomatis
   */
  useEffect(() => {
    const nominal = Number(formData.grand_total) || 0;
    setFormData((prev) => ({
      ...prev,
      grand_total_words: nominal > 0 ? angkaKeTerbilang(nominal) : "",
    }));
  }, [formData.grand_total]);

  /**
   * ============================================
   * FILTER & PAGINATION LOGIC
   * ============================================
   */

  // Filter dan sort data (with safe default)
  const filteredAndSortedSPK = (propsSpkList || [])
    .filter((item) => {
      const searchTerm = searchQuery.toLowerCase();

      // === Search Logic ===
      const matchesSearch =
        item.talent_name1?.toLowerCase().includes(searchTerm) ||
        item.talent_name2?.toLowerCase().includes(searchTerm) ||
        item.talent_name3?.toLowerCase().includes(searchTerm) ||
        item.talent_name4?.toLowerCase().includes(searchTerm) ||
        item.talent_name5?.toLowerCase().includes(searchTerm) ||
        (item.talent_name || item.talent)?.toLowerCase().includes(searchTerm) ||
        (item.brand_name || item.brand)?.toLowerCase().includes(searchTerm) ||
        (item.spk_number || item.number)?.toLowerCase().includes(searchTerm);

      // === Date Filter Logic ===
      const dateString = item.created_at || item.date || "";
      const parts = dateString.split(" ");

      const itemMonth = parts[1] ? bulanIndo[parts[1]] : "";
      const itemYear = parts[2] || "";

      const matchesMonth =
        selectedMonth === "all" || itemMonth === selectedMonth;
      const matchesYear = selectedYear === "all" || itemYear === selectedYear;

      return matchesSearch && matchesMonth && matchesYear;
    })
    .sort((a, b) => {
      return sortOrder === "desc" ? b.id - a.id : a.id - b.id;
    });

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedSPK.length / rowsPerPage);
  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentItems = filteredAndSortedSPK.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  // Reset page ke 1 kalau ada perubahan filter
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedMonth, selectedYear]);

  // Get available years dari data
  const availableYears = [
    ...new Set(
      (propsSpkList || [])
        .map((item) => {
          const dateString = item.created_at || item.date || "";
          const parts = dateString.split(" ");
          return parts[2];
        })
        .filter(Boolean),
    ),
  ].sort((a, b) => b.localeCompare(a));

  /**
   * ============================================
   * RENDER LOGIC
   * ============================================
   */

  // === FORM VIEW ===
  if (isFormOpen) {
    return (
      <div className="animate-in slide-in-from-right duration-500 pb-20">
        {/* ============================================ */}
        {/* FORM HEADER */}
        {/* ============================================ */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowExitModal(true)}
              className="p-2 hover:bg-slate-100 rounded-full transition-all"
              title="Back to list"
            >
              <ChevronLeft size={24} />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-[#1B3A5B]">
                {editingId ? `Edit SPK - ${editingId}` : "Buat SPK Baru"}
              </h2>
              {/* UI Feedback: Draft tersimpan otomatis */}
              <p className="text-xs text-slate-500 font-medium mt-1">
                ✓ Draft tersimpan otomatis
              </p>
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* FORM COMPONENT */}
        {/* ============================================ */}
        <SPKForm
          formData={formData}
          onChange={handleChange}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          editingId={editingId}
          activeTalentCount={activeTalentCount}
          setActiveTalentCount={setActiveTalentCount}
          onTalentChange={handleTalentChange}
          onAddTalent={handleAddTalent}
          onRemoveTalent={handleRemoveTalent}
          activeSowCount={activeSowCount}
          sowIds={sowIds}
          onAddSow={handleAddSow}
          onRemoveSow={handleRemoveSpecificSow}
          activeCompetitorCount={activeCompetitorCount}
          setActiveCompetitorCount={setActiveCompetitorCount}
          onCompetitorChange={handleCompetitorChange}
          onAddCompetitor={handleAddCompetitor}
          onRemoveCompetitor={handleRemoveCompetitor}
        />

        {/* ============================================ */}
        {/* EXIT CONFIRMATION MODAL */}
        {/* ============================================ */}
        {showExitModal && (
          <div className="fixed inset-0 z-200 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            {/* Modal Container */}
            <div className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-300">
              <div className="p-8 space-y-6">
                {/* Modal Header */}
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-50 rounded-2xl">
                    <ChevronLeft size={24} className="text-amber-600" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1B3A5B]">
                    Keluar dari Form?
                  </h3>
                </div>

                {/* Warning Message */}
                <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl">
                  <p className="text-amber-800 text-sm leading-relaxed">
                    Draft yang belum disimpan akan dihapus secara permanen. 
                    Pastikan Anda sudah menyimpan perubahan sebelum keluar.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowExitModal(false)}
                    className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all"
                  >
                    Tetap di Sini
                  </button>
                  <button
                    onClick={() => {
                      setShowExitModal(false);
                      setIsFormOpen(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all"
                  >
                    Ya, Keluar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // === LIST VIEW ===
  return (
    <div className="animate-in fade-in duration-500 space-y-6 relative min-h-100">
      <h2 className="text-2xl font-bold mb-8 text-[#1B3A5B]">SPK Management</h2>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white z-50 flex flex-col items-center justify-center space-y-4">
          <div className="flex flex-col items-center sticky top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B3A5B]"></div>
            <p className="text-slate-500 font-medium animate-pulse mt-4">
              Loading
            </p>
          </div>
        </div>
      )}

      {/* Filter & Action Bar */}
      <SPKFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        availableYears={availableYears}
        onRefresh={handleRealTimeRefresh}
        onCreateNew={() => {
          resetForm();
          setIsFormOpen(true);
        }}
        isLoading={isLoading}
      />

      {/* NOTE: Below code is deprecated, kept for reference
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
        <div className="flex flex-wrap items-center gap-2 flex-1 w-full md:w-auto">
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
              className="w-full pl-11 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/10 outline-none transition-all shadow-sm text-black"
            />
          </div>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 h-11 border font-bold border-slate-200 rounded-2xl bg-white text-sm outline-none shadow-sm focus:ring-2 focus:ring-blue-500/10 transition-all cursor-pointer text-black"
          >
            <option value="all">All Year</option>
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 h-11 border font-bold border-slate-200 rounded-2xl bg-white text-sm outline-none shadow-sm focus:ring-2 focus:ring-blue-500/10 transition-all cursor-pointer text-black"
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

        </div>
      </div> */}

      {/* Table Section */}
      <SPKTable
        items={currentItems}
        indexOfFirstItem={indexOfFirstItem}
        sortOrder={sortOrder as "asc" | "desc"}
        onSortChange={setSortOrder}
        onActionClick={setOpenActionId}
        openActionId={openActionId}
        onEdit={handleOpenEdit}
        onDelete={openDeleteModal}
      />

      {/* Delete Modal */}
      <SPKDeleteModal
        open={deleteModal.open}
        item={deleteModal.item}
        confirmText={confirmText}
        onConfirmTextChange={setConfirmText}
        onClose={() => setDeleteModal({ open: false, item: null })}
        onDelete={executeDelete}
        isLoading={isLoading}
      />

      {/* Pagination */}
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
            className="bg-white border border-slate-200 text-black text-xs font-bold rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-blue-500/10 shadow-sm cursor-pointer"
          >
            {[10, 20, 50, 100].map((size) => (
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
                      ? "bg-[#1B3A5B] text-white shadow-md shadow-[#007AFF]/20"
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
