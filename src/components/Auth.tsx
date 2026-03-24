'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.refresh();
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setError('Check your email for confirmation!');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 relative overflow-hidden" style={{
      background: `linear-gradient(to bottom, rgba(16, 24, 43, 0.95), rgba(13, 14, 28, 0.98)),
                   radial-gradient(circle at center 30%, rgba(21, 101, 192, 0.2) 0%, transparent 60%),
                   url('https://www.transparenttextures.com/patterns/cubes.png') #0a0f1c`,
      backgroundBlendMode: 'overlay, normal, normal'
    }}>
      {/* Decorative blurred orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md space-y-8 p-10 rounded-[2.5rem] relative z-10" style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: 'inset 1px 1px 0px rgba(255, 255, 255, 0.1), 0 20px 60px rgba(0, 0, 0, 0.5)',
      }}>
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl shadow-xl mb-6 relative overflow-hidden" style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(37, 99, 235, 0.1) 100%)',
            boxShadow: 'inset 1px 1px 0px rgba(255, 255, 255, 0.2), 0 8px 32px rgba(0, 0, 0, 0.4)',
          }}>
            <img src="/icon.png" alt="Raw Margin" className="w-14 h-14 object-contain brightness-0 invert opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-full animate-[glass-shine_4s_infinite]" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            Raw Margin
          </h2>
          <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">
            Intelligent Daily Budget
          </p>
        </div>
        
        <form className="mt-10 space-y-6" onSubmit={handleSignIn}>
          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                className="block w-full rounded-2xl border border-white/10 py-4 pl-12 pr-4 text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 sm:text-sm transition-all bg-black/20"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                <Lock size={18} />
              </div>
              <input
                type="password"
                required
                className="block w-full rounded-2xl border border-white/10 py-4 pl-12 pr-4 text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 sm:text-sm transition-all bg-black/20"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center font-medium bg-red-900/20 border border-red-500/20 py-3 rounded-xl backdrop-blur-md">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3 mt-8">
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center items-center rounded-2xl px-6 py-4 text-sm font-bold text-white transition-all disabled:opacity-70 overflow-hidden"
              style={{
                background: 'radial-gradient(circle at 30% 30%, #60a5fa 0%, #2563eb 60%, #1e3a8a 100%)',
                boxShadow: 'inset 2px 2px 4px rgba(255, 255, 255, 0.4), 0 8px 24px rgba(37, 99, 235, 0.4)',
              }}
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              {loading ? (
                <Loader2 className="animate-spin mr-2" size={20} />
              ) : (
                'Iniciar Sesión'
              )}
            </button>
            <button
              type="button"
              onClick={handleSignUp}
              disabled={loading}
              className="flex w-full justify-center rounded-2xl px-6 py-4 text-sm font-semibold text-slate-300 border border-white/10 hover:bg-white/5 transition-all"
            >
              Crear nueva cuenta
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes glass-shine {
          0% { transform: translateX(-150%) skewX(-12deg); }
          20% { transform: translateX(200%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
      `}</style>
    </div>
  );
}
