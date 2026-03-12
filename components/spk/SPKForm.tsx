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
import React, {
  useDeferredValue,
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
import {
  Plus,
  Trash2,
  Building2,
  User,
  BadgeDollarSign,
  ListChecks,
  Banknote,
  Calculator,
  X,
  Loader,
  ChevronDown,
} from "lucide-react";
import { GiStrong } from "react-icons/gi";
import { generateHTML } from "@/src/utils/spkTemplate";

interface SPKFormProps {
  formData: any; // FormDataType dari parent
  onChange: (e: any) => void;
  onSubmit: (data: any) => void | Promise<void>;
  isLoading: boolean;
  editingId: string | number | null;
  onBack: () => void;
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
  autoComplete = "off",
}: any) {
  return (
    <div className="flex flex-col w-full">
      <label className="text-[13px] font-bold text-slate-900 dark:text-white uppercase mb-1.5 tracking-wider">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        autoComplete={autoComplete}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-500 bg-white dark:bg-slate-900 text-black dark:text-white"
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
  onBack,
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
  const isCompetitorSectionOpen = formData.collab_nature === "Eksklusif";

  // Auto-scroll sync state - isolated dari form updates
  const [activeSection, setActiveSection] = useState<string>("");

  // Zoom state untuk preview scaling (50% - 200%)
  const [zoom, setZoom] = useState(1);
  const [zoomInput, setZoomInput] = useState("100"); // Input field value

  // Tax calculator sticky window state
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [isCalcMinimized, setIsCalcMinimized] = useState(false);
  const [isCalcLoading, setIsCalcLoading] = useState(true);

  // Drag-to-scroll state untuk grab tool
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scrollStart, setScrollStart] = useState({ left: 0, top: 0 });
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const previewCanvasRef = useRef<HTMLDivElement>(null);

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

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setZoom((prev) => {
      const newZoom = Math.min(prev + 0.1, 2); // Max 200%
      setZoomInput(String(Math.round(newZoom * 100)));
      return newZoom;
    });
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => {
      const newZoom = Math.max(prev - 0.1, 0.5); // Min 50%
      setZoomInput(String(Math.round(newZoom * 100)));
      return newZoom;
    });
  }, []);

  const handleZoomReset = useCallback(() => {
    const containerWidth = scrollContainerRef.current?.clientWidth ?? 0;
    const documentWidth = previewCanvasRef.current?.offsetWidth ?? 0;

    if (containerWidth <= 0 || documentWidth <= 0) {
      setZoom(1);
      setZoomInput("100");
      return;
    }

    const fitScale = Math.min(containerWidth / documentWidth, 1);
    setZoom(fitScale);
    setZoomInput(String(Math.round(fitScale * 100)));

    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }
  }, []);

  // Handle zoom input change from user typing
  const handleZoomInputChange = useCallback(
    (value: string) => {
      setZoomInput(value);
    },
    []
  );

  // Handle zoom input commit (on Enter or onBlur)
  const handleZoomInputCommit = useCallback(
    (inputValue: string) => {
      const parsed = parseInt(inputValue, 10);
      if (isNaN(parsed)) {
        // Invalid input, revert to current zoom
        setZoomInput(String(Math.round(zoom * 100)));
        return;
      }

      // Clamp value between 10 and 200
      const clamped = Math.max(10, Math.min(200, parsed));
      const zoomFraction = clamped / 100;

      setZoom(zoomFraction);
      setZoomInput(String(clamped));
    },
    [zoom]
  );

  // Drag-to-scroll handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    e.preventDefault(); // Prevent text selection
    setIsDragging(true);
    setDragStart({
      x: e.pageX,
      y: e.pageY,
    });
    setScrollStart({
      left: scrollContainerRef.current.scrollLeft,
      top: scrollContainerRef.current.scrollTop,
    });
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !scrollContainerRef.current) return;
      e.preventDefault();

      const deltaX = e.pageX - dragStart.x;
      const deltaY = e.pageY - dragStart.y;

      scrollContainerRef.current.scrollLeft = scrollStart.left - deltaX;
      scrollContainerRef.current.scrollTop = scrollStart.top - deltaY;
    },
    [isDragging, dragStart, scrollStart],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Debounce srcDoc update: jangan update iframe terlalu sering saat user ngetik
  /**
    * Form state dipasok dari parent SPKView dan disimpan in-memory.
    * Tidak ada persistence ke browser storage agar refresh selalu reset form.
   */
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
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
    // Filter out activeSection sebelum submit ke API
    const { activeSection: _, ...cleanData } = formData || {};
    // Kirim data mentah ke parent, bukan browser event
    onSubmit(cleanData);
  };

  // Memoized Tax Calculator Component - Prevents re-render when form data changes
  const TaxCalculatorWindow = React.memo(() => (
    <div
      className={`fixed border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1E293B] rounded-lg shadow-2xl transition-all duration-200 z-50 ${
        !isCalcOpen ? "hidden" : "block"
      }`}
      style={{
        width: isCalcMinimized ? "300px" : "400px",
        height: isCalcMinimized ? "auto" : "600px",
        bottom: "10px",
        right: "10px",
      }}
    >
      {/* Header - Sticky dan selalu terlihat */}
      <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-t-lg shrink-0">
        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Kalkulator Pajak</h3>
        <div className="flex items-center gap-2">
          {/* Minimize Button */}
          <button
            onClick={() => setIsCalcMinimized(!isCalcMinimized)}
            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors cursor-pointer"
            title={isCalcMinimized ? "Expand" : "Minimize"}
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-slate-600 dark:text-slate-300"
            >
              {isCalcMinimized ? (
                <path d="M8 3v6h6M16 21v-6h-6" />
              ) : (
                <path d="M8 19v-6H2M22 5v6h-6" />
              )}
            </svg>
          </button>
          {/* Close Button */}
          <button
            onClick={() => setIsCalcOpen(false)}
            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors cursor-pointer"
            title="Close"
            type="button"
          >
            <X size={16} className="text-slate-600 dark:text-slate-300" />
          </button>
        </div>
      </div>

      {/* Loading Spinner - Only show when content is visible */}
      {isCalcLoading && !isCalcMinimized && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-slate-900/70 z-10 rounded-lg pointer-events-none">
          <div className="flex flex-col items-center gap-2">
            <Loader size={24} className="text-blue-500 dark:text-blue-400 animate-spin" />
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">Memuat kalkulator...</p>
          </div>
        </div>
      )}

      {/* Iframe Container - ALWAYS in DOM, never unmounted */}
{/* Iframe Container - ALWAYS in DOM, never unmounted */}
<div
  className={`w-full bg-white dark:bg-[#1E293B] rounded-b-lg overflow-hidden transition-all duration-200 ${
    isCalcMinimized ? "hidden" : "block"
  }`}
  style={{
    height: "530px", // Kita kunci tingginya (sesuaikan dengan tinggi kalkulatornya)
    pointerEvents: "auto",
    userSelect: "auto",
    position: "relative", // Tambahkan ini
  }}
>
  {/* Iframe - Kita paksa tingginya lebih besar sedikit dari kontainer biar kepotong */}
  <iframe
    key="tax-calc-frame"
    src="https://tax-kol-calculator.vercel.app/"
    className="w-full border-none block shadow-inner"
    title="Tax Calculator"
    onLoad={() => setIsCalcLoading(false)}
    allow="clipboard-read; clipboard-write; microphone; camera"
    sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
    style={{
      pointerEvents: "auto",
      userSelect: "auto",
      height: "580px",
      marginTop: "10px",
      overflow: "hidden",
    }}
  />
</div>
    </div>
  ));
  // Memoize form content
  const formContent = useMemo(
    () => (
      <div className=" flex flex-1 overflow-hidden w-full h-screen">
        {/* LEFT COLUMN: Header + Form */}
        <div className="w-full lg:w-7/12 h-full overflow-y-auto px-4">
          {/* HEADER - At top of scrollable area */}
          <div className="sticky top-0 z-50 bg-white dark:bg-[#1E293B] px-6 py-4 border-b rounded-xl border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between gap-4 pt-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-slate-100 rounded-full transition-all"
                  title="Back to list"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>
                <div>
                  <h2 className="text-2xl font-bold text-[#1B3A5B] dark:text-slate-200">
                    {editingId ? `Edit SPK - ${editingId}` : "Buat SPK Baru"}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                    ✓ Draft tersimpan otomatis
                  </p>
                </div>
              </div>

              {/* Tax Calculator Toggle Button */}
              <button
                onClick={() => setIsCalcOpen(!isCalcOpen)}
                className={`p-2 rounded-md transition-all shadow-sm flex items-center gap-2 border ${
                  isCalcOpen
                    ? "bg-blue-600 text-white border-blue-700 shadow-blue-200"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
                title="Buka/Tutup Kalkulator Pajak"
              >
                <Calculator size={20} />
              </button>
            </div>
          </div>

          {/* FORM SECTIONS */}
          <form
            onSubmit={handleSubmit}
            autoComplete="off"
            className="bg-white dark:bg-[#1E293B] p-4 sm:p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-8 mb-6 mt-5"
          >
            {/* ============================================ */}
            {/* SECTION I: COMPANY IDENTITY */}
            {/* ============================================ */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 border-b border-slate-200 dark:border-slate-800 pb-2">
                <h4 className="font-bold text-sm uppercase tracking-wider dark:text-slate-100">
                  Bagian I: Identitas Perusahaan
                </h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InputGroup
                  label="Nama Penandatangan"
                  name="first_party_signer"
                  value={formData.first_party_signer}
                  onChange={onChange}
                  onFocus={() =>
                    handleFocusChange("preview-first-party-signer")
                  }
                  onBlur={handleBlurChange}
                  placeholder="Andi Pratama"
                />
                <InputGroup
                  label="Jabatan Penandatangan"
                  name="first_party_position"
                  value={formData.first_party_position}
                  onChange={onChange}
                  onFocus={() =>
                    handleFocusChange("preview-first-party-position")
                  }
                  onBlur={handleBlurChange}
                  placeholder="Director"
                />
              </div>
            </section>

            {/* ============================================ */}
            {/* SECTION II: VENDOR IDENTITY */}
            {/* ============================================ */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 border-b border-slate-200 dark:border-slate-800 pb-2">
                <h4 className="font-bold text-sm uppercase tracking-wider dark:text-slate-100">
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
                  <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1.5 block">
                    Alamat KTP
                  </label>
                  <textarea
                    name="vendor_address"
                    value={formData.vendor_address}
                    autoComplete="off"
                    onChange={onChange}
                    onFocus={() => handleFocusChange("preview-vendor-address")}
                    onBlur={handleBlurChange}
                    placeholder="Alamat sesuai KTP..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-blue-500/10 outline-none text-black dark:text-white bg-white dark:bg-slate-900 placeholder:text-slate-300 dark:placeholder:text-slate-500"
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
                  onFocus={() =>
                    handleFocusChange("preview-vendor-company-name")
                  }
                  onBlur={handleBlurChange}
                  placeholder="Andi Studio"
                />
              </div>
            </section>

            {/* ============================================ */}
            {/* SECTION III: COMMERCIAL TERMS */}
            {/* ============================================ */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 border-b border-slate-200 dark:border-slate-800 pb-2">
                <h4 className="font-bold text-sm uppercase tracking-wider dark:text-slate-100">
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
                  onFocus={() => handleFocusChange("preview-jenis-kerjasama")}
                  onBlur={handleBlurChange}
                  placeholder="Campaign Digital"
                />
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col w-full">
                    <label className="text-[13px] font-bold text-slate-800 dark:text-slate-300 uppercase mb-1.5 tracking-wider">
                      Mulai Kampanye
                    </label>
                    <input
                      type="month"
                      name="campaign_start"
                      value={formData.campaign_start}
                      autoComplete="off"
                      onChange={onChange}
                      onFocus={() =>
                        handleFocusChange("preview-campaign-period")
                      }
                      onBlur={handleBlurChange}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-blue-500/10 outline-none bg-white dark:bg-slate-900 text-black dark:text-white"
                    />
                  </div>
                  <div className="flex flex-col w-full">
                    <label className="text-[13px] font-bold text-slate-900 dark:text-white uppercase mb-1.5 tracking-wider">
                      Selesai Kampanye
                    </label>
                    <input
                      type="month"
                      name="campaign_end"
                      value={formData.campaign_end}
                      autoComplete="off"
                      onChange={onChange}
                      onFocus={() =>
                        handleFocusChange("preview-campaign-period")
                      }
                      onBlur={handleBlurChange}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-blue-500/10 outline-none bg-white dark:bg-slate-900 text-black dark:text-white"
                    />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="text-[13px] font-bold text-slate-900 dark:text-white uppercase mb-2 block">
                    Sifat Kerjasama
                  </label>
                  <select
                    name="collab_nature"
                    value={formData.collab_nature}
                    autoComplete="off"
                    onChange={onChange}
                    onFocus={() => handleFocusChange("preview-collab-nature")}
                    onBlur={handleBlurChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm outline-none bg-white dark:bg-slate-900 text-black dark:text-white"
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
              <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 border-b border-slate-200 dark:border-slate-800 pb-2">
                <h4 className="font-bold text-sm uppercase tracking-wider dark:text-slate-100">
                  Bagian IV: Scope of Work
                </h4>
              </div>

              {/* --- SUB-SECTION: TALENT LIST --- */}
              <div className="space-y-4">
                <label className="text-[13px] font-bold text-slate-900 dark:text-white uppercase tracking-widest block">
                  Daftar Talent
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {formData.talents?.map((talent: any, index: number) => (
                    <div
                      key={talent.id}
                      className="relative group animate-in fade-in slide-in-from-left-2 duration-300"
                    >
                      <div className="flex flex-col w-full">
                        <label className="text-[13px] font-bold text-slate-800 dark:text-slate-300 uppercase mb-1.5 tracking-wider">
                          Talent {index + 1}
                        </label>
                        <input
                          type="text"
                          value={talent.name}
                          autoComplete="off"
                          onChange={(e) =>
                            onTalentChange(talent.id, e.target.value)
                          }
                          onFocus={() => handleFocusChange("sow-1-talent")}
                          onBlur={handleBlurChange}
                          placeholder="Masukkan nama talent..."
                          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-500 bg-white dark:bg-slate-900 text-black dark:text-white"
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
                      className="flex items-center justify-center gap-2 my-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl h-11.25 text-slate-400 dark:text-slate-500 hover:border-[#007AFF] hover:text-[#007AFF] hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all font-bold text-sm"
                    >
                      <Plus size={16} />
                    </button>
                  )}
                </div>
              </div>

              <div className="h-px bg-slate-100 dark:bg-slate-700 my-2"></div>

              {/* --- SUB-SECTION: SOW LIST --- */}
              <div className="space-y-6">
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest block">
                  Daftar Scope of Work
                </label>

                {sowIds.map((id, index) => {
                  const num = index + 1;
                  return (
                    <div
                      key={id}
                      className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 relative group animate-in zoom-in-95 duration-300"
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
                            onFocus={() =>
                              handleFocusChange(`sow-${num}-col-desc`)
                            }
                            onBlur={handleBlurChange}
                          />
                        </div>
                        <InputGroup
                          label="JUMLAH"
                          name={`jumlah${num}`}
                          value={formData[`jumlah${num}`] || ""}
                          onChange={onChange}
                          onFocus={() =>
                            handleFocusChange(`sow-${num}-col-qty`)
                          }
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
                    className="w-full py-3 flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-slate-400 dark:text-slate-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all font-bold text-sm"
                  >
                    <Plus size={16} />
                  </button>
                )}
              </div>
            </section>

            {/* ============================================ */}
            {/* SECTION V: COMPETITORS */}
            {/* ============================================ */}
            <section className="space-y-4 p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <h4 className="font-bold text-sm uppercase tracking-wider dark:text-slate-100">
                    Daftar Kompetitor
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  {isCompetitorSectionOpen && (
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                      {formData.competitors?.length || 0}/10
                    </span>
                  )}
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${
                      isCompetitorSectionOpen ? "rotate-180" : "rotate-0"
                    } text-slate-400`}
                  />
                </div>
              </div>

              {isCompetitorSectionOpen ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {formData.competitors?.map(
                      (competitor: any, index: number) => (
                        <div
                          key={competitor.id}
                          className="relative group animate-in zoom-in-95 duration-200"
                        >
                          <input
                            value={competitor.name}
                            autoComplete="off"
                            onChange={(e) =>
                              onCompetitorChange(competitor.id, e.target.value)
                            }
                            onFocus={() =>
                              handleFocusChange(`competitor-${competitor.id}`)
                            }
                            onBlur={handleBlurChange}
                            placeholder={`Komp. ${index + 1}`}
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs outline-none focus:ring-2 focus:ring-[#007AFF]/20 bg-white dark:bg-slate-900 transition-all shadow-sm text-black dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-500"
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
                      ),
                    )}

                    {formData.competitors?.length < 10 && (
                      <button
                        type="button"
                        onClick={onAddCompetitor}
                        className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl py-2 text-slate-400 dark:text-slate-500 hover:border-[#007AFF] hover:text-[#007AFF] hover:bg-white dark:hover:bg-slate-900 transition-all font-bold text-[10px] uppercase shadow-sm"
                      >
                        <Plus size={14} />
                      </button>
                    )}
                  </div>

                  <p className="text-[9px] text-slate-500 dark:text-slate-400 italic">
                    *Input kompetitor ini akan otomatis digabungkan ke dalam
                    kontrak Eksklusif di PDF.
                  </p>
                </>
              ) : (
                <p className="text-[10px] text-slate-600 dark:text-slate-400 italic bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3">
                  Section kompetitor tertutup. Ubah Jenis SPK ke
                  <strong> Eksklusif</strong> untuk membuka section ini.
                </p>
              )}
            </section>

            {/* ============================================ */}
            {/* SECTION VI: PAYMENT & BANK */}
            {/* ============================================ */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 border-b border-slate-200 dark:border-slate-800 pb-2">
                <h4 className="font-bold text-sm uppercase tracking-wider dark:text-slate-100">
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
                  <label className="text-[13px] font-bold text-slate-900 dark:text-white uppercase mb-1.5 tracking-wider">
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
                    autoComplete="off"
                    onChange={onChange}
                    onFocus={() => handleFocusChange("preview-grand-total")}
                    onBlur={handleBlurChange}
                    placeholder="0"
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-blue-500/10 outline-none transition-all font-bold text-[#1B3A5B] dark:text-blue-400 bg-white dark:bg-slate-900 placeholder:text-slate-300 dark:placeholder:text-slate-500"
                  />
                </div>
              </div>

              {/* Grand Total Words (Auto-computed) */}
              <div className="flex flex-col w-full">
                <label className="text-[13px] font-bold text-slate-900 dark:text-white uppercase mb-1.5 tracking-wider">
                  Terbilang
                </label>
                <div className="px-4 py-2.5 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-[#1B3A5B] dark:text-blue-400 font-medium min-h-10.5 flex items-center capitalize italic">
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
                  onFocus={() =>
                    handleFocusChange("preview-bank-account-number")
                  }
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
        <div className="hidden lg:block w-5/12 h-full bg-slate-50 dark:bg-[#0F172A] p-4">
          <div className="h-full flex flex-col">
            {/* SPK Live Preview */}
            <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-full">
              {/* Preview Header with Zoom Controls */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                  Live Preview - Dokumen SPK
                </h3>

                {/* Zoom Controls */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleZoomOut}
                    disabled={zoom <= 0.5}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Zoom Out"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                      <line x1="8" x2="14" y1="11" y2="11" />
                    </svg>
                  </button>

                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={zoomInput}
                      onChange={(e) => handleZoomInputChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleZoomInputCommit(zoomInput);
                          (e.target as HTMLInputElement).blur();
                        }
                      }}
                      onBlur={() => handleZoomInputCommit(zoomInput)}
                      min="10"
                      max="200"
                     className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-center bg-transparent outline-none w-12"
                      placeholder="100"
                    />
                    <span className="text-xs text-slate-600 dark:text-slate-400">%</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleZoomIn}
                    disabled={zoom >= 2}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Zoom In"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                      <line x1="11" x2="11" y1="8" y2="14" />
                      <line x1="8" x2="14" y1="11" y2="11" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={handleZoomReset}
                    className="px-2 py-1 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-600 dark:text-slate-400"
                    title="Reset to 100%"
                  >
                    Fit
                  </button>
                </div>
              </div>

              {/* Preview Container with Zoom & Drag-to-Scroll */}
              <div
                ref={scrollContainerRef}
                className="flex-1 flex flex-col items-start justify-start overflow-auto rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg bg-gray-50 select-none preview-scroll-container"
                style={{
                  scrollbarWidth: "none", // Firefox
                  msOverflowStyle: "none", // IE/Edge
                  backgroundColor: "#f9fafb",
                }}
              >
                {/* Zoom Canvas - FORCED WHITE WRAPPER untuk preview PDF */}
                <div
                  ref={previewCanvasRef}
                  className="bg-white transition-transform duration-200 relative"
                  style={{
                    minHeight: "2300px", // Enough height for full SPK document
                    height: "auto",
                    width: "250mm", // A4 width
                    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                    transform: `scale(${zoom})`,
                    transformOrigin: "top left",
                    marginBottom: zoom > 1 ? `${(zoom - 1) * 2000}px` : "0",
                    marginRight: zoom > 1 ? `${(zoom - 1) * 100}%` : "0",
                    backgroundColor: "#ffffff",
                  }}
                >
                  {/* Permanent Transparent Overlay - Captures ALL mouse events for Grab */}
                  <div
                    className={`absolute inset-0 z-100 ${
                      isDragging ? "cursor-grabbing" : "cursor-grab"
                    }`}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                    style={{ background: "transparent" }}
                  />

                  {/* Iframe Preview - Full height, no pointer events */}
                  <iframe
                    srcDoc={generateHTML(debouncedPreviewData)}
                    className="w-full border-none"
                    scrolling="no"
                    style={{
                      height: "2800px", // Match canvas height
                      width: "100%",
                      display: "block",
                      overflow: "hidden",
                      pointerEvents: "none",
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
      onBack,
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
      zoom,
      handleZoomIn,
      handleZoomOut,
      handleZoomReset,
      isDragging,
      handleMouseDown,
      handleMouseMove,
      handleMouseUp,
      handleMouseLeave,
    ],
  );

  return (
    <>
      {formContent}
      <TaxCalculatorWindow />
    </>
  );
}
