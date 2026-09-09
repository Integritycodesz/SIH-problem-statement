import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, CheckCircle2, 
  Camera, UserCheck, X, ShieldCheck
} from 'lucide-react';
import { api, type User, type Dispute, type Contract } from '../services/api';

interface DisputePortalProps {
  currentUser: User | null;
  initialContractId?: number | null;
}

export const DisputePortal: React.FC<DisputePortalProps> = ({ 
  currentUser, 
  initialContractId 
}) => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [showFileModal, setShowFileModal] = useState<boolean>(false);

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

  const loadDisputes = async () => {
    try {
      const [allDisputes, allContracts] = await Promise.all([
        api.getDisputes(),
        api.getContracts()
      ]);
      setDisputes(allDisputes);
      setContracts(allContracts);
      if (allDisputes.length > 0 && !selectedDispute) {
        setSelectedDispute(allDisputes[0]);
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
      alert('Dispute resolved! Escrow payout adjusted and released.');
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
            <ShieldCheck size={13} /> 3-Tier Statutory Arbitration Framework
          </div>
          <h2 style={{ fontSize: '1.65rem', color: '#0f172a' }}>Grievance & 3-Tier Dispute Resolution</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Peer Negotiation → APMC Mandi Official Arbitration → State Marketing Board Appellate Panel.
          </p>
        </div>

        <button 
          className="btn-gov-secondary"
          onClick={() => setShowFileModal(true)}
          style={{ borderColor: '#fca5a5', color: '#dc2626', backgroundColor: '#fef2f2' }}
        >
          <AlertTriangle size={15} /> File Formal Grievance
        </button>
      </div>

      {/* Grid: Active Disputes & Resolution Workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '20px' }}>
        {/* Left: Disputes List */}
        <div className="gov-card" style={{ padding: '20px' }}>
          <h4 style={{ fontSize: '1.05rem', color: '#0f172a', marginBottom: '14px' }}>
            Active Grievance Tickets ({disputes.length})
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
                  Contract #{d.contract_id} • Filed by: <strong>{d.filed_by_name} ({d.filed_by_role})</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Claimed Deduction:</span>
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
                  Contract #{selectedDispute.contract_id} • Filed on {new Date(selectedDispute.created_at).toLocaleDateString()}
                </div>
              </div>
              <span className={`badge ${selectedDispute.status === 'RESOLVED' ? 'badge-grade-a' : 'badge-amber-tag'}`}>
                {selectedDispute.status}
              </span>
            </div>

            {/* 3-Tier Resolution Progression */}
            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-card)' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px' }}>
                Statutory Resolution Hierarchy
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', textAlign: 'center' }}>
                <div style={{ padding: '8px', backgroundColor: selectedDispute.tier === 'TIER_1_PEER' ? '#fef3c7' : '#ffffff', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-card)' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>Tier 1: Peer</div>
                  <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>Direct Settlement</div>
                </div>

                <div style={{ padding: '8px', backgroundColor: selectedDispute.tier === 'TIER_2_ARBITRATION' ? '#fef3c7' : '#ffffff', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-card)' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>Tier 2: APMC</div>
                  <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>Mandi Arbiter</div>
                </div>

                <div style={{ padding: '8px', backgroundColor: selectedDispute.tier === 'TIER_3_PANEL' ? '#fef3c7' : '#ffffff', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-card)' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>Tier 3: State</div>
                  <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>MSAMB Panel</div>
                </div>
              </div>
            </div>

            {/* Complaint details */}
            <div style={{ backgroundColor: '#ffffff', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-card)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Grievance Statement:</div>
              <p style={{ fontSize: '0.86rem', color: '#0f172a' }}>{selectedDispute.complaint_details}</p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', fontSize: '0.8rem', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                <span>Claimed Deduction: <strong style={{ color: '#dc2626' }}>₹{selectedDispute.claimed_deduction}</strong></span>
                {selectedDispute.resolved_at && (
                  <span>Agreed Settlement: <strong style={{ color: '#059669' }}>₹{selectedDispute.agreed_adjustment}</strong></span>
                )}
              </div>
            </div>

            {/* Evidence image preview */}
            {selectedDispute.evidence_urls && (
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Camera size={13} /> Submitted Inspection Evidence:
                </div>
                <img 
                  src={selectedDispute.evidence_urls} 
                  alt="Quality verification" 
                  style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-card)' }} 
                />
              </div>
            )}

            {/* Official Arbitration Ruling Panel */}
            {selectedDispute.status !== 'RESOLVED' ? (
              <div style={{ backgroundColor: '#f0fdf4', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid #bbf7d0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <UserCheck size={16} color="#059669" />
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#065f46' }}>
                    APMC Official Arbiter Ruling Workbench:
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '3px', display: 'block' }}>
                      Agreed Deduction / Price Adjustment (₹)
                    </label>
                    <input 
                      type="number" 
                      value={arbitrationAdjustment} 
                      onChange={(e) => setArbitrationAdjustment(Number(e.target.value))} 
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '3px', display: 'block' }}>
                      Official Arbiter Ruling & Instructions
                    </label>
                    <textarea 
                      rows={2} 
                      value={arbiterRulingNotes} 
                      onChange={(e) => setArbiterRulingNotes(e.target.value)} 
                    />
                  </div>

                  <button 
                    className="btn-gov-primary" 
                    onClick={() => handleResolve('TIER_2_ARBITRATION')}
                    style={{ justifyContent: 'center', fontSize: '0.82rem', padding: '8px' }}
                  >
                    Issue APMC Arbitrated Settlement
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ padding: '14px', backgroundColor: '#ecfdf5', borderRadius: 'var(--radius-sm)', border: '1px solid #a7f3d0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#065f46', fontWeight: 700, marginBottom: '4px', fontSize: '0.86rem' }}>
                  <CheckCircle2 size={16} /> Grievance Officially Resolved
                </div>
                <p style={{ fontSize: '0.78rem', color: '#065f46' }}>
                  Ruling: {selectedDispute.arbiter_ruling}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Select a dispute ticket on the left.
          </div>
        )}
      </div>

      {/* Modal: File Dispute */}
      {showFileModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', color: '#0f172a' }}>File Formal APMC Dispute</h3>
              <button onClick={() => setShowFileModal(false)} style={{ background: 'transparent', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFileDisputeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a', marginBottom: '4px', display: 'block' }}>
                  Select Contract
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
                  Nature of Grievance
                </label>
                <select value={disputeType} onChange={(e) => setDisputeType(e.target.value)}>
                  <option value="QUALITY_MISMATCH">Quality Mismatch (Moisture / Caliber)</option>
                  <option value="WEIGHT_SHORTAGE">Weighment Shortage at APMC Gate</option>
                  <option value="TRANSIT_DAMAGE">Transit / Spoilage Damage</option>
                  <option value="DELAYED_DELIVERY">Delayed Dispatch beyond SLA</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a', marginBottom: '4px', display: 'block' }}>
                  Claimed Deduction Amount (₹)
                </label>
                <input 
                  type="number" 
                  value={claimedDeduction} 
                  onChange={(e) => setClaimedDeduction(Number(e.target.value))} 
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a', marginBottom: '4px', display: 'block' }}>
                  Detailed Grievance Description
                </label>
                <textarea 
                  rows={2} 
                  value={complaintDetails} 
                  onChange={(e) => setComplaintDetails(e.target.value)} 
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a', marginBottom: '4px', display: 'block' }}>
                  Inspection Photo Evidence URL
                </label>
                <input 
                  type="text" 
                  value={evidenceUrl} 
                  onChange={(e) => setEvidenceUrl(e.target.value)} 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button type="button" className="btn-gov-secondary" onClick={() => setShowFileModal(false)}>Cancel</button>
                <button type="submit" className="btn-gov-primary" style={{ backgroundColor: '#dc2626' }}>
                  Submit Grievance to APMC
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
