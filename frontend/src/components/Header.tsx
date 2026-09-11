import React, { useState, useEffect } from 'react';
import { 
  Bell, ChevronDown, Check, ShieldCheck, 
  User as UserIcon, Zap, CheckCheck, Lock, LogOut, Building2
} from 'lucide-react';
import { api, type User, type AgriNotification } from '../services/api';
import { isSupabaseConfigured, subscribeToCommodityPrices } from '../services/supabase';
import { translations, type Language } from '../utils/i18n';
import { getRolePermissions } from '../utils/rbac';

interface LiveTickerItem {
  id: string;
  mandi: string;
  mandiMr: string;
  commodity: string;
  commodityMr: string;
  price: number;
  change: string;
  changeType: 'up' | 'down' | 'neutral';
  arrivals?: string;
}


interface HeaderProps {
  currentUser: User | null;
  allUsers: User[];
  onSelectUser: (user: User) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  lang: Language;
  onSelectLang: (lang: Language) => void;
  onOpenAuthModal: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  allUsers,
  onSelectUser,
  activeTab,
  onSelectTab,
  lang,
  onSelectLang,
  onOpenAuthModal,
  onLogout,
}) => {
  const [showRoleDropdown, setShowRoleDropdown] = useState<boolean>(false);
  const [showNotifDrawer, setShowNotifDrawer] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<AgriNotification[]>([]);
  const [tickerFeed, setTickerFeed] = useState<LiveTickerItem[]>([]);
  const supabaseActive = isSupabaseConfigured();
  const t = translations[lang];

  useEffect(() => {
    loadNotifications();
    loadLiveTicker();
    const interval = setInterval(() => {
      loadNotifications();
      loadLiveTicker();
    }, 15000);
    const sub = subscribeToCommodityPrices(() => {
      loadLiveTicker();
    });
    return () => {
      clearInterval(interval);
      if (sub && typeof sub.unsubscribe === 'function') {
        sub.unsubscribe();
      }
    };
  }, []);

  const loadLiveTicker = async () => {
    try {
      const prices = await api.getPrices(undefined, 25);
      if (prices && prices.length > 0) {
        const items: LiveTickerItem[] = prices.map((p) => {
          const changeVal = Number(p.change_24h) || 0;
          return {
            id: String(p.id),
            mandi: p.mandi_name.replace(' APMC', '').replace(' Market', ''),
            mandiMr: p.mandi_name,
            commodity: p.commodity + (p.variety ? ` (${p.variety})` : ''),
            commodityMr: p.commodity,
            price: Number(p.modal_price) || 0,
            change: `${changeVal >= 0 ? '+' : ''}${changeVal}%`,
            changeType: changeVal > 0 ? 'up' : changeVal < 0 ? 'down' : 'neutral',
            arrivals: p.arrivals_tonnes ? `${p.arrivals_tonnes} tonnes` : undefined
          };
        });
        setTickerFeed(items);
      }
    } catch (err) {
      console.warn('Error loading dynamic live ticker:', err);
    }
  };


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
      if (notif.linkTab === 'buyer' && notif.type === 'RFQ') {
        onSelectTab('rfq');
      } else {
        onSelectTab(notif.linkTab);
      }
      setShowNotifDrawer(false);
    }
  };

  const handleMarkAllRead = async () => {
    for (const n of notifications) {
      await api.markNotificationAsRead(n.id);
    }
    loadNotifications();
  };

  const rolePerms = getRolePermissions(currentUser);

  return (
    <div style={{ backgroundColor: '#ffffff', borderBottom: '1px solid var(--border-card)' }}>
      {/* 1. Top Green APMC Ticker Bar (Thicker & Infinite Scroll Marquee) */}
      <div style={{ 
        backgroundColor: '#064e3b',
        background: 'linear-gradient(90deg, #04362a 0%, #064e3b 25%, #064e3b 75%, #04362a 100%)',
        color: '#ffffff', 
        padding: '8px 20px',
        minHeight: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(16, 185, 129, 0.25)',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.12)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Left Pinned Badge: LIVE APMC */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          flexShrink: 0,
          backgroundColor: '#04362a',
          border: '1px solid rgba(52, 211, 153, 0.45)',
          padding: '5px 14px',
          borderRadius: '20px',
          zIndex: 10,
          boxShadow: '4px 0 10px rgba(4, 54, 42, 0.9)'
        }}>
          <span className="live-pulse-dot" />
          <span style={{ 
            fontWeight: 800, 
            color: '#34d399', 
            fontSize: '0.76rem', 
            letterSpacing: '0.06em',
            textTransform: 'uppercase'
          }}>
            {t.liveApmc}
          </span>
        </div>

        {/* Center: Infinite Marquee Scrolling Viewport with gradient mask */}
        <div className="apmc-ticker-viewport" title="Hover to pause scroll">
          <div className="apmc-ticker-track">
            {tickerFeed.length === 0 ? (
              <div style={{ color: '#a7f3d0', fontSize: '0.8rem', padding: '4px 14px' }}>
                Connecting to live Maharashtra APMC Mandi feeds...
              </div>
            ) : (
              [...tickerFeed, ...tickerFeed].map((item, idx) => (
                <div
                  key={`${item.id}-${idx}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.82rem',
                    whiteSpace: 'nowrap',
                    padding: '3px 10px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.09)'
                  }}
                >
                  <span style={{ fontWeight: 700, color: '#f8fafc' }}>
                    {lang === 'MR' ? item.mandiMr : item.mandi}
                  </span>
                  <span style={{ color: '#93c5fd', fontSize: '0.78rem' }}>
                    {lang === 'MR' ? item.commodityMr : item.commodity}:
                  </span>
                  <strong style={{ color: '#ffffff', fontFamily: 'var(--font-display)', fontSize: '0.86rem', fontWeight: 800 }}>
                    ₹{item.price.toLocaleString()}/qtl
                  </strong>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '1px 6px',
                    borderRadius: '4px',
                    backgroundColor: item.changeType === 'down' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(16, 185, 129, 0.28)',
                    color: item.changeType === 'down' ? '#fca5a5' : '#6ee7b7'
                  }}>
                    {item.changeType === 'up' ? '▲ ' : item.changeType === 'down' ? '▼ ' : ''}{item.change}
                  </span>
                  {item.arrivals && (
                    <span style={{ fontSize: '0.7rem', color: '#a7f3d0', opacity: 0.85 }}>
                      ({item.arrivals})
                    </span>
                  )}
                  <span style={{ color: 'rgba(255,255,255,0.2)', marginLeft: '4px' }}>•</span>
                </div>
              ))
            )}

          </div>
        </div>

        {/* Right Pinned Badges */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          flexShrink: 0, 
          zIndex: 10,
          backgroundColor: '#04362a',
          padding: '4px 12px',
          borderRadius: '20px',
          border: '1px solid rgba(52, 211, 153, 0.3)',
          boxShadow: '-4px 0 10px rgba(4, 54, 42, 0.9)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#a7f3d0', fontSize: '0.74rem', fontWeight: 600 }}>
            <ShieldCheck size={14} color="#34d399" />
            <span style={{ display: 'inline-block' }}>Official MSAMB Mandi Feed</span>
          </div>

          <div 
            title={supabaseActive ? "Supabase Cloud PostgreSQL & Realtime Connected" : "Supabase Adapter Ready. Running Reactive In-Memory Engine"}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: supabaseActive ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.1)',
              padding: '3px 9px',
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

        {/* Center Tabs — Role-filtered using RBAC primaryTabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', overflowX: 'auto' }}>
          {/* Mandi Prices — always visible to everyone */}
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

          {/* Farmer Produce — only FARMER, FPO, ADMIN, OFFICIAL */}
          {rolePerms.primaryTabs.includes('farmer') && (
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
                gap: '6px'
              }}
            >
              {activeTab === 'farmer' && <Check size={14} />}
              <span>{t.farmerProduceTab}</span>
              {(currentUser?.role === 'FARMER' || currentUser?.role === 'FPO') && (
                <span style={{ fontSize: '0.62rem', backgroundColor: '#059669', color: '#ffffff', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                  {lang === 'MR' ? 'माझे' : 'My'}
                </span>
              )}
            </button>
          )}

          {/* Buyer Demands (Reverse RFQ) — Accessible to all */}
          {(rolePerms.primaryTabs.includes('demands') || !currentUser) && (
            <button
              onClick={() => onSelectTab('demands')}
              style={{
                padding: '7px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.84rem',
                fontWeight: 600,
                backgroundColor: activeTab === 'demands' ? '#065f46' : 'transparent',
                color: activeTab === 'demands' ? '#ffffff' : '#334155',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Building2 size={13} color={activeTab === 'demands' ? '#34d399' : '#059669'} />
              <span>{t.demandsTab}</span>
              <span style={{ fontSize: '0.62rem', backgroundColor: '#ea580c', color: '#ffffff', padding: '1px 5px', borderRadius: '4px', fontWeight: 800 }}>
                {lang === 'MR' ? 'थेट मागणी' : 'Tenders'}
              </span>
            </button>
          )}

          {/* Marketplace — BUYER, ADMIN, OFFICIAL + Guests with lock */}
          {(rolePerms.primaryTabs.includes('buyer') || !currentUser) && (
            <button
              onClick={() => onSelectTab('buyer')}
              style={{
                padding: '7px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.84rem',
                fontWeight: 600,
                backgroundColor: activeTab === 'buyer' ? '#065f46' : 'transparent',
                color: activeTab === 'buyer' ? '#ffffff' : '#334155',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {!currentUser && <Lock size={12} style={{ opacity: 0.6 }} />}
              <span>{t.marketplaceTab}</span>
              {currentUser?.role === 'BUYER' && (
                <span style={{ fontSize: '0.62rem', backgroundColor: '#2563eb', color: '#ffffff', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                  {lang === 'MR' ? 'खरेदी' : 'Buyer'}
                </span>
              )}
            </button>
          )}

          {/* Bilateral RFQ — FARMER, BUYER, ADMIN */}
          {rolePerms.primaryTabs.includes('rfq') && (
            <button
              onClick={() => onSelectTab('rfq')}
              style={{
                padding: '7px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.84rem',
                fontWeight: 600,
                backgroundColor: activeTab === 'rfq' ? '#065f46' : 'transparent',
                color: activeTab === 'rfq' ? '#ffffff' : '#334155',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Zap size={13} color={activeTab === 'rfq' ? '#34d399' : '#059669'} />
              {t.rfqTab}
            </button>
          )}

          {/* Escrow & Contracts — all authenticated roles */}
          {rolePerms.primaryTabs.includes('contracts') && (
            <button
              onClick={() => onSelectTab('contracts')}
              style={{
                padding: '7px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.84rem',
                fontWeight: 600,
                backgroundColor: activeTab === 'contracts' ? '#065f46' : 'transparent',
                color: activeTab === 'contracts' ? '#ffffff' : '#334155',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {t.escrowContractsTab}
            </button>
          )}

          {/* Help & Disputes — all authenticated roles */}
          {rolePerms.primaryTabs.includes('disputes') && (
            <button
              onClick={() => onSelectTab('disputes')}
              style={{
                padding: '7px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.84rem',
                fontWeight: 600,
                backgroundColor: activeTab === 'disputes' ? '#065f46' : 'transparent',
                color: activeTab === 'disputes' ? '#ffffff' : '#334155',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>{t.disputesTab}</span>
              {currentUser?.role === 'OFFICIAL' && (
                <span style={{ fontSize: '0.62rem', backgroundColor: '#d97706', color: '#ffffff', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                  {lang === 'MR' ? 'लवाद' : 'Arbiter'}
                </span>
              )}
            </button>
          )}
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

          {/* User Profile / Sign-In Button */}
          {!currentUser ? (
            <button 
              onClick={onOpenAuthModal}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                backgroundColor: '#065f46',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                padding: '7px 16px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(6, 95, 70, 0.25)',
                transition: 'all 0.15s ease'
              }}
            >
              <UserIcon size={14} />
              <span>{lang === 'MR' ? 'लॉगिन / नोंदणी' : 'Sign In / Register'}</span>
            </button>
          ) : (
            <div style={{ position: 'relative' }}>
              <div 
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px 10px 4px 4px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: '#f8fafc',
                  border: `1px solid ${rolePerms.badgeBorder}`,
                  cursor: 'pointer'
                }}
              >
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" 
                  alt="User Avatar"
                  style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div style={{ textAlign: 'left', lineHeight: 1.15 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>
                      {currentUser.name}
                    </span>
                    <span style={{
                      fontSize: '0.58rem',
                      fontWeight: 800,
                      backgroundColor: rolePerms.badgeBg,
                      color: rolePerms.badgeColor,
                      border: `1px solid ${rolePerms.badgeBorder}`,
                      padding: '1px 5px',
                      borderRadius: '4px',
                      textTransform: 'uppercase'
                    }}>
                      {currentUser.role}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.64rem', color: rolePerms.badgeColor, fontWeight: 600 }}>
                    {lang === 'MR' ? rolePerms.titleMr : rolePerms.titleEn}
                  </div>
                </div>
                <ChevronDown size={14} color="#64748b" />
              </div>

              {/* Dropdown for Personas & Sign Out */}
              {showRoleDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '6px',
                  width: '280px',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border-card)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '8px',
                  zIndex: 50
                }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', padding: '4px 8px 6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {lang === 'MR' ? 'भूमिका बदला (RBAC चाचणी):' : 'Switch Persona (RBAC Testing):'}
                  </div>

                  {/* Section: Farmers */}
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#059669', padding: '4px 8px', textTransform: 'uppercase' }}>
                    👨‍🌾 {lang === 'MR' ? 'शेतकरी / FPO गट' : 'Farmers & FPOs'}
                  </div>
                  {allUsers.filter(u => u.role === 'FARMER' || u.role === 'FPO').slice(0, 3).map((u) => (
                    <div
                      key={u.id}
                      onClick={() => {
                        onSelectUser(u);
                        setShowRoleDropdown(false);
                      }}
                      style={{
                        padding: '6px 8px',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: currentUser.id === u.id ? '#ecfdf5' : 'transparent',
                        marginBottom: '2px'
                      }}
                    >
                      <UserIcon size={13} color={currentUser.id === u.id ? '#059669' : '#64748b'} />
                      <div style={{ fontSize: '0.76rem' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{u.name}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{u.district}</div>
                      </div>
                    </div>
                  ))}

                  {/* Section: Corporate Buyers */}
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#2563eb', padding: '6px 8px 4px', textTransform: 'uppercase', borderTop: '1px solid #f1f5f9', marginTop: '4px' }}>
                    🏢 {lang === 'MR' ? 'संस्थात्मक खरेदीदार' : 'Corporate Buyers'}
                  </div>
                  {allUsers.filter(u => u.role === 'BUYER').slice(0, 2).map((u) => (
                    <div
                      key={u.id}
                      onClick={() => {
                        onSelectUser(u);
                        setShowRoleDropdown(false);
                      }}
                      style={{
                        padding: '6px 8px',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: currentUser.id === u.id ? '#eff6ff' : 'transparent',
                        marginBottom: '2px'
                      }}
                    >
                      <UserIcon size={13} color={currentUser.id === u.id ? '#2563eb' : '#64748b'} />
                      <div style={{ fontSize: '0.76rem' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{u.name}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{u.district}</div>
                      </div>
                    </div>
                  ))}

                  {/* Section: Official Arbiters */}
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#d97706', padding: '6px 8px 4px', textTransform: 'uppercase', borderTop: '1px solid #f1f5f9', marginTop: '4px' }}>
                    ⚖️ {lang === 'MR' ? 'बाजार समिती लवाद अधिकारी' : 'APMC Mandi Arbiter'}
                  </div>
                  {allUsers.filter(u => u.role === 'OFFICIAL').map((u) => (
                    <div
                      key={u.id}
                      onClick={() => {
                        onSelectUser(u);
                        setShowRoleDropdown(false);
                      }}
                      style={{
                        padding: '6px 8px',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: currentUser.id === u.id ? '#fef3c7' : 'transparent',
                        marginBottom: '2px'
                      }}
                    >
                      <UserIcon size={13} color={currentUser.id === u.id ? '#d97706' : '#64748b'} />
                      <div style={{ fontSize: '0.76rem' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{u.name}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>APMC State Arbiter</div>
                      </div>
                    </div>
                  ))}

                  <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '6px', paddingTop: '6px' }}>
                    <div
                      onClick={() => {
                        setShowRoleDropdown(false);
                        onLogout();
                      }}
                      style={{
                        padding: '6px 8px',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#dc2626'
                      }}
                    >
                      <LogOut size={13} />
                      <span style={{ fontSize: '0.76rem', fontWeight: 600 }}>
                        {lang === 'MR' ? 'लॉग आऊट' : 'Sign Out'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
