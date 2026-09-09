import React, { useState } from 'react';
import { 
  Bell, ChevronDown, Check, ShieldCheck, 
  User as UserIcon, Zap
} from 'lucide-react';
import type { User } from '../services/api';
import { isSupabaseConfigured } from '../services/supabase';

interface HeaderProps {
  currentUser: User | null;
  allUsers: User[];
  onSelectUser: (user: User) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  allUsers,
  onSelectUser,
  activeTab,
  onSelectTab,
}) => {
  const [lang, setLang] = useState<'EN' | 'MR'>('EN');
  const [showRoleDropdown, setShowRoleDropdown] = useState<boolean>(false);
  const supabaseActive = isSupabaseConfigured();

  return (
    <div style={{ backgroundColor: '#ffffff', borderBottom: '1px solid var(--border-card)' }}>
      {/* 1. Top Green APMC Ticker Bar */}
      <div style={{ 
        backgroundColor: 'var(--bg-ticker)', 
        color: '#ffffff', 
        fontSize: '0.75rem', 
        padding: '6px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '5px', 
            fontWeight: 700, 
            color: '#34d399' 
          }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
            LIVE APMC
          </span>
          <span style={{ color: '#d1fae5' }}>
            Lasalgaon Onion: <strong>₹2,450/qtl</strong> • Pune Soybean: <strong>₹4,820/qtl</strong> • Nashik Tomato: <strong>₹1,850/qtl</strong> • Nagpur Cotton: <strong>₹7,120/qtl</strong>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#a7f3d0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <ShieldCheck size={14} />
            <span>MSP Benchmark Active & Protected</span>
          </div>

          <div 
            title={supabaseActive ? "Supabase Cloud PostgreSQL & Realtime Connected" : "Supabase Adapter Ready. Provide VITE_SUPABASE_URL in .env to activate Cloud Realtime"}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: supabaseActive ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.1)',
              padding: '2px 8px',
              borderRadius: '12px',
              border: supabaseActive ? '1px solid #34d399' : '1px solid rgba(255, 255, 255, 0.2)',
              color: supabaseActive ? '#6ee7b7' : '#e2e8f0',
              fontSize: '0.68rem',
              fontWeight: 600
            }}
          >
            <Zap size={11} color={supabaseActive ? '#34d399' : '#cbd5e1'} />
            <span>{supabaseActive ? 'Supabase Live' : 'Supabase Ready'}</span>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="app-container" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ 
            width: '36px', 
            height: '36px', 
            borderRadius: 'var(--radius-sm)', 
            backgroundColor: '#065f46',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '1.1rem'
          }}>
            🌾
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                AgroConnect
              </span>
              <span style={{ 
                backgroundColor: '#ecfdf5', 
                color: '#065f46', 
                border: '1px solid #a7f3d0', 
                borderRadius: 'var(--radius-xs)', 
                padding: '1px 5px', 
                fontSize: '0.65rem', 
                fontWeight: 700 
              }}>
                MSIS
              </span>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              Govt. of Maharashtra Agri-Tech Hub
            </div>
          </div>
        </div>

        {/* Center Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', overflowX: 'auto' }}>
          <button
            onClick={() => onSelectTab('intelligence')}
            style={{
              padding: '7px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.84rem',
              fontWeight: 600,
              backgroundColor: activeTab === 'intelligence' ? '#065f46' : 'transparent',
              color: activeTab === 'intelligence' ? '#ffffff' : '#334155'
            }}
          >
            Mandi Prices
          </button>

          <button
            onClick={() => onSelectTab('farmer')}
            style={{
              padding: '7px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.84rem',
              fontWeight: 600,
              backgroundColor: activeTab === 'farmer' ? '#dcfce7' : 'transparent',
              color: activeTab === 'farmer' ? '#166534' : '#334155',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {activeTab === 'farmer' && <Check size={14} />}
            Farmer Produce
          </button>

          <button
            onClick={() => onSelectTab('buyer')}
            style={{
              padding: '7px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.84rem',
              fontWeight: 600,
              backgroundColor: activeTab === 'buyer' ? '#065f46' : 'transparent',
              color: activeTab === 'buyer' ? '#ffffff' : '#334155'
            }}
          >
            Marketplace
          </button>

          <button
            onClick={() => onSelectTab('contracts')}
            style={{
              padding: '7px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.84rem',
              fontWeight: 600,
              backgroundColor: activeTab === 'contracts' ? '#065f46' : 'transparent',
              color: activeTab === 'contracts' ? '#ffffff' : '#334155'
            }}
          >
            Escrow & Contracts
          </button>

          <button
            onClick={() => onSelectTab('disputes')}
            style={{
              padding: '7px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.84rem',
              fontWeight: 600,
              backgroundColor: activeTab === 'disputes' ? '#065f46' : 'transparent',
              color: activeTab === 'disputes' ? '#ffffff' : '#334155'
            }}
          >
            Help & Disputes
          </button>
        </div>

        {/* Right Controls: Language, Bell & User Profile Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Language Toggle */}
          <div style={{ 
            display: 'flex', 
            border: '1px solid var(--border-card)', 
            borderRadius: 'var(--radius-sm)', 
            overflow: 'hidden',
            fontSize: '0.75rem',
            fontWeight: 600
          }}>
            <button
              onClick={() => setLang('EN')}
              style={{
                padding: '4px 8px',
                backgroundColor: lang === 'EN' ? '#065f46' : '#ffffff',
                color: lang === 'EN' ? '#ffffff' : '#64748b'
              }}
            >
              English
            </button>
            <button
              onClick={() => setLang('MR')}
              style={{
                padding: '4px 8px',
                backgroundColor: lang === 'MR' ? '#065f46' : '#ffffff',
                color: lang === 'MR' ? '#ffffff' : '#64748b'
              }}
            >
              मराठी
            </button>
          </div>

          {/* Notification Bell */}
          <div style={{ position: 'relative', cursor: 'pointer' }}>
            <Bell size={18} color="#64748b" />
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              backgroundColor: '#f59e0b',
              color: '#ffffff',
              fontSize: '0.62rem',
              fontWeight: 700,
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              3
            </span>
          </div>

          {/* User Profile Pill & Switcher */}
          <div style={{ position: 'relative' }}>
            <div 
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 8px 4px 4px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: '#f8fafc',
                border: '1px solid var(--border-card)',
                cursor: 'pointer'
              }}
            >
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" 
                alt="User Avatar"
                style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div style={{ textAlign: 'left', lineHeight: 1.1 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>
                  {currentUser?.name || 'Rameshwar Patil'}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#059669', fontWeight: 600 }}>
                  {currentUser?.role === 'BUYER' ? 'Corporate Buyer' : currentUser?.role === 'OFFICIAL' ? 'APMC Official' : 'FPO Delegate • Nashik'}
                </div>
              </div>
              <ChevronDown size={14} color="#64748b" />
            </div>

            {/* Dropdown for Personas */}
            {showRoleDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '6px',
                width: '240px',
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                padding: '6px',
                zIndex: 50
              }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', padding: '6px 8px', textTransform: 'uppercase' }}>
                  Switch SIH Persona:
                </div>
                {allUsers.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => {
                      onSelectUser(u);
                      setShowRoleDropdown(false);
                    }}
                    style={{
                      padding: '8px',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: currentUser?.id === u.id ? 'var(--primary-surface)' : 'transparent'
                    }}
                  >
                    <UserIcon size={14} color={currentUser?.id === u.id ? '#059669' : '#64748b'} />
                    <div style={{ fontSize: '0.78rem' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{u.name}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{u.role} • {u.district}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
