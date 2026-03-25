"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    const fadeOutTimer = setTimeout(() => {
      setIsVisible(false);
    }, 1200);

    const removeTimer = setTimeout(() => {
      setShouldRender(false);
    }, 1700);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-white dark:bg-zinc-950 transition-opacity duration-500 ease-in-out ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="relative flex flex-col items-center gap-6">
        {/* Animated Background Glow */}
        <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full animate-pulse Scale-150" />
        
        {/* Logo Container */}
        <div 
          className="relative w-32 h-32 md:w-40 md:h-40 overflow-hidden rounded-3xl shadow-2xl shadow-blue-500/20 border border-white/10"
          style={{
            animation: "splash-scale 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards"
          }}
        >
          <Image
            src="/icon.png"
            alt="Calendario Financiero Logo"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Text Animation */}
        <div 
          className="flex flex-col items-center"
          style={{
            animation: "splash-text 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards"
          }}
        >
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Calendario <span className="text-blue-600">Financiero</span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium tracking-wide text-xs uppercase mt-2">
            Intelligent Daily Budget
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes splash-scale {
          0% { transform: scale(0.8); opacity: 0; filter: blur(10px); }
          60% { transform: scale(1.05); opacity: 1; filter: blur(0); }
          100% { transform: scale(1); opacity: 1; filter: blur(0); }
        }

        @keyframes splash-text {
          0% { transform: translateY(20px); opacity: 0; }
          40% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
