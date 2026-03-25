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

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback` // Or your default redirect config
      }
    });
    if (error) {
      setError(error.message);
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
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] shadow-xl mb-6 relative overflow-hidden" style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: 'inset 1px 1px 0px rgba(255, 255, 255, 0.2), 0 12px 40px rgba(0, 0, 0, 0.4)',
          }}>
            <img src="/icon.png" alt="Calendario Financiero" className="w-full h-full object-cover scale-110" />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-full animate-[glass-shine_4s_infinite]" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            Calendario Financiero
          </h2>
          <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">
            Intelligent Daily Budget
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          {/* Google SSO Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="group relative flex w-full justify-center items-center rounded-2xl px-6 py-4 text-sm font-bold text-white border border-white/10 transition-all hover:bg-white/5 active:scale-95 disabled:opacity-70 bg-black/20"
            style={{ boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.05)' }}
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continuar con Google
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 text-slate-500 bg-[#0c1222]">O usa tu correo</span>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSignIn}>
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
                Crear cuenta con correo
              </button>
            </div>
          </form>
        </div>
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
