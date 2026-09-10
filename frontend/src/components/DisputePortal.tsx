import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, CheckCircle2, 
  Camera, UserCheck, X, ShieldCheck, ArrowUpRight
} from 'lucide-react';
import { api, type User, type Dispute, type Contract } from '../services/api';
import { translations, type Language } from '../utils/i18n';

interface DisputePortalProps {
  currentUser: User | null;
  initialContractId?: number | null;
  lang?: Language;
}

export const DisputePortal: React.FC<DisputePortalProps> = ({ 
  currentUser, 
  initialContractId,
  lang = 'EN'
}) => {
  const t = translations[lang] || translations.EN;
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [showFileModal, setShowFileModal] = useState<boolean>(false);
  const [isEscalating, setIsEscalating] = useState<boolean>(false);

  // File Dispute Form
  const [disputeContractId, setDisputeContractId] = useState<number>(initialContractId || 1);
  const [disputeType, setDisputeType] = useState<string>('QUALITY_MISMATCH');
  const [claimedDeduction, setClaimedDeduction] = useState<number>(1200);
  const [complaintDetails, setComplaintDetails] = useState<string>(
    'Moisture test at APMC gate is 13.8% vs guaranteed 11.2%. Requesting drying deduction allowance.'
  );
  const [evidenceUrl, setEvidenceUrl] = useState<string>(
    'https://images.unsplash.com/photo-1597916829826-02e5bb4a54e0?w=600&auto=format&fit=crop'
  );

  // Arbiter Ruling Form
  const [arbitrationAdjustment, setArbitrationAdjustment] = useState<number>(800);
  const [arbiterRulingNotes, setArbiterRulingNotes] = useState<string>(
    'APMC Mandi Grade test confirmed 12.5% moisture. Adjusted fair drying allowance to ₹800; remaining escrow balance released.'
  );

  useEffect(() => {
    loadDisputes();
  }, [currentUser]);

  useEffect(() => {
    if (initialContractId) {
      setDisputeContractId(initialContractId);
      setShowFileModal(true);
    }
  }, [initialContractId]);

  const loadDisputes = async () => {
    try {
      const [allDisputes, allContracts] = await Promise.all([
        api.getDisputes(),
        api.getContracts()
      ]);
      setDisputes(allDisputes);
      setContracts(allContracts);
      if (allDisputes.length > 0) {
        if (initialContractId) {
          const match = allDisputes.find(d => d.contract_id === initialContractId);
          if (match) {
            setSelectedDispute(match);
            return;
          }
        }
        if (!selectedDispute) {
          setSelectedDispute(allDisputes[0]);
        } else {
          const updated = allDisputes.find(d => d.id === selectedDispute.id);
          if (updated) setSelectedDispute(updated);
        }
      }
    } catch (e) {
      console.error('Error loading disputes:', e);
    }
  };

  const handleFileDisputeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      const filed = await api.fileDispute({
        contract_id: disputeContractId,
        filed_by_id: currentUser.id,
        filed_by_role: currentUser.role,
        dispute_type: disputeType,
        complaint_details: complaintDetails,
        claimed_deduction: claimedDeduction,
        evidence_urls: evidenceUrl
      });
      setShowFileModal(false);
      await loadDisputes();
      setSelectedDispute(filed);
    } catch (err) {
      console.error('Error filing dispute:', err);
    }
  };

  const handleEscalate = async (targetTier: string) => {
    if (!selectedDispute) return;
    setIsEscalating(true);
    try {
      const updated = await api.escalateDispute(
        selectedDispute.id, 
        targetTier, 
        `Grievance escalated to ${targetTier.replace(/_/g, ' ')} due to lack of peer conciliation.`
      );
      setSelectedDispute(updated);
      await loadDisputes();
    } catch (e) {
      console.error('Error escalating dispute:', e);
    } finally {
      setIsEscalating(false);
    }
  };

  const handleResolve = async (tier: string) => {
    if (!selectedDispute) return;
    try {
      const resolved = await api.resolveDispute(selectedDispute.id, {
        tier: tier,
        status: 'RESOLVED',
        agreed_adjustment: arbitrationAdjustment,
        arbiter_ruling: arbiterRulingNotes
      });
      setSelectedDispute(resolved);
      await loadDisputes();
    } catch (err) {
      console.error('Error resolving dispute:', err);
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
            <ShieldCheck size={13} /> {lang === 'MR' ? '३-स्तरीय वैधानिक लवाद व तक्रार निवारण कक्ष' : '3-Tier Statutory Arbitration Framework'}
          </div>
          <h2 style={{ fontSize: '1.65rem', color: '#0f172a' }}>{t.disputeTitle}</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {t.disputeSubtitle}
          </p>
        </div>

        <button 
          className="btn-gov-secondary"
          onClick={() => setShowFileModal(true)}
          style={{ borderColor: '#fca5a5', color: '#dc2626', backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <AlertTriangle size={15} /> {t.fileGrievanceBtn}
        </button>
      </div>

      {/* Grid: Active Disputes & Resolution Workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '20px' }}>
        {/* Left: Disputes List */}
        <div className="gov-card" style={{ padding: '20px' }}>
          <h4 style={{ fontSize: '1.05rem', color: '#0f172a', marginBottom: '14px' }}>
            {t.activeGrievanceTickets} ({disputes.length})
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {disputes.map(d => (
              <div 
                key={d.id} 
                onClick={() => setSelectedDispute(d)}
                style={{ 
                  cursor: 'pointer',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: selectedDispute?.id === d.id ? '#fffbeb' : '#ffffff',
                  border: `1px solid ${selectedDispute?.id === d.id ? '#fde68a' : 'var(--border-card)'}`,
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>Ticket #{d.id}</span>
                  <span className={`badge ${d.status === 'RESOLVED' ? 'badge-grade-a' : 'badge-amber-tag'}`}>
                    {d.tier.replace(/_/g, ' ')}
                  </span>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Contract #{d.contract_id} • {lang === 'MR' ? 'अर्जदार:' : 'Filed by:'} <strong>{d.filed_by_name} ({d.filed_by_role})</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{t.claimedDeduction}:</span>
                  <strong style={{ fontSize: '0.92rem', color: '#dc2626' }}>
                    ₹{d.claimed_deduction.toLocaleString()}
                  </strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Selected Dispute Details & 3-Tier Resolution Workbench */}
        {selectedDispute ? (
          <div className="gov-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontSize: '1.2rem', color: '#0f172a' }}>
                  Ticket #{selectedDispute.id} — {selectedDispute.dispute_type.replace(/_/g, ' ')}
                </h4>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Contract #{selectedDispute.contract_id} • {new Date(selectedDispute.created_at).toLocaleDateString()}
                </div>
              </div>
              <span className={`badge ${selectedDispute.status === 'RESOLVED' ? 'badge-grade-a' : 'badge-amber-tag'}`}>
                {selectedDispute.status}
              </span>
            </div>

            {/* 3-Tier Resolution Progression */}
            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-card)' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px' }}>
                {lang === 'MR' ? 'वैधानिक लवाद स्तर (Statutory Hierarchy)' : 'Statutory Resolution Hierarchy'}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', textAlign: 'center' }}>
                <div style={{ padding: '8px', backgroundColor: selectedDispute.tier === 'TIER_1_PEER' ? '#fef3c7' : '#ffffff', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-card)' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>{t.tier1Peer}</div>
                  <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>
                    {lang === 'MR' ? 'थेट द्विपक्षीय चर्चा' : 'Direct Settlement'}
                  </div>
                </div>

                <div style={{ padding: '8px', backgroundColor: selectedDispute.tier === 'TIER_2_ARBITRATION' ? '#fef3c7' : '#ffffff', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-card)' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>{t.tier2Apmc}</div>
                  <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>
                    {lang === 'MR' ? 'बाजार समिती सचिव लवाद' : 'Mandi Arbiter'}
                  </div>
                </div>

                <div style={{ padding: '8px', backgroundColor: selectedDispute.tier === 'TIER_3_PANEL' ? '#fef3c7' : '#ffffff', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-card)' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>{t.tier3State}</div>
                  <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>
                    {lang === 'MR' ? 'MSAMB राज्यस्तरीय पॅनेल' : 'MSAMB Panel'}
                  </div>
                </div>
              </div>
            </div>

            {/* Complaint details */}
            <div style={{ backgroundColor: '#ffffff', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-card)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                {lang === 'MR' ? 'तक्रारदार निवेदन (Grievance Statement):' : 'Grievance Statement:'}
              </div>
              <p style={{ fontSize: '0.86rem', color: '#0f172a' }}>{selectedDispute.complaint_details}</p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', fontSize: '0.8rem', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                <span>{t.claimedDeduction}: <strong style={{ color: '#dc2626' }}>₹{selectedDispute.claimed_deduction}</strong></span>
                {selectedDispute.resolved_at && (
                  <span>{t.agreedSettlement}: <strong style={{ color: '#059669' }}>₹{selectedDispute.agreed_adjustment}</strong></span>
                )}
              </div>
            </div>

            {/* Evidence image preview */}
            {selectedDispute.evidence_urls && (
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Camera size={13} /> {lang === 'MR' ? 'दाखल केलेला तपासणी पुरावा:' : 'Submitted Inspection Evidence:'}
                </div>
                <img 
                  src={selectedDispute.evidence_urls} 
                  alt="Quality verification" 
                  style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-card)' }} 
                />
              </div>
            )}

            {/* Tier Escalation Controls if not yet resolved */}
            {selectedDispute.status !== 'RESOLVED' && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-card)' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {lang === 'MR' ? 'लवाद स्तर बदलणे:' : 'Escalation Action:'}
                </span>

                {selectedDispute.tier === 'TIER_1_PEER' && (
                  <button 
                    className="btn-gov-secondary"
                    disabled={isEscalating}
                    onClick={() => handleEscalate('TIER_2_ARBITRATION')}
                    style={{ fontSize: '0.75rem', padding: '4px 10px', color: '#d97706', borderColor: '#fde68a' }}
                  >
                    <ArrowUpRight size={13} /> {t.escalateToTier2Btn}
                  </button>
                )}

                {(selectedDispute.tier === 'TIER_1_PEER' || selectedDispute.tier === 'TIER_2_ARBITRATION') && (
                  <button 
                    className="btn-gov-secondary"
                    disabled={isEscalating}
                    onClick={() => handleEscalate('TIER_3_PANEL')}
                    style={{ fontSize: '0.75rem', padding: '4px 10px', color: '#dc2626', borderColor: '#fca5a5' }}
                  >
                    <ArrowUpRight size={13} /> {t.escalateToTier3Btn}
                  </button>
                )}
              </div>
            )}

            {/* Official Arbitration Ruling Panel */}
            {selectedDispute.status !== 'RESOLVED' ? (
              <div style={{ backgroundColor: '#f0fdf4', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid #bbf7d0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <UserCheck size={16} color="#059669" />
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#065f46' }}>
                    {lang === 'MR' ? 'बाजार समिती अधिकृत लवाद निर्णय कक्ष:' : 'APMC Official Arbiter Ruling Workbench:'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '3px', display: 'block' }}>
                      {lang === 'MR' ? 'मंजूर वजावट / मूल्य समायोजन (₹)' : 'Agreed Deduction / Price Adjustment (₹)'}
                    </label>
                    <input 
                      type="number" 
                      value={arbitrationAdjustment} 
                      onChange={(e) => setArbitrationAdjustment(Number(e.target.value))} 
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '3px', display: 'block' }}>
                      {lang === 'MR' ? 'अधिकृत लवाद निकाल व आदेश' : 'Official Arbiter Ruling & Instructions'}
                    </label>
                    <textarea 
                      rows={2} 
                      value={arbiterRulingNotes} 
                      onChange={(e) => setArbiterRulingNotes(e.target.value)} 
                    />
                  </div>

                  <button 
                    className="btn-gov-primary" 
                    onClick={() => handleResolve(selectedDispute.tier)}
                    style={{ justifyContent: 'center', fontSize: '0.82rem', padding: '8px' }}
                  >
                    {t.issueRulingBtn}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ padding: '14px', backgroundColor: '#ecfdf5', borderRadius: 'var(--radius-sm)', border: '1px solid #a7f3d0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#065f46', fontWeight: 700, marginBottom: '4px', fontSize: '0.86rem' }}>
                  <CheckCircle2 size={16} /> {lang === 'MR' ? 'तक्रार अधिकृतरीत्या निकाली काढली' : 'Grievance Officially Resolved'}
                </div>
                <p style={{ fontSize: '0.78rem', color: '#065f46' }}>
                  <strong>{lang === 'MR' ? 'निकाल:' : 'Ruling:'}</strong> {selectedDispute.arbiter_ruling}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            {lang === 'MR' ? 'कृपया डावीकडील तक्रार तिकीट निवडा.' : 'Select a dispute ticket on the left.'}
          </div>
        )}
      </div>

      {/* Modal: File Dispute */}
      {showFileModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', color: '#0f172a' }}>{t.fileGrievanceBtn}</h3>
              <button onClick={() => setShowFileModal(false)} style={{ background: 'transparent', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFileDisputeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a', marginBottom: '4px', display: 'block' }}>
                  {lang === 'MR' ? 'करार निवडा' : 'Select Contract'}
                </label>
                <select 
                  value={disputeContractId} 
                  onChange={(e) => setDisputeContractId(Number(e.target.value))}
                >
                  {contracts.map(c => (
                    <option key={c.id} value={c.id}>{c.contract_number} — {c.commodity} ({c.farmer_name})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a', marginBottom: '4px', display: 'block' }}>
                  {lang === 'MR' ? 'तक्रारीचे स्वरूप' : 'Nature of Grievance'}
                </label>
                <select value={disputeType} onChange={(e) => setDisputeType(e.target.value)}>
                  <option value="QUALITY_MISMATCH">{lang === 'MR' ? 'गुणवत्ता फरक (ओलावा / प्रतवारी)' : 'Quality Mismatch (Moisture / Caliber)'}</option>
                  <option value="WEIGHT_SHORTAGE">{lang === 'MR' ? 'APMC गेटवर वजन तूट' : 'Weighment Shortage at APMC Gate'}</option>
                  <option value="TRANSIT_DAMAGE">{lang === 'MR' ? 'वाहतुकीदरम्यान मालाचे नुकसान' : 'Transit / Spoilage Damage'}</option>
                  <option value="DELAYED_DELIVERY">{lang === 'MR' ? 'करारापेक्षा उशिरा पोहोच' : 'Delayed Dispatch beyond SLA'}</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a', marginBottom: '4px', display: 'block' }}>
                  {t.claimedDeduction} (₹)
                </label>
                <input 
                  type="number" 
                  value={claimedDeduction} 
                  onChange={(e) => setClaimedDeduction(Number(e.target.value))} 
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a', marginBottom: '4px', display: 'block' }}>
                  {lang === 'MR' ? 'तपशीलवार तक्रार वर्णन' : 'Detailed Grievance Description'}
                </label>
                <textarea 
                  rows={2} 
                  value={complaintDetails} 
                  onChange={(e) => setComplaintDetails(e.target.value)} 
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a', marginBottom: '4px', display: 'block' }}>
                  {lang === 'MR' ? 'तपासणी छायाचित्र लिंक (पुरावा)' : 'Inspection Photo Evidence URL'}
                </label>
                <input 
                  type="text" 
                  value={evidenceUrl} 
                  onChange={(e) => setEvidenceUrl(e.target.value)} 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button type="button" className="btn-gov-secondary" onClick={() => setShowFileModal(false)}>
                  {lang === 'MR' ? 'रद्द करा' : 'Cancel'}
                </button>
                <button type="submit" className="btn-gov-primary" style={{ backgroundColor: '#dc2626' }}>
                  {lang === 'MR' ? 'बाजार समितीकडे तक्रार नोंदवा' : 'Submit Grievance to APMC'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
