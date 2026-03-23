'use client';

import { Account } from '@/types/database';
import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface AccountBarProps {
  accounts: Account[];
  selectedAccountId: string | null;
  onSelectAccount: (id: string | null) => void;
  balance: number;
}

export default function AccountBar({ accounts, selectedAccountId, onSelectAccount, balance }: AccountBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedAccount = accounts.find(a => a.id === selectedAccountId);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="account-bar">
      <div className="account-selector" ref={dropdownRef}>
        <button className="account-selector-btn" onClick={() => setIsOpen(!isOpen)}>
          <span>{selectedAccount?.name || 'Todas las cuentas'}</span>
          <ChevronDown size={16} className={`chevron ${isOpen ? 'chevron--open' : ''}`} />
        </button>

        {isOpen && (
          <div className="account-dropdown">
            <button
              className={`account-option ${!selectedAccountId ? 'account-option--active' : ''}`}
              onClick={() => { onSelectAccount(null); setIsOpen(false); }}
            >
              Todas las cuentas
            </button>
            {accounts.map(account => (
              <button
                key={account.id}
                className={`account-option ${selectedAccountId === account.id ? 'account-option--active' : ''}`}
                onClick={() => { onSelectAccount(account.id); setIsOpen(false); }}
              >
                {account.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="account-balance">
        <span className="balance-label">Balance:</span>
        <span className={`balance-value ${balance >= 0 ? 'balance--positive' : 'balance--negative'}`}>
          ${Math.abs(balance).toLocaleString('es-CL', { minimumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );
}
