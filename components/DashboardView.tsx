"use client";
import React from "react";
import {
  Users,
  Cake,
  TrendingUp,
  UserX,
  UserCheck,
  Compass,
  Share2,
  Instagram,
} from "lucide-react";
import { SiTiktok } from "react-icons/si";
import { AreaChart, Area } from "recharts";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from "recharts";

interface DashboardViewProps {
  talents: any[];
  impressionData: any[];
}

export default function DashboardView({
  talents,
  impressionData,
}: DashboardViewProps) {
  // 1. Hitung Total Valuation
  const totalValuation = talents.reduce(
    (acc, curr) => acc + (curr.rateCard || 0),
    0,
  );

  const totalAge = talents.reduce(
    (acc, curr) => acc + (parseInt(curr.umur) || 0),
    0,
  );
  const avgAge =
    talents.length > 0 ? (totalAge / talents.length).toFixed(1) : 0;

  const activeCount = talents.filter((t) => t.status === "Active").length;
  const inactiveCount = talents.filter((t) => t.status === "Inactive").length;
  const rangeData = [
    { category: "Beauty", min: 2000000, max: 5000000 },
    { category: "Food", min: 1500000, max: 4000000 },
    { category: "Health", min: 3000000, max: 7000000 },
    { category: "Gaming", min: 5000000, max: 15000000 },
    { category: "Finance", min: 8000000, max: 20000000 },
  ];

  // --- LOGIKA RATE CARD RANGE ---
  const rateRanges = {
    "< 2M": 0,
    "2M - 5M": 0,
    "5M - 10M": 0,
    "10M - 20M": 0,
    "20M++": 0,
  };

  talents.forEach((t) => {
    const rate = parseInt(t.rateCard) || 0;
    if (rate < 2000000) rateRanges["< 2M"]++;
    else if (rate >= 2000000 && rate < 5000000) rateRanges["2M - 5M"]++;
    else if (rate >= 5000000 && rate < 10000000) rateRanges["5M - 10M"]++;
    else if (rate >= 10000000 && rate < 20000000) rateRanges["10M - 20M"]++;
    else if (rate >= 20000000) rateRanges["20M++"]++;
  });

  const rateCardData = Object.keys(rateRanges).map((key) => ({
    range: key,
    total: (rateRanges as any)[key],
  }));

  // Hitung distribusi IG
  const igTiers = talents.reduce(
    (acc, t) => {
      const tier = t.tier_ig || "Nano";
      acc[tier] = (acc[tier] || 0) + 1;
      return acc;
    },
    { Mega: 0, Macro: 0, Micro: 0, Nano: 0 },
  );

  // Hitung distribusi TikTok
  const ttTiers = talents.reduce(
    (acc, t) => {
      const tier = t.tier_tiktok || "Nano";
      acc[tier] = (acc[tier] || 0) + 1;
      return acc;
    },
    { Mega: 0, Macro: 0, Micro: 0, Nano: 0 },
  );

  const total = talents.length || 1;

  // --- LOGIKA GENDER DISTRIBUTION ---
  const genderCounts = talents.reduce((acc: any, curr) => {
    const gender = curr.gender || "Other";
    acc[gender] = (acc[gender] || 0) + 1;
    return acc;
  }, {});

  const genderData = Object.keys(genderCounts).map((key) => ({
    name: key,
    value: genderCounts[key],
  }));

  const religionCounts = talents.reduce((acc: any, curr) => {
    const rel = curr.agama || "Other";
    acc[rel] = (acc[rel] || 0) + 1;
    return acc;
  }, {});

  const religionData = Object.keys(religionCounts).map((key) => ({
    name: key,
    value: religionCounts[key],
  }));

  // 2. LOGIKA ZODIAK (BAR CHART)
  const zodiacOrder = [
    "Aries",
    "Taurus",
    "Gemini",
    "Cancer",
    "Leo",
    "Virgo",
    "Libra",
    "Scorpio",
    "Sagittarius",
    "Capricorn",
    "Aquarius",
    "Pisces",
  ];

  const zodiacCounts = talents.reduce((acc: any, curr) => {
    const zodiac = curr.zodiac || "Unknown";
    acc[zodiac] = (acc[zodiac] || 0) + 1;
    return acc;
  }, {});

  const zodiacData = zodiacOrder.map((z) => ({
    name: z,
    total: zodiacCounts[z] || 0,
  }));

  // 3. LOGIKA DISTRIBUSI UMUR (PIE CHART)
  const ageGroups = {
    "age 10-20": 0,
    "age 21-30": 0,
    "age 31-40": 0,
    "age 41-50": 0,
    "age 51+": 0,
  };

  talents.forEach((t) => {
    const age = parseInt(t.umur);
    if (age >= 10 && age <= 20) ageGroups["age 10-20"]++;
    else if (age >= 21 && age <= 30) ageGroups["age 21-30"]++;
    else if (age >= 31 && age <= 40) ageGroups["age 31-40"]++;
    else if (age >= 41 && age <= 50) ageGroups["age 41-50"]++;
    else if (age > 50) ageGroups["age 51+"]++;
  });

  const ageData = Object.keys(ageGroups).map((key) => ({
    name: key,
    value: (ageGroups as any)[key],
  }));

  const sourceData = talents.reduce((acc: any[], curr) => {
    const source = curr.source || "Manual";
    const existing = acc.find((item) => item.name === source);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: source, value: 1 });
    }
    return acc;
  }, []);

  // Hitung persentase source terbanyak untuk label di bawah
  const topSource =
    sourceData.length > 0
      ? sourceData.sort((a, b) => b.value - a.value)[0].name
      : "-";

  // 4. Logika Domisili & Category (Tetap dipertahankan untuk baris 3)
  const domisiliMap = talents.reduce((acc: any, curr) => {
    const loc = curr.domisili || "Unknown";
    acc[loc] = (acc[loc] || 0) + 1;
    return acc;
  }, {});

  const domisiliData = Object.keys(domisiliMap).map((key) => ({
    name: key,
    total: domisiliMap[key],
  }));

  const categoryCounts = talents.reduce((acc: any, curr) => {
    const cat = curr.category || "Uncategorized";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const pieCategoryData = Object.keys(categoryCounts).map((key) => ({
    name: key,
    value: categoryCounts[key],
  }));

  // Menghitung jumlah per Tier
  const tierDistribution = talents.reduce(
    (acc, t) => {
      const tier = t.tier || "Nano";
      if (acc[tier] !== undefined) acc[tier]++;
      return acc;
    },
    { Mega: 0, Macro: 0, Micro: 0, Nano: 0 },
  );

  // Total Talent untuk hitung persentase (opsional)
  const totalTalents = talents.length;

  const COLORS = [
    "#1B4D66",
    "#E956D3",
    "#46C555",
    "#F59E0B",
    "#6366F1",
    "#EC4899",
    "#8B5CF6",
  ];

  return (
    <div className="animate-in fade-in duration-500 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#1B3A5B]">
          Executive Overview
        </h2>
      </div>

      {/* ROW 1: TOP STATS & TIERING */}
      <div className="grid grid-cols-12 gap-4 mb-8 items-stretch">
        {/* KOLOM KIRI: TOTAL & AVAILABILITY (Dijejerin Vertikal) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          {/* Card 1: Total Talents */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between h-full">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Total Talents
              </p>
              <div className="text-3xl font-black text-slate-800">
                {talents.length}
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
              <Users size={24} />
            </div>
          </div>

          {/* Card 2: Talent Availability */}
          <div className="flex flex-col justify-center h-full">
            <div className="flex items-center w-full">
              <div className=" bg-white rounded-2xl border-slate-100 p-6 shadow-sm flex-1 flex flex-col items-center">
                <span className="text-2xl font-black text-slate-800 mb-2">
                  {activeCount}
                </span>
                <span className="text-[10px] font-bold uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Active
                </span>
              </div>
              <div className="w-px h-10 bg-slate-100 mx-4 shrink-0" />
              <div className="bg-white rounded-2xl border-slate-100 p-6 shadow-sm flex-1 flex flex-col items-center">
                <span className="text-2xl font-black text-slate-800 mb-2">
                  {inactiveCount}
                </span>
                <span className="text-[10px] font-bold uppercase text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                  Inactive
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: DUAL TIERING (Habisin Sisa Space ke Kanan) */}
        <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-center">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-slate-800">
              Talent Tiering Composition
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {/* RENDER IG COLUMN */}
            <div className="space-y-4">
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-pink-500 bg-pink-50 px-2.5 py-1.5 rounded-xl border border-pink-100 w-fit">
                <Instagram size={14} /> Instagram
              </span>
              {["Mega", "Macro", "Micro", "Nano"].map((tier) => (
                <div key={`ig-${tier}`} className="min-w-0">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      {tier}
                    </span>
                    <span className="text-xs font-black text-slate-800">
                      {(igTiers as any)[tier]}{" "}
                      <span className="text-[10px] text-slate-300 font-bold">
                        TALENTS
                      </span>
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-pink-500 transition-all duration-700"
                      style={{
                        width: `${((igTiers as any)[tier] / total) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* RENDER TIKTOK COLUMN */}
            <div className="space-y-4">
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 w-fit">
                <SiTiktok size={14} />
                TikTok
              </span>
              {["Mega", "Macro", "Micro", "Nano"].map((tier) => (
                <div key={`tt-${tier}`} className="min-w-0">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      {tier}
                    </span>
                    <span className="text-xs font-black text-slate-800">
                      {(ttTiers as any)[tier]}{" "}
                      <span className="text-[10px] text-slate-300 font-bold">
                        TALENTS
                      </span>
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-800 transition-all duration-700"
                      style={{
                        width: `${((ttTiers as any)[tier] / total) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* ROW 3: SOURCE, GENDER, & RELIGION */}
      <div className="grid grid-cols-12 gap-6">
        {/* 1. SOURCE DISTRIBUTION */}
        <div className="col-span-12 lg:col-span-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-800">
              Source Distribution
            </h3>
            <Compass size={16} className="text-slate-300" />
          </div>

          <div className="h-64 relative">
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-4">
              <h4 className="text-lg font-black text-slate-800">
                {sourceData.length}
              </h4>
              <p className="text-[8px] font-bold text-slate-400 uppercase">
                Sources
              </p>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {sourceData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any) => [
                    `${value} Talent`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-auto pt-4 border-t border-slate-50">
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mb-3">
              {sourceData.map((entry, index) => (
                <div
                  key={`leg-src-${index}`}
                  className="flex items-center gap-1.5"
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-[10px] font-bold text-slate-600">
                    {entry.name}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center bg-slate-50 rounded-xl px-3 py-2">
              <p className="text-[9px] font-bold text-slate-400 uppercase">
                Top Source
              </p>
              <p className="text-[10px] font-black text-blue-600">
                {topSource}
              </p>
            </div>
          </div>
        </div>

        {/* 2. GENDER DISTRIBUTION */}
        <div className="col-span-12 lg:col-span-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-800">
              Gender Distribution
            </h3>
            <Users size={16} className="text-slate-300" />
          </div>

          <div className="h-64 relative">
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-4">
              <h4 className="text-lg font-black text-slate-800">
                {genderData.length}
              </h4>
              <p className="text-[8px] font-bold text-slate-400 uppercase">
                Groups
              </p>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {genderData.map((entry, index) => (
                    <Cell
                      key={`cell-gen-${index}`}
                      fill={COLORS[(index + 1) % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any) => [
                    `${value} Talent`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-auto pt-4 border-t border-slate-50">
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mb-3">
              {genderData.map((entry, index) => (
                <div
                  key={`leg-gen-${index}`}
                  className="flex items-center gap-1.5"
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: COLORS[(index + 1) % COLORS.length],
                    }}
                  />
                  <span className="text-[10px] font-bold text-slate-600">
                    {entry.name}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center bg-slate-50 rounded-xl px-3 py-2">
              <p className="text-[9px] font-bold text-slate-400 uppercase">
                Dominant
              </p>
              <p className="text-[10px] font-black text-pink-600">
                {genderData.sort((a, b) => b.value - a.value)[0]?.name || "-"}
              </p>
            </div>
          </div>
        </div>

        {/* 3. RELIGION DISTRIBUTION */}
        <div className="col-span-12 lg:col-span-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-800">
              Religion Distribution
            </h3>
            <UserCheck size={16} className="text-slate-300" />
          </div>

          <div className="h-64 relative">
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-4">
              <h4 className="text-lg font-black text-slate-800">
                {religionData.length}
              </h4>
              <p className="text-[8px] font-bold text-slate-400 uppercase">
                Faiths
              </p>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={religionData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {religionData.map((entry, index) => (
                    <Cell
                      key={`cell-rel-${index}`}
                      fill={COLORS[(index + 2) % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any) => [
                    `${value} Talent`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-auto pt-4 border-t border-slate-50">
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mb-3">
              {religionData.map((entry, index) => (
                <div
                  key={`leg-rel-${index}`}
                  className="flex items-center gap-1.5"
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: COLORS[(index + 2) % COLORS.length],
                    }}
                  />
                  <span className="text-[10px] font-bold text-slate-600">
                    {entry.name}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center bg-slate-50 rounded-xl px-3 py-2">
              <p className="text-[9px] font-bold text-slate-400 uppercase">
                Major
              </p>
              <p className="text-[10px] font-black text-emerald-600">
                {religionData.sort((a, b) => b.value - a.value)[0]?.name || "-"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
