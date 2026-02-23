"use client";

import React, { useState, useEffect } from "react";
import { Mail, Lock, LogIn, AlertCircle, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [lockoutTime, setLockoutTime] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  // Sync lockoutTime with backend on mount (POST, cek blokir)
  useEffect(() => {
    const checkLockout = async () => {
      try {
        const res = await fetch("/api/Login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        if (res.status === 429) {
          const data = await res.json();
          if (typeof data.retryAfter === "number" && data.retryAfter > 0) {
            setLockoutTime(data.retryAfter);
          }
        }
      } catch (e) {
        // ignore
      }
    };
    checkLockout();
  }, []);

  useEffect(() => {
    if (lockoutTime <= 0) return;
    const timer = setInterval(() => {
      setLockoutTime((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutTime]);

  // Format detik ke MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Kirim ke endpoint lokal /api/login
      const res = await fetch("/api/Login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password }),
      });

      const data = await res.json();

      if (res.status === 429) {
        // Jika lockout, set waktu dari server (dalam detik)
        if (typeof data.retryAfter === "number") {
          setLockoutTime(data.retryAfter);
        } else {
          setLockoutTime(15 * 60);
        }
        setError("Terlalu banyak percobaan. Coba lagi nanti.");
        return;
      }

      if (res.ok) {
        router.push("/dashboard");
      } else {
        setError("username or password incorrect");
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
      <div className="grow flex items-center justify-center p-4 relative">
        {/* Overlay Lockout */}
        {lockoutTime > 0 && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md rounded-lg">
            <div className="text-white text-2xl font-bold mb-2">Login Blocked</div>
            <div className="text-orange-300 text-lg font-mono mb-1">{formatTime(lockoutTime)}</div>
            <div className="text-white text-sm">Terlalu banyak percobaan. Silakan coba lagi nanti.</div>
          </div>
        )}
        <div className={`bg-black p-12 rounded-lg shadow-sm w-full max-w-md border border-gray-200 transition-all ${lockoutTime > 0 ? "blur-sm pointer-events-none" : ""}`}>
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
              <div className="flex flex-col items-center gap-2 text-red-500 text-sm font-medium p-3 bg-red-500/10 rounded-md border border-red-500/20">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
                {lockoutTime > 0 && (
                  <div className="flex items-center gap-1 mt-1 text-orange-400">
                    <Clock className="h-4 w-4" />
                    <span>Try again in: {formatTime(lockoutTime)}</span>
                  </div>
                )}
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
