/**
 * ============================================
 * SPK HELPER FUNCTIONS
 * ============================================
 * Utility functions untuk SPK management
 * Berisi:
 * - Fungsi konversi tanggal (Indonesian format)
 * - Fungsi konversi angka ke terbilang
 * - Fungsi generate initial SOW data
 * - Bilangan dan kalender helper
 */

/**
 * DICTIONARY: Bulan Indonesia
 * Mapping bulan dalam format Indonesian ke nomor bulan
 */
export const bulanIndo: { [key: string]: string } = {
  Januari: "01",
  Februari: "02",
  Maret: "03",
  April: "04",
  Mei: "05",
  Juni: "06",
  Juli: "07",
  Agustus: "08",
  September: "09",
  Oktober: "10",
  November: "11",
  Desember: "12",
};

/**
 * ARRAY: Teks Bulan Indonesia
 * Array untuk mapping dari nomor bulan ke teks Indonesia (0-indexed)
 */
export const bulanIndoArray = [
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

/**
 * formatTanggalIndo - Format tanggal dari ISO ke Indonesia
 * @param {string} dateStr - Format input: YYYY-MM-DD atau YYYY-MM
 * @returns {string} Format output: "DD Januari YYYY" atau "Januari YYYY"
 * 
 * Contoh:
 * formatTanggalIndo("2026-02-27") => "27 Februari 2026"
 * formatTanggalIndo("2026-02") => "Februari 2026"
 */
export const formatTanggalIndo = (dateStr: string): string => {
  if (!dateStr) return "";

  const parts = dateStr.split("-");

  if (parts.length === 3) {
    // Format YYYY-MM-DD (untuk payment_date)
    return `${parseInt(parts[2])} ${bulanIndoArray[parseInt(parts[1]) - 1]} ${parts[0]}`;
  } else if (parts.length === 2) {
    // Format YYYY-MM (untuk campaign_period)
    return `${bulanIndoArray[parseInt(parts[1]) - 1]} ${parts[0]}`;
  }

  return dateStr;
};

/**
 * formatToMonthInput - Konversi teks tanggal Indonesia ke format month input (YYYY-MM)
 * @param {string} dateStr - Input: "Februari 2026" atau "2026-02" atau "27 Februari 2026"
 * @returns {string} Output: "2026-02"
 * 
 * Gunakan untuk populate input[type="month"]
 */
export const formatToMonthInput = (dateStr: string): string => {
  if (!dateStr) return "";

  const ds = dateStr.trim();

  // Jika sudah format YYYY-MM, return substring pertama 7 karakter
  if (ds.includes("-") && ds.split("-")[0].length === 4) {
    return ds.substring(0, 7);
  }

  // Parsing teks "Februari 2026" atau "27 Februari 2026"
  const parts = ds.split(" ");
  
  // Cari posisi bulan dalam array bulanIndoArray
  const bulanIndex = bulanIndoArray.findIndex(
    (bulan) => bulan.toLowerCase() === parts[parts.length - 2]?.toLowerCase()
  );
  const tahun = parts[parts.length - 1];

  if (bulanIndex >= 0 && tahun) {
    const nomorBulan = (bulanIndex + 1).toString().padStart(2, "0");
    return `${tahun}-${nomorBulan}`;
  }

  return "";
};

/**
 * angkaKeTerbilang - Konversi angka ke teks terbilang (Indonesian)
 * @param {number} n - Angka input (max ~1 triliun)
 * @returns {string} Teks terbilang dalam bahasa Indonesia + " rupiah"
 * 
 * Contoh:
 * angkaKeTerbilang(1500000) => "satu juta lima ratus ribu rupiah"
 * angkaKeTerbilang(0) => "nol rupiah"
 */
export const angkaKeTerbilang = (n: number): string => {
  if (n === 0) return "nol rupiah";

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

  const convertGroup = (num: number): string => {
    if (num === 0) return "";
    if (num < 12) return units[num];
    if (num < 20) return convertGroup(num - 10) + " belas";
    if (num < 100)
      return convertGroup(Math.floor(num / 10)) + " puluh " + units[num % 10];
    if (num < 200) return "seratus " + convertGroup(num - 100);
    if (num < 1000)
      return (
        convertGroup(Math.floor(num / 100)) + " ratus " + convertGroup(num % 100)
      );
    if (num < 2000) return "seribu " + convertGroup(num - 1000);
    if (num < 1000000)
      return (
        convertGroup(Math.floor(num / 1000)) + " ribu " + convertGroup(num % 1000)
      );
    if (num < 1000000000)
      return (
        convertGroup(Math.floor(num / 1000000)) +
        " juta " +
        convertGroup(num % 1000000)
      );
    if (num < 1000000000000)
      return (
        convertGroup(Math.floor(num / 1000000000)) +
        " miliar " +
        convertGroup(num % 1000000000)
      );

    return "";
  };

  const hasil = convertGroup(n).replace(/\s+/g, " ").trim();
  return hasil + " rupiah";
};

/**
 * generateInitialSows - Generate initial SOW state object (1-10)
 * @returns {Object} Object dengan key format: sow1, jumlah1, keterangan1_1, dll
 * 
 * Gunakan untuk initialize form data
 * Contoh return: {
 *   sow1: "", jumlah1: "", keterangan1_1: "", keterangan1_2: "", keterangan1_3: "",
 *   sow2: "", jumlah2: "", keterangan2_1: "", keterangan2_2: "", keterangan2_3: "",
 *   ...dst sampai sow10
 * }
 */
export const generateInitialSows = (): { [key: string]: string } => {
  return Array.from({ length: 10 }).reduce(
    (acc: { [key: string]: string }, _, i) => {
      const n = i + 1;
      acc[`sow${n}`] = "";
      acc[`jumlah${n}`] = "";
      acc[`keterangan${n}_1`] = "";
      acc[`keterangan${n}_2`] = "";
      acc[`keterangan${n}_3`] = "";
      return acc;
    },
    {}
  );
};

/**
 * generateInitialTalents - Generate initial Talent state (1-5)
 * @returns {Object} Object dengan key format: talent_name1, talent_name2, dst
 */
export const generateInitialTalents = (): { [key: string]: string } => {
  return Array.from({ length: 5 }).reduce(
    (acc: { [key: string]: string }, _, i) => {
      const n = i + 1;
      acc[`talent_name${n}`] = "";
      return acc;
    },
    {}
  );
};

/**
 * generateInitialCompetitors - Generate initial Competitor state (1-10)
 * @returns {Object} Object dengan key format: competitor1, competitor2, dst
 */
export const generateInitialCompetitors = (): { [key: string]: string } => {
  return Array.from({ length: 10 }).reduce(
    (acc: { [key: string]: string }, _, i) => {
      const n = i + 1;
      acc[`competitor${n}`] = "";
      return acc;
    },
    {}
  );
};
