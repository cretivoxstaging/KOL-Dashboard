import { useState, useEffect } from "react";
import { Talent } from "../../types";

export function useTalentData() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "talent" | "tax" | "SPK">("dashboard");
  const [talents, setTalents] = useState<Talent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [talentToEdit, setTalentToEdit] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedReligion, setSelectedReligion] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedTier, setSelectedTier] = useState("All");
  const [selectedAgeRange, setSelectedAgeRange] = useState("All");
  const [selectedSource, setSelectedSource] = useState("All");
  const [sortBy, setSortBy] = useState("update-desc");

  const getTimestamp = (dateString?: string) => {
    if (!dateString || dateString === "null" || dateString === "") return 0;
    try {
      const parts = dateString.split("-");
      if (parts.length === 3) {
        const day = parts[0];
        const month = parts[1];
        const yearWithTime = parts[2];
        const isoFormat = `${yearWithTime.split(" ")[0]}-${month}-${day}T${yearWithTime.split(" ")[1]}`;
        return new Date(isoFormat).getTime();
      }
      return new Date(dateString).getTime();
    } catch (e) {
      return 0;
    }
  };

  const filteredAndSortedTalents = talents
    .filter((t) => {
      const matchSearch =
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.suku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.igAccount?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchReligion = selectedReligion === "All" || t.agama === selectedReligion;
      const matchStatus = selectedStatus === "All" || t.status === selectedStatus;
      const matchTier = () => {
        if (selectedTier === "All") return true;
        if (selectedTier.startsWith("IG:")) {
          const targetTier = selectedTier.replace("IG: ", "");
          return t.tier_ig === targetTier;
        }
        if (selectedTier.startsWith("TT: ")) {
          const targetTier = selectedTier.replace("TT: ", "");
          return t.tier_tiktok === targetTier;
        }
        return t.tier === selectedTier;
      };
      const matchSource = selectedSource === "All" || t.source === selectedSource;
      const age = parseInt(t.umur) || 0;
      let ageRange = "All";
      if (age >= 10 && age <= 20) ageRange = "10-20";
      else if (age >= 21 && age <= 30) ageRange = "21-30";
      else if (age >= 31 && age <= 40) ageRange = "31-40";
      else if (age >= 41 && age <= 50) ageRange = "41-50";
      else if (age > 50) ageRange = "51++";
      const matchAge = selectedAgeRange === "All" || ageRange === selectedAgeRange;
      return (
        matchSearch &&
        matchReligion &&
        matchStatus &&
        matchTier() &&
        matchAge &&
        matchSource
      );
    })
    .sort((a, b) => {
      const [field, order] = sortBy.split("-");
      const isAsc = order === "asc";
      switch (field) {
        case "last_update":
        case "update":
          const timeA = getTimestamp(a.last_update);
          const timeB = getTimestamp(b.last_update);
          return isAsc ? timeA - timeB : timeB - timeA;
        case "name":
          return isAsc
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        case "igFollowers":
          const followersA = Number(a.igFollowers) || 0;
          const followersB = Number(b.igFollowers) || 0;
          return isAsc ? followersA - followersB : followersB - followersA;
        case "tiktokFollowers":
          const ttA = Number(a.tiktokFollowers) || 0;
          const ttB = Number(b.tiktokFollowers) || 0;
          return isAsc ? ttA - ttB : ttB - ttA;
        default:
          if (sortBy === "update-desc") {
            return getTimestamp(b.last_update) - getTimestamp(a.last_update);
          }
          return 0;
      }
    });

  const getTalents = async () => {
    const res = await fetch("/api/Talent");
    if (!res.ok) throw new Error("Gagal mengambil data");
    return res.json();
  };

  const createTalent = async (payload: any) => {
    const res = await fetch("/api/Talent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Gagal menambah talent");
    return res.json();
  };

  const updateTalent = async (id: string | number, payload: any) => {
    const res = await fetch(`/api/Talent/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Gagal update talent");
    return res.json();
  };

  const deleteTalent = async (id: string | number) => {
    const res = await fetch(`/api/Talent/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Gagal menghapus talent");
    return res.json();
  };

  const loadTalents = async () => {
    try {
      setIsLoading(true);
      const result = await getTalents();
      if (result && result.data) {
        const mappedData = result.data.map((t: any) => {
          const ig = parseInt(t.instagram_followers) || 0;
          const tt = parseInt(t.tiktok_followers) || 0;
          const getTier = (foll: number) => {
            if (foll >= 1000000) return "Mega";
            if (foll >= 100000) return "Macro";
            if (foll >= 10000) return "Micro";
            return "Nano";
          };
          return {
            id: t.id,
            name: t.name,
            domisili: t.domicile,
            igAccount: t.instagram_username,
            igFollowers: ig,
            tiktokAccount: t.tiktok_username,
            tiktokFollowers: tt,
            totalFollowers: ig + tt,
            contactPerson: t.contact_person,
            suku: t.ethnicity,
            agama: t.religion,
            alasan: t.reason_for_joining,
            hobby: t.hobby,
            umur: t.age,
            pekerjaan: t.occupation,
            zodiac: t.zodiac,
            tempatKuliah: t.university,
            category: t.category || "Uncategorized",
            status: t.status === "active" ? "Active" : "Inactive",
            monthlyImpressions: t.monthly_impressions || [
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            ],
            tier_ig: getTier(ig),
            tier_tiktok: getTier(tt),
            er: t.er || "0%",
            source: t.source || "-",
            youtube_subscriber: t.youtube_subscriber,
            youtube_username: t.youtube_username || "",
            last_update: t.last_update,
            email: t.email || "-",
            hijab: t.hijab || "no",
            gender: t.gender || "-",
          };
        });
        setTalents(mappedData);
      }
    } catch (error) {
      console.error("Client Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      setSortBy("last_update-desc");
      setSearchTerm("");
      setSelectedCategory("All");
      setSelectedReligion("All");
      setSelectedStatus("All");
      setSelectedTier("All");
      setSelectedAgeRange("All");
      setSelectedSource("All");
      await loadTalents();
    } catch (error) {
      console.error("Refresh Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTalents();
  }, []);

  const handleSaveTalent = async (formData: any) => {
    try {
      setIsLoading(true);
      let currentIgFollowers = formData.igFollowers;
      let currentIgTier = formData.tier_ig;
      let currentTtFollowers = formData.tiktokFollowers;
      let currentTtTier = formData.tier_tiktok;
      let shouldSyncIg = false;
      if (!talentToEdit) {
        shouldSyncIg = !!(formData.igAccount && formData.igAccount !== "-");
      } else if (talentToEdit.igAccount !== formData.igAccount) {
        shouldSyncIg = !!(formData.igAccount && formData.igAccount !== "-");
      }
      if (shouldSyncIg) {
        try {
          const usernameIg = formData.igAccount.replace("@", "").trim();
          const resIg = await fetch(`/api/instagram?username=${usernameIg}`);
          const dataIg = await resIg.json();
          if (dataIg.success) {
            currentIgFollowers = dataIg.followers;
            currentIgTier = dataIg.tier;
          }
        } catch (err) {}
      }
      let shouldSyncTiktok = false;
      if (!talentToEdit) {
        shouldSyncTiktok = !!(formData.tiktokAccount && formData.tiktokAccount !== "-");
      } else if (talentToEdit.tiktokAccount !== formData.tiktokAccount) {
        shouldSyncTiktok = !!(formData.tiktokAccount && formData.tiktokAccount !== "-");
      }
      if (shouldSyncTiktok) {
        try {
          const usernameTt = formData.tiktokAccount.replace("@", "").trim();
          const resTt = await fetch(`/api/tiktok?username=${usernameTt}`);
          const dataTt = await resTt.json();
          if (dataTt.success) {
            currentTtFollowers = dataTt.followers;
            currentTtTier = dataTt.tier;
          }
        } catch (err) {}
      }
      const payload = {
        name: formData.name,
        domicile: formData.domisili,
        instagram_username: formData.igAccount,
        instagram_followers: String(currentIgFollowers || "0"),
        tiktok_username: formData.tiktokAccount,
        tiktok_followers: String(currentTtFollowers || "0"),
        youtube_username: formData.youtube_username,
        youtube_subscriber: String(formData.youtube_subscriber || "0"),
        contact_person: formData.contactPerson,
        ethnicity: formData.suku,
        religion: formData.agama,
        reason_for_joining: formData.alasan,
        hobby: formData.hobby,
        age: String(formData.umur),
        occupation: formData.pekerjaan,
        zodiac: formData.zodiac,
        university: formData.tempatKuliah,
        category: formData.category,
        rate_card: String(formData.rateCard || "0"),
        status: formData.status.toLowerCase(),
        tier_ig: currentIgTier,
        tier_tiktok: currentTtTier,
        er: formData.er,
        source: talentToEdit ? formData.source : "Manual",
        tier: currentIgTier,
        last_update: new Date().toISOString(),
        email: formData.email,
        hijab: formData.hijab,
        gender: formData.gender,
      };
      if (talentToEdit) {
        await updateTalent(talentToEdit.id, payload);
      } else {
        await createTalent(payload);
      }
      await loadTalents();
      setIsModalOpen(false);
      setTalentToEdit(null);
    } catch (error: any) {
      alert("Gagal menyimpan: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTalent = async (id: number) => {
    try {
      setIsLoading(true);
      await deleteTalent(id);
      await loadTalents();
    } catch (error: any) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEdit = (talent: any) => {
    setTalentToEdit(talent);
    setIsModalOpen(true);
  };

  return {
    activeTab,
    setActiveTab,
    talents,
    setTalents,
    isModalOpen,
    setIsModalOpen,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    talentToEdit,
    setTalentToEdit,
    isLoading,
    setIsLoading,
    isSidebarOpen,
    setIsSidebarOpen,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    selectedReligion,
    setSelectedReligion,
    selectedStatus,
    setSelectedStatus,
    selectedTier,
    setSelectedTier,
    selectedAgeRange,
    setSelectedAgeRange,
    selectedSource,
    setSelectedSource,
    sortBy,
    setSortBy,
    filteredAndSortedTalents,
    handleRefresh,
    handleSaveTalent,
    handleDeleteTalent,
    handleOpenEdit,
  };
}
