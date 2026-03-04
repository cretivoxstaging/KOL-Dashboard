/**
 * ============================================
 * SPK TABLE COMPONENT
 * ============================================
 * 
 * Komponen untuk menampilkan daftar SPK dalam bentuk tabel
 * Fitur:
 * - Display data dengan pagination
 * - Sorting berdasarkan tanggal
 * - Action buttons (Edit, Download, Delete)
 * - Responsive design
 * - Status styling untuk talent badges
 * 
 * Semua handler logic berada di parent (SPKView)
 */

"use client";
import React from "react";
import {
  ChevronDown,
  Download,
  Pencil,
  Trash2,
} from "lucide-react";

interface SPKTableProps {
  items: any[]; // Current page items
  indexOfFirstItem: number;
  sortOrder: "asc" | "desc";
  onSortChange: (order: "asc" | "desc") => void;
  onActionClick: (id: string | null) => void;
  openActionId: string | null;
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
}

/**
 * ============================================
 * SPKTable Main Component
 * ============================================
 */
export default function SPKTable({
  items,
  indexOfFirstItem,
  sortOrder,
  onSortChange,
  onActionClick,
  openActionId,
  onEdit,
  onDelete,
}: SPKTableProps) {
  // Safe guard: ensure items is always an array
  const safeItems = items || [];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <table className="w-full text-left min-w-200">
        {/* ============================================ */}
        {/* TABLE HEADER */}
        {/* ============================================ */}
        <thead className="bg-slate-200 border-b border-slate-100">
          <tr className="text-[10px] sm:text-[11px] font-bold text-slate-800 uppercase tracking-widest">
            {/* No Column */}
            <th className="p-2 sm:p-5 text-center w-10">No</th>

            {/* SPK Number */}
            <th className="p-2 sm:p-5">No. SPK</th>

            {/* Talent */}
            <th className="p-2 sm:p-5">Talent</th>

            {/* Brand */}
            <th className="p-2 sm:p-5">Brand</th>

            {/* Date (Sortable) */}
            <th
              className="p-2 sm:p-5 cursor-pointer hover:bg-slate-300 transition-colors group"
              onClick={() =>
                onSortChange(sortOrder === "desc" ? "asc" : "desc")
              }
            >
              <div className="flex items-center gap-1">
                <span>Date</span>
                {/* Sort Icons */}
                <div className="flex flex-col -space-y-1 opacity-40 group-hover:opacity-100 transition-opacity">
                  <svg
                    className={`w-2.5 h-2.5 ${
                      sortOrder === "asc" ? "text-[#1B3A5B] opacity-100" : ""
                    }`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 4l-8 8h16l-8-8z" />
                  </svg>
                  <svg
                    className={`w-2.5 h-2.5 ${
                      sortOrder === "desc"
                        ? "text-[#1B3A5B] opacity-100"
                        : ""
                    }`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 20l8-8H4l8 8z" />
                  </svg>
                </div>
              </div>
            </th>

            {/* Action Column */}
            <th className="p-2 sm:p-5 text-center">Action</th>
          </tr>
        </thead>

        {/* ============================================ */}
        {/* TABLE BODY */}
        {/* ============================================ */}
        <tbody className="text-xs sm:text-sm">
          {safeItems.length > 0 ? (
            safeItems.map((item, index) => {
              // Cek apakah ini 2 baris terakhir (untuk positioning dropdown)
              const isLastRow = index >= safeItems.length - 2;

              return (
                <tr
                  key={item.id}
                  className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                >
                  {/* No Column */}
                  <td className="p-2 sm:p-5 text-center font-bold text-slate-800">
                    {indexOfFirstItem + index + 1}
                  </td>

                  {/* SPK Number */}
                  <td className="p-2 sm:p-5 font-bold text-[#1B3A5B]">
                    {item.spk_number || item.number}
                  </td>

                  {/* Talent Badges */}
                  <td className="p-5">
                    <div className="flex flex-wrap gap-1 max-w-100">
                      {[
                        item.talent_name1,
                        item.talent_name2,
                        item.talent_name3,
                        item.talent_name4,
                        item.talent_name5,
                      ]
                        .filter(Boolean)
                        .map((name, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md border border-blue-100 whitespace-nowrap"
                          >
                            {name}
                          </span>
                        ))}
                    </div>
                  </td>

                  {/* Brand */}
                  <td className="p-2 sm:p-5 text-slate-500">
                    {item.brand_name || item.brand}
                  </td>

                  {/* Date */}
                  <td className="p-2 sm:p-5 text-slate-500">
                    {item.created_at || item.date}
                  </td>

                  {/* Action Dropdown */}
                  <td className="p-5 text-center">
                    <div className="relative inline-block text-left">
                      {/* Action Button */}
                      <button
                        onClick={() =>
                          onActionClick(
                            openActionId === item.id ? null : item.id
                          )
                        }
                        className="flex items-center gap-2 bg-[#007AFF] text-white px-4 py-2 rounded-lg text-[10px] font-bold transition-all shadow-sm hover:bg-[#007AFF]/80"
                      >
                        Action
                        <ChevronDown
                          size={12}
                          className={`transition-transform ${
                            openActionId === item.id ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {/* Action Dropdown Menu */}
                      {openActionId === item.id && (
                        <>
                          {/* Backdrop */}
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => onActionClick(null)}
                          ></div>

                          {/* Dropdown Menu */}
                          <div
                            className={`absolute right-0 w-44 bg-white border border-slate-100 rounded-2xl shadow-2xl z-20 py-2 transition-all animate-in fade-in zoom-in-95 duration-200 ${
                              isLastRow
                                ? "bottom-full mb-2 origin-bottom-right"
                                : "top-full mt-2 origin-top-right"
                            }`}
                          >
                            {/* Edit Button */}
                            <button
                              onClick={() => {
                                onEdit(item);
                                onActionClick(null);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                              <Pencil size={14} className="text-amber-500" />
                              Edit
                            </button>

                            {/* Download PDF Button */}
                            <button
                              onClick={() => {
                                window.open(item.url, "_blank");
                                onActionClick(null);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                              <Download
                                size={14}
                                className="text-emerald-500"
                              />
                              Download PDF
                            </button>

                            {/* Divider */}
                            <div className="h-px bg-slate-100 my-1 mx-2"></div>

                            {/* Delete Button */}
                            <button
                              onClick={() => {
                                onDelete(item);
                                onActionClick(null);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan={6}
                className="p-10 text-center text-slate-400 italic"
              >
                Data tidak ditemukan.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
