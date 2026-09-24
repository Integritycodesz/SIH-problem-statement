import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  QrCode, 
  Printer, 
  X, 
  Scale
} from 'lucide-react';
import type { DigitalGatePass, GatePassStatus } from '../types';
import { INITIAL_GATE_PASSES } from '../utils/gatePass';
import { type Language } from '../utils/i18n';

interface DigitalGatePassModalProps {
  isOpen: boolean;
  onClose: () => void;
  gatePass?: DigitalGatePass;
  contractNumber?: string;
  lang: Language;
}

export const DigitalGatePassModal: React.FC<DigitalGatePassModalProps> = ({
  isOpen,
  onClose,
  gatePass,
  contractNumber,
  lang
}) => {
  const isMr = lang === 'MR';
  const [activePass, setActivePass] = useState<DigitalGatePass>(() => {
    return gatePass || INITIAL_GATE_PASSES[0];
  });

  useEffect(() => {
    if (gatePass) {
      setActivePass(gatePass);
    }
  }, [gatePass]);

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

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status: GatePassStatus) => {
    switch (status) {
      case 'PAYMENT_TRIGGERED':
      case 'COMPLETED':
        return { labelEn: 'MILL WEIGHED & ESCROW RELEASED', labelMr: 'वजन पूर्ण व रक्कम वितरीत', bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' };
      case 'QUALITY_ASSAYED':
        return { labelEn: 'QUALITY ASSAYED (PENDING TARE)', labelMr: 'गुणवत्ता तपासणी पूर्ण (रिकामे वजन बाकी)', bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' };
      case 'GROSS_WEIGHED':
        return { labelEn: 'GROSS WEIGHT RECORDED', labelMr: 'एकूण वजन नोंदवले', bg: '#fef3c7', text: '#d97706', border: '#fde68a' };
      case 'AT_MILL_GATE':
        return { labelEn: 'AT MILL GATE (AWAITING WEIGHMENT)', labelMr: 'मिल गेटवर उपस्थित (वजनाची प्रतीक्षा)', bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' };
      default:
        return { labelEn: 'GATE PASS ACTIVE', labelMr: 'गेट पास सक्रिय', bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' };
    }
  };

  const statusBadge = getStatusBadge(activePass.status);
  const displayContractNumber = contractNumber || activePass.contract_number;

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
          maxWidth: '840px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
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
              backgroundColor: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <QrCode size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
                  {isMr ? 'अधिकृत डिजिटल ई-गेट पास व वजन पावती' : 'Digital e-Gate Pass & Weighbridge Token'}
                </h3>
                <span style={{
                  backgroundColor: '#064e3b',
                  color: '#6ee7b7',
                  border: '1px solid #059669',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}>
                  PHASE 4 APMC GATE PASS
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
                {isMr 
                  ? 'थेट प्रक्रिया केंद्र किंवा मिल गेटवर क्यूआर स्कॅन करून थेट वजनकाटा व एस्क्रो पेमेंट अनलॉक करा' 
                  : 'Fast-track QR scan entry at processing mill weighbridges with instantaneous escrow release'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="no-print">
            <button
              onClick={handlePrint}
              style={{
                backgroundColor: '#059669',
                color: '#ffffff',
                border: 'none',
                padding: '6px 14px',
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
              <span>{isMr ? 'गेट पास प्रिंट करा' : 'Print Gate Pass'}</span>
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
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {/* Official Pass Document Container */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '2px solid #0f172a',
            borderRadius: '12px',
            padding: '20px',
            position: 'relative'
          }}>
            {/* Gov Header Strip */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '2px solid #0f172a',
              paddingBottom: '12px',
              marginBottom: '16px'
            }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#047857', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  GOVERNMENT OF MAHARASHTRA • MSAMB E-MARKETING PORTAL
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: '2px 0' }}>
                  DIGITAL MILL GATE ENTRY & WEIGHMENT PASS
                </h2>
                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  Contract Ref: <strong>{displayContractNumber}</strong> • Gate Pass No: <strong style={{ color: '#059669' }}>{activePass.pass_number}</strong>
                </div>
              </div>

              {/* Status Badge */}
              <div style={{
                backgroundColor: statusBadge.bg,
                color: statusBadge.text,
                border: `1px solid ${statusBadge.border}`,
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 800,
                textAlign: 'right'
              }}>
                {isMr ? statusBadge.labelMr : statusBadge.labelEn}
              </div>
            </div>

            {/* QR Code and Key Details Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '160px 1fr',
              gap: '20px',
              alignItems: 'center',
              marginBottom: '20px',
              backgroundColor: '#f8fafc',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              {/* Visual Simulated QR Code */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '2px solid #0f172a',
                borderRadius: '8px',
                padding: '8px',
                textAlign: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                {/* SVG QR Code Pattern */}
                <svg viewBox="0 0 100 100" style={{ width: '100%', height: 'auto', display: 'block' }}>
                  <rect width="100" height="100" fill="#ffffff" />
                  {/* Position squares */}
                  <rect x="5" y="5" width="25" height="25" fill="#0f172a" />
                  <rect x="8" y="8" width="19" height="19" fill="#ffffff" />
                  <rect x="11" y="11" width="13" height="13" fill="#0f172a" />
                  
                  <rect x="70" y="5" width="25" height="25" fill="#0f172a" />
                  <rect x="73" y="8" width="19" height="19" fill="#ffffff" />
                  <rect x="76" y="11" width="13" height="13" fill="#0f172a" />

                  <rect x="5" y="70" width="25" height="25" fill="#0f172a" />
                  <rect x="8" y="73" width="19" height="19" fill="#ffffff" />
                  <rect x="11" y="76" width="13" height="13" fill="#0f172a" />

                  {/* QR Data Dots */}
                  <rect x="35" y="10" width="6" height="6" fill="#059669" />
                  <rect x="45" y="15" width="6" height="6" fill="#0f172a" />
                  <rect x="55" y="8" width="6" height="6" fill="#059669" />
                  <rect x="10" y="38" width="6" height="6" fill="#0f172a" />
                  <rect x="22" y="45" width="6" height="6" fill="#059669" />
                  <rect x="35" y="35" width="30" height="30" fill="#0f172a" />
                  <rect x="42" y="42" width="16" height="16" fill="#ffffff" />
                  <rect x="47" y="47" width="6" height="6" fill="#059669" />
                  <rect x="72" y="40" width="6" height="6" fill="#0f172a" />
                  <rect x="82" y="48" width="6" height="6" fill="#059669" />
                  <rect x="38" y="75" width="6" height="6" fill="#0f172a" />
                  <rect x="50" y="82" width="6" height="6" fill="#059669" />
                  <rect x="62" y="72" width="6" height="6" fill="#0f172a" />
                  <rect x="75" y="80" width="15" height="6" fill="#0f172a" />
                </svg>
                <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#475569', marginTop: '4px' }}>
                  SCAN AT GATE / WEIGHBRIDGE
                </div>
              </div>

              {/* Truck & Consignment Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.8rem' }}>
                <div>
                  <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 700 }}>
                    {isMr ? 'शेतकरी / उत्पादक' : 'Farmer / FPO Consignor'}
                  </div>
                  <div style={{ fontWeight: 800, color: '#0f172a' }}>{activePass.farmer_name}</div>
                  <div style={{ fontSize: '0.72rem', color: '#475569' }}>{activePass.farmer_phone}</div>
                </div>

                <div>
                  <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 700 }}>
                    {isMr ? 'खरेदीदार मिल / प्रक्रिया केंद्र' : 'Institutional Buyer / Processing Mill'}
                  </div>
                  <div style={{ fontWeight: 800, color: '#0f172a' }}>{activePass.buyer_name}</div>
                  <div style={{ fontSize: '0.72rem', color: '#475569' }}>{activePass.destination_mill}</div>
                </div>

                <div>
                  <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 700 }}>
                    {isMr ? 'वाहन क्र. व चालक' : 'Vehicle & Driver'}
                  </div>
                  <div style={{ fontWeight: 800, color: '#059669' }}>{activePass.truck_number}</div>
                  <div style={{ fontSize: '0.72rem', color: '#475569' }}>{activePass.driver_name} ({activePass.driver_phone})</div>
                </div>

                <div>
                  <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 700 }}>
                    {isMr ? 'शेतमाल व अंदाजित वजन' : 'Commodity & Estimated Lot'}
                  </div>
                  <div style={{ fontWeight: 800, color: '#0f172a' }}>{activePass.commodity} ({activePass.variety})</div>
                  <div style={{ fontSize: '0.72rem', color: '#475569' }}>Estimated: <strong>{activePass.estimated_quantity_quintals} Qtl</strong></div>
                </div>
              </div>
            </div>

            {/* Weighbridge Measured Weights & Refraction Table */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <Scale size={16} color="#059669" />
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {isMr ? 'वजनकाटा व प्रयोगशाळा तपासणी तपशील' : 'Official Mill Weighbridge & Quality Assay Readings'}
                </h4>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', border: '1px solid #cbd5e1' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1', textAlign: 'left', color: '#475569' }}>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>{isMr ? 'मापदंड' : 'Measurement Parameter'}</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>{isMr ? 'नोंदवलेले मूल्य' : 'Recorded Value'}</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>{isMr ? 'मानक मर्यादा' : 'Permissible Standard'}</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>{isMr ? 'अपवर्तन कपात (Refraction)' : 'Refraction Impact'}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1' }}><strong>Gross Weight (भरलेला ट्रक)</strong></td>
                    <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1', fontWeight: 800 }}>{activePass.gross_weight_kg.toLocaleString('en-IN')} kg</td>
                    <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1', color: '#64748b' }}>Weighbridge In</td>
                    <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1', color: '#64748b' }}>Scale 1</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1' }}><strong>Tare Weight (रिकामे वाहन)</strong></td>
                    <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1', fontWeight: 800 }}>{activePass.tare_weight_kg.toLocaleString('en-IN')} kg</td>
                    <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1', color: '#64748b' }}>Weighbridge Out</td>
                    <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1', color: '#64748b' }}>Scale 2</td>
                  </tr>
                  <tr style={{ backgroundColor: '#f0fdf4' }}>
                    <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1' }}><strong>Net Produce Weight (निव्वळ शेतमाल)</strong></td>
                    <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1', fontWeight: 900, color: '#059669', fontSize: '0.85rem' }}>
                      {activePass.net_produce_kg.toLocaleString('en-IN')} kg ({activePass.net_produce_quintals} Qtl)
                    </td>
                    <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1', color: '#64748b' }}>Exact Net Weight</td>
                    <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1', fontWeight: 700, color: '#059669' }}>0 kg Tare Error</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1' }}>Tested Moisture (आर्द्रता)</td>
                    <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1', fontWeight: 700 }}>{activePass.tested_moisture_pct}%</td>
                    <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1', color: '#64748b' }}>≤ 12.0% Base</td>
                    <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1', color: '#059669', fontWeight: 700 }}>Optimal (0% Cut)</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1' }}>Foreign Matter (कचरा/माती)</td>
                    <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1', fontWeight: 700 }}>{activePass.tested_foreign_matter_pct}%</td>
                    <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1', color: '#64748b' }}>≤ 1.0% Base</td>
                    <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1', color: '#059669', fontWeight: 700 }}>Accepted (0% Cut)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Financial Settlement & Escrow Release Box */}
            <div style={{
              backgroundColor: '#f8fafc',
              border: '2px solid #059669',
              borderRadius: '8px',
              padding: '12px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>
                  {isMr ? 'एकूण देय रक्कम (रक्कम थेट बँक खात्यात)' : 'Final Produce Settlement Value (Escrow Auto-Disbursed)'}
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#047857' }}>
                  ₹{activePass.net_payable_amount.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#475569' }}>
                  50% Advance (₹{activePass.escrow_advance_deducted.toLocaleString('en-IN')}) + Final Released: <strong>₹{activePass.final_settlement_released.toLocaleString('en-IN')}</strong>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  {isMr ? 'वजनकाटा ऑपरेटर व टर्मिनल' : 'Weighbridge Certified By'}
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
                  {activePass.weighbridge_operator}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                  Terminal: {activePass.weighbridge_terminal_id}
                </div>
              </div>
            </div>

            {/* Security Cryptographic Watermark */}
            <div style={{
              borderTop: '1px dashed #cbd5e1',
              paddingTop: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.66rem',
              color: '#94a3b8'
            }}>
              <div>
                SHA256: <code>{activePass.security_hash.substring(0, 32)}...</code>
              </div>
              <div>
                MSAMB Timestamp: {activePass.gate_out_time || activePass.gate_in_time}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
