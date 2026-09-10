import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MandiIntelligence } from './components/MandiIntelligence';
import { FarmerPortal } from './components/FarmerPortal';
import { BuyerDiscovery } from './components/BuyerDiscovery';
import { EscrowContractHub } from './components/EscrowContractHub';
import { DisputePortal } from './components/DisputePortal';
import { api, type User } from './services/api';
import { type Language } from './utils/i18n';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<string>('buyer'); // Default to Marketplace
  const [lang, setLang] = useState<Language>('EN');
  const [disputeTargetContractId, setDisputeTargetContractId] = useState<number | null>(null);
  const [selectedContractId, setSelectedContractId] = useState<number | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const users = await api.getUsers();
      setAllUsers(users);
      if (users.length > 0) {
        const farmer = users.find(u => u.role === 'FARMER');
        setCurrentUser(farmer || users[0]);
      }
    } catch (e) {
      console.error('Error fetching users:', e);
    }
  };

  const handleUserSelect = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'FARMER') {
      setActiveTab('farmer');
    } else if (user.role === 'BUYER') {
      setActiveTab('buyer');
    } else if (user.role === 'OFFICIAL') {
      setActiveTab('disputes');
    }
  };

  const handleNavigateToDisputes = (contractId: number) => {
    setDisputeTargetContractId(contractId);
    setActiveTab('disputes');
  };

  const handleNavigateToContracts = (contractId?: number) => {
    if (contractId) {
      setSelectedContractId(contractId);
    }
    setActiveTab('contracts');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-page)' }}>
      {/* Exact Reference Header with Ticker, Navigation & Interactive Notification Center */}
      <Header
        currentUser={currentUser}
        allUsers={allUsers}
        onSelectUser={handleUserSelect}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        lang={lang}
        onSelectLang={setLang}
      />

      <main className="app-container" style={{ flex: 1 }}>
        {activeTab === 'intelligence' && (
          <MandiIntelligence lang={lang} />
        )}
        {activeTab === 'farmer' && (
          <FarmerPortal 
            currentUser={currentUser} 
            onNavigateToRFQs={() => setActiveTab('buyer')} 
            lang={lang}
          />
        )}
        {activeTab === 'buyer' && (
          <BuyerDiscovery 
            currentUser={currentUser} 
            onNavigateToContracts={handleNavigateToContracts} 
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
      </main>

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
