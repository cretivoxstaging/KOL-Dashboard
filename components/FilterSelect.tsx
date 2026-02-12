import React from "react";

interface FilterSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder: string;
}

const FilterSelect: React.FC<FilterSelectProps> = ({ value, onChange, options, placeholder }) => (
  <div className="flex items-center bg-white px-3 py-2 border border-slate-200 rounded-xl shadow-sm hover:border-[#1B3A5B]/30 transition-all">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-xs font-bold text-slate-700 outline-none bg-transparent cursor-pointer"
    >
      <option value="All">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

export default FilterSelect;
