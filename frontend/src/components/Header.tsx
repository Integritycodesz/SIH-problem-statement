import React, { useState, useEffect } from 'react';
import { 
  Bell, ChevronDown, Check, ShieldCheck, 
  User as UserIcon, Zap, CheckCheck
} from 'lucide-react';
import { api, type User, type AgriNotification } from '../services/api';
import { isSupabaseConfigured } from '../services/supabase';
import { translations, type Language } from '../utils/i18n';

interface HeaderProps {
  currentUser: User | null;
  allUsers: User[];
  onSelectUser: (user: User) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  lang: Language;
  onSelectLang: (lang: Language) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  allUsers,
  onSelectUser,
  activeTab,
  onSelectTab,
  lang,
  onSelectLang,
}) => {
  const [showRoleDropdown, setShowRoleDropdown] = useState<boolean>(false);
  const [showNotifDrawer, setShowNotifDrawer] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<AgriNotification[]>([]);
  const supabaseActive = isSupabaseConfigured();
  const t = translations[lang];

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 8000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const list = await api.getNotifications();
      setNotifications([...list]);
    } catch (err) {
      console.warn('Error loading notifications:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = async (notif: AgriNotification) => {
    await api.markNotificationAsRead(notif.id);
    loadNotifications();
    if (notif.linkTab) {
      onSelectTab(notif.linkTab);
      setShowNotifDrawer(false);
    }
  };

  const handleMarkAllRead = async () => {
    for (const n of notifications) {
      await api.markNotificationAsRead(n.id);
    }
    loadNotifications();
  };

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
            {t.liveApmc}
          </span>
          <span style={{ color: '#d1fae5' }}>
            {lang === 'MR' 
              ? 'लासलगाव कांदा: ₹२,४५०/क्विंटल • पुणे सोयाबीन: ₹४,८२०/क्विंटल • नाशिक टोमॅटो: ₹१,८५०/क्विंटल • नागपूर कापूस: ₹७,१२०/क्विंटल'
              : 'Lasalgaon Onion: ₹2,450/qtl • Pune Soybean: ₹4,820/qtl • Nashik Tomato: ₹1,850/qtl • Nagpur Cotton: ₹7,120/qtl'
            }
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#a7f3d0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <ShieldCheck size={14} />
            <span>{t.mspProtected}</span>
          </div>

          <div 
            title={supabaseActive ? "Supabase Cloud PostgreSQL & Realtime Connected" : "Supabase Adapter Ready. Running Reactive In-Memory Engine"}
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
                {t.appTitle}
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
              {t.hubSubtitle}
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
            {t.mandiPricesTab}
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
            {t.farmerProduceTab}
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
            {t.marketplaceTab}
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
            {t.escrowContractsTab}
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
            {t.disputesTab}
          </button>
        </div>

        {/* Right Controls: Language, Interactive Notification Bell & User Profile Switcher */}
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
              onClick={() => onSelectLang('EN')}
              style={{
                padding: '4px 8px',
                backgroundColor: lang === 'EN' ? '#065f46' : '#ffffff',
                color: lang === 'EN' ? '#ffffff' : '#64748b'
              }}
            >
              English
            </button>
            <button
              onClick={() => onSelectLang('MR')}
              style={{
                padding: '4px 8px',
                backgroundColor: lang === 'MR' ? '#065f46' : '#ffffff',
                color: lang === 'MR' ? '#ffffff' : '#64748b'
              }}
            >
              मराठी
            </button>
          </div>

          {/* Interactive Notification Bell */}
          <div style={{ position: 'relative' }}>
            <div 
              onClick={() => setShowNotifDrawer(!showNotifDrawer)}
              style={{ position: 'relative', cursor: 'pointer', padding: '4px' }}
              title="Live Agri Notifications"
            >
              <Bell size={18} color="#64748b" />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '0px',
                  right: '0px',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  width: '15px',
                  height: '15px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {unreadCount}
                </span>
              )}
            </div>

            {/* Notification Dropdown Drawer */}
            {showNotifDrawer && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                width: '320px',
                maxHeight: '400px',
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 60,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  padding: '10px 14px', 
                  borderBottom: '1px solid #f1f5f9', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  backgroundColor: '#f8fafc'
                }}>
                  <strong style={{ fontSize: '0.82rem', color: '#0f172a' }}>
                    {t.notificationsTitle}
                  </strong>
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllRead}
                      style={{ 
                        background: 'transparent', 
                        fontSize: '0.7rem', 
                        color: '#059669', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '3px',
                        cursor: 'pointer'
                      }}
                    >
                      <CheckCheck size={12} /> Mark all read
                    </button>
                  )}
                </div>

                <div style={{ overflowY: 'auto', maxHeight: '320px', display: 'flex', flexDirection: 'column' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {t.noNotifications}
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        style={{
                          padding: '10px 14px',
                          borderBottom: '1px solid #f8fafc',
                          cursor: 'pointer',
                          backgroundColor: n.read ? '#ffffff' : '#f0fdf4',
                          transition: 'background-color 0.15s'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                          <span style={{ 
                            fontSize: '0.65rem', 
                            fontWeight: 700, 
                            padding: '1px 5px',
                            borderRadius: '3px',
                            backgroundColor: n.type === 'ESCROW' ? '#ecfdf5' : n.type === 'PRICE' ? '#fffbeb' : n.type === 'DISPUTE' ? '#fef2f2' : '#eff6ff',
                            color: n.type === 'ESCROW' ? '#065f46' : n.type === 'PRICE' ? '#b45309' : n.type === 'DISPUTE' ? '#dc2626' : '#1d4ed8'
                          }}>
                            {n.type}
                          </span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                            {n.timestamp}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.78rem', fontWeight: n.read ? 600 : 700, color: '#0f172a' }}>
                          {n.title}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '2px' }}>
                          {n.message}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
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
                  {currentUser?.name || 'Ramesh Patil'}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#059669', fontWeight: 600 }}>
                  {currentUser?.role === 'BUYER' 
                    ? (lang === 'MR' ? 'संस्थात्मक खरेदीदार' : 'Corporate Buyer')
                    : currentUser?.role === 'OFFICIAL' 
                    ? (lang === 'MR' ? 'बाजार समिती लवाद अधिकारी' : 'APMC Official Arbiter')
                    : (lang === 'MR' ? 'शेतकरी प्रतिनिधी • नाशिक' : 'FPO Delegate • Nashik')
                  }
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
                width: '260px',
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                padding: '6px',
                zIndex: 50
              }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', padding: '6px 8px', textTransform: 'uppercase' }}>
                  {t.switchPersona}
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

export default Header;
