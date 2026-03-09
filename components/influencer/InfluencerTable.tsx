/**
 * ============================================
 * INFLUENCER TABLE COMPONENT
 * ============================================
 * 
 * Komponen tabel khusus untuk Influencer/KOL List
 * Filter: Hanya menampilkan data dengan source !== "talent"
 * 
 * Menampilkan: Artist/Celebrity, Influencer/KOL, Media, Clippers
 * Wraps TalentView dengan logika filtering influencer-specific
 */

"use client";
import React from "react";
import TalentView from "../talent/TalentView";
import { Talent } from "../../types";

interface InfluencerTableProps {
  talents: Talent[];
  isLoading: boolean;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  talentToEdit: any | null;
  setTalentToEdit: (val: any) => void;
  sortBy: string;
  setSortBy: (val: string) => void;
  selectedReligion: string;
  setSelectedReligion: (val: string) => void;
  selectedStatus: string;
  setSelectedStatus: (val: string) => void;
  selectedTier: string;
  setSelectedTier: (val: string) => void;
  selectedAgeRange: string;
  setSelectedAgeRange: (val: string) => void;
  selectedSource: string;
  setSelectedSource: (val: string) => void;
  filteredAndSortedTalents: Talent[];
  onDelete: (id: number) => void;
  onUpdate: (talent: any) => void;
  onRefresh: () => void;
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;
}

export default function InfluencerTable({
  talents,
  isLoading,
  isModalOpen,
  setIsModalOpen,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  talentToEdit,
  setTalentToEdit,
  sortBy,
  setSortBy,
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
  filteredAndSortedTalents,
  onDelete,
  onUpdate,
  onRefresh,
  isSidebarOpen,
  isSidebarCollapsed,
}: InfluencerTableProps) {
  // Filter HANYA influencer (source !== "talent" dan !== "Talent")
  const influencersOnly = filteredAndSortedTalents.filter(
    (t) => t.source !== "talent" && t.source !== "Talent"
  );

  return (
    <TalentView
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      selectedCategory={selectedCategory}
      setSelectedCategory={setSelectedCategory}
      filteredTalent={influencersOnly}
      onAddClick={() => setIsModalOpen(true)}
      onDelete={onDelete}
      onUpdate={onUpdate}
      onRefresh={onRefresh}
      isLoading={isLoading}
      sortBy={sortBy}
      setSortBy={setSortBy}
      selectedSource={selectedSource}
      setSelectedSource={setSelectedSource}
      selectedReligion={selectedReligion}
      setSelectedReligion={setSelectedReligion}
      selectedStatus={selectedStatus}
      setSelectedStatus={setSelectedStatus}
      selectedTier={selectedTier}
      setSelectedTier={setSelectedTier}
      selectedAgeRange={selectedAgeRange}
      setSelectedAgeRange={setSelectedAgeRange}
      isSidebarOpen={isSidebarOpen}
      isSidebarCollapsed={isSidebarCollapsed}
    />
  );
}
