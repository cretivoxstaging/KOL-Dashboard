"use client";
import React from "react";
import { Users, Cake, TrendingUp, UserX, UserCheck } from "lucide-react";
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

  // --- LOGIKA RELIGION DISTRIBUTION ---
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
        <p className="text-sm text-slate-400">
          Total Database:{" "}
          <span className="font-bold text-slate-700">
            {talents.length} Talents
          </span>
        </p>
      </div>

      {/* ROW 1: STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Talents"
          value={talents.length}
          icon={<Users size={20} />}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Talent Availability"
          value={
            <div className="flex items-center gap-6 mt-1">
              {/* Bagian Aktif */}
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-slate-800">
                  {activeCount}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Active
                </span>
              </div>

              {/* Pembatas Garis Halus */}
              <div className="h-10 bg-slate-200" />

              {/* Bagian Nonaktif */}
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-slate-800">
                  {inactiveCount}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                  Inactive
                </span>
              </div>
            </div>
          }
          icon={<Users size={20} />}
          color="bg-slate-50 text-slate-600"
        />
        {/* CARD: TALENT COMPOSITION */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center h-full col-span-1 md:col-span-2">
          {/* BAGIAN KIRI: RINGKASAN */}
          <div className="flex flex-col justify-center pr-10 border-r border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 mb-3">
              <Users size={20} />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              Talent Composition
            </p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-4xl font-black text-slate-800">
                {totalTalents}
              </h3>
              <span className="text-xs font-bold text-slate-400 uppercase">
                Total
              </span>
            </div>
          </div>
          {/* BAGIAN KANAN: BARIS PROGRESS (2 KOLOM RAPI) */}
          <div className="flex-1 pl-10">
            <div className="grid grid-cols-2 gap-x-12 gap-y-5">
              {[
                {
                  label: "Mega",
                  count: tierDistribution.Mega,
                  color: "bg-purple-500",
                },
                {
                  label: "Macro",
                  count: tierDistribution.Macro,
                  color: "bg-blue-500",
                },
                {
                  label: "Micro",
                  count: tierDistribution.Micro,
                  color: "bg-cyan-500",
                },
                {
                  label: "Nano",
                  count: tierDistribution.Nano,
                  color: "bg-slate-400",
                },
              ].map((item) => (
                <div key={item.label} className="w-full">
                  <div className="flex justify-between items-end mb-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                      {item.label}
                    </span>
                    <span className="text-[11px] font-black text-slate-800 flex items-center gap-1">
                      {item.count}
                      {""}
                      <span className="text-[9px] text-slate-400 font-bold">
                        TALENT
                      </span>
                    </span>
                  </div>
                  {/* Progress Bar Container */}
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} transition-all duration-700 ease-out`}
                      style={{
                        width: `${
                          totalTalents > 0
                            ? (item.count / totalTalents) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* ROW 2 - KIRI: Zodiac Bar Chart (GANTI DARI COST EFFICIENCY) */}
        <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800">
            Zodiac Distribution
          </h3>
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-6">
            Total talents per zodiac sign
          </p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={zodiacData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#F1F5F9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fill: "#94A3B8" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#94A3B8" }}
                />
                <Tooltip
                  formatter={(
                    value: number | undefined,
                    name: string | undefined,
                  ) => [`${value || 0} Talent`, name]}
                  cursor={{ fill: "#F8FAFC" }}
                />
                <Bar
                  dataKey="total"
                  fill="#1B4D66"
                  radius={[6, 6, 0, 0]}
                  barSize={35}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ROW 2 - KANAN: Age Distribution Pie Chart (GANTI DARI DOMICILE) */}
        <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-slate-800">
              Age Range Distribution
            </h3>
            <Cake size={16} className="text-slate-300" />
          </div>

          <div className="h-72 relative">
            {/* AKSESORIS TENGAH (IDENTITAS UMUR) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-6">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mb-1 border border-slate-100 shadow-sm">
                <Cake size={20} className="text-slate-400" />
              </div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                Avg Age
              </p>
              <h4 className="text-xl font-black text-slate-800">{avgAge}</h4>
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ageData}
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {ageData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      className="outline-none"
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(
                    value: number | undefined,
                    name: string | undefined,
                  ) => [`${value || 0} Talent`, name]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{
                    fontSize: "10px",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    paddingTop: "20px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* AKSESORIS BAWAH (FOOTER STATS) */}
          <div className="mt-4 pt-6 border-t border-slate-50 flex justify-between items-center">
            <div className="text-center flex-1">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                Youngest
              </p>
              <p className="text-sm font-black text-slate-700">
                {Math.min(...talents.map((t) => parseInt(t.umur) || 99))}
              </p>
            </div>
            <div className="h-8 bg-slate-100"></div>
            <div className="text-center flex-1">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                Main Group
              </p>
              <p className="text-sm font-black text-blue-600">
                {ageData.sort((a, b) => b.value - a.value)[0]?.name || "-"}
              </p>
            </div>
            <div className="h-8 bg-slate-100"></div>
            <div className="text-center flex-1">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                Oldest
              </p>
              <p className="text-sm font-black text-slate-700">
                {Math.max(...talents.map((t) => parseInt(t.umur) || 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 3: RATE CARD RANGE & RELIGION */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-slate-800">
              Religion Distribution
            </h3>
            <div className="p-1.5 bg-slate-50 rounded-lg">
              <Users size={14} className="text-slate-400" />
            </div>
          </div>

          <div className="h-72 relative">
            {/* CENTER INFO */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-6">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                Diversity
              </p>
              <h4 className="text-xl font-black text-slate-800">
                {religionData.length}
              </h4>
              <p className="text-[9px] font-bold text-slate-400 uppercase">
                Groups
              </p>
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={religionData}
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {religionData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(
                    value: number | undefined,
                    name: string | undefined,
                  ) => [`${value || 0} Talent`, name]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  wrapperStyle={{
                    fontSize: "10px",
                    fontWeight: "bold",
                    paddingTop: "20px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Rate Card Range - Bar Chart (Kiri - Span 8) */}
        <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800">
            Rate Card Range Distribution
          </h3>
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-6">
            Market value segmentation
          </p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rateCardData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#F1F5F9"
                />
                <XAxis
                  dataKey="range"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#94A3B8" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#94A3B8" }}
                />
                <Tooltip
                  formatter={(
                    value: number | undefined,
                    name: string | undefined,
                  ) => [`${value || 0} Talent`, name]}
                  cursor={{ fill: "#F8FAFC" }}
                />
                <Bar
                  dataKey="total"
                  fill="#E956D3"
                  radius={[6, 6, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group transition-all">
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
          {title}
        </p>
        <div className="text-2xl font-bold text-slate-800">{value}</div>
      </div>
      <div className={`p-3 rounded-2xl ${color} transition-transform`}>
        {icon}
      </div>
    </div>
  );
}
