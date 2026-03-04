/**
 * ============================================
 * SPK DELETE MODAL COMPONENT
 * ============================================
 * 
 * Modal konfirmasi delete SPK dengan:
 * - Warning message
 * - Confirmation text input ("delete")
 * - Cancel dan Delete buttons
 * - Loading state pada delete button
 * - Backdrop overlay
 * 
 * Semua handler berada di parent (SPKView)
 */

"use client";
import React from "react";
import { Trash2 } from "lucide-react";

interface SPKDeleteModalProps {
  open: boolean;
  item: any | null;
  confirmText: string;
  onConfirmTextChange: (text: string) => void;
  onClose: () => void;
  onDelete: () => void;
  isLoading: boolean;
}

/**
 * ============================================
 * SPKDeleteModal Main Component
 * ============================================
 */
export default function SPKDeleteModal({
  open,
  item,
  confirmText,
  onConfirmTextChange,
  onClose,
  onDelete,
  isLoading,
}: SPKDeleteModalProps) {
  // Jika modal tidak open, return null (tidak render apa-apa)
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      {/* Modal Container */}
      <div className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-300">
        <div className="p-8 space-y-6">
          {/* ============================================ */}
          {/* MODAL HEADER */}
          {/* ============================================ */}
          <div className="flex items-center gap-3 text-red-600">
            <div className="p-3 bg-red-50 rounded-2xl">
              <Trash2 size={24} />
            </div>
            <h3 className="text-xl font-bold text-[#1B3A5B]">Delete SPK</h3>
          </div>

          {/* ============================================ */}
          {/* WARNING MESSAGE */}
          {/* ============================================ */}
          <div className="bg-red-50 border border-red-100 p-4 rounded-2xl">
            <p className="text-red-800 text-xs leading-relaxed">
              <span className="font-bold">Warning:</span> This action cannot be
              undone. Data for <b>{item?.talent}</b> on brand{" "}
              <b>{item?.brand}</b> will be permanently removed.
            </p>
          </div>

          {/* ============================================ */}
          {/* CONFIRMATION INPUT */}
          {/* ============================================ */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700">
              Type <span className="text-red-600">delete</span> to confirm:
            </label>
            <input
              type="text"
              placeholder="Type 'delete' here..."
              value={confirmText}
              onChange={(e) => onConfirmTextChange(e.target.value)}
              className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-red-500/5 focus:border-red-200 transition-all text-sm"
            />
          </div>

          {/* ============================================ */}
          {/* ACTION BUTTONS */}
          {/* ============================================ */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {/* Cancel Button */}
            <button
              onClick={onClose}
              className="py-3.5 rounded-2xl font-bold text-slate-500 border border-slate-200 hover:bg-slate-50 transition-all text-sm"
            >
              Cancel
            </button>

            {/* Delete Button */}
            <button
              disabled={confirmText.toLowerCase() !== "delete" || isLoading}
              onClick={onDelete}
              className="py-3.5 rounded-2xl font-bold bg-red-500 hover:bg-red-600 text-white disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-red-200"
            >
              <Trash2 size={18} />
              {isLoading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
