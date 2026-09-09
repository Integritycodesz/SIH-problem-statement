import React, { useState, useEffect } from 'react';
import { 
  FileText, ShieldCheck, Lock, 
  Truck, DollarSign, AlertTriangle, Key
} from 'lucide-react';
import { api, type User, type Contract } from '../services/api';

interface EscrowContractHubProps {
  currentUser: User | null;
  onNavigateToDisputes: (contractId: number) => void;
}

export const EscrowContractHub: React.FC<EscrowContractHubProps> = ({ 
  currentUser, 
  onNavigateToDisputes 
}) => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [aadhaarLastFour, setAadhaarLastFour] = useState<string>('9821');
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  useEffect(() => {
    loadContracts();
  }, [currentUser]);

  const loadContracts = async () => {
    try {
      const res = await api.getContracts();
      setContracts(res);
      if (res.length > 0 && !selectedContract) {
        setSelectedContract(res[0]);
      } else if (selectedContract) {
        const updated = res.find(c => c.id === selectedContract.id);
        if (updated) setSelectedContract(updated);
      }
    } catch (e) {
      console.error('Error loading contracts:', e);
    }
  };

  const handleSign = async (role: 'FARMER' | 'BUYER') => {
    if (!selectedContract || !currentUser) return;
    setActionLoading(true);
    try {
      const updated = await api.signContract(selectedContract.id, {
        user_id: currentUser.id,
        signer_role: role,
        aadhaar_last_four: aadhaarLastFour
      });
      setSelectedContract(updated);
      await loadContracts();
    } catch (e) {
      console.error('Error signing:', e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleFundAdvance = async () => {
    if (!selectedContract) return;
    setActionLoading(true);
    try {
      const updated = await api.fundAdvance(selectedContract.id);
      setSelectedContract(updated);
      await loadContracts();
    } catch (e) {
      console.error('Error funding advance:', e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDispatch = async () => {
    if (!selectedContract) return;
    setActionLoading(true);
    try {
      const updated = await api.dispatchContract(selectedContract.id);
      setSelectedContract(updated);
      await loadContracts();
    } catch (e) {
      console.error('Error dispatching produce:', e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkDelivered = async () => {
    if (!selectedContract) return;
    setActionLoading(true);
    try {
      const updated = await api.markDelivered(selectedContract.id);
      setSelectedContract(updated);
      await loadContracts();
    } catch (e) {
      console.error('Error marking delivered:', e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReleaseFinal = async () => {
    if (!selectedContract) return;
    setActionLoading(true);
    try {
      const updated = await api.releaseFinalSettlement(selectedContract.id);
      setSelectedContract(updated);
      await loadContracts();
    } catch (e) {
      console.error('Error releasing settlement:', e);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingTop: '16px' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '6px', 
            backgroundColor: '#ecfdf5', 
            color: '#065f46', 
            border: '1px solid #a7f3d0', 
            borderRadius: 'var(--radius-full)', 
            padding: '2px 10px', 
            fontSize: '0.72rem', 
            fontWeight: 700,
            marginBottom: '6px'
          }}>
            <ShieldCheck size={13} /> Legally Enforceable Under APMC Act 1963
          </div>
          <h2 style={{ fontSize: '1.65rem', color: '#0f172a' }}>Smart Contracts & Escrow Milestone Payments</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Bi-party digital contracts with two-tier escrow protection: 50% advance locked pre-transit, 50% released upon APMC assay sign-off.
          </p>
        </div>

        <span style={{ 
          backgroundColor: '#ecfdf5', 
          color: '#065f46', 
          border: '1px solid #a7f3d0', 
          borderRadius: 'var(--radius-full)', 
          padding: '6px 14px', 
          fontSize: '0.8rem', 
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <Lock size={14} /> Escrow Gateway: RBI Approved Nodal Node
        </span>
      </div>

      {/* Main Split: Contracts List & Detailed Contract Workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '20px' }}>
        {/* Left: Contracts Directory */}
        <div className="gov-card" style={{ padding: '20px' }}>
          <h4 style={{ fontSize: '1.05rem', color: '#0f172a', marginBottom: '14px' }}>
            Active Executed Contracts ({contracts.length})
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {contracts.map(c => (
              <div 
                key={c.id} 
                onClick={() => setSelectedContract(c)}
                style={{ 
                  cursor: 'pointer',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: selectedContract?.id === c.id ? '#ecfdf5' : '#ffffff',
                  border: `1px solid ${selectedContract?.id === c.id ? '#a7f3d0' : 'var(--border-card)'}`,
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{c.contract_number}</span>
                  <span className={`badge ${
                    c.status === 'COMPLETED' ? 'badge-grade-a' : 
                    c.status.includes('DISPUTED') ? 'badge-amber-tag' : 'badge-blue-tag'
                  }`}>
                    {c.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {c.commodity} • {c.quantity_quintals} Qtl • Farmer: <strong>{c.farmer_name}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Contract Value:</span>
                  <strong style={{ fontSize: '0.95rem', color: '#059669' }}>
                    ₹{c.total_amount.toLocaleString()}
                  </strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Selected Contract Workspace & Escrow Engine */}
        {selectedContract ? (
          <div className="gov-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h4 style={{ fontSize: '1.2rem', color: '#0f172a' }}>Contract Ref: {selectedContract.contract_number}</h4>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Buyer: <strong>{selectedContract.buyer_name}</strong> ↔ Farmer: <strong>{selectedContract.farmer_name}</strong>
                </div>
              </div>

              <button 
                className="btn-gov-secondary"
                onClick={() => onNavigateToDisputes(selectedContract.id)}
                style={{ fontSize: '0.78rem', color: '#dc2626', borderColor: '#fecaca' }}
              >
                <AlertTriangle size={13} /> Raise Dispute
              </button>
            </div>

            {/* Escrow Milestone Timeline */}
            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-card)' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Escrow Milestone Progression
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', textAlign: 'center' }}>
                {/* Step 1: E-Sign */}
                <div style={{ padding: '8px 4px', backgroundColor: (selectedContract.farmer_signed && selectedContract.buyer_signed) ? '#ecfdf5' : '#ffffff', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-card)' }}>
                  <div style={{ 
                    width: '24px', height: '24px', margin: '0 auto 4px', borderRadius: '50%',
                    backgroundColor: (selectedContract.farmer_signed && selectedContract.buyer_signed) ? '#065f46' : '#cbd5e1',
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem'
                  }}>
                    <Key size={12} />
                  </div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0f172a' }}>1. Signed</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    {selectedContract.farmer_signed && selectedContract.buyer_signed ? 'Verified' : 'Pending'}
                  </div>
                </div>

                {/* Step 2: 50% Advance Escrow */}
                <div style={{ padding: '8px 4px', backgroundColor: selectedContract.escrow?.advance_status !== 'UNPAID' ? '#ecfdf5' : '#ffffff', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-card)' }}>
                  <div style={{ 
                    width: '24px', height: '24px', margin: '0 auto 4px', borderRadius: '50%',
                    backgroundColor: selectedContract.escrow?.advance_status !== 'UNPAID' ? '#065f46' : '#cbd5e1',
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem'
                  }}>
                    <Lock size={12} />
                  </div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0f172a' }}>2. Advance (50%)</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    {selectedContract.escrow?.advance_status || 'UNPAID'}
                  </div>
                </div>

                {/* Step 3: Transit Dispatch */}
                <div style={{ padding: '8px 4px', backgroundColor: selectedContract.status === 'IN_TRANSIT' || selectedContract.status === 'DELIVERED_PENDING_INSPECTION' || selectedContract.status === 'COMPLETED' ? '#ecfdf5' : '#ffffff', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-card)' }}>
                  <div style={{ 
                    width: '24px', height: '24px', margin: '0 auto 4px', borderRadius: '50%',
                    backgroundColor: selectedContract.status === 'IN_TRANSIT' || selectedContract.status === 'DELIVERED_PENDING_INSPECTION' || selectedContract.status === 'COMPLETED' ? '#065f46' : '#cbd5e1',
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem'
                  }}>
                    <Truck size={12} />
                  </div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0f172a' }}>3. In Transit</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Dispatched</div>
                </div>

                {/* Step 4: Final Settlement */}
                <div style={{ padding: '8px 4px', backgroundColor: selectedContract.status === 'COMPLETED' ? '#ecfdf5' : '#ffffff', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-card)' }}>
                  <div style={{ 
                    width: '24px', height: '24px', margin: '0 auto 4px', borderRadius: '50%',
                    backgroundColor: selectedContract.status === 'COMPLETED' ? '#065f46' : '#cbd5e1',
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem'
                  }}>
                    <DollarSign size={12} />
                  </div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0f172a' }}>4. Balance (50%)</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    {selectedContract.status === 'COMPLETED' ? 'Settled' : 'Gate Weighment'}
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Breakdown Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ padding: '12px 14px', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-card)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Stage 1 Advance (50%)</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#d97706' }}>
                  ₹{selectedContract.advance_amount.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Status: <strong style={{ color: '#0f172a' }}>{selectedContract.escrow?.advance_status}</strong>
                </div>
              </div>

              <div style={{ padding: '12px 14px', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-card)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Stage 2 Balance (50%)</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669' }}>
                  ₹{selectedContract.balance_amount.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Status: <strong style={{ color: '#0f172a' }}>{selectedContract.escrow?.balance_status}</strong>
                </div>
              </div>
            </div>

            {/* Interactive Action Controls */}
            <div style={{ backgroundColor: '#ecfdf5', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid #a7f3d0' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '10px', color: '#065f46' }}>
                Escrow Live Action Controls (Interactive Workflow):
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                {(!selectedContract.farmer_signed || !selectedContract.buyer_signed) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#065f46', fontWeight: 600 }}>Aadhaar/OTP:</span>
                    <input 
                      type="text" 
                      maxLength={4}
                      value={aadhaarLastFour}
                      onChange={(e) => setAadhaarLastFour(e.target.value)}
                      style={{ width: '70px', padding: '5px 8px', fontSize: '0.78rem' }}
                    />
                  </div>
                )}

                {!selectedContract.farmer_signed && (
                  <button 
                    className="btn-gov-primary" 
                    disabled={actionLoading}
                    onClick={() => handleSign('FARMER')}
                    style={{ fontSize: '0.78rem', padding: '7px 12px' }}
                  >
                    E-Sign as Farmer (Aadhaar OTP)
                  </button>
                )}

                {!selectedContract.buyer_signed && (
                  <button 
                    className="btn-gov-primary" 
                    disabled={actionLoading}
                    onClick={() => handleSign('BUYER')}
                    style={{ fontSize: '0.78rem', padding: '7px 12px' }}
                  >
                    E-Sign as Buyer (Digital Token)
                  </button>
                )}

                {selectedContract.farmer_signed && selectedContract.buyer_signed && selectedContract.escrow?.advance_status === 'UNPAID' && (
                  <button 
                    className="btn-gov-primary" 
                    disabled={actionLoading}
                    onClick={handleFundAdvance}
                    style={{ fontSize: '0.78rem', padding: '7px 12px' }}
                  >
                    Lock ₹{selectedContract.advance_amount.toLocaleString()} Advance in Escrow (Buyer)
                  </button>
                )}

                {selectedContract.escrow?.advance_status === 'HELD_IN_ESCROW' && selectedContract.status === 'ADVANCE_ESCROW_LOCKED' && (
                  <button 
                    className="btn-gov-primary" 
                    disabled={actionLoading}
                    onClick={handleDispatch}
                    style={{ fontSize: '0.78rem', padding: '7px 12px' }}
                  >
                    Dispatch Produce & Release Advance to Farmer
                  </button>
                )}

                {selectedContract.status === 'IN_TRANSIT' && (
                  <button 
                    className="btn-gov-primary" 
                    disabled={actionLoading}
                    onClick={handleMarkDelivered}
                    style={{ fontSize: '0.78rem', padding: '7px 12px' }}
                  >
                    APMC Gate Arrival & Weighment Inspection
                  </button>
                )}

                {selectedContract.status === 'DELIVERED_PENDING_INSPECTION' && (
                  <button 
                    className="btn-gov-primary" 
                    disabled={actionLoading}
                    onClick={handleReleaseFinal}
                    style={{ fontSize: '0.78rem', padding: '7px 12px' }}
                  >
                    Release 100% Final Settlement of ₹{selectedContract.balance_amount.toLocaleString()} (Buyer)
                  </button>
                )}
              </div>
            </div>

            {/* Legal Contract Document Box */}
            <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-card)', maxHeight: '160px', overflowY: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                <FileText size={13} /> Legal Agreement Text (Auto-generated per APMC Act 1963):
              </div>
              <pre style={{ fontSize: '0.75rem', color: '#334155', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                {selectedContract.legal_terms || 'Terms executed.'}
              </pre>
            </div>
          </div>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Select a contract on the left.
          </div>
        )}
      </div>
    </div>
  );
};
