"use client";
import React from "react";
import { LayoutDashboard, Users, Calculator, LogOut, Menu, FileText } from "lucide-react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
}

function SidebarItem({ icon, label, active, collapsed, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group ${active ? "bg-[#1B3A5B] text-white shadow-lg" : "text-slate-400 hover:bg-slate-50"} ${collapsed ? "justify-center" : ""}`}
      title={collapsed ? label : ""}
    >
      <div className="shrink-0">{icon}</div>
      {!collapsed && <span className="text-sm font-medium whitespace-nowrap">{label}</span>}
    </button>
  );
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen, isSidebarCollapsed, setIsSidebarCollapsed }) => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      Cookies.remove("auth_token");
      router.push("/login");
    } catch (error) {
      // Optional: handle error (e.g., show notification)
      router.push("/login");
    }
  };
  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-50 bg-white border-r border-gray-200 shadow-xl flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} ${isSidebarCollapsed ? "w-20" : "w-64"}`}
    >
      <div className={`flex items-center mb-10 text-[#1B3A5B] p-6 ${isSidebarCollapsed ? "justify-center" : "justify-between"}`}>
        {!isSidebarCollapsed && <h1 className="text-xl font-bold tracking-tight uppercase">KOL</h1>}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors hidden lg:block"
        >
          <Menu size={20} />
        </button>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors lg:hidden ml-auto"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
      </div>
      <nav className="flex-1 space-y-2 px-4">
        <SidebarItem
          icon={<LayoutDashboard size={20} />}
          label="Dashboard"
          active={activeTab === "dashboard"}
          collapsed={isSidebarCollapsed}
          onClick={() => setActiveTab("dashboard")}
        />
        <SidebarItem
          icon={<Users size={20} />}
          label="Talent List"
          active={activeTab === "talent"}
          collapsed={isSidebarCollapsed}
          onClick={() => setActiveTab("talent")}
        />
        <SidebarItem
          icon={<Calculator size={20} />}
          label="Tax Calculator"
          active={activeTab === "tax"}
          collapsed={isSidebarCollapsed}
          onClick={() => setActiveTab("tax")}
        />
        <SidebarItem
          icon={<FileText size={20} />}
          label="SPK"
          active={activeTab === "SPK"}
          collapsed={isSidebarCollapsed}
          onClick={() => setActiveTab("SPK")}
        />
      </nav>
      <div className="p-4 mt-auto">
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 bg-[#1B3A5B] text-white shadow-lg hover:bg-red-500 transition-all rounded-[9px] h-12 font-bold text-sm ${isSidebarCollapsed ? "justify-center w-12" : "w-full px-4"}`}
        >
          <LogOut size={18} />
          {!isSidebarCollapsed && <span>Log Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
