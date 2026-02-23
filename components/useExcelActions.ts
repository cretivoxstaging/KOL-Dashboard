import { useRef, useState } from "react";
import * as XLSX from "xlsx";

export interface ImportProgress {
  current: number;
  total: number;
}

export function useExcelActions(onRefresh: () => void) {
  const [showProgress, setShowProgress] = useState(false);
  const [importProgress, setImportProgress] = useState<ImportProgress>({ current: 0, total: 0 });
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);
  const isCancelledRef = useRef(false);

  const safeNum = (val: any) => {
    if (!val || val === "NaN" || val === "null" || val === "") return "0";
    const cleaned = String(val).replace(/[^\d]/g, "");
    return cleaned || "0";
  };

  const handleCancelImport = () => {
    isCancelledRef.current = true;
    localStorage.removeItem("pending_import_data");
    localStorage.removeItem("pending_import_index");
    setShowProgress(false);
    setIsPaused(false);
    isPausedRef.current = false;
    onRefresh();
  };

  const togglePause = () => {
    const nextState = !isPaused;
    setIsPaused(nextState);
    isPausedRef.current = nextState;
  };

  const processImport = async (allData: any[], startIndex = 0) => {
    if (!allData || allData.length === 0) return;
    setShowProgress(true);
    setIsPaused(false);
    isPausedRef.current = false;
    isCancelledRef.current = false;
    localStorage.setItem("pending_import_data", JSON.stringify(allData));
    for (let i = startIndex; i < allData.length; i++) {
      if (isCancelledRef.current) {
        console.log("Import dihentikan oleh user.");
        return;
      }
      while (isPausedRef.current) {
        await new Promise((r) => setTimeout(r, 500));
        if (isCancelledRef.current) return;
      }
      const row = allData[i];
      setImportProgress({ current: i + 1, total: allData.length });
      localStorage.setItem("pending_import_index", i.toString());
      try {
        const igUser = String(row["Username_Instagram"] || "").replace("@", "").trim();
        let isDuplicate = false;
        if (igUser && igUser !== "-" && igUser !== "N/A") {
          try {
            // Next.js API routes are lowercase by convention
            const checkRes = await fetch(`/api/talent?search=${igUser}`);
            if (checkRes.ok) {
              const checkData = await checkRes.json();
              isDuplicate = checkData.some(
                (t: any) => t.igAccount?.replace("@", "").toLowerCase() === igUser.toLowerCase()
              );
              if (isDuplicate) {
                console.warn(`[Skip] @${igUser} sudah ada di database.`);
                continue;
              }
            } else {
              // If fetch fails (non-2xx), just skip duplicate check and continue import
              // No error log to avoid console spam
            }
          } catch (e) {
            // Network or parsing error, skip duplicate check and continue import
            // No error log to avoid console spam
          }
        }
        const ttUser = String(row["Username_Tiktok"] || "").replace("@", "").trim();
        let igData = { followers: "0", er: "0.00%", tier: "Nano" };
        let ttData = { followers: "0" };
        // --- D. Final Variables (Prioritas API, Fallback Excel) ---
        const igFollowersFinal = igData.followers !== "0" ? igData.followers : safeNum(row["Followers_Instagram"]);
        const ttFollowersFinal = ttData.followers !== "0" ? ttData.followers : safeNum(row["Followers_Tiktok"]);
        // --- E. Payload Sesuai Struktur Database ---
        const payload = {
          name: String(row["Name"] || row["name"] || "-"),
          domicile: String(row["domisili"] || row["domicile"] || "-"),
          instagram_username: igUser ? `@${igUser}` : "-",
          instagram_followers: igFollowersFinal,
          tiktok_username: ttUser ? `@${ttUser}` : "-",
          tiktok_followers: ttFollowersFinal,
          youtube_username: String(row["YouTube Username"] || "-"),
          youtube_subscriber: safeNum(row["YouTube Subscribers"]),
          contact_person: String(row["Phone Number"] || "-"),
          ethnicity: String(row["Ethnic"] || "-"),
          religion: String(row["Religion"] || "-"),
          reason_for_joining: String(row["reasons to be a talent"] || "-"),
          hobby: String(row["Hobby"] || "-"),
          age: safeNum(row["Age"] || "-"),
          occupation: String(row["Work"] || "-"),
          zodiac: String(row["Zodiac"] || "-"),
          university: String(row["college"] || "-"),
          category: String(row["Category"] || "-"),
          rate_card: safeNum(row["Rate Card"]),
          status: "active",
          tier: igData.tier,
          er: igData.er || "0.00%",
          last_update: new Date().toISOString(),
          email: String(row["Email Address"] || row["Email"] || "-"),
          hijab: String(row["Hijab Status"] || row["Hijab/Non"] || "-")
            .toLowerCase()
            .includes("yes")
            ? "yes"
            : "no",
          gender: String(row["Gender"] || "-"),
          source: String(row.finalSource || "-"),
        };
        await fetch("/api/talent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        // Hanya log error fatal pada baris, tidak spam error verifikasi
        console.error(`Gagal baris ${i + 1}:`, err);
      }
      await new Promise((r) => setTimeout(r, 1200));
    }
    if (!isCancelledRef.current) {
      // Selesai import, bersihkan state dan refresh data
      localStorage.removeItem("pending_import_data");
      localStorage.removeItem("pending_import_index");
      setShowProgress(false);
      setIsPaused(false);
      isPausedRef.current = false;
      onRefresh();
    }
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const bstr = event.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        let allCleanData: any[] = [];
        wb.SheetNames.forEach((sheetName) => {
          const ws = wb.Sheets[sheetName];
          const rawData: any[] = XLSX.utils.sheet_to_json(ws, { range: 1 });
          const cleanDataPerSheet = rawData
            .filter((row) => row["Name"])
            .map((row) => ({
              ...row,
              finalSource: row["Source"] || row["source"] || sheetName,
            }));
          allCleanData = [...allCleanData, ...cleanDataPerSheet];
        });
        if (allCleanData.length === 0) return alert("File kosong atau format salah!");
        processImport(allCleanData);
      } catch (err) {
        console.error(err);
        alert("Error saat import.");
      }
    };
    reader.readAsBinaryString(file);
  };

  // Export Excel function
  const handleExportExcel = (filteredTalent: any[]) => {
    if (!filteredTalent || filteredTalent.length === 0) {
      alert("No data to export!");
      return;
    }
    // Map data to exportable format (flatten fields as needed)
    const exportData = filteredTalent.map((t) => ({
      Name: t.name,
      Category: t.category,
      Source: t.source,
      Status: t.status,
      "Instagram Username": t.igAccount,
      "Instagram Followers": t.igFollowers,
      "Instagram ER": t.er,
      "Instagram Tier": t.tier_ig,
      "Tiktok Username": t.tiktokAccount,
      "Tiktok Followers": t.tiktokFollowers,
      "Tiktok Tier": t.tier_tiktok,
      "YouTube Username": t.youtube_username,
      "YouTube Subscribers": t.youtube_subscriber,
      Email: t.email,
      "Contact Person": t.contactPerson,
      Ethnic: t.suku,
      Religion: t.agama,
      Zodiac: t.zodiac,
      Hobby: t.hobby,
      Occupation: t.pekerjaan,
      University: t.tempatKuliah,
      Location: t.domisili,
      Gender: t.gender,
      "Hijab Status": t.hijab,
      "Last Update": t.last_update,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Talent");
    XLSX.writeFile(wb, "talent_data.xlsx");
  };

  return {
    showProgress,
    setShowProgress,
    importProgress,
    setImportProgress,
    isPaused,
    setIsPaused,
    isPausedRef,
    isCancelledRef,
    handleCancelImport,
    togglePause,
    processImport,
    handleImportExcel,
    handleExportExcel,
  };
}
