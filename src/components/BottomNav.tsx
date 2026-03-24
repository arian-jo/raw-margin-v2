'use client';

import { Calendar, PieChart, Settings } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'calendar' | 'stats';
  onTabChange: (tab: 'calendar' | 'stats') => void;
  onOpenSettings: () => void;
}

export default function BottomNav({ activeTab, onTabChange, onOpenSettings }: BottomNavProps) {
  return (
    <div className="bottom-nav">
      <button 
        className={`bottom-nav-item ${activeTab === 'calendar' ? 'active' : ''}`}
        onClick={() => onTabChange('calendar')}
      >
        <Calendar size={24} />
        <span>Calendario</span>
      </button>
      
      <button 
        className={`bottom-nav-item ${activeTab === 'stats' ? 'active' : ''}`}
        onClick={() => onTabChange('stats')}
      >
        <PieChart size={24} />
        <span>Estadísticas</span>
      </button>
      
      <button 
        className="bottom-nav-item"
        onClick={onOpenSettings}
      >
        <Settings size={24} />
        <span>Ajustes</span>
      </button>
    </div>
  );
}
