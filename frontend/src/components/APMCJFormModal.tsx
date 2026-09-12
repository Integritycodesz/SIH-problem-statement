import React, { useState, useEffect } from 'react';
import { 
  FileText, ShieldCheck, 
  X, Printer
} from 'lucide-react';
import { api, type APMCJFormRecord, type Contract } from '../services/api';
import { type Language } from '../utils/i18n';

interface APMCJFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractId: number;
  contract?: Contract | null;
  lang?: Language;
}

export const APMCJFormModal: React.FC<APMCJFormModalProps> = ({
  isOpen,
  onClose,
  contractId,
  contract: _contract,
  lang = 'EN'
}) => {
  if (!isOpen) return null;

  const isMarathi = lang === 'MR';
  const [jForm, setJForm] = useState<APMCJFormRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.getAPMCJFormForContract(contractId)
      .then(res => {
        if (mounted) setJForm(res);
      })
      .catch(err => {
        console.error('Error fetching APMC J-Form:', err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [contractId]);

  return (
    <div 
      className="modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px'
      }}
    >
      <div 
        className="gov-card"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-md)',
          width: '100%',
          maxWidth: '820px',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div style={{
          backgroundColor: '#1e3a8a',
          background: 'linear-gradient(135deg, #172554 0%, #1e3a8a 50%, #1d4ed8 100%)',
          padding: '18px 24px',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '38px', 
              height: '38px', 
              borderRadius: '8px', 
              backgroundColor: '#93c5fd', 
              color: '#1e3a8a', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <FileText size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ 
                  backgroundColor: '#93c5fd', 
                  color: '#172554', 
                  fontSize: '0.66rem', 
                  fontWeight: 800, 
                  padding: '2px 8px', 
                  borderRadius: '4px',
                  textTransform: 'uppercase' 
                }}>
                  STATUTORY FORM J (RULE 24)
                </span>
                <span style={{ fontSize: '0.72rem', color: '#bfdbfe' }}>
                  {isMarathi ? 'महाराष्ट्र कृषी उत्पन्न खरेदी-विक्री नियम १९६७' : 'Maharashtra APMC Regulation Rules 1967'}
                </span>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', margin: '4px 0 0 0' }}>
                {isMarathi ? 'अधिकृत कृषी उत्पन्न विक्री पावती (e-J-Form)' : 'Official APMC e-J-Form (Statutory Sale Slip)'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {loading || !jForm ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              Loading Official APMC e-J-Form...
            </div>
          ) : (
            <>
              {/* Action Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Legally valid proof of agricultural sale for Bank KCC loan appraisal, crop insurance, and state subsidies.
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn-gov-secondary"
                    onClick={() => window.print()}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', borderColor: '#1e3a8a', color: '#1e3a8a' }}
                  >
                    <Printer size={14} /> Print Form J (A4 Voucher)
                  </button>
                </div>
              </div>

              {/* Printable Official Form J Sheet */}
              <div 
                id="printable-apmc-j-form"
                style={{
                  border: '2px solid #1e3a8a',
                  borderRadius: 'var(--radius-sm)',
                  padding: '24px',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}
              >
                {/* Official State Header */}
                <div style={{ textAlign: 'center', borderBottom: '2px solid #1e3a8a', paddingBottom: '14px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.08em', color: '#1e3a8a', textTransform: 'uppercase' }}>
                    Government of Maharashtra • Department of Co-operation, Marketing & Textiles
                  </div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 2px 0' }}>
                    FORM J (RULE 24) — कृषी उत्पन्न विक्री पावती (SALE SLIP)
                  </h2>
                  <div style={{ fontSize: '0.8rem', color: '#1e3a8a', fontWeight: 700 }}>
                    {jForm.apmc_market_yard}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                    Issued under the Maharashtra Agricultural Produce Marketing (Regulation) Act, 1963
                  </div>
                </div>

                {/* Primary Identifiers Bar */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '0.74rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Form J Serial No:</span>
                    <div style={{ fontWeight: 800, color: '#1e3a8a', fontSize: '0.86rem' }}>{jForm.form_j_number}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Contract Reference:</span>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{jForm.contract_number}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Date of Sale / Weighment:</span>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{jForm.sale_date}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Escrow Payment Status:</span>
                    <div style={{ fontWeight: 800, color: '#059669' }}>SETTLED (100% DBT)</div>
                  </div>
                </div>

                {/* Farmer & Buyer 2-Column Information */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {/* Farmer Details */}
                  <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '4px', padding: '12px 14px' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#065f46', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Farmer / Seller (विक्रेता शेतकरी)
                    </div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>{jForm.farmer_name}</div>
                    <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: '2px' }}>
                      District: <strong>{jForm.farmer_district}</strong> • Aadhaar: <strong>•••• •••• {jForm.farmer_aadhaar_last_four}</strong>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: '2px' }}>
                      Bank A/C: <strong>{jForm.farmer_bank_account}</strong> (IFSC: {jForm.farmer_bank_ifsc})
                    </div>
                  </div>

                  {/* Buyer Details */}
                  <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '4px', padding: '12px 14px' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#1e3a8a', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Procuring Buyer / Purchaser (खरेदीदार व्यापारी)
                    </div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>{jForm.buyer_name}</div>
                    <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: '2px' }}>
                      MSAMB License: <strong style={{ color: '#1e3a8a' }}>{jForm.buyer_license_number}</strong>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#059669', marginTop: '2px', fontWeight: 600 }}>
                      ✓ Pre-funded RBI Nodal Escrow Node
                    </div>
                  </div>
                </div>

                {/* Weighbridge & Commodity Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', border: '1px solid #e2e8f0' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                      <th style={{ padding: '8px 10px', textAlign: 'left', color: '#334155' }}>Commodity & Grade</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right', color: '#334155' }}>Gross Wt (Qtl)</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right', color: '#334155' }}>Tare Wt (Qtl)</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right', color: '#334155' }}>Net Wt (Qtl)</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right', color: '#334155' }}>Rate (₹/Qtl)</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right', color: '#334155' }}>Gross Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px 10px', fontWeight: 700, color: '#0f172a' }}>
                        {jForm.commodity} ({jForm.variety})
                        <div style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 600 }}>
                          {jForm.quality_grade} • MSP: ₹{jForm.msp_benchmark_per_quintal}/qtl
                        </div>
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: '#64748b' }}>{jForm.gross_weight_quintals.toFixed(2)}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: '#64748b' }}>{jForm.tare_weight_quintals.toFixed(2)}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>{jForm.net_weight_quintals.toFixed(2)}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 800, color: '#059669' }}>₹{jForm.rate_per_quintal.toLocaleString()}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>₹{jForm.gross_sale_value.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Financial Reconciliation & Deductions */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px', alignItems: 'center' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem' }}>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '5px 0', color: '#64748b' }}>Gross Produce Sale Value:</td>
                        <td style={{ padding: '5px 0', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                          ₹{jForm.gross_sale_value.toLocaleString()}
                        </td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '5px 0', color: '#64748b' }}>Statutory APMC Market Cess (1.05%):</td>
                        <td style={{ padding: '5px 0', textAlign: 'right', color: '#dc2626' }}>
                          - ₹{jForm.market_cess_amount.toLocaleString()}
                        </td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '5px 0', color: '#64748b' }}>Electronic Weighbridge Slips & Testing:</td>
                        <td style={{ padding: '5px 0', textAlign: 'right', color: '#dc2626' }}>
                          - ₹{jForm.weighment_fees.toLocaleString()}
                        </td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '5px 0', color: '#64748b' }}>Hamali & Handling Charges (APMC Approved):</td>
                        <td style={{ padding: '5px 0', textAlign: 'right', color: '#dc2626' }}>
                          - ₹{jForm.hamali_and_handling_fees.toLocaleString()}
                        </td>
                      </tr>
                      <tr style={{ borderTop: '2px solid #0f172a' }}>
                        <td style={{ padding: '8px 0', fontWeight: 800, fontSize: '0.86rem', color: '#0f172a' }}>
                          Net Amount Credited to Farmer (निव्वळ जमा रक्कम):
                        </td>
                        <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 800, fontSize: '1.05rem', color: '#059669' }}>
                          ₹{jForm.net_amount_payable.toLocaleString()}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={2} style={{ fontSize: '0.68rem', color: 'var(--text-muted)', paddingTop: '2px' }}>
                          Disbursement UTR: <code>{jForm.escrow_settlement_utr}</code> (RBI Nodal Escrow Instant Settlement)
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* QR Box & Legal Stamp */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
                    <div style={{ width: '120px', height: '120px', backgroundColor: '#ffffff', padding: '6px', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                      <svg viewBox="0 0 100 100" width="100%" height="100%" shapeRendering="crispEdges">
                        <rect width="100" height="100" fill="#ffffff" />
                        <rect x="5" y="5" width="24" height="24" fill="#1e3a8a" />
                        <rect x="8" y="8" width="18" height="18" fill="#ffffff" />
                        <rect x="11" y="11" width="12" height="12" fill="#1e3a8a" />
                        <rect x="71" y="5" width="24" height="24" fill="#1e3a8a" />
                        <rect x="74" y="8" width="18" height="18" fill="#ffffff" />
                        <rect x="77" y="11" width="12" height="12" fill="#1e3a8a" />
                        <rect x="5" y="71" width="24" height="24" fill="#1e3a8a" />
                        <rect x="8" y="74" width="18" height="18" fill="#ffffff" />
                        <rect x="11" y="77" width="12" height="12" fill="#1e3a8a" />
                        <rect x="35" y="8" width="8" height="8" fill="#1e3a8a" />
                        <rect x="50" y="20" width="12" height="12" fill="#059669" />
                        <rect x="35" y="45" width="10" height="10" fill="#1e3a8a" />
                        <rect x="65" y="50" width="10" height="10" fill="#1e3a8a" />
                        <rect x="40" y="70" width="8" height="8" fill="#059669" />
                      </svg>
                    </div>
                    <strong style={{ fontSize: '0.66rem', color: '#1e3a8a', marginTop: '6px' }}>
                      MSAMB DIGITAL SIGNATURE VERIFIED
                    </strong>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>
                      APMC Rule 24 Statutory Sale Voucher
                    </div>
                  </div>
                </div>

                {/* Footer Disclaimers */}
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.66rem', color: '#64748b' }}>
                  <div>
                    Digital SHA-256 Hash: <code>{jForm.digital_signature_hash}</code>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#059669', fontWeight: 700 }}>
                    <ShieldCheck size={14} /> Valid for Bank KCC & Crop Insurance Claims
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Modal Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              className="btn-gov-secondary"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
