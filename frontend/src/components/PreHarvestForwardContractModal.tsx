import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Sprout, 
  Printer, 
  X, 
  FileText, 
  Scale
} from 'lucide-react';
import type { ForwardContractOffer } from '../types';
import { 
  INITIAL_FORWARD_CONTRACT_OFFERS, 
  simulateForwardContractPayout 
} from '../utils/forwardContracts';
import { type Language } from '../utils/i18n';

interface PreHarvestForwardContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer?: ForwardContractOffer;
  currentUser?: any;
  lang: Language;
}

export const PreHarvestForwardContractModal: React.FC<PreHarvestForwardContractModalProps> = ({
  isOpen,
  onClose,
  offer,
  currentUser,
  lang
}) => {
  const isMr = lang === 'MR';
  
  const [activeOffer, setActiveOffer] = useState<ForwardContractOffer>(() => {
    return offer || INITIAL_FORWARD_CONTRACT_OFFERS[0];
  });

  // Slider for simulated harvest spot price
  const [simulatedSpot, setSimulatedSpot] = useState<number>(activeOffer.pre_harvest_contract_price);
  const [committedQuantity, setCommittedQuantity] = useState<number>(100);
  const [activeTab, setActiveTab] = useState<'SIMULATOR' | 'FORM_C_AGREEMENT'>('SIMULATOR');

  useEffect(() => {
    if (offer) {
      setActiveOffer(offer);
      setSimulatedSpot(offer.pre_harvest_contract_price);
    }
  }, [offer]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.classList.add('has-print-modal');

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('has-print-modal');
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const simResult = simulateForwardContractPayout(
    activeOffer.pre_harvest_contract_price,
    activeOffer.cacp_msp_floor_price,
    simulatedSpot,
    activeOffer.upside_sharing_percent
  );

  const totalContractValue = committedQuantity * simResult.final_farmer_price_per_qtl;
  const sowingAdvanceInr = Math.round(totalContractValue * (activeOffer.sowing_advance_percent / 100));

  const handlePrint = () => {
    window.print();
  };

  const modalContent = (
    <div 
      className="refraction-print-modal"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '16px',
        overflowY: 'auto'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="refraction-print-card"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '920px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}
      >
        {/* Modal Header */}
        <div style={{
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #334155'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <Sprout size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
                  {isMr ? 'हंगामपूर्व आगाऊ करार व हमीभाव कॉरिडॉर' : 'Pre-Harvest Forward Contract & MSP Price Corridor'}
                </h3>
                <span style={{
                  backgroundColor: '#14532d',
                  color: '#86efac',
                  border: '1px solid #22c55e',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}>
                  PHASE 5 FORWARD SOURCING
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
                {isMr 
                  ? 'पेरणीपूर्वी निश्चित हमीभाव + बाजार भाव वाढल्यास ५०% नफा वाटणी + २०% आगाऊ बियाणे एस्क्रो' 
                  : 'Pre-sowing locked rate with 100% price crash protection, 50% upside sharing & 20% sowing input advance'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="no-print">
            <button
              onClick={() => setActiveTab(activeTab === 'SIMULATOR' ? 'FORM_C_AGREEMENT' : 'SIMULATOR')}
              style={{
                backgroundColor: activeTab === 'FORM_C_AGREEMENT' ? '#16a34a' : '#334155',
                color: '#ffffff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <FileText size={14} />
              <span>{activeTab === 'FORM_C_AGREEMENT' ? (isMr ? 'सिम्युलेटर पहा' : 'Back to Simulator') : (isMr ? 'फॉर्म सी करार पहा' : 'View Form C Agreement')}</span>
            </button>

            <button
              onClick={handlePrint}
              style={{
                backgroundColor: '#059669',
                color: '#ffffff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Printer size={14} />
              <span>{isMr ? 'प्रिंट करार' : 'Print Agreement'}</span>
            </button>

            <button
              onClick={onClose}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {activeTab === 'SIMULATOR' ? (
            <div>
              {/* Offer Summary Card */}
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 800, textTransform: 'uppercase' }}>
                      {activeOffer.company_name} • {activeOffer.season}
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', margin: '2px 0' }}>
                      {activeOffer.commodity} ({activeOffer.variety})
                    </h3>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      Delivery Window: <strong>{activeOffer.delivery_window_start} to {activeOffer.delivery_window_end}</strong>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>
                      {isMr ? 'निश्चित पूर्व-हंगाम करार दर' : 'Agreed Pre-Harvest Rate'}
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#15803d' }}>
                      ₹{activeOffer.pre_harvest_contract_price.toLocaleString('en-IN')} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>/ Qtl</span>
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 700 }}>
                      +₹{activeOffer.pre_harvest_contract_price - activeOffer.cacp_msp_floor_price} above CACP MSP (₹{activeOffer.cacp_msp_floor_price})
                    </div>
                  </div>
                </div>

                {/* Offer Feature Badges */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #86efac', padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700 }}>
                    🛡️ Zero Distress Sale Risk (MSP Guaranteed)
                  </span>
                  <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700 }}>
                    📈 50% Spot Upside Sharing
                  </span>
                  <span style={{ backgroundColor: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700 }}>
                    🌱 20% Sowing Seed Advance in Escrow
                  </span>
                </div>
              </div>

              {/* Interactive Price Corridor Simulation */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '2px solid #22c55e',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Scale size={18} color="#16a34a" />
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                      {isMr ? 'बाजार भाव चढ-उतार सिम्युलेटर (Price Corridor Testing)' : 'Harvest Spot Price Corridor Simulator'}
                    </h4>
                  </div>
                  <div style={{
                    backgroundColor: simResult.protection_mechanism === 'SPOT_UPSIDE_SHARED' ? '#dcfce7' : '#eff6ff',
                    color: simResult.protection_mechanism === 'SPOT_UPSIDE_SHARED' ? '#15803d' : '#1d4ed8',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 800
                  }}>
                    {simResult.protection_mechanism === 'SPOT_UPSIDE_SHARED' ? (isMr ? 'नफा वाटणी सक्रिय!' : '50% Upside Bonus Active!') : (isMr ? 'किमान भाव हमी लागू' : 'Floor Protection Active')}
                  </div>
                </div>

                <p style={{ fontSize: '0.76rem', color: '#475569', marginBottom: '16px' }}>
                  {isMr 
                    ? 'हंगामाच्या वेळी बाजार भाव कसाही बदलला (वाढला किंवा कोसळला) तरी शेतकऱ्याला कसा फायदा होतो हे तपासण्यासाठी खालील स्लायडर हलवा:' 
                    : 'Slide to test how the forward contract protects you if harvest spot prices crash or rewards you if prices surge:'}
                </p>

                {/* Slider */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 800, marginBottom: '6px' }}>
                    <span style={{ color: '#dc2626' }}>Severe Market Crash (₹3,800/Qtl)</span>
                    <span style={{ color: '#0f172a', fontSize: '1rem' }}>
                      Hypothetical Spot Price: <strong style={{ color: '#2563eb' }}>₹{simulatedSpot}/Qtl</strong>
                    </span>
                    <span style={{ color: '#16a34a' }}>Market Bull Rally (₹6,500/Qtl)</span>
                  </div>
                  <input
                    type="range"
                    min="3800"
                    max="6500"
                    step="50"
                    value={simulatedSpot}
                    onChange={(e) => setSimulatedSpot(Number(e.target.value))}
                    style={{ width: '100%', height: '8px', accentColor: '#16a34a', cursor: 'pointer' }}
                  />
                </div>

                {/* Simulation Dynamic Output Box */}
                <div style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '16px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '12px'
                }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>
                      {isMr ? 'शेतकऱ्याला मिळणारा अंतिम भाव' : 'Effective Realized Farmer Price'}
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#15803d' }}>
                      ₹{simResult.final_farmer_price_per_qtl.toLocaleString('en-IN')} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>/ Qtl</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 700 }}>
                      +₹{simResult.effective_gain_over_msp_per_qtl}/Qtl above MSP floor
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>
                      {isMr ? 'कायदेशीर विश्लेषण' : 'Statutory Protection Clause'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#1e293b', fontWeight: 600, lineHeight: 1.4 }}>
                      {isMr ? simResult.explanation_mr : simResult.explanation_en}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quantity Booking & Sowing Advance Calculation */}
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px',
                alignItems: 'center'
              }}>
                <div>
                  <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    {isMr ? 'हमी दिलेले उत्पादन वजन (क्विंटल):' : 'Committed Quantity to Book (Quintals):'}
                  </label>
                  <input
                    type="number"
                    min="20"
                    max="500"
                    step="10"
                    value={committedQuantity}
                    onChange={(e) => setCommittedQuantity(Math.max(10, Number(e.target.value)))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '1rem',
                      fontWeight: 800,
                      color: '#0f172a'
                    }}
                  />
                </div>

                <div>
                  <div style={{ fontSize: '0.7rem', color: '#b45309', fontWeight: 800, textTransform: 'uppercase' }}>
                    {isMr ? '२०% तात्काळ बियाणे/खत आगाऊ रक्कम' : '20% Immediate Sowing Input Advance'}
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#92400e' }}>
                    ₹{sowingAdvanceInr.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#78350f' }}>
                    Released to your bank on signing via SBI Agri-Escrow Node
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.7rem', color: '#15803d', fontWeight: 800, textTransform: 'uppercase' }}>
                    {isMr ? 'एकूण करार मूल्य' : 'Total Harvest Contract Value'}
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#14532d' }}>
                    ₹{totalContractValue.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#166534' }}>
                    Guaranteed seasonal procurement quota
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('FORM_C_AGREEMENT')}
                  style={{
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    fontSize: '0.86rem',
                    fontWeight: 900,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <FileText size={16} />
                  <span>{isMr ? 'फॉर्म सी करार तयार करा व स्वाक्षरी करा' : 'Generate & Sign Form C Contract'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Printable Form C Agreement */
            <div style={{
              backgroundColor: '#ffffff',
              border: '2px solid #0f172a',
              borderRadius: '8px',
              padding: '24px',
              fontFamily: 'serif',
              color: '#0f172a'
            }}>
              <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '12px', marginBottom: '16px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#475569' }}>
                  GOVERNMENT OF MAHARASHTRA • AGRICULTURE & CO-OPERATION DEPARTMENT
                </div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 900, margin: '4px 0', textTransform: 'uppercase' }}>
                  MODEL CONTRACT FARMING AGREEMENT (FORM C)
                </h2>
                <div style={{ fontSize: '0.78rem', color: '#334155' }}>
                  [Under Section 13(1) of the Maharashtra Agricultural Produce Marketing (Development & Regulation) Act]
                </div>
              </div>

              {/* Agreement Details */}
              <div style={{ fontSize: '0.82rem', lineHeight: 1.6, marginBottom: '16px' }}>
                <p>
                  This Pre-Harvest Forward Farming Agreement is entered into on this <strong>{new Date().toLocaleDateString('en-GB')}</strong> between <strong>{activeOffer.company_name}</strong> (hereinafter referred to as the <em>'Sponsor / Buyer'</em>) and <strong>{currentUser?.name || (isMr ? 'नोंदणीकृत शेतकरी' : 'Registered Farmer')}</strong> (hereinafter referred to as the <em>'Farmer / Producer'</em>).
                </p>

                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', padding: '12px', borderRadius: '6px', margin: '12px 0' }}>
                  <div><strong>1. Commodity & Variety:</strong> {activeOffer.commodity} ({activeOffer.variety}) - {activeOffer.season}</div>
                  <div><strong>2. Agreed Contract Volume:</strong> {committedQuantity} Quintals</div>
                  <div><strong>3. Base Guaranteed Forward Price:</strong> ₹{activeOffer.pre_harvest_contract_price} / Quintal (CACP MSP Floor: ₹{activeOffer.cacp_msp_floor_price}/Qtl)</div>
                  <div><strong>4. Upside Sharing Clause:</strong> In the event that the APMC benchmark price at delivery exceeds ₹{activeOffer.pre_harvest_contract_price}, 50% of the price premium shall be payable directly to the Farmer.</div>
                  <div><strong>5. Sowing Input Advance:</strong> 20% advance of ₹{sowingAdvanceInr.toLocaleString('en-IN')} deposited into SBI Dedicated Agri-Escrow Node upon signing.</div>
                  <div><strong>6. Delivery Center:</strong> {activeOffer.mill_delivery_center}</div>
                  <div><strong>7. Quality Specifications:</strong> {activeOffer.quality_specs_summary}</div>
                </div>

                <p style={{ fontSize: '0.75rem', color: '#475569' }}>
                  * This contract is legally protected under the State Dispute Settlement Authority. Neither party may default without invoking statutory mediation.
                </p>
              </div>

              {/* Signatures */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '40px', textAlign: 'center', fontSize: '0.78rem' }}>
                <div>
                  <div style={{ borderBottom: '1px solid #0f172a', height: '40px', marginBottom: '6px' }}></div>
                  <div><strong>Signature of Farmer / FPO Representative</strong></div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Aadhaar e-Signed via AgroConnect</div>
                </div>

                <div>
                  <div style={{ borderBottom: '1px solid #0f172a', height: '40px', marginBottom: '6px' }}></div>
                  <div><strong>Authorized Signatory for {activeOffer.company_name}</strong></div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Corporate APMC License #MH-MSAMB-TR-2024-8008</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
