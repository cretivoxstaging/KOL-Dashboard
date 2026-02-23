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
