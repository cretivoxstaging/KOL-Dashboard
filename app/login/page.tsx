"use client";

import React, { useState } from "react";
import { Mail, Lock, LogIn, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/API/Login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("isLoggedIn", "true");
        router.push("/dashboard");
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#E9EDF0]">
      {/* Kontainer Utama */}
      <div className="grow flex items-center justify-center p-4">
        <div className="bg-black p-12 rounded-lg shadow-sm w-full max-w-md border border-gray-200">
          <h1 className="text-3xl font-semibold text-white text-center mb-10">
            Login
          </h1>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Input Email */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-white font-semibold text-sm">
                <Mail className="h-4 w-4" /> {/* IKON EMAIL DI SAMPING TEKS */}
                <span>Email</span>
              </label>
              <input
                type="text"
                placeholder="Enter your email"
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-md bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* --- BAGIAN PASSWORD --- */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-white font-semibold text-sm">
                <Lock className="h-4 w-4" />{" "}
                {/* IKON PASSWORD DI SAMPING TEKS */}
                <span>Password</span>
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-md bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <div className="flex items-center justify-center gap-2 text-red-500 text-sm font-medium animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            {/* Tombol Login */}
            <div className="flex justify-center w-full">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex items-center justify-center gap-2 py-1 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white transition-colors ${
                  isLoading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                <LogIn className="h-5 w-5" />
                {isLoading ? "Checking..." : "Sign In"}
              </button>
            </div>
          </form>

          {/* Footer Branding */}
          <div className="mt-8 text-center text-xs text-white">
            Powered by <span className="font-bold italic">CRETECH</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
