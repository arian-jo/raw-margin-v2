'use client';

import { useState } from 'react';
import { X, Save, Circle, ChevronLeft } from 'lucide-react';
import { ICONS } from '@/lib/icons';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCategory: (name: string, color: string, icon: string) => Promise<void>;
}

// Pre-defined set of vibrant Monefy-style colors
const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', 
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', 
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', 
  '#f43f5e', '#64748b', '#78716c'
];

export default function CategoryManagerModal({ isOpen, onClose, onAddCategory }: CategoryManagerModalProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [icon, setIcon] = useState('Home');
  const [loading, setLoading] = useState(false);
  
  // Secondary state to handle Icon Catalog Modal
  const [showCatalog, setShowCatalog] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onAddCategory(name.trim(), color, icon);
      setName('');
      setColor(COLORS[0]);
      setIcon('Home');
      onClose();
    } catch (err) {
      console.error('Failed to create category', err);
    } finally {
      setLoading(false);
    }
  };

  const CurrentIcon = ICONS.find(i => i.name === icon)?.component || Circle;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 60 }}>
      {showCatalog ? (
        // --- ICON CATALOG MODAL ---
        <div className="modal-content catalog-modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <button onClick={() => setShowCatalog(false)} className="modal-close-btn" style={{ marginRight: '16px' }}>
              <ChevronLeft size={20} />
            </button>
            <h2>Catálogo de iconos</h2>
          </div>
          
          <div className="icon-grid-catalog">
            {ICONS.map((ico) => {
              const IconComp = ico.component;
              const isSelected = icon === ico.name;
              return (
                <button
                  key={ico.name}
                  type="button"
                  className={`icon-catalog-btn ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    setIcon(ico.name);
                    setShowCatalog(false);
                  }}
                >
                  <div className="icon-catalog-circle" style={{ backgroundColor: isSelected ? color : 'var(--border-light)' }}>
                    <IconComp size={24} color={isSelected ? '#fff' : 'var(--text-secondary)'} strokeWidth={1.5} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        // --- CREATE CATEGORY MODAL ---
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Crear categoría</h2>
            <button onClick={onClose} className="modal-close-btn">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-field">
              <input
                type="text"
                required
                className="form-input"
                placeholder="Nombre de la categoría"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Color</label>
              <div className="color-picker-scroll">
                {COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    className={`color-dot ${color === c ? 'selected' : ''}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                  />
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Símbolo</label>
              <div 
                className="selected-icon-preview"
                onClick={() => setShowCatalog(true)}
              >
                <div className="selected-icon-circle" style={{ backgroundColor: color }}>
                  <CurrentIcon size={32} color="#fff" strokeWidth={1.5} />
                </div>
                <span className="selected-icon-text">Toca para cambiar símbolo</span>
              </div>
            </div>

            <button type="submit" disabled={loading} className="submit-btn">
              <Save size={18} />
              {loading ? 'Añadiendo...' : 'Añadir'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
