import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MandiIntelligence } from './components/MandiIntelligence';
import { FarmerPortal } from './components/FarmerPortal';
import { BuyerDiscovery } from './components/BuyerDiscovery';
import { RFQNegotiationPortal } from './components/RFQNegotiationPortal';
import { EscrowContractHub } from './components/EscrowContractHub';
import { DisputePortal } from './components/DisputePortal';
import { AuthModal } from './components/AuthModal';
import { api, type User, type ProduceLot } from './services/api';
import { type Language } from './utils/i18n';
import { getRolePermissions } from './utils/rbac';
import { Lock, ShieldCheck, ArrowRight } from 'lucide-react';

export const App: React.FC = () => {
  // Initialize currentUser from localStorage (default to null / guest)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('agroconnect_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<string>('intelligence'); // Default to public Mandi Prices
  const [lang, setLang] = useState<Language>('EN');
  const [disputeTargetContractId, setDisputeTargetContractId] = useState<number | null>(null);
  const [selectedContractId, setSelectedContractId] = useState<number | null>(null);
  const [negotiationLot, setNegotiationLot] = useState<ProduceLot | null>(null);
  const [prefillLotData, setPrefillLotData] = useState<{ commodity: string; variety?: string; price: number; mandi?: string } | null>(null);

  const handleListLotFromMandi = (data: { commodity: string; variety?: string; price: number; mandi?: string }) => {
    setPrefillLotData(data);
    setActiveTab('farmer');
  };

  // Authentication State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMessage, setAuthModalMessage] = useState<string>('');
  const [pendingActionCallback, setPendingActionCallback] = useState<(() => void) | null>(null);
  const [pendingTabAfterAuth, setPendingTabAfterAuth] = useState<string | null>(null);

  const PROTECTED_TABS = ['buyer', 'rfq', 'contracts', 'disputes'];

  useEffect(() => {
    loadUsers();
    initAuth();
  }, []);

  const initAuth = async () => {
    try {
      const sessionUser = await api.getActiveSessionUser();
      if (sessionUser) {
        setCurrentUser(sessionUser);
      }
    } catch (err) {
      console.warn('[App Auth] Session restoration notice:', err);
    }

    const sub = api.onAuthStateChange((user) => {
      if (user) {
        setCurrentUser(user);
      }
    });

    return () => {
      if (sub && typeof (sub as any).unsubscribe === 'function') {
        (sub as any).unsubscribe();
      }
    };
  };

  const loadUsers = async () => {
    try {
      const users = await api.getUsers();
      setAllUsers(users);
    } catch (e) {
      console.error('Error fetching users:', e);
    }
  };


  const getTabLabel = (tab: string): string => {
    switch (tab) {
      case 'intelligence': return lang === 'MR' ? 'बाजार भाव निर्देशांक' : 'Mandi Prices';
      case 'farmer': return lang === 'MR' ? 'शेतकरी उत्पादन' : 'Farmer Produce';
      case 'buyer': return lang === 'MR' ? 'थोक बाजारपेठ' : 'Wholesale Marketplace';
      case 'rfq': return lang === 'MR' ? 'थेट द्विपक्षीय वाटाघाटी' : 'Bilateral RFQ Negotiation';
      case 'contracts': return lang === 'MR' ? 'एस्क्रो व करार केंद्र' : 'Escrow & Smart Contracts';
      case 'disputes': return lang === 'MR' ? 'मदत व लवाद निवारण' : 'Help & Grievance Arbitration';
      default: return tab;
    }
  };

  const handleSelectTab = (tab: string) => {
    if (PROTECTED_TABS.includes(tab) && !currentUser) {
      setAuthModalMessage(
        lang === 'MR'
          ? `${getTabLabel(tab)} पाहण्यासाठी कृपया अधिकृत लॉगिन किंवा नोंदणी करा.`
          : `Authentication required to access ${getTabLabel(tab)}. Please sign in or register.`
      );
      setPendingTabAfterAuth(tab);
      setIsAuthModalOpen(true);
      return;
    }
    setActiveTab(tab);
  };

  const handleRequireAuth = (message?: string, onComplete?: () => void) => {
    if (currentUser) {
      if (onComplete) onComplete();
      return;
    }
    setAuthModalMessage(
      message || (lang === 'MR' 
        ? 'या कृतीसाठी अधिकृत लॉगिन आवश्यक आहे. कृपया लॉगिन करा.' 
        : 'Authentication required to perform this action. Please sign in or register.')
    );
    setPendingActionCallback(() => onComplete || null);
    setIsAuthModalOpen(true);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('agroconnect_user', JSON.stringify(user));
    } catch (e) {
      console.warn('Could not save user to localStorage', e);
    }
    setIsAuthModalOpen(false);

    // Execute pending action if any was requested
    if (pendingActionCallback) {
      const cb = pendingActionCallback;
      setPendingActionCallback(null);
      cb();
    } else if (pendingTabAfterAuth) {
      setActiveTab(pendingTabAfterAuth);
      setPendingTabAfterAuth(null);
    } else {
      // No pending redirect — navigate to user's role-appropriate default tab
      const perms = getRolePermissions(user);
      setActiveTab(perms.defaultTab);
    }
  };

  const handleLogout = async () => {
    try {
      await api.signOut();
    } catch (err) {
      console.warn('[App Auth] Sign out notice:', err);
    }
    setCurrentUser(null);
    try {
      localStorage.removeItem('agroconnect_user');
    } catch (e) {
      console.warn('Could not remove user from localStorage', e);
    }
    // If on a protected tab, redirect to public Mandi Prices
    if (PROTECTED_TABS.includes(activeTab)) {
      setActiveTab('intelligence');
    }
  };


  const rolePerms = getRolePermissions(currentUser);

  const handleUserSelect = (user: User) => {
    handleLoginSuccess(user);
    const perms = getRolePermissions(user);
    setActiveTab(perms.defaultTab);
  };

  const handleNavigateToDisputes = (contractId: number) => {
    setDisputeTargetContractId(contractId);
    handleSelectTab('disputes');
  };

  const handleNavigateToContracts = (contractId?: number) => {
    if (contractId) {
      setSelectedContractId(contractId);
    }
    handleSelectTab('contracts');
  };

  const handleNavigateToNegotiation = (lot?: ProduceLot) => {
    if (lot) {
      setNegotiationLot(lot);
    }
    handleSelectTab('rfq');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isCurrentTabProtected = PROTECTED_TABS.includes(activeTab) && !currentUser;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-page)' }}>
      {/* Exact Reference Header with Ticker, Navigation & Interactive Notification Center */}
      <Header
        currentUser={currentUser}
        allUsers={allUsers}
        onSelectUser={handleUserSelect}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        lang={lang}
        onSelectLang={setLang}
        onOpenAuthModal={() => {
          setAuthModalMessage('');
          setPendingActionCallback(null);
          setPendingTabAfterAuth(null);
          setIsAuthModalOpen(true);
        }}
        onLogout={handleLogout}
      />

      {/* RBAC Active Role Banner Strip */}
      {currentUser && (
        <div style={{
          backgroundColor: rolePerms.badgeBg,
          borderBottom: `1px solid ${rolePerms.badgeBorder}`,
          padding: '6px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          boxShadow: 'inset 0 -1px 3px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{
              backgroundColor: '#ffffff',
              border: `1px solid ${rolePerms.badgeBorder}`,
              color: rolePerms.badgeColor,
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '0.66rem',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: rolePerms.badgeColor }} />
              {rolePerms.role} RBAC ACCESS
            </span>
            <span style={{ color: '#1e293b', fontSize: '0.78rem', fontWeight: 600 }}>
              {lang === 'MR' ? 'अधिकृत वापरकर्ता:' : 'Signed in as:'} <strong>{currentUser.name}</strong> ({lang === 'MR' ? rolePerms.titleMr : rolePerms.titleEn})
            </span>
          </div>
        </div>
      )}

      <main className="app-container" style={{ flex: 1 }}>
        {/* If user lands on protected tab while unauthenticated, show Lock Screen Gate */}
        {isCurrentTabProtected ? (
          <div style={{ 
            maxWidth: '600px', 
            margin: '60px auto', 
            backgroundColor: '#ffffff', 
            border: '1px solid #e2e8f0', 
            borderRadius: 'var(--radius-lg)', 
            padding: '36px 30px', 
            textAlign: 'center',
            boxShadow: 'var(--shadow-md)'
          }}>
            <div style={{ 
              width: '64px', 
              height: '64px', 
              borderRadius: '50%', 
              backgroundColor: '#ecfdf5', 
              color: '#059669', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 16px' 
            }}>
              <Lock size={32} />
            </div>

            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              backgroundColor: '#f1f5f9', 
              color: '#475569', 
              padding: '2px 10px', 
              borderRadius: 'var(--radius-full)', 
              fontSize: '0.72rem', 
              fontWeight: 700,
              marginBottom: '10px'
            }}>
              <ShieldCheck size={13} color="#059669" />
              <span>MSAMB Protected Section</span>
            </div>

            <h3 style={{ fontSize: '1.4rem', color: '#0f172a', marginBottom: '8px' }}>
              {lang === 'MR' ? 'प्रवेश प्रतिबंधित: लॉगिन आवश्यक' : 'Authentication Required'}
            </h3>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '24px' }}>
              {lang === 'MR' 
                ? `"${getTabLabel(activeTab)}" विभागात थेट कायदेशीर करार व सुरक्षित व्यवहार समाविष्ट आहेत. कृपया पुढे जाण्यासाठी अधिकृत खात्यात प्रवेश करा.` 
                : `The "${getTabLabel(activeTab)}" portal handles verified commercial bidding and legally-binding escrow settlements under Maharashtra APMC regulations. Please sign in or register to access.`
              }
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                className="btn-gov-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '0.9rem' }}
                onClick={() => {
                  setAuthModalMessage(`Please sign in to access ${getTabLabel(activeTab)}.`);
                  setPendingTabAfterAuth(activeTab);
                  setIsAuthModalOpen(true);
                }}
              >
                <span>{lang === 'MR' ? 'लॉगिन किंवा नोंदणी करा' : 'Sign In / Register to Access'}</span>
                <ArrowRight size={16} />
              </button>

              <button 
                className="btn-gov-secondary"
                style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: '0.85rem' }}
                onClick={() => setActiveTab('intelligence')}
              >
                <span>{lang === 'MR' ? 'सर्वजनिक बाजार भाव पहा' : 'Browse Public Mandi Prices'}</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'intelligence' && (
              <MandiIntelligence 
                lang={lang} 
                currentUser={currentUser}
                onRequireAuth={handleRequireAuth}
                onListProduce={handleListLotFromMandi}
              />
            )}
            {activeTab === 'farmer' && (
              <FarmerPortal 
                currentUser={currentUser} 
                onNavigateToRFQs={(lot) => handleNavigateToNegotiation(lot)} 
                lang={lang}
                onRequireAuth={handleRequireAuth}
                initialLotPrefill={prefillLotData}
              />
            )}
            {activeTab === 'buyer' && (
              <BuyerDiscovery 
                currentUser={currentUser} 
                onNavigateToContracts={handleNavigateToContracts} 
                onNavigateToNegotiation={handleNavigateToNegotiation}
                lang={lang}
              />
            )}
            {activeTab === 'rfq' && (
              <RFQNegotiationPortal
                currentUser={currentUser}
                selectedLot={negotiationLot}
                onNavigateToContracts={handleNavigateToContracts}
                onBackToMarketplace={() => setActiveTab('buyer')}
                lang={lang}
              />
            )}
            {activeTab === 'contracts' && (
              <EscrowContractHub 
                currentUser={currentUser} 
                onNavigateToDisputes={handleNavigateToDisputes} 
                initialContractId={selectedContractId}
                lang={lang}
              />
            )}
            {activeTab === 'disputes' && (
              <DisputePortal 
                currentUser={currentUser} 
                initialContractId={disputeTargetContractId} 
                lang={lang}
              />
            )}
          </>
        )}
      </main>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setPendingActionCallback(null);
          setPendingTabAfterAuth(null);
        }}
        onLoginSuccess={handleLoginSuccess}
        allUsers={allUsers}
        pendingMessage={authModalMessage}
        lang={lang}
      />

      {/* Footer */}
      <footer style={{ 
        borderTop: '1px solid var(--border-card)', 
        backgroundColor: '#ffffff',
        padding: '32px 20px 24px',
        marginTop: 'auto'
      }}>
        <div className="app-container" style={{ padding: 0 }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start', 
            flexWrap: 'wrap', 
            gap: '24px',
            marginBottom: '24px'
          }}>
            {/* Left */}
            <div style={{ maxWidth: '420px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <strong style={{ fontSize: '0.98rem', color: '#0f172a' }}>
                  {lang === 'MR' ? 'ॲग्रो-कनेक्ट पोर्टल' : 'AgroConnect Portal'}
                </strong>
                <span style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '0.68rem', padding: '1px 6px', borderRadius: 'var(--radius-xs)', fontWeight: 600 }}>
                  {lang === 'MR' ? 'महाराष्ट्र शासन' : 'Maharashtra State'}
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {lang === 'MR' 
                  ? 'थेट APMC-प्रमाणित शेतमाल जोडणी, डिजिटल एस्क्रो वाटप आणि पडताळणी केलेली शेतकरी उत्पादक कंपनी एकत्रीकरण व्यासपीठ.'
                  : 'Direct APMC-grade produce linkage, digital escrow settlement, and verified farmer producer aggregation platform.'
                }
              </p>
            </div>

            {/* Right Helpline Info */}
            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {lang === 'MR' ? 'टोल-फ्री किसान हेल्पलाईन' : 'Toll-Free Kisan Helpline'}
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#059669' }}>
                  1800-233-AGRO (2476)
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {lang === 'MR' ? 'सहाय्यता कक्ष' : 'Support Desk'}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                  support-agroconnect@maharashtra.gov.in
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div style={{ 
            borderTop: '1px solid #f1f5f9', 
            paddingTop: '16px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            flexWrap: 'wrap', 
            gap: '12px',
            fontSize: '0.75rem',
            color: 'var(--text-muted)'
          }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <span style={{ cursor: 'pointer' }}>{lang === 'MR' ? 'तक्रार निवारण सेल' : 'Grievance Cell'}</span>
              <span style={{ cursor: 'pointer' }}>{lang === 'MR' ? 'किमान हमीभाव निर्देशांक' : 'MSP Benchmark Index'}</span>
              <span style={{ cursor: 'pointer' }}>{lang === 'MR' ? 'डिजिटल एस्क्रो नियम' : 'Digital Escrow Rules'}</span>
              <span style={{ cursor: 'pointer' }}>{lang === 'MR' ? 'गोपनीयता धोरण' : 'Privacy Policy'}</span>
            </div>

            <div>
              © 2026 Government of Maharashtra & MSIS. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
