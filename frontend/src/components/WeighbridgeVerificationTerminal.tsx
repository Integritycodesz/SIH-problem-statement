import React, { useState } from 'react';
import { 
  Scale, 
  CheckCircle2, 
  Zap, 
  FileText
} from 'lucide-react';
import type { DigitalGatePass } from '../types';
import { INITIAL_GATE_PASSES, computeWeighbridgeSettlement } from '../utils/gatePass';
import { type Language } from '../utils/i18n';

interface WeighbridgeVerificationTerminalProps {
  onOpenGatePassModal: (pass: DigitalGatePass) => void;
  lang: Language;
}

export const WeighbridgeVerificationTerminal: React.FC<WeighbridgeVerificationTerminalProps> = ({
  onOpenGatePassModal,
  lang
}) => {
  const isMr = lang === 'MR';
  
  // Selected gate pass for active weighbridge processing
  const [selectedPass, setSelectedPass] = useState<DigitalGatePass>(INITIAL_GATE_PASSES[1]); // Default to gp-war-3021 (in progress)
  
  // Weighbridge live state inputs
  const [grossWeightKg, setGrossWeightKg] = useState<number>(selectedPass.gross_weight_kg || 17200);
  const [tareWeightKg, setTareWeightKg] = useState<number>(selectedPass.tare_weight_kg || 9700);
  const [moisturePct, setMoisturePct] = useState<number>(selectedPass.tested_moisture_pct || 8.5);
  const [foreignMatterPct, setForeignMatterPct] = useState<number>(selectedPass.tested_foreign_matter_pct || 1.2);
  const [damagedPct, setDamagedPct] = useState<number>(selectedPass.tested_damaged_pct || 1.0);
  
  const [isProcessingSettlement, setIsProcessingSettlement] = useState(false);
  const [isSettlementComplete, setIsSettlementComplete] = useState(selectedPass.status === 'PAYMENT_TRIGGERED');

  // Compute live weighbridge settlement
  const settlement = computeWeighbridgeSettlement(
    grossWeightKg,
    tareWeightKg,
    selectedPass.base_price_per_quintal,
    selectedPass.commodity,
    moisturePct,
    foreignMatterPct,
    damagedPct,
    selectedPass.escrow_advance_deducted
  );

  const handleSelectPass = (pass: DigitalGatePass) => {
    setSelectedPass(pass);
    setGrossWeightKg(pass.gross_weight_kg);
    setTareWeightKg(pass.tare_weight_kg);
    setMoisturePct(pass.tested_moisture_pct);
    setForeignMatterPct(pass.tested_foreign_matter_pct);
    setDamagedPct(pass.tested_damaged_pct);
    setIsSettlementComplete(pass.status === 'PAYMENT_TRIGGERED');
  };

  const handleTriggerEscrowPayout = () => {
    setIsProcessingSettlement(true);
    setTimeout(() => {
      setIsProcessingSettlement(false);
      setIsSettlementComplete(true);
      
      const updatedPass: DigitalGatePass = {
        ...selectedPass,
        gross_weight_kg: grossWeightKg,
        tare_weight_kg: tareWeightKg,
        net_produce_kg: settlement.netProduceKg,
        net_produce_quintals: settlement.netProduceQuintals,
        tested_moisture_pct: moisturePct,
        tested_foreign_matter_pct: foreignMatterPct,
        tested_damaged_pct: damagedPct,
        refraction_deduction_amount: settlement.refractionDeductionInr,
        net_payable_amount: settlement.netPayableInr,
        final_settlement_released: settlement.finalSettlementReleasedInr,
        status: 'PAYMENT_TRIGGERED',
        gate_out_time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
      setSelectedPass(updatedPass);
    }, 1200);
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      marginBottom: '24px'
    }}>
      {/* Terminal Title */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        borderBottom: '1px solid #f1f5f9',
        paddingBottom: '16px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            backgroundColor: '#059669',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Scale size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                {isMr ? 'अधिकृत मिल गेट वजनकाटा ऑपरेटर टर्मिनल' : 'Official Mill Weighbridge & Escrow Settlement Terminal'}
              </h3>
              <span style={{
                backgroundColor: '#ecfdf5',
                color: '#059669',
                border: '1px solid #a7f3d0',
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '4px'
              }}>
                LIVE WEIGH-BAY 02
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0 0' }}>
              {isMr 
                ? 'काटा वजन, गुणवत्ता अपवर्तन आणि थेट ५०% उर्वरित एस्क्रो वाटप एका क्लिकवर' 
                : 'Direct dual-scale net weighment, statutory refraction cuts, and instant auto-release of remaining escrow'}
            </p>
          </div>
        </div>

        {/* Pass Switcher */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {INITIAL_GATE_PASSES.map((gp) => {
            const isSelected = selectedPass.id === gp.id;
            return (
              <button
                key={gp.id}
                type="button"
                onClick={() => handleSelectPass(gp)}
                style={{
                  backgroundColor: isSelected ? '#0f172a' : '#f8fafc',
                  color: isSelected ? '#ffffff' : '#475569',
                  border: isSelected ? '1px solid #0f172a' : '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {gp.truck_number} ({gp.commodity})
              </button>
            );
          })}
        </div>
      </div>

      {/* Terminal Main Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '20px'
      }}>
        {/* Left Column: Scale Weights Input */}
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '16px'
        }}>
          <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Scale size={16} color="#059669" />
            <span>{isMr ? 'वजनकाटा वाचन (Dual-Scale)' : 'Weighbridge Gross & Tare Scales'}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                {isMr ? '१. Gross Weight (भरलेला ट्रक + माल kg)' : '1. Gross Weight (Loaded Truck + Cargo in kg)'}
              </label>
              <input
                type="number"
                value={grossWeightKg}
                onChange={(e) => setGrossWeightKg(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '1rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  backgroundColor: '#ffffff'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                {isMr ? '२. Tare Weight (रिकाम्या वाहनाचे वजन kg)' : '2. Tare Weight (Empty Truck Tare in kg)'}
              </label>
              <input
                type="number"
                value={tareWeightKg}
                onChange={(e) => setTareWeightKg(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '1rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  backgroundColor: '#ffffff'
                }}
              />
            </div>

            {/* Calculated Net Weight Display */}
            <div style={{
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: '8px',
              padding: '10px 12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#065f46', fontWeight: 700, textTransform: 'uppercase' }}>
                  {isMr ? 'निव्वळ शेतमाल वजन' : 'Calculated Net Produce Weight'}
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#047857' }}>
                  {settlement.netProduceKg.toLocaleString('en-IN')} kg
                </div>
              </div>
              <div style={{
                backgroundColor: '#059669',
                color: '#ffffff',
                padding: '4px 10px',
                borderRadius: '6px',
                fontWeight: 800,
                fontSize: '0.85rem'
              }}>
                {settlement.netProduceQuintals} Qtl
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column: Quality Lab Assay at Gate */}
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '16px'
        }}>
          <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={16} color="#2563eb" />
            <span>{isMr ? 'प्रयोगशाळा गुणवत्ता चाचणी (Lab Assay)' : 'Gate Quality Testing Parameters'}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                <span>{isMr ? 'आर्द्रता (Moisture %)' : 'Tested Moisture %'}</span>
                <span style={{ color: moisturePct <= 12 ? '#059669' : '#dc2626' }}>{moisturePct}% (Base: 10%, Free: 12%)</span>
              </div>
              <input
                type="range"
                min="8"
                max="16"
                step="0.1"
                value={moisturePct}
                onChange={(e) => setMoisturePct(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#2563eb' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                <span>{isMr ? 'कचरा / माती (Foreign Matter %)' : 'Foreign Matter / Dust %'}</span>
                <span style={{ color: foreignMatterPct <= 1 ? '#059669' : '#dc2626' }}>{foreignMatterPct}% (Base: 1.0%)</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="5.0"
                step="0.1"
                value={foreignMatterPct}
                onChange={(e) => setForeignMatterPct(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#2563eb' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                <span>{isMr ? 'खराब / डागी धान्य (Damaged %)' : 'Damaged / Shriveled Grains %'}</span>
                <span style={{ color: damagedPct <= 2 ? '#059669' : '#dc2626' }}>{damagedPct}% (Base: 2.0%)</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="6.0"
                step="0.1"
                value={damagedPct}
                onChange={(e) => setDamagedPct(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#2563eb' }}
              />
            </div>

            {/* Refraction Output Indicator */}
            <div style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '0.74rem',
              color: '#1e40af',
              fontWeight: 600
            }}>
              {isMr ? settlement.refractionSummaryMr : settlement.refractionSummaryEn}
            </div>
          </div>
        </div>

        {/* Right Column: Escrow Settlement & Trigger */}
        <div style={{
          backgroundColor: '#0f172a',
          color: '#ffffff',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {isMr ? 'एकूण देय रक्कम' : 'Net Produce Value'}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#10b981', margin: '4px 0' }}>
              ₹{settlement.netPayableInr.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>
              @ ₹{selectedPass.base_price_per_quintal}/Qtl for {settlement.netProduceQuintals} Qtl
            </div>

            <div style={{ borderTop: '1px solid #334155', margin: '12px 0', paddingTop: '10px', fontSize: '0.72rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', marginBottom: '4px' }}>
                <span>50% Advance (Already In Escrow):</span>
                <span>-₹{selectedPass.escrow_advance_deducted.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6ee7b7', fontWeight: 800 }}>
                <span>Final Balance To Release:</span>
                <span>₹{settlement.finalSettlementReleasedInr.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {isSettlementComplete ? (
              <div style={{
                backgroundColor: '#064e3b',
                border: '1px solid #059669',
                color: '#6ee7b7',
                padding: '10px',
                borderRadius: '8px',
                textAlign: 'center',
                fontSize: '0.78rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}>
                <CheckCircle2 size={16} />
                <span>{isMr ? 'एस्क्रो रक्कम शेतकऱ्याला वितरीत झाली!' : 'Escrow Disbursed to Farmer Account!'}</span>
              </div>
            ) : (
              <button
                type="button"
                disabled={isProcessingSettlement}
                onClick={handleTriggerEscrowPayout}
                style={{
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '0.86rem',
                  fontWeight: 900,
                  cursor: isProcessingSettlement ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
                }}
              >
                <Zap size={16} />
                <span>{isProcessingSettlement ? (isMr ? 'प्रक्रिया सुरू आहे...' : 'Releasing Escrow...') : (isMr ? 'काटा वजन मंजूर करा व एस्क्रो रक्कम पाठवा' : 'Approve Weight & Release Escrow')}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onOpenGatePassModal(selectedPass)}
              style={{
                backgroundColor: '#1e293b',
                color: '#94a3b8',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '8px',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <FileText size={14} />
              <span>{isMr ? 'डिजिटल गेट पास व वजन पावती पहा' : 'View Full e-Gate Pass & Weigh Slip'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
