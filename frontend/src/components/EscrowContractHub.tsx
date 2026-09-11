import React, { useState, useEffect } from 'react';
import { 
  FileText, ShieldCheck, Lock, 
  Truck, DollarSign, AlertTriangle, Key, UserCheck, CheckCircle2, Scale, QrCode
} from 'lucide-react';
import { api, type User, type Contract } from '../services/api';
import { translations, type Language } from '../utils/i18n';
import { QualityRefractionModal } from './QualityRefractionModal';
import { DigitalGatePassModal } from './DigitalGatePassModal';
import { TruckloadOptimizerModal } from './TruckloadOptimizerModal';
import { INITIAL_GATE_PASSES } from '../utils/gatePass';

interface EscrowContractHubProps {
  currentUser: User | null;
  onNavigateToDisputes: (contractId: number) => void;
  initialContractId?: number | null;
  lang?: Language;
}

export const EscrowContractHub: React.FC<EscrowContractHubProps> = ({ 
  currentUser, 
  onNavigateToDisputes,
  initialContractId,
  lang = 'EN'
}) => {
  const t = translations[lang] || translations.EN;
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [aadhaarLastFour, setAadhaarLastFour] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [refractionModalOpen, setRefractionModalOpen] = useState<boolean>(false);
  const [gatePassModalOpen, setGatePassModalOpen] = useState<boolean>(false);
  const [truckloadModalOpen, setTruckloadModalOpen] = useState<boolean>(false);
  const [rolePerspective, setRolePerspective] = useState<'AUTO' | 'FARMER' | 'BUYER' | 'ADMIN'>('AUTO');

  useEffect(() => {
    loadContracts();
  }, [currentUser]);

  useEffect(() => {
    if (initialContractId && contracts.length > 0) {
      const match = contracts.find(c => c.id === initialContractId);
      if (match) setSelectedContract(match);
    }
  }, [initialContractId, contracts]);

  const loadContracts = async () => {
    try {
      const res = await api.getContracts();
      setContracts(res);
      if (res.length > 0) {
        if (initialContractId) {
          const match = res.find(c => c.id === initialContractId);
          if (match) {
            setSelectedContract(match);
            return;
          }
        }
        if (!selectedContract) {
          setSelectedContract(res[0]);
        } else {
          const updated = res.find(c => c.id === selectedContract.id);
          if (updated) setSelectedContract(updated);
        }
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

  // Determine active operating persona
  const activeRole = rolePerspective === 'AUTO' ? (currentUser?.role || 'FARMER') : rolePerspective;

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
            <ShieldCheck size={13} /> {lang === 'MR' ? 'महाराष्ट्र कृषी उत्पन्न खरेदी-विक्री कायदा १९६३ अंतर्गत कायदेशीर बांधील' : 'Legally Enforceable Under APMC Act 1963'}
          </div>
          <h2 style={{ fontSize: '1.65rem', color: '#0f172a' }}>{t.escrowTitle}</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {t.escrowSubtitle}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Persona Role Switcher for seamless evaluation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{lang === 'MR' ? 'भूमिका नियंत्रण:' : 'Perspective:'}</span>
            <button 
              onClick={() => setRolePerspective('FARMER')}
              style={{ 
                border: 'none', 
                padding: '3px 8px', 
                borderRadius: '4px', 
                fontSize: '0.72rem', 
                fontWeight: activeRole === 'FARMER' ? 700 : 500,
                backgroundColor: activeRole === 'FARMER' ? '#059669' : 'transparent',
                color: activeRole === 'FARMER' ? '#fff' : '#475569',
                cursor: 'pointer'
              }}
            >
              {lang === 'MR' ? 'शेतकरी' : 'Farmer'}
            </button>
            <button 
              onClick={() => setRolePerspective('BUYER')}
              style={{ 
                border: 'none', 
                padding: '3px 8px', 
                borderRadius: '4px', 
                fontSize: '0.72rem', 
                fontWeight: activeRole === 'BUYER' ? 700 : 500,
                backgroundColor: activeRole === 'BUYER' ? '#2563eb' : 'transparent',
                color: activeRole === 'BUYER' ? '#fff' : '#475569',
                cursor: 'pointer'
              }}
            >
              {lang === 'MR' ? 'खरेदीदार' : 'Buyer'}
            </button>
            <button 
              onClick={() => setRolePerspective('ADMIN')}
              style={{ 
                border: 'none', 
                padding: '3px 8px', 
                borderRadius: '4px', 
                fontSize: '0.72rem', 
                fontWeight: activeRole === 'ADMIN' ? 700 : 500,
                backgroundColor: activeRole === 'ADMIN' ? '#d97706' : 'transparent',
                color: activeRole === 'ADMIN' ? '#fff' : '#475569',
                cursor: 'pointer'
              }}
            >
              {lang === 'MR' ? 'लवाद / अधिकारी' : 'Officer'}
            </button>
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
            <Lock size={14} /> {lang === 'MR' ? 'आरबीआय मान्यताप्राप्त नोडल एस्क्रो खाते' : 'Escrow Gateway: RBI Approved Nodal Node'}
          </span>
        </div>
      </div>

      {/* Main Split: Contracts List & Detailed Contract Workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '20px' }}>
        {/* Left: Contracts Directory */}
        <div className="gov-card" style={{ padding: '20px' }}>
          <h4 style={{ fontSize: '1.05rem', color: '#0f172a', marginBottom: '14px' }}>
            {t.activeExecutedContracts} ({contracts.length})
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {contracts.length === 0 ? (
              <div style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <FileText size={32} style={{ margin: '0 auto 10px', color: '#94a3b8' }} />
                <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                  {lang === 'MR' ? 'कोणताही सक्रिय करार नाही' : 'No Active Contracts Found'}
                </p>
                <p style={{ fontSize: '0.78rem', marginTop: '4px', lineHeight: 1.4 }}>
                  {lang === 'MR'
                    ? 'वाटाघाटी पूर्ण झाल्यावर मान्य झालेली बोली स्वीकारून थेट कायदेशीर करार येथे तयार होतो.'
                    : 'Legally binding e-contracts are generated automatically once buyer and farmer finalize terms in the RFQ Portal.'}
                </p>
              </div>
            ) : (
              contracts.map(c => (
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
                  {c.commodity} • {c.quantity_quintals} Qtl • {lang === 'MR' ? 'शेतकरी:' : 'Farmer:'} <strong>{c.farmer_name}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    {lang === 'MR' ? 'करार मूल्य:' : 'Contract Value:'}
                  </span>
                  <strong style={{ fontSize: '0.95rem', color: '#059669' }}>
                    ₹{c.total_amount.toLocaleString()}
                  </strong>
                </div>
              </div>
            )))}
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
                  {lang === 'MR' ? 'खरेदीदार:' : 'Buyer:'} <strong>{selectedContract.buyer_name}</strong> ↔ {lang === 'MR' ? 'शेतकरी:' : 'Farmer:'} <strong>{selectedContract.farmer_name}</strong>
                </div>
              </div>

              <button 
                className="btn-gov-secondary"
                onClick={() => onNavigateToDisputes(selectedContract.id)}
                style={{ fontSize: '0.78rem', color: '#dc2626', borderColor: '#fecaca' }}
              >
                <AlertTriangle size={13} /> {t.raiseDisputeBtn}
              </button>
            </div>

            {/* Escrow Milestone Timeline */}
            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-card)' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '12px' }}>
                {lang === 'MR' ? 'एस्क्रो वाटप टप्पे (Escrow Progression)' : 'Escrow Milestone Progression'}
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
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0f172a' }}>{t.stepSigned}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    {selectedContract.farmer_signed && selectedContract.buyer_signed 
                      ? (lang === 'MR' ? 'सत्यापित' : 'Verified') 
                      : (lang === 'MR' ? 'प्रलंबित' : 'Pending')}
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
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0f172a' }}>{t.stepAdvance}</div>
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
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0f172a' }}>{t.stepInTransit}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    {selectedContract.status === 'IN_TRANSIT' 
                      ? (lang === 'MR' ? 'रवाना झाला' : 'Dispatched') 
                      : (selectedContract.status === 'DRAFT' || selectedContract.status === 'AWAITING_SIGNATURES' ? 'Waiting' : 'Dispatched')}
                  </div>
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
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0f172a' }}>{t.stepSettled}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    {selectedContract.status === 'COMPLETED' 
                      ? (lang === 'MR' ? 'पूर्ण जमा' : 'Settled') 
                      : (lang === 'MR' ? 'वजन तपासणी' : 'Gate Weighment')}
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Breakdown Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ padding: '12px 14px', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-card)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.stage1Advance}</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#d97706' }}>
                  ₹{selectedContract.advance_amount.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Status: <strong style={{ color: '#0f172a' }}>{selectedContract.escrow?.advance_status}</strong>
                </div>
              </div>

              <div style={{ padding: '12px 14px', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-card)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.stage2Balance}</span>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#065f46', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <UserCheck size={14} />
                  {lang === 'MR' ? 'एस्क्रो थेट कृती नियंत्रण:' : 'Escrow Live Action Controls:'}
                </div>
                <span style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 600 }}>
                  {lang === 'MR' ? `सध्याची भूमिका: ${activeRole}` : `Active Role: ${activeRole}`}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Aadhaar Input if either needs signing */}
                {(!selectedContract.farmer_signed || !selectedContract.buyer_signed) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#065f46', fontWeight: 600 }}>Aadhaar/OTP:</span>
                    <input 
                      type="text" 
                      maxLength={4}
                      value={aadhaarLastFour}
                      onChange={(e) => setAadhaarLastFour(e.target.value)}
                      placeholder="1234"
                      style={{ width: '70px', padding: '5px 8px', fontSize: '0.78rem' }}
                    />
                  </div>
                )}

                {/* Farmer Sign Button */}
                {!selectedContract.farmer_signed && (activeRole === 'FARMER' || activeRole === 'ADMIN') && (
                  <button 
                    className="btn-gov-primary" 
                    disabled={actionLoading}
                    onClick={() => handleSign('FARMER')}
                    style={{ fontSize: '0.78rem', padding: '7px 12px' }}
                  >
                    {t.eSignFarmer}
                  </button>
                )}

                {/* Buyer Sign Button */}
                {!selectedContract.buyer_signed && (activeRole === 'BUYER' || activeRole === 'ADMIN') && (
                  <button 
                    className="btn-gov-primary" 
                    disabled={actionLoading}
                    onClick={() => handleSign('BUYER')}
                    style={{ fontSize: '0.78rem', padding: '7px 12px', backgroundColor: '#2563eb' }}
                  >
                    {t.eSignBuyer}
                  </button>
                )}

                {/* Buyer Lock Advance Button */}
                {selectedContract.farmer_signed && selectedContract.buyer_signed && selectedContract.escrow?.advance_status === 'UNPAID' && (activeRole === 'BUYER' || activeRole === 'ADMIN') && (
                  <button 
                    className="btn-gov-primary" 
                    disabled={actionLoading}
                    onClick={handleFundAdvance}
                    style={{ fontSize: '0.78rem', padding: '7px 12px', backgroundColor: '#d97706' }}
                  >
                    {t.lockAdvanceBtn} (₹{selectedContract.advance_amount.toLocaleString()})
                  </button>
                )}

                {/* Farmer Dispatch Button */}
                {selectedContract.escrow?.advance_status === 'HELD_IN_ESCROW' && selectedContract.status === 'ADVANCE_ESCROW_LOCKED' && (activeRole === 'FARMER' || activeRole === 'ADMIN') && (
                  <button 
                    className="btn-gov-primary" 
                    disabled={actionLoading}
                    onClick={handleDispatch}
                    style={{ fontSize: '0.78rem', padding: '7px 12px' }}
                  >
                    {t.dispatchBtn}
                  </button>
                )}

                {/* Buyer Delivery Inspection Button */}
                {selectedContract.status === 'IN_TRANSIT' && (activeRole === 'BUYER' || activeRole === 'ADMIN') && (
                  <button 
                    className="btn-gov-primary" 
                    disabled={actionLoading}
                    onClick={handleMarkDelivered}
                    style={{ fontSize: '0.78rem', padding: '7px 12px' }}
                  >
                    {t.deliveredBtn}
                  </button>
                )}

                {/* Buyer Release Final Balance Button */}
                {selectedContract.status === 'DELIVERED_PENDING_INSPECTION' && (activeRole === 'BUYER' || activeRole === 'ADMIN') && (
                  <button 
                    className="btn-gov-primary" 
                    disabled={actionLoading}
                    onClick={handleReleaseFinal}
                    style={{ fontSize: '0.78rem', padding: '7px 12px', backgroundColor: '#059669' }}
                  >
                    {t.releaseFinalBtn} (₹{selectedContract.balance_amount.toLocaleString()})
                  </button>
                )}

                {/* Completed Banner */}
                {selectedContract.status === 'COMPLETED' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#065f46', fontWeight: 700, fontSize: '0.84rem' }}>
                    <CheckCircle2 size={16} />
                    {lang === 'MR' 
                      ? '१००% करार यशस्वीरीत्या पूर्ण झाला असून दोन्ही एस्क्रो टप्पे वितरित झाले आहेत.'
                      : 'Contract 100% completed & full escrow successfully distributed to farmer account.'}
                  </div>
                )}
              </div>
            </div>

            {/* Statutory Quality Refraction Matrix Card */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-sm)', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Scale size={16} color="#0284c7" />
                  <strong style={{ fontSize: '0.84rem', color: '#0f172a' }}>
                    {lang === 'MR' ? 'वैधानिक गुणवत्ता अपवर्तन निकष (APMC Rule 38)' : 'Statutory Quality Refraction Schedule (APMC Rule 38)'}
                  </strong>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                  {lang === 'MR'
                    ? `${selectedContract.commodity} आधार आर्द्रता: १०%, कचरा: १%. गेट वजन कपात व दर वजावट कायदेशीर बांधील.`
                    : `${selectedContract.commodity}: Base Moisture 10%, Foreign Matter 1%. Binding APMC Schedule attached to mill weighbridge.`}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn-gov-secondary"
                  onClick={() => setRefractionModalOpen(true)}
                  style={{ fontSize: '0.76rem', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Scale size={13} color="#0284c7" />
                  <span>{lang === 'MR' ? 'अपवर्तन पावती' : 'Refraction Slip'}</span>
                </button>

                <button
                  type="button"
                  className="btn-gov-secondary"
                  onClick={() => setGatePassModalOpen(true)}
                  style={{ fontSize: '0.76rem', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}
                >
                  <QrCode size={13} color="#059669" />
                  <span>{lang === 'MR' ? 'ई-गेट पास (QR)' : 'Digital Gate Pass (QR)'}</span>
                </button>

                <button
                  type="button"
                  className="btn-gov-secondary"
                  onClick={() => setTruckloadModalOpen(true)}
                  style={{ fontSize: '0.76rem', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe' }}
                >
                  <Truck size={13} color="#2563eb" />
                  <span>{lang === 'MR' ? 'वाहतूक बिल्टी' : 'Truck Bilty'}</span>
                </button>
              </div>
            </div>

            {/* Legal Contract Document Box */}
            <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-card)', maxHeight: '160px', overflowY: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                <FileText size={13} /> {lang === 'MR' ? 'कायदेशीर करार दस्तऐवज (APMC कायदा १९६३ अन्वये):' : 'Legal Agreement Text (Auto-generated per APMC Act 1963):'}
              </div>
              <pre style={{ fontSize: '0.75rem', color: '#334155', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                {selectedContract.legal_terms || 'Terms executed.'}
              </pre>
            </div>
          </div>
        ) : (
          <div className="gov-card" style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Lock size={36} style={{ color: '#94a3b8', marginBottom: '12px' }} />
            <h4 style={{ fontSize: '1.05rem', color: '#0f172a', marginBottom: '6px' }}>
              {lang === 'MR' ? 'कोणताही करार निवडलेला नाही' : 'No Contract Selected'}
            </h4>
            <p style={{ fontSize: '0.82rem', maxWidth: '380px', margin: '0 auto', lineHeight: 1.5 }}>
              {lang === 'MR'
                ? 'तपशील, ५०% आगाऊ एस्क्रो ठेव आणि डिजिटल स्वाक्षरी तपासण्यासाठी डावीकडील कराराची निवड करा.'
                : 'Select an agreement from the list on the left to review milestone progression, execute digital signatures, or release escrow settlements.'}
            </p>
          </div>
        )}
      </div>

      {/* Quality Refraction Weighbridge Modal */}
      {selectedContract && (
        <QualityRefractionModal
          isOpen={refractionModalOpen}
          onClose={() => setRefractionModalOpen(false)}
          commodity={selectedContract.commodity}
          basePricePerQuintal={selectedContract.final_price_per_quintal}
          initialQuantityQuintals={selectedContract.quantity_quintals}
          customSchedule={selectedContract.refraction_schedule}
          companyName={selectedContract.buyer_name}
          lang={lang}
        />
      )}

      {/* Digital Gate Pass Modal (Phase 4) */}
      <DigitalGatePassModal
        isOpen={gatePassModalOpen}
        onClose={() => setGatePassModalOpen(false)}
        contractNumber={selectedContract?.contract_number}
        gatePass={INITIAL_GATE_PASSES.find(gp => gp.commodity.toLowerCase().includes(selectedContract?.commodity.toLowerCase() || '')) || INITIAL_GATE_PASSES[0]}
        lang={lang}
      />

      {/* Logistics Consignment Waybill Modal (Phase 3) */}
      <TruckloadOptimizerModal
        isOpen={truckloadModalOpen}
        onClose={() => setTruckloadModalOpen(false)}
        commodity={selectedContract?.commodity || 'Soybean'}
        destinationHub={selectedContract?.delivery_address || 'Nagpur Hingna Industrial Area'}
        lang={lang}
      />
    </div>
  );
};
