import React, { useState } from 'react';
import { 
  Warehouse, ShieldCheck, CheckCircle2, 
  X, Printer, Percent, Banknote, Sparkles
} from 'lucide-react';
import { api, type ENWRPledgeLoanApplication } from '../services/api';
import { type Language } from '../utils/i18n';

interface ENWRPledgeLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
  currentUser?: any;
  initialCommodity?: string;
  initialQuantity?: number;
  initialPrice?: number;
  initialWarehouseName?: string;
}

export const ENWRPledgeLoanModal: React.FC<ENWRPledgeLoanModalProps> = ({
  isOpen,
  onClose,
  lang = 'EN',
  currentUser,
  initialCommodity = 'Soybean',
  initialQuantity = 120,
  initialPrice = 4900,
  initialWarehouseName = 'Maharashtra State Warehousing Corp (MSWC) Nodal Depot'
}) => {
  const isMarathi = lang === 'MR';

  const [commodity, setCommodity] = useState<string>(initialCommodity);
  const [variety] = useState<string>('JS-335 Grade A');
  const [quantity, setQuantity] = useState<number | ''>(initialQuantity);
  const [modalPrice, setModalPrice] = useState<number | ''>(initialPrice);
  const [warehouseName, setWarehouseName] = useState<string>(initialWarehouseName);
  const [tenureDays, setTenureDays] = useState<number>(45);
  const [farmerName, setFarmerName] = useState<string>(currentUser?.name || '');
  const [farmerPhone, setFarmerPhone] = useState<string>(currentUser?.phone || '');
  const [bankAccount, setBankAccount] = useState<string>('');
  const [bankIfsc, setBankIfsc] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [approvedLoan, setApprovedLoan] = useState<ENWRPledgeLoanApplication | null>(null);

  React.useEffect(() => {
    if (currentUser?.name && !farmerName) {
      setFarmerName(currentUser.name);
    }
    if (currentUser?.phone && !farmerPhone) {
      setFarmerPhone(currentUser.phone);
    }
  }, [currentUser]);

  // Calculations
  const qty = Number(quantity) || 120;
  const rate = Number(modalPrice) || 4900;
  const grossVal = qty * rate;
  const ltv = 70; // 70% statutory LTV against e-NWR
  const sanctionAmt = Math.round(grossVal * (ltv / 100));
  const interestRate = 7.0; // 7% p.a. concessional rate under Maharashtra subvention
  const interestCost = Math.round((sanctionAmt * (interestRate / 100) * tenureDays) / 365);
  const warehouseStorageCost = Math.round(qty * 0.40 * tenureDays); // ₹0.40 / qtl / day
  const projectedFutureRate = Math.round(rate * (1 + 0.078 * (tenureDays / 45))); // Expected gain scaled by tenure (benchmark: +7.8% per 45 days)
  const futureGrossVal = qty * projectedFutureRate;
  const grossHoldingGain = futureGrossVal - grossVal;
  const netFarmerAdvantage = grossHoldingGain - interestCost - warehouseStorageCost;

  const handleApplyLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const loan = await api.applyForENWRLoan({
        farmer_id: currentUser?.id,
        farmer_name: farmerName || currentUser?.name || 'Registered Farmer',
        farmer_phone: farmerPhone || currentUser?.phone || '',
        farmer_bank_account: bankAccount || 'DBT Direct Account',
        farmer_bank_ifsc: bankIfsc || 'SBIN0001429',
        farmer_district: currentUser?.district || 'Nashik',
        commodity,
        variety,
        quantity_quintals: qty,
        modal_price_per_qtl: rate,
        gross_valuation: grossVal,
        loan_ltv_percent: ltv,
        sanctioned_loan_amount: sanctionAmt,
        annual_interest_rate_percent: interestRate,
        tenure_days: tenureDays,
        warehouse_name: warehouseName,
        lending_partner: 'Maharashtra State Co-operative Bank (NABARD Refinance Gateway)'
      });
      setApprovedLoan(loan);
    } catch (err: any) {
      console.error('Error applying for e-NWR pledge loan:', err);
      alert('Failed to process pledge loan: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

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
          maxWidth: '780px',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div style={{
          backgroundColor: '#064e3b',
          background: 'linear-gradient(135deg, #04362a 0%, #064e3b 50%, #065f46 100%)',
          padding: '20px 24px',
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
              backgroundColor: '#34d399', 
              color: '#064e3b', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Warehouse size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ 
                  backgroundColor: '#34d399', 
                  color: '#064e3b', 
                  fontSize: '0.66rem', 
                  fontWeight: 800, 
                  padding: '2px 8px', 
                  borderRadius: '4px',
                  textTransform: 'uppercase' 
                }}>
                  WDRA & NABARD ACCREDITED
                </span>
                <span style={{ fontSize: '0.72rem', color: '#a7f3d0' }}>
                  {isMarathi ? 'महाराष्ट्र शासन व्याज सवलत योजना' : 'Govt. of Maharashtra 7% Subvention Scheme'}
                </span>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', margin: '4px 0 0 0' }}>
                {isMarathi ? 'e-NWR गोदाम पावती तारण कर्ज (Instant Liquidity)' : 'e-NWR Warehouse Receipt Pledge Financing'}
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
          
          {approvedLoan ? (
            /* Loan Approved Certificate View */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ 
                backgroundColor: '#ecfdf5', 
                border: '1px solid #a7f3d0', 
                borderRadius: 'var(--radius-sm)', 
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#059669', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.05rem', color: '#065f46', margin: 0, fontWeight: 800 }}>
                    {isMarathi ? 'तारण कर्ज मंजूर! रक्कम खात्यात त्वरित जमा' : 'e-NWR Pledge Loan Approved & DBT Disbursed!'}
                  </h4>
                  <div style={{ fontSize: '0.78rem', color: '#047857', marginTop: '3px' }}>
                    UTR #{approvedLoan.disbursement_utr} • ₹{approvedLoan.sanctioned_loan_amount.toLocaleString()} credited to Account {approvedLoan.farmer_bank_account}
                  </div>
                </div>
              </div>

              {/* Printable Sanction Certificate */}
              <div 
                id="enwr-sanction-certificate"
                style={{
                  border: '2px solid #065f46',
                  borderRadius: 'var(--radius-sm)',
                  padding: '24px',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}
              >
                <div style={{ textAlign: 'center', borderBottom: '2px solid #065f46', paddingBottom: '12px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#065f46', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Warehousing Development and Regulatory Authority (WDRA) • Government of India
                  </div>
                  <h3 style={{ fontSize: '1.18rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 2px' }}>
                    ELECTRONIC NEGOTIABLE WAREHOUSE RECEIPT (e-NWR) & PLEDGE SANCTION MEMO
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                    Issued under the Warehousing (Development and Regulation) Act, 2007 • Bank Ref: MSCB/WDRA/2026
                  </div>
                </div>

                {/* Identifiers Strip */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '0.76rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>e-NWR Receipt No:</span>
                    <div style={{ fontWeight: 800, color: '#065f46', fontSize: '0.88rem' }}>{approvedLoan.enwr_receipt_number}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Disbursed Loan Amount:</span>
                    <div style={{ fontWeight: 800, color: '#059669', fontSize: '0.92rem' }}>₹{approvedLoan.sanctioned_loan_amount.toLocaleString()}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Subsidized Interest:</span>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{approvedLoan.annual_interest_rate_percent}% p.a. (7% Cap)</div>
                  </div>
                </div>

                {/* 2-Column Table + QR */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px', alignItems: 'center' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '5px 0', color: '#64748b', fontWeight: 600 }}>Farmer / Beneficiary:</td>
                        <td style={{ padding: '5px 0', color: '#0f172a', fontWeight: 700 }}>{approvedLoan.farmer_name}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '5px 0', color: '#64748b', fontWeight: 600 }}>Commodity & Variety:</td>
                        <td style={{ padding: '5px 0', color: '#0f172a', fontWeight: 700 }}>{approvedLoan.commodity} ({approvedLoan.variety})</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '5px 0', color: '#64748b', fontWeight: 600 }}>Pledged Quantity:</td>
                        <td style={{ padding: '5px 0', color: '#0f172a', fontWeight: 700 }}>{approvedLoan.quantity_quintals} Quintals ({(approvedLoan.quantity_quintals / 10).toFixed(1)} MT)</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '5px 0', color: '#64748b', fontWeight: 600 }}>Accredited Warehouse:</td>
                        <td style={{ padding: '5px 0', color: '#0f172a' }}>{approvedLoan.warehouse_name}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '5px 0', color: '#64748b', fontWeight: 600 }}>Total Produce Valuation:</td>
                        <td style={{ padding: '5px 0', color: '#0f172a', fontWeight: 700 }}>₹{approvedLoan.gross_valuation.toLocaleString()} (@ ₹{approvedLoan.modal_price_per_qtl}/qtl)</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '5px 0', color: '#64748b', fontWeight: 600 }}>Lending Bank Partner:</td>
                        <td style={{ padding: '5px 0', color: '#065f46', fontWeight: 600 }}>{approvedLoan.lending_partner}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '5px 0', color: '#64748b', fontWeight: 600 }}>Pledge Tenure:</td>
                        <td style={{ padding: '5px 0', color: '#0f172a' }}>{approvedLoan.tenure_days} Days (Auto-repayable upon Escrow Sale)</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* QR Box */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px dashed #cbd5e1' }}>
                    <div style={{ width: '120px', height: '120px', backgroundColor: '#ffffff', padding: '6px', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                      <svg viewBox="0 0 100 100" width="100%" height="100%" shapeRendering="crispEdges">
                        <rect width="100" height="100" fill="#ffffff" />
                        <rect x="5" y="5" width="24" height="24" fill="#065f46" />
                        <rect x="8" y="8" width="18" height="18" fill="#ffffff" />
                        <rect x="11" y="11" width="12" height="12" fill="#065f46" />
                        <rect x="71" y="5" width="24" height="24" fill="#065f46" />
                        <rect x="74" y="8" width="18" height="18" fill="#ffffff" />
                        <rect x="77" y="11" width="12" height="12" fill="#065f46" />
                        <rect x="5" y="71" width="24" height="24" fill="#065f46" />
                        <rect x="8" y="74" width="18" height="18" fill="#ffffff" />
                        <rect x="11" y="77" width="12" height="12" fill="#065f46" />
                        <rect x="35" y="15" width="8" height="8" fill="#065f46" />
                        <rect x="50" y="25" width="10" height="10" fill="#059669" />
                        <rect x="35" y="45" width="10" height="10" fill="#065f46" />
                        <rect x="65" y="50" width="12" height="12" fill="#059669" />
                        <rect x="40" y="70" width="8" height="8" fill="#065f46" />
                        <rect x="60" y="75" width="10" height="10" fill="#065f46" />
                      </svg>
                    </div>
                    <strong style={{ fontSize: '0.66rem', color: '#065f46', marginTop: '6px' }}>
                      WDRA REPOSITORY VERIFIED
                    </strong>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>
                      Govt Central e-NWR Database
                    </div>
                  </div>
                </div>

                {/* Footer Stamp */}
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.68rem', color: '#64748b' }}>
                  <div>Security Token: <code>WDRA-VERIFIED-PLEDGE-SHA256</code></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#059669', fontWeight: 700 }}>
                    <ShieldCheck size={14} /> Legally Enforceable Warehouse Receipt
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn-gov-secondary"
                  onClick={() => window.print()}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Printer size={15} /> Print e-NWR Certificate (A4)
                </button>
                <button
                  type="button"
                  className="btn-gov-primary"
                  onClick={onClose}
                  style={{ backgroundColor: '#059669' }}
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Interactive Application Form & Economics Preview */
            <form onSubmit={handleApplyLoan} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Distress Sale Problem Solved Banner */}
              <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 'var(--radius-sm)', padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e3a8a', fontWeight: 700, fontSize: '0.86rem' }}>
                  <Percent size={16} /> {isMarathi ? 'अडचणीच्या विक्रीपासून संरक्षण (Eliminate Distress Selling)' : 'Instant Post-Harvest Cashflow without Selling Produce'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#1d4ed8', marginTop: '3px', lineHeight: 1.4 }}>
                  {isMarathi 
                    ? 'पिकाचे भाव कमी असताना माल विकण्याची गरज नाही. गोदामात माल ठेवून ७०% रक्कम त्वरित कर्ज स्वरूपात ७% सवलतीच्या व्याजाने मिळवा.'
                    : 'Avoid selling immediately at harvest-trough prices. Deposit your harvest in a WDRA godown, receive 70% instant bank liquidity via DBT today, and sell when prices peak.'}
                </div>
              </div>

              {/* Produce & Warehouse Inputs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a', marginBottom: '4px', display: 'block' }}>
                    Commodity / Crop:
                  </label>
                  <select 
                    value={commodity} 
                    onChange={(e) => setCommodity(e.target.value)}
                    style={{ width: '100%', padding: '8px', fontSize: '0.82rem' }}
                  >
                    <option value="Soybean">Soybean (सोयाबीन)</option>
                    <option value="Onion">Onion (कांदा)</option>
                    <option value="Cotton">Cotton (कापूस)</option>
                    <option value="Wheat">Wheat (गहू)</option>
                    <option value="Gram">Gram / Chana (हरभरा)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a', marginBottom: '4px', display: 'block' }}>
                    Quantity (Quintals):
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                    min={10}
                    step={5}
                    required
                    style={{ fontSize: '0.86rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a', marginBottom: '4px', display: 'block' }}>
                    Current Mandi Spot Rate (₹/qtl):
                  </label>
                  <input
                    type="number"
                    value={modalPrice}
                    onChange={(e) => setModalPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    min={500}
                    step={10}
                    required
                    style={{ fontSize: '0.86rem' }}
                  />
                </div>
              </div>

              {/* Warehouse & Holding Tenure */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a', marginBottom: '4px', display: 'block' }}>
                    Select WDRA Accredited Storage Hub:
                  </label>
                  <select
                    value={warehouseName}
                    onChange={(e) => setWarehouseName(e.target.value)}
                    style={{ width: '100%', padding: '8px', fontSize: '0.8rem' }}
                  >
                    <option value="Maharashtra State Warehousing Corp (MSWC) Latur Hub">Maharashtra State Warehousing Corp (MSWC) Latur Hub</option>
                    <option value="Sahyadri Mega Agro-Processing & Cold Chain, Dindori">Sahyadri Mega Agro-Processing & Cold Chain, Dindori</option>
                    <option value="Pune Gultekdi Modern APMC Silo Terminal">Pune Gultekdi Modern APMC Silo Terminal</option>
                    <option value="Central Warehousing Corporation (CWC) Amravati Godown">Central Warehousing Corporation (CWC) Amravati Godown</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a', marginBottom: '4px', display: 'block' }}>
                    Pledge Loan Tenure:
                  </label>
                  <select
                    value={tenureDays}
                    onChange={(e) => setTenureDays(Number(e.target.value))}
                    style={{ width: '100%', padding: '8px', fontSize: '0.8rem' }}
                  >
                    <option value={30}>30 Days (Short-term)</option>
                    <option value={45}>45 Days (Recommended Peak Window)</option>
                    <option value={60}>60 Days (Medium-term)</option>
                    <option value={90}>90 Days (Off-season Peak)</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Financial Simulation Box */}
              <div style={{ 
                backgroundColor: '#f8fafc', 
                border: '1px solid #e2e8f0', 
                borderRadius: 'var(--radius-sm)', 
                padding: '16px' 
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#065f46', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} /> Instant Liquidity & Net Profit Simulator
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                  <div style={{ backgroundColor: '#ffffff', padding: '10px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>Total Crop Value</div>
                    <strong style={{ fontSize: '0.94rem', color: '#0f172a' }}>₹{grossVal.toLocaleString()}</strong>
                    <div style={{ fontSize: '0.62rem', color: '#64748b' }}>{qty} Qtl @ ₹{rate}/qtl</div>
                  </div>

                  <div style={{ backgroundColor: '#ecfdf5', padding: '10px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                    <div style={{ fontSize: '0.66rem', color: '#047857' }}>70% Instant DBT Loan</div>
                    <strong style={{ fontSize: '1.05rem', color: '#059669' }}>₹{sanctionAmt.toLocaleString()}</strong>
                    <div style={{ fontSize: '0.62rem', color: '#047857' }}>Disbursed in 2 Hours</div>
                  </div>

                  <div style={{ backgroundColor: '#ffffff', padding: '10px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>Interest Cost ({tenureDays}d)</div>
                    <strong style={{ fontSize: '0.94rem', color: '#b45309' }}>₹{interestCost.toLocaleString()}</strong>
                    <div style={{ fontSize: '0.62rem', color: '#64748b' }}>7.0% Subsidized Cap</div>
                  </div>

                  <div style={{ backgroundColor: '#f0fdf4', padding: '10px', borderRadius: '4px', border: '1px solid #bbf7d0' }}>
                    <div style={{ fontSize: '0.66rem', color: '#065f46' }}>Net Extra Gain vs Selling</div>
                    <strong style={{ fontSize: '1.05rem', color: '#065f46' }}>+₹{netFarmerAdvantage.toLocaleString()}</strong>
                    <div style={{ fontSize: '0.62rem', color: '#047857' }}>Net Alpha after all costs</div>
                  </div>
                </div>
              </div>

              {/* Farmer Bank Details */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a', marginBottom: '4px', display: 'block' }}>
                    {isMarathi ? 'शेतकऱ्याचे संपूर्ण नाव:' : 'Farmer Full Name:'}
                  </label>
                  <input
                    type="text"
                    value={farmerName}
                    placeholder={isMarathi ? 'शेतकऱ्याचे नाव टाका' : 'Enter farmer full name'}
                    onChange={(e) => setFarmerName(e.target.value)}
                    required
                    style={{ fontSize: '0.84rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a', marginBottom: '4px', display: 'block' }}>
                    {isMarathi ? 'मोबाईल नंबर:' : 'Mobile Number:'}
                  </label>
                  <input
                    type="text"
                    value={farmerPhone}
                    placeholder={isMarathi ? '१० अंकी मोबाईल नंबर' : 'Enter 10-digit mobile number'}
                    onChange={(e) => setFarmerPhone(e.target.value)}
                    required
                    style={{ fontSize: '0.84rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a', marginBottom: '4px', display: 'block' }}>
                    {isMarathi ? 'बँक खाते क्रमांक (DBT):' : 'Bank Account (DBT Linked):'}
                  </label>
                  <input
                    type="text"
                    value={bankAccount}
                    placeholder={isMarathi ? 'बँक खाते क्रमांक टाका' : 'Enter bank account number'}
                    onChange={(e) => setBankAccount(e.target.value)}
                    required
                    style={{ fontSize: '0.84rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a', marginBottom: '4px', display: 'block' }}>
                    {isMarathi ? 'बँक IFSC कोड:' : 'Bank IFSC Code:'}
                  </label>
                  <input
                    type="text"
                    value={bankIfsc}
                    placeholder="e.g. SBIN0001429"
                    onChange={(e) => setBankIfsc(e.target.value)}
                    required
                    style={{ fontSize: '0.84rem', fontFamily: 'monospace' }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  className="btn-gov-secondary"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-gov-primary"
                  style={{ backgroundColor: '#059669', display: 'flex', alignItems: 'center', gap: '8px' }}
                  disabled={isSubmitting}
                >
                  <Banknote size={16} />
                  {isSubmitting 
                    ? (isMarathi ? 'कर्ज मंजूर करत आहे...' : 'Sanctioning e-NWR Loan...') 
                    : (isMarathi ? '७०% तारण कर्ज मिळवा (Disburse Loan)' : `Confirm e-NWR & Disburse ₹${sanctionAmt.toLocaleString()}`)}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
