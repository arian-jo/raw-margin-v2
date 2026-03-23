'use client';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  CalendarDays, Settings, LogOut, MoreVertical
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface CalendarHeaderProps {
  currentMonth: Date;
  onNavigate: (direction: 'prev' | 'next' | 'prevYear' | 'nextYear' | 'today') => void;
  onOpenSettings: () => void;
}

export default function CalendarHeader({ currentMonth, onNavigate, onOpenSettings }: CalendarHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const monthLabel = format(currentMonth, 'MMM yyyy', { locale: es });

  // Close menu when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="calendar-header">
      <div className="calendar-header-inner">
        {/* Left: Logout button */}
        <button
          className="header-icon-btn"
          onClick={() => supabase.auth.signOut()}
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
        >
          <LogOut size={19} />
        </button>

        {/* Center: Month navigation */}
        <div className="month-nav">
          <button className="nav-btn" onClick={() => onNavigate('prevYear')} aria-label="Año anterior">
            <ChevronsLeft size={18} />
          </button>
          <button className="nav-btn" onClick={() => onNavigate('prev')} aria-label="Mes anterior">
            <ChevronLeft size={18} />
          </button>
          <span className="month-label">{monthLabel}</span>
          <button className="nav-btn" onClick={() => onNavigate('next')} aria-label="Mes siguiente">
            <ChevronRight size={18} />
          </button>
          <button className="nav-btn" onClick={() => onNavigate('nextYear')} aria-label="Año siguiente">
            <ChevronsRight size={18} />
          </button>
        </div>

        {/* Right: Today + Settings menu */}
        <div className="header-actions">
          <button
            className="header-icon-btn"
            onClick={() => onNavigate('today')}
            aria-label="Ir a hoy"
            title="Hoy"
          >
            <CalendarDays size={20} />
          </button>

          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              className="header-icon-btn"
              onClick={() => setShowMenu(v => !v)}
              aria-label="Opciones"
            >
              <MoreVertical size={20} />
            </button>

            {showMenu && (
              <div className="header-dropdown">
                <button
                  className="dropdown-item"
                  onClick={() => { onOpenSettings(); setShowMenu(false); }}
                >
                  <Settings size={16} />
                  <span>Configuración</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
