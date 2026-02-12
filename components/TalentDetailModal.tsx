import React from "react";
import { Plus, Clock, Instagram } from "lucide-react";
import DetailItem from "./DetailItem";
import { Talent } from "../types";

interface TalentDetailModalProps {
  selectedDetail: Talent;
  setSelectedDetail: (val: Talent | null) => void;
  formatDate: (dateString?: string) => string;
  getSourceStyle: (source: string) => string;
  onUpdate: (talent: Talent) => void;
  setTalentToDelete: (talent: Talent) => void;
}

const TalentDetailModal: React.FC<TalentDetailModalProps> = ({
  selectedDetail,
  setSelectedDetail,
  formatDate,
  getSourceStyle,
  onUpdate,
  setTalentToDelete,
}) => {
  if (!selectedDetail) return null;
  return (
    <div
      className={
        "fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center p-4 animate-in fade-in duration-300"
      }
    >
      <div
        className={
          "bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-8 relative scrollbar-hide xl:ml-100 2xl:ml-120"
        }
      >
        {/* Header modal */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex gap-4">
            <div className="w-20 h-20 rounded-2xl bg-[#1B3A5B] flex items-center justify-center text-3xl font-bold text-white uppercase shadow-lg shadow-[#1B3A5B]/20">
              {selectedDetail.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-3">
                {/* Nama Utama */}
                <h3 className="text-2xl font-black text-[#1B3A5B]">
                  {selectedDetail.name}
                </h3>
                {/* Badge Source */}
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${getSourceStyle(
                    selectedDetail.source,
                  )}`}
                >
                  {selectedDetail.source}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-slate-100 text-[#1B3A5B] text-[10px] font-bold rounded-md uppercase tracking-wider">
                    {selectedDetail.category}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                      selectedDetail.status === "Active"
                        ? "bg-green-100 text-green-600"
                        : "bg-orange-100 text-orange-600"
                    }`}
                  >
                    {selectedDetail.status}
                  </span>
                  <Clock size={12} />
                  <span className="text-[10px] font-medium">
                    Last updated: {formatDate(selectedDetail.last_update)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => setSelectedDetail(null)}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-700"
          >
            <Plus size={24} className="rotate-45" />
          </button>
        </div>
        {/* Body modal: grid 2 kolom */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          {/* Kolom kiri: personal info */}
          <div className="space-y-5">
            <h4 className="text-[11px] font-bold text-black uppercase tracking-[0.2em] border-b border-slate-100 pb-2">
              Personal Information
            </h4>
            <div className="grid grid-cols-2 gap-y-4 gap-x-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-tighter mb-0.5">
                  Contact Person
                </p>
                {selectedDetail.contactPerson ? (
                  <a
                    href={`https://wa.me/${selectedDetail.contactPerson.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-green-600 hover:text-green-700 flex items-center gap-1 hover:underline"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.672 1.43 5.661 1.43h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    {selectedDetail.contactPerson}
                  </a>
                ) : (
                  <p className="text-xs font-bold text-slate-300">-</p>
                )}
              </div>
              <DetailItem label="Ethnicity" value={selectedDetail.suku} />
              <DetailItem label="Religion" value={selectedDetail.agama} />
              <DetailItem label="Zodiac" value={selectedDetail.zodiac} />
              <DetailItem label="Hobby" value={selectedDetail.hobby} />
              <DetailItem label="Occupation" value={selectedDetail.pekerjaan} />
              <DetailItem
                label="Education"
                value={selectedDetail.tempatKuliah}
              />
              <DetailItem
                label="Domisili / Location"
                value={selectedDetail.domisili}
              />
              <DetailItem label="Gender" value={selectedDetail.gender || "-"} />
              <DetailItem
                label="Hijab Status"
                value={selectedDetail.hijab === "yes" ? "Hijab" : "Non-Hijab"}
              />
            </div>
          </div>
          {/* Kolom kanan: business & socials */}
          <div className="space-y-5">
            <h4 className="text-[11px] font-bold text-black uppercase tracking-[0.2em] border-b border-slate-100 pb-2">
              Social Media & Business
            </h4>
            {/* SOCIAL LINKS */}
            <div className="space-y-4">
              {/* INSTAGRAM CARD */}
              <div className="relative bg-slate-50 p-3 rounded-2xl border border-slate-100">
                {/* TIER BADGE */}
                <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-[9px] font-black px-2 py-0.5 rounded-lg shadow-md uppercase tracking-tighter">
                  {selectedDetail.tier_ig || "Nano"}
                </div>
                {/* HEADER LINE: Label & ER */}
                <div className="flex gap-2 items-center mb-1">
                  <p className="text-[9px] font-bold text-slate-700 uppercase">
                    Instagram Profile
                  </p>
                  {/* ER Badge di samping tulisan Instagram Profile */}
                  <span className="text-[9px] font-black text-orange-600 bg-orange-100/50 px-1.5 py-0.5 rounded border border-orange-200 uppercase">
                    ER: {selectedDetail.er || "0.00%"}
                  </span>
                </div>
                {/* LINK & FOLLOWERS */}
                <a
                  href={`https://instagram.com/${selectedDetail.igAccount.replace("@", "")}`}
                  target="_blank"
                  className="text-sm font-bold text-blue-600 flex items-center gap-2 hover:underline"
                >
                  <Instagram size={16} />
                  <div className="flex items-baseline gap-1.5">
                    <span>{selectedDetail.igAccount}</span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      ({selectedDetail.igFollowers?.toLocaleString()} followers)
                    </span>
                  </div>
                </a>
              </div>
              {/* TIKTOK CARD */}
              <div className="relative bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div className="absolute -top-2 -right-2 bg-pink-600 text-white text-[9px] font-black px-2 py-0.5 rounded-lg shadow-md uppercase tracking-tighter">
                  {selectedDetail.tier_tiktok || "Nano"}
                </div>
                <p className="text-[9px] font-bold text-slate-700 uppercase mb-1">
                  TikTok Profile
                </p>
                <a
                  href={`https://tiktok.com/@${selectedDetail.tiktokAccount.replace("@", "")}`}
                  target="_blank"
                  className="text-sm font-bold text-pink-600 flex items-center gap-2 hover:underline"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 50 50"
                    fill="currentColor"
                  >
                    <path d="M41,4H9C6.243,4,4,6.243,4,9v32c0,2.757,2.243,5,5,5h32c2.757,0,5-2.243,5-5V9C46,6.243,43.757,4,41,4z M37.006,22.323 c-0.227,0.021-0.457,0.035-0.69,0.035c-2.623,0-4.928-1.349-6.269-3.388c0,5.349,0,11.435,0,11.537c0,4.709-3.818,8.527-8.527,8.527 s-8.527-3.818-8.527-8.527s3.818-8.527,8.527-8.527c0.178,0,0.352,0.016,0.527,0.027v4.202c-0.175-0.021-0.347-0.053-0.527-0.053 c-2.404,0-4.352,1.948-4.352,4.352s1.948,4.352,4.352,4.352s4.527-1.894,4.527-4.298c0-0.095,0.042-19.594,0.042-19.594h4.016 c0.378,3.591,3.277,6.425,6.901,6.685V22.323z" />
                  </svg>
                  {selectedDetail.tiktokAccount}
                  <span className="text-[11px] text-slate-400 font-medium">
                    ({selectedDetail.tiktokFollowers.toLocaleString()}{" "}
                    followers)
                  </span>
                </a>
              </div>
              {/* YOUTUBE CARD */}
              <div className="relative bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <p className="text-[9px] font-bold text-slate-700 uppercase mb-1">
                  Channel YouTube
                </p>
                <a
                  href={`https://youtube.com/@${selectedDetail.youtube_username || ""}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-red-600 flex items-center gap-2 hover:underline"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M21.8 8.001s-.2-1.4-.8-2c-.7-.8-1.5-.8-1.9-.9C16.1 5 12 5 12 5h0s-4.1 0-7.1.1c-.4.1-1.2.1-1.9.9-.6.6-.8 2-.8 2S2 9.6 2 11.2v1.6c0 1.6.2 3.2.2 3.2s.2 1.4.8 2c.7.8 1.7.8 2.1.9 1.5.1 6.9.1 6.9.1s4.1 0 7.1-.1c.4-.1 1.2-.1 1.9-.9.6-.6.8-2 .8-2s.2-1.6.2-3.2v-1.6c0-1.6-.2-3.2-.2-3.2zM9.8 15.1V8.9l6.2 3.1-6.2 3.1z" />
                  </svg>
                  {selectedDetail.youtube_username || "-"}
                  <span className="text-[11px] text-slate-400 font-medium">
                    (
                    {(selectedDetail.youtube_subscriber || 0).toLocaleString(
                      "id-ID",
                    )}{" "}
                    subs)
                  </span>
                </a>
              </div>
              {/* BUSINESS EMAIL CARD */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <p className="text-[9px] font-bold text-slate-00 uppercase mb-1">
                  Business Email
                </p>
                {selectedDetail.email && selectedDetail.email !== "-" ? (
                  <a
                    href={`mailto:${selectedDetail.email}`}
                    className="text-sm font-bold text-slate-700 flex items-center gap-2 hover:text-[#1B3A5B] transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    {selectedDetail.email}
                  </a>
                ) : (
                  <p className="text-sm font-bold text-slate-300 italic">
                    - No Email Provided -
                  </p>
                )}
              </div>
            </div>
          </div>
          {/* ACTION BUTTONS */}
          <div className="col-span-1 md:col-span-2 pt-4 flex gap-3">
            <button
              onClick={() => {
                onUpdate(selectedDetail);
                setSelectedDetail(null);
              }}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-amber-500 text-white rounded-2xl font-bold hover:bg-amber-600 shadow-lg shadow-amber-200 transition-all active:scale-95"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19.5 2 21l1.5-5L16.5 3.5z" />
              </svg>
              Edit Profile
            </button>
            <button
              onClick={() => {
                setTalentToDelete(selectedDetail);
                setSelectedDetail(null);
              }}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 shadow-lg shadow-red-200 transition-all active:scale-95"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18" />
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0v14m6-14v14" />
              </svg>
              Delete Talent
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TalentDetailModal;
