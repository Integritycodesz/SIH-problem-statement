import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MandiIntelligence } from './components/MandiIntelligence';
import { FarmerPortal } from './components/FarmerPortal';
import { BuyerDiscovery } from './components/BuyerDiscovery';
import { EscrowContractHub } from './components/EscrowContractHub';
import { DisputePortal } from './components/DisputePortal';
import { api, type User } from './services/api';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<string>('buyer'); // Default to Marketplace as in Image 1
  const [disputeTargetContractId, setDisputeTargetContractId] = useState<number | null>(null);

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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-page)' }}>
      {/* Exact Reference Header with Ticker & Navigation */}
      <Header
        currentUser={currentUser}
        allUsers={allUsers}
        onSelectUser={handleUserSelect}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      <main className="app-container" style={{ flex: 1 }}>
        {activeTab === 'intelligence' && <MandiIntelligence />}
        {activeTab === 'farmer' && (
          <FarmerPortal 
            currentUser={currentUser} 
            onNavigateToRFQs={() => setActiveTab('buyer')} 
          />
        )}
        {activeTab === 'buyer' && (
          <BuyerDiscovery 
            currentUser={currentUser} 
            onNavigateToContracts={() => setActiveTab('contracts')} 
          />
        )}
        {activeTab === 'contracts' && (
          <EscrowContractHub 
            currentUser={currentUser} 
            onNavigateToDisputes={handleNavigateToDisputes} 
          />
        )}
        {activeTab === 'disputes' && (
          <DisputePortal 
            currentUser={currentUser} 
            initialContractId={disputeTargetContractId} 
          />
        )}
      </main>

      {/* Exact Reference Footer */}
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
                <strong style={{ fontSize: '0.98rem', color: '#0f172a' }}>AgroConnect Portal</strong>
                <span style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '0.68rem', padding: '1px 6px', borderRadius: 'var(--radius-xs)', fontWeight: 600 }}>
                  Maharashtra State
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Direct APMC-grade produce linkage, digital escrow settlement, and verified farmer producer aggregation platform.
              </p>
            </div>

            {/* Right Helpline Info */}
            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Toll-Free Kisan Helpline
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#059669' }}>
                  1800-233-AGRO (2476)
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Support Desk
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
              <span style={{ cursor: 'pointer' }}>Grievance Cell</span>
              <span style={{ cursor: 'pointer' }}>MSP Benchmark Index</span>
              <span style={{ cursor: 'pointer' }}>Digital Escrow Rules</span>
              <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
            </div>

            <div>
              © 2025 Government of Maharashtra & MSIS. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
