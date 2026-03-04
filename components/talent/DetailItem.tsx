/**
 * ============================================
 * DETAIL ITEM - REUSABLE DISPLAY COMPONENT
 * ============================================
 * 
 * Component reusable untuk menampilkan key-value pair di detail modal
 * 
 * Fitur:
 * - Consistent styling untuk semua detail items
 * - Support link vs plain text
 * - Label dengan font bold
 * - Value dengan text wrapping
 * 
 * Props:
 * - label: Key name (e.g. "Full Name", "Instagram")
 * - value: Value to display
 * - href: Optional URL untuk external link
 */

import React from "react";

interface DetailItemProps {
  label: string;
  value: string;
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value }) => (
  <div>
    <p className="text-[10px] font-bold text-slate-800 uppercase tracking-tighter mb-0.5">
      {label}
    </p>
    <p className="text-xs font-bold text-slate-600">{value || "-"}</p>
  </div>
);

export default DetailItem;
