"use client";
import React from "react";
import {
  LayoutDashboard,
  Users,
  Calculator,
  LogOut,
  Menu,
  FileText,
  Moon,
  Sun,
} from "lucide-react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useDarkMode } from "@/app/DarkModeContext";

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
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group 
        ${
          active
            ? "bg-[#007AFF] text-white shadow-lg"
            : "text-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
        } 
        ${collapsed ? "justify-center" : ""}`}
      title={collapsed ? label : ""}
    >
      <div className="shrink-0">{icon}</div>
      {!collapsed && (
        <span className="text-sm font-medium whitespace-nowrap">{label}</span>
      )}
    </button>
  );
}

const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isSidebarOpen,
  setIsSidebarOpen,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
}) => {
  const router = useRouter();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const modeLabel = isDarkMode ? "Light Mode" : "Dark Mode";

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      Cookies.remove("auth_token");
      router.push("/login");
    } catch (error) {
      router.push("/login");
    }
  };

  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-50 bg-white dark:bg-[#1E293B] border-r border-gray-200 dark:border-slate-800 shadow-xl flex flex-col transition-all duration-300 ease-in-out 
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} 
        ${isSidebarCollapsed ? "w-20" : "w-64"}`}
    >
      {/* HEADER SIDEBAR */}
      <div
        className={`flex items-center mb-10 text-[#1B3A5B] dark:text-slate-200 p-6 ${isSidebarCollapsed ? "justify-center" : "justify-between"}`}
      >
        {!isSidebarCollapsed && (
          <h1 className="text-xl font-bold tracking-tight uppercase">
            KOL <span className="italic normal-case font-black">CRETIVOX</span>
          </h1>
        )}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors hidden lg:block"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* NAVIGATION MENU */}
      <nav className="flex-1 space-y-2 px-4 ">
        <SidebarItem
          icon={<LayoutDashboard size={20} />}
          label="Dashboard"
          active={activeTab === "dashboard"}
          collapsed={isSidebarCollapsed}
          onClick={() => setActiveTab("dashboard")}
        />

        <SidebarItem
          icon={<Users size={20} />}
          label="Influencer List"
          active={activeTab === "influencer"}
          collapsed={isSidebarCollapsed}
          onClick={() => setActiveTab("influencer")}
        />

        <SidebarItem
          icon={<Users size={20} />}
          label="Talent List"
          active={activeTab === "talent-list"}
          collapsed={isSidebarCollapsed}
          onClick={() => setActiveTab("talent-list")}
        />

        <SidebarItem
          icon={<FileText size={20} />}
          label="SPK"
          active={activeTab === "SPK"}
          collapsed={isSidebarCollapsed}
          onClick={() => setActiveTab("SPK")}
        />

        <SidebarItem
          icon={<Calculator size={20} />}
          label="Tax Calculator"
          active={activeTab === "tax"}
          collapsed={isSidebarCollapsed}
          onClick={() => setActiveTab("tax")}
        />
      </nav>

      {/* BOTTOM ACTIONS */}
      <div className="p-4 mt-auto">
        <button
          onClick={toggleDarkMode}
          className={`w-full flex items-center rounded-xl transition-all mb-3 h-12 ${
            isSidebarCollapsed
              ? "justify-center"
              : "justify-between px-3"
          } ${
            isDarkMode
              ? "bg-slate-800/70 text-slate-300 hover:bg-slate-700"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
          title={isSidebarCollapsed ? modeLabel : ""}
          aria-label="Toggle Dark Mode"
        >
          {isSidebarCollapsed ? (
            isDarkMode ? <Moon size={18} /> : <Sun size={18} />
          ) : (
            <>
              <div className="flex items-center gap-2 min-w-30">
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                <span className="text-sm font-medium transition-colors duration-200">
                  {modeLabel}
                </span>
              </div>
              <span
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                  isDarkMode ? "bg-blue-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                    isDarkMode ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </span>
            </>
          )}
        </button>

        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 bg-[#007AFF] text-white shadow-lg hover:bg-[#007AFF]/80 transition-all rounded-[9px] h-12 font-bold text-sm 
            ${isSidebarCollapsed ? "justify-center w-12" : "w-full px-4"}`}
        >
          <LogOut size={18} />
          {!isSidebarCollapsed && <span>Log Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
