"use client";
import React, { useState, useEffect } from 'react';
import { Calculator, Receipt, Percent, Wallet } from 'lucide-react';

export default function TaxCalculatorView() {
  const [grossAmount, setGrossAmount] = useState<number>(0);
  const [hasNPWP, setHasNPWP] = useState<boolean>(true);
  const [dpp, setDPP] = useState<number>(0);
  const [taxAmount, setTaxAmount] = useState<number>(0);
  const [netAmount, setNetAmount] = useState<number>(0);

  useEffect(() => {
    // Dasar Pengenaan Pajak (DPP) biasanya 50% dari Gross untuk Tenaga Ahli/Penerima Imbalan
    const calculatedDPP = grossAmount * 0.5;
    
    // Tarif PPh 21 (Lapisan 1: 5% jika NPWP, 6% jika non-NPWP)
    const rate = hasNPWP ? 0.05 : 0.06;
    const calculatedTax = calculatedDPP * rate;
    
    setDPP(calculatedDPP);
    setTaxAmount(calculatedTax);
    setNetAmount(grossAmount - calculatedTax);
  }, [grossAmount, hasNPWP]);

  return (
    <div className="animate-in fade-in duration-500 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-8 text-[#1B3A5B]">Tax Calculator (PPh 21)</h2>

      <div className="grid grid-cols-12 gap-8">
        {/* INPUT SECTION */}
        <div className="col-span-5 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Kontrak (Gross)</label>
            <div className="relative mt-2">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
              <input 
                type="number" 
                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20 font-bold text-slate-700"
                placeholder="0"
                onChange={(e) => setGrossAmount(Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status Perpajakan</label>
            <div className="flex gap-3 mt-2">
              <button 
                onClick={() => setHasNPWP(true)}
                className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-all border ${hasNPWP ? 'bg-[#1B3A5B] text-white border-[#1B3A5B]' : 'bg-white text-slate-400 border-slate-200'}`}
              >
                Punya NPWP
              </button>
              <button 
                onClick={() => setHasNPWP(false)}
                className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-all border ${!hasNPWP ? 'bg-[#1B3A5B] text-white border-[#1B3A5B]' : 'bg-white text-slate-400 border-slate-200'}`}
              >
                Non NPWP
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 italic">*Non-NPWP dikenakan tarif 20% lebih tinggi (6%)</p>
          </div>
        </div>

        {/* RESULT SECTION */}
        <div className="col-span-7 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Percent size={20}/></div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dasar Pengenaan Pajak (50%)</p>
                <p className="text-lg font-bold text-slate-700">Rp {dpp.toLocaleString('id-ID')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-50 text-red-600 rounded-2xl"><Receipt size={20}/></div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Potongan PPh 21 ({hasNPWP ? '5%' : '6%'})</p>
                <p className="text-lg font-bold text-red-600">- Rp {taxAmount.toLocaleString('id-ID')}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1B3A5B] p-8 rounded-3xl shadow-xl shadow-blue-900/20 flex items-center justify-between">
            <div className="flex items-center gap-4 text-white">
              <div className="p-3 bg-white/10 rounded-2xl"><Wallet size={24}/></div>
              <div>
                <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Total Terima (Netto)</p>
                <p className="text-3xl font-bold">Rp {netAmount.toLocaleString('id-ID')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}