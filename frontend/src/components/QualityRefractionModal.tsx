import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Scale,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Printer,
  X,
  FileText,
  HelpCircle,
  ShieldCheck,
  Building2
} from 'lucide-react';
import type { RefractionSchedule, RefractionCalculationResult } from '../types';
import { calculateQualityRefraction, getCommodityRefractionSchedule } from '../utils/refraction';

interface QualityRefractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  commodity: string;
  basePricePerQuintal: number;
  initialQuantityQuintals?: number;
  customSchedule?: RefractionSchedule;
  companyName?: string;
  onApplyRefraction?: (result: RefractionCalculationResult) => void;
  lang?: 'EN' | 'MR';
}

export const QualityRefractionModal: React.FC<QualityRefractionModalProps> = ({
  isOpen,
  onClose,
  commodity,
  basePricePerQuintal,
  initialQuantityQuintals = 100,
  customSchedule,
  companyName = 'MSAMB Licensed Institutional Buyer',
  onApplyRefraction,
  lang = 'EN'
}) => {
  const isMarathi = lang === 'MR';

  const schedule = customSchedule || getCommodityRefractionSchedule(commodity);

  // Input states
  const [grossWeight, setGrossWeight] = useState<number>(initialQuantityQuintals);
  const [basePrice, setBasePrice] = useState<number>(basePricePerQuintal || 5100);
  const [moisturePct, setMoisturePct] = useState<number>(12.8);
  const [foreignMatterPct, setForeignMatterPct] = useState<number>(1.8);
  const [damagedPct, setDamagedPct] = useState<number>(1.5);
  const [activeTab, setActiveTab] = useState<'CALCULATOR' | 'SCHEDULE' | 'SLIP'>('CALCULATOR');
  const [slipId] = useState<string>(() => String(Date.now()).slice(-6));

  // Single-page print body class management
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('has-print-modal');
    } else {
      document.body.classList.remove('has-print-modal');
    }
    return () => {
      document.body.classList.remove('has-print-modal');
    };
  }, [isOpen]);

  useEffect(() => {
    if (initialQuantityQuintals) setGrossWeight(initialQuantityQuintals);
    if (basePricePerQuintal) setBasePrice(basePricePerQuintal);
  }, [initialQuantityQuintals, basePricePerQuintal]);

  // Compute live refraction result
  const calcResult: RefractionCalculationResult = calculateQualityRefraction(
    {
      gross_weight_quintals: grossWeight,
      base_price_per_quintal: basePrice,
      tested_moisture_pct: moisturePct,
      tested_foreign_matter_pct: foreignMatterPct,
      tested_damaged_pct: damagedPct
    },
    schedule
  );

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const applyPreset = (presetType: 'EXPORT' | 'STANDARD' | 'HIGH_MOISTURE') => {
    if (presetType === 'EXPORT') {
      setMoisturePct(schedule.base_moisture_pct);
      setForeignMatterPct(Math.max(0.5, schedule.permissible_foreign_matter_pct - 0.4));
      setDamagedPct(0.8);
    } else if (presetType === 'STANDARD') {
      setMoisturePct(schedule.permissible_moisture_pct + 0.8); // 12.8%
      setForeignMatterPct(schedule.permissible_foreign_matter_pct + 0.8); // 1.8%
      setDamagedPct(1.5);
    } else if (presetType === 'HIGH_MOISTURE') {
      setMoisturePct(Math.min(14.5, schedule.permissible_moisture_pct + 2.4));
      setForeignMatterPct(schedule.permissible_foreign_matter_pct + 1.4);
      setDamagedPct(3.2);
    }
  };

  const modalContent = (
    <div
      className="refraction-print-modal"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(5px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto'
      }}
      onClick={onClose}
    >
      <div
        className="refraction-print-card"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '820px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '94vh',
          animation: 'modalSlideUp 0.25s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
            color: '#ffffff',
            padding: '18px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '3px solid #10b981'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              <Scale size={24} color="#a7f3d0" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h3 style={{ margin: 0, fontSize: '1.18rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
                  {isMarathi
                    ? `वैधानिक गुणवत्ता अपवर्तन व दर कपात कोष्टक (${commodity})`
                    : `Statutory Quality Refraction & Deduction Matrix (${commodity})`}
                </h3>
                <span
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.25)',
                    color: '#a7f3d0',
                    border: '1px solid #34d399',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '20px',
                    textTransform: 'uppercase'
                  }}
                >
                  APMC Rule 38
                </span>
              </div>
              <p style={{ margin: '3px 0 0', fontSize: '0.76rem', color: '#d1fae5', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={13} color="#34d399" />
                <span>{schedule.statutory_rule_ref}</span>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              className="no-print"
              onClick={handlePrint}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.18)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.35)',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Printer size={14} />
              <span>{isMarathi ? 'अपवर्तन पावती मुद्रित करा' : 'Print Deduction Slip'}</span>
            </button>

            <button
              type="button"
              className="no-print"
              onClick={onClose}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '6px'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Hidden during print) */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            gap: '8px',
            padding: '10px 24px',
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0'
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('CALCULATOR')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: activeTab === 'CALCULATOR' ? '#065f46' : '#e2e8f0',
              color: activeTab === 'CALCULATOR' ? '#ffffff' : '#475569',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Scale size={14} />
            <span>{isMarathi ? 'थेट अपवर्तन गणक (Live Calculator)' : 'Interactive Calculator'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('SCHEDULE')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: activeTab === 'SCHEDULE' ? '#065f46' : '#e2e8f0',
              color: activeTab === 'SCHEDULE' ? '#ffffff' : '#475569',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FileText size={14} />
            <span>{isMarathi ? 'कायदेशीर अपवर्तन निकष (Statutory Schedule)' : 'Statutory Schedule Limits'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('SLIP')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: activeTab === 'SLIP' ? '#065f46' : '#e2e8f0',
              color: activeTab === 'SLIP' ? '#ffffff' : '#475569',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <CheckCircle2 size={14} />
            <span>{isMarathi ? 'वेब्रिज अपवर्तन पावती (Mill Gate Slip)' : 'Official Weighbridge Slip'}</span>
          </button>
        </div>

        {/* Modal Body Container */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Executive Status Banner */}
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '10px',
              backgroundColor:
                calcResult.acceptance_status === 'FULL_ACCEPTANCE'
                  ? '#ecfdf5'
                  : calcResult.acceptance_status === 'STANDARD_REFRACTION_APPLIED'
                  ? '#f0fdf4'
                  : calcResult.acceptance_status === 'HIGH_REFRACTION_WARNING'
                  ? '#fffbeb'
                  : '#fef2f2',
              border: `1px solid ${
                calcResult.acceptance_status === 'FULL_ACCEPTANCE'
                  ? '#a7f3d0'
                  : calcResult.acceptance_status === 'STANDARD_REFRACTION_APPLIED'
                  ? '#86efac'
                  : calcResult.acceptance_status === 'HIGH_REFRACTION_WARNING'
                  ? '#fde68a'
                  : '#fecaca'
              }`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {calcResult.acceptance_status === 'REJECTION_RISK' ? (
                <AlertTriangle size={22} color="#dc2626" />
              ) : calcResult.acceptance_status === 'HIGH_REFRACTION_WARNING' ? (
                <AlertTriangle size={22} color="#d97706" />
              ) : (
                <CheckCircle2 size={22} color="#059669" />
              )}
              <div>
                <strong
                  style={{
                    fontSize: '0.88rem',
                    color:
                      calcResult.acceptance_status === 'REJECTION_RISK'
                        ? '#991b1b'
                        : calcResult.acceptance_status === 'HIGH_REFRACTION_WARNING'
                        ? '#92400e'
                        : '#065f46'
                  }}
                >
                  {isMarathi ? calcResult.status_label_mr : calcResult.status_label_en}
                </strong>
                <div style={{ fontSize: '0.74rem', color: '#475569' }}>
                  {isMarathi
                    ? `खरेदीदार: ${companyName} | शेतमाल: ${commodity} | आधारभाव: ₹${basePrice}/क्विंटल`
                    : `Procuring Entity: ${companyName} | Commodity: ${commodity} | Base Benchmark: ₹${basePrice}/Qtl`}
                </div>
              </div>
            </div>

            {/* Total Refraction Impact Pill */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                {isMarathi ? 'एकूण अपवर्तन कपात' : 'Total Refraction Cut'}
              </div>
              <div
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 900,
                  color: calcResult.total_refraction_discount_amount > 0 ? '#dc2626' : '#059669'
                }}
              >
                {calcResult.total_refraction_discount_amount > 0
                  ? `-₹${calcResult.total_refraction_discount_amount.toLocaleString()} (${calcResult.effective_deduction_pct}%)`
                  : '₹0 (0.0% Cut)'}
              </div>
            </div>
          </div>

          {/* TAB 1: INTERACTIVE CALCULATOR */}
          {(activeTab === 'CALCULATOR' || activeTab === 'SLIP') && (
            <>
              {/* Presets Toolbar (Hidden during print) */}
              <div className="no-print" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569' }}>
                  {isMarathi ? 'जलद नमुने:' : 'Quick Lab Presets:'}
                </span>
                <button
                  type="button"
                  onClick={() => applyPreset('EXPORT')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    backgroundColor: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    color: '#065f46',
                    cursor: 'pointer'
                  }}
                >
                  ✓ {isMarathi ? 'निर्यात प्रत (१०.०% आर्द्रता, ०.६% कचरा)' : 'Grade A Export (10.0% M, 0.6% FM)'}
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('STANDARD')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    color: '#1e40af',
                    cursor: 'pointer'
                  }}
                >
                  ⚡ {isMarathi ? 'मानक मंडी नमुना (१२.८% आर्द्रता, १.८% कचरा)' : 'Standard Mandi (12.8% M, 1.8% FM)'}
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('HIGH_MOISTURE')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    backgroundColor: '#fff7ed',
                    border: '1px solid #fed7aa',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    color: '#9a3412',
                    cursor: 'pointer'
                  }}
                >
                  ⚠ {isMarathi ? 'पावसाळी जास्त ओलावा (१४.४% आर्द्रता)' : 'High Moisture Post-Rain (14.4% M)'}
                </button>
              </div>

              {/* Input Sliders & Number Controls (Hidden during print if in SLIP tab) */}
              <div
                className={activeTab === 'SLIP' ? 'no-print' : ''}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '16px',
                  backgroundColor: '#f8fafc',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}
              >
                {/* 1. Gross Weight */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                    <label style={{ fontWeight: 700, color: '#334155' }}>
                      {isMarathi ? 'एकूण आवक वजन (Gross Weight):' : 'Gross Consignment Weight:'}
                    </label>
                    <span style={{ fontWeight: 800, color: '#0f172a' }}>{grossWeight} Qtl</span>
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={10000}
                    step={1}
                    value={grossWeight}
                    onChange={(e) => setGrossWeight(Math.max(1, Number(e.target.value)))}
                    className="form-input"
                    style={{ height: '36px', fontSize: '0.85rem' }}
                  />
                </div>

                {/* 2. Base Price */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                    <label style={{ fontWeight: 700, color: '#334155' }}>
                      {isMarathi ? 'करार आधारभाव (Base Price):' : 'Base Tender Price:'}
                    </label>
                    <span style={{ fontWeight: 800, color: '#059669' }}>₹{basePrice}/Qtl</span>
                  </div>
                  <input
                    type="number"
                    min={500}
                    max={50000}
                    step={10}
                    value={basePrice}
                    onChange={(e) => setBasePrice(Math.max(100, Number(e.target.value)))}
                    className="form-input"
                    style={{ height: '36px', fontSize: '0.85rem' }}
                  />
                </div>

                {/* 3. Tested Moisture % Slider */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                    <label style={{ fontWeight: 700, color: '#334155' }}>
                      {isMarathi ? 'तपासलेली आर्द्रता (Moisture %):' : 'Tested Moisture (%):'}
                    </label>
                    <span
                      style={{
                        fontWeight: 800,
                        color: moisturePct > schedule.permissible_moisture_pct ? '#dc2626' : '#059669'
                      }}
                    >
                      {moisturePct}% (मानक: &lt;={schedule.permissible_moisture_pct}%)
                    </span>
                  </div>
                  <input
                    type="range"
                    min={8.0}
                    max={18.0}
                    step={0.1}
                    value={moisturePct}
                    onChange={(e) => setMoisturePct(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#059669' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748b' }}>
                    <span>8% (Dry)</span>
                    <span>12% (Permissible)</span>
                    <span>18% (Reject)</span>
                  </div>
                </div>

                {/* 4. Tested Foreign Matter % Slider */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                    <label style={{ fontWeight: 700, color: '#334155' }}>
                      {isMarathi ? 'कचरा/माती (Foreign Matter %):' : 'Foreign Matter / Dust (%):'}
                    </label>
                    <span
                      style={{
                        fontWeight: 800,
                        color: foreignMatterPct > schedule.permissible_foreign_matter_pct ? '#dc2626' : '#059669'
                      }}
                    >
                      {foreignMatterPct}% (मानक: &lt;={schedule.permissible_foreign_matter_pct}%)
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.0}
                    max={6.0}
                    step={0.1}
                    value={foreignMatterPct}
                    onChange={(e) => setForeignMatterPct(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#059669' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748b' }}>
                    <span>0% (Clean)</span>
                    <span>1% (Free)</span>
                    <span>6% (High)</span>
                  </div>
                </div>

                {/* 5. Damaged / Shriveled Grains % */}
                <div style={{ gridColumn: 'span 1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                    <label style={{ fontWeight: 700, color: '#334155' }}>
                      {isMarathi ? 'किडके/सुरकुतलेले दाणे (Damaged %):' : 'Damaged / Shriveled (%):'}
                    </label>
                    <span
                      style={{
                        fontWeight: 800,
                        color: damagedPct > schedule.permissible_damaged_grains_pct ? '#d97706' : '#059669'
                      }}
                    >
                      {damagedPct}% (मानक: &lt;={schedule.permissible_damaged_grains_pct}%)
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.0}
                    max={8.0}
                    step={0.1}
                    value={damagedPct}
                    onChange={(e) => setDamagedPct(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#059669' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748b' }}>
                    <span>0%</span>
                    <span>2% (Base)</span>
                    <span>8%</span>
                  </div>
                </div>
              </div>

              {/* 3 Live Key Result Indicator Cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
                  gap: '14px'
                }}
              >
                {/* Weight Card */}
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '16px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      {isMarathi ? 'निव्वळ देय वजन' : 'Net Payable Weight'}
                    </span>
                    <Scale size={16} color="#0284c7" />
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a' }}>
                    {calcResult.net_weight_quintals.toFixed(2)}{' '}
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Qtl</span>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: calcResult.foreign_matter_deduction_quintals > 0 ? '#dc2626' : '#059669', marginTop: '4px' }}>
                    {calcResult.foreign_matter_deduction_quintals > 0
                      ? isMarathi
                        ? `कचरा कपात: -${calcResult.foreign_matter_deduction_quintals} क्विंटल (${calcResult.foreign_matter_excess_pct}%)`
                        : `Dirt Cut: -${calcResult.foreign_matter_deduction_quintals} Qtl (${calcResult.foreign_matter_excess_pct}% excess FM)`
                      : isMarathi
                      ? '✓ १००% वजन स्वीकार्य (शून्य कपात)'
                      : '✓ 100% Weight Accepted (No deduction)'}
                  </div>
                </div>

                {/* Adjusted Price Card */}
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '16px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      {isMarathi ? 'अपवर्तन समायोजित दर' : 'Refraction Adjusted Rate'}
                    </span>
                    <TrendingDown size={16} color="#d97706" />
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#059669' }}>
                    ₹{calcResult.net_price_per_quintal.toLocaleString()}{' '}
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>/Qtl</span>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: calcResult.total_price_deduction_per_quintal > 0 ? '#dc2626' : '#059669', marginTop: '4px' }}>
                    {calcResult.total_price_deduction_per_quintal > 0
                      ? isMarathi
                        ? `दर वजावट: -₹${calcResult.total_price_deduction_per_quintal}/क्विंटल (आर्द्रता: -₹${calcResult.moisture_deduction_per_quintal})`
                        : `Rate Cut: -₹${calcResult.total_price_deduction_per_quintal}/Qtl (Moisture: -₹${calcResult.moisture_deduction_per_quintal})`
                      : isMarathi
                      ? '✓ पूर्ण आधारभाव लागू (शून्य दर कपात)'
                      : '✓ Full Base Rate Protected (No cut)'}
                  </div>
                </div>

                {/* Net Payout Card */}
                <div
                  style={{
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '12px',
                    padding: '16px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#065f46', textTransform: 'uppercase' }}>
                      {isMarathi ? 'अंतिम एस्क्रो देय रक्कम' : 'Final Escrow Net Payout'}
                    </span>
                    <CheckCircle2 size={16} color="#059669" />
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#065f46' }}>
                    ₹{calcResult.net_total_amount.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#047857', marginTop: '4px' }}>
                    {isMarathi
                      ? `एकूण मूल्य: ₹${calcResult.gross_total_amount.toLocaleString()} (बचत: ₹${calcResult.total_refraction_discount_amount.toLocaleString()})`
                      : `Gross: ₹${calcResult.gross_total_amount.toLocaleString()} | Total Adj: ₹${calcResult.total_refraction_discount_amount.toLocaleString()}`}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: STATUTORY SCHEDULE LIMITS */}
          {activeTab === 'SCHEDULE' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '18px'
                }}
              >
                <h4 style={{ fontSize: '0.98rem', color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building2 size={18} color="#065f46" />
                  <span>
                    {isMarathi
                      ? `महाराष्ट्र कृषी उत्पन्न खरेदी-विक्री कायदा अन्वये ${commodity} चे वैधानिक अपवर्तन निकष`
                      : `Statutory Refraction Schedule for ${commodity} under APMC Model Act & AGMARK`}
                  </span>
                </h4>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#e2e8f0', color: '#1e293b', textAlign: 'left' }}>
                      <th style={{ padding: '8px 12px' }}>{isMarathi ? 'गुणवत्ता मापदंड' : 'Quality Parameter'}</th>
                      <th style={{ padding: '8px 12px' }}>{isMarathi ? 'आधार / मोफत मर्यादा' : 'Base / Free Allowance'}</th>
                      <th style={{ padding: '8px 12px' }}>{isMarathi ? 'वैधानिक कपात दर' : 'Statutory Deduction Formula'}</th>
                      <th style={{ padding: '8px 12px' }}>{isMarathi ? 'कमाल स्वीकार्य मर्यादा' : 'Max Tolerable Limit'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 600 }}>{isMarathi ? '१. आर्द्रता (Moisture)' : '1. Moisture Content'}</td>
                      <td style={{ padding: '10px 12px', color: '#059669', fontWeight: 700 }}>&lt;= {schedule.permissible_moisture_pct}%</td>
                      <td style={{ padding: '10px 12px' }}>
                        {isMarathi
                          ? `${schedule.permissible_moisture_pct}% पेक्षा जास्त प्रत्येक १% आर्द्रतेस ${schedule.moisture_penalty_rate_pct}% दर वजावट`
                          : `${schedule.moisture_penalty_rate_pct}% price deduction per 1.0% excess above ${schedule.permissible_moisture_pct}%`}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#dc2626', fontWeight: 700 }}>{schedule.max_tolerable_moisture_pct}% ({isMarathi ? 'नाकारण्याचा अधिकार' : 'Mill Rejection'})</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 600 }}>{isMarathi ? '२. कचरा / माती / काडी (Foreign Matter)' : '2. Foreign Matter & Dust'}</td>
                      <td style={{ padding: '10px 12px', color: '#059669', fontWeight: 700 }}>&lt;= {schedule.permissible_foreign_matter_pct}%</td>
                      <td style={{ padding: '10px 12px' }}>
                        {isMarathi
                          ? '१% पेक्षा जास्त कचऱ्यास थेट निव्वळ वजनातून वजावट (Net Weight Deduction)'
                          : 'Direct 1:1 net weight deduction on excess foreign matter'}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#dc2626', fontWeight: 700 }}>3.5%</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '10px 12px', fontWeight: 600 }}>{isMarathi ? '३. किडके / सुरकुतलेले दाणे (Damaged)' : '3. Damaged / Shriveled Grains'}</td>
                      <td style={{ padding: '10px 12px', color: '#059669', fontWeight: 700 }}>&lt;= {schedule.permissible_damaged_grains_pct}%</td>
                      <td style={{ padding: '10px 12px' }}>
                        {isMarathi
                          ? `२% पेक्षा जास्त असल्यास ${schedule.damaged_penalty_rate_pct}% दर वजावट प्रति १%`
                          : `${schedule.damaged_penalty_rate_pct}% price cut per 1.0% excess above ${schedule.permissible_damaged_grains_pct}%`}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#d97706', fontWeight: 700 }}>5.0%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3 or PRINT VIEW: OFFICIAL WEIGHBRIDGE REFRACTION SLIP */}
          {(activeTab === 'SLIP' || activeTab === 'CALCULATOR') && (
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '2px solid #064e3b',
                borderRadius: '10px',
                padding: '18px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              {/* Slip Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px dashed #cbd5e1', paddingBottom: '10px' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#065f46', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {isMarathi ? 'महाराष्ट्र राज्य कृषी पणन मंडळ (MSAMB) डिजिटल प्रमाणन' : 'Government of Maharashtra / MSAMB Mandated Verification'}
                  </div>
                  <h4 style={{ margin: '2px 0 0', fontSize: '1.05rem', color: '#0f172a', fontWeight: 800 }}>
                    {isMarathi ? 'तपशीलवार गुणवत्ता अपवर्तन पावती (Quality Refraction Deduction Slip)' : 'Official Mill Weighbridge Quality Refraction Slip'}
                  </h4>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                    Slip No: AGC-REF-{slipId} | Date: {new Date().toLocaleDateString('en-IN')}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#065f46' }}>{companyName}</div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>APMC Gate No. 3 Weighbridge & Lab Node</div>
                </div>
              </div>

              {/* Itemized Calculation Breakdown Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', color: '#334155', borderBottom: '1px solid #cbd5e1' }}>
                    <th style={{ padding: '6px 8px', textAlign: 'left' }}>#</th>
                    <th style={{ padding: '6px 8px', textAlign: 'left' }}>{isMarathi ? 'तपशील (Particulars)' : 'Particulars / Lab Metric'}</th>
                    <th style={{ padding: '6px 8px', textAlign: 'right' }}>{isMarathi ? 'चाचणी प्रमाण (Observed)' : 'Observed'}</th>
                    <th style={{ padding: '6px 8px', textAlign: 'right' }}>{isMarathi ? 'मानक मर्यादा (Permissible)' : 'Permissible'}</th>
                    <th style={{ padding: '6px 8px', textAlign: 'right' }}>{isMarathi ? 'कपात दर / प्रमाण (Deduction)' : 'Statutory Deduction'}</th>
                    <th style={{ padding: '6px 8px', textAlign: 'right' }}>{isMarathi ? 'अंतिम समायोजित मूल्य' : 'Net Adjustment'}</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Row 1: Gross Weight & Foreign Matter */}
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '6px 8px' }}>1</td>
                    <td style={{ padding: '6px 8px', fontWeight: 600 }}>
                      {isMarathi ? 'एकूण आवक वजन (Gross Weight)' : 'Gross Consignment Weight'}
                    </td>
                    <td style={{ padding: '6px 8px', textAlign: 'right' }}>{grossWeight.toFixed(2)} Qtl</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right' }}>--</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right' }}>--</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 700 }}>{grossWeight.toFixed(2)} Qtl</td>
                  </tr>

                  <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: calcResult.foreign_matter_deduction_quintals > 0 ? '#fef2f2' : 'transparent' }}>
                    <td style={{ padding: '6px 8px' }}>2</td>
                    <td style={{ padding: '6px 8px' }}>
                      {isMarathi ? 'कचरा/माती निव्वळ वजन वजावट (Foreign Matter Cut)' : 'Foreign Matter Weight Deduction'}
                    </td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', color: foreignMatterPct > schedule.permissible_foreign_matter_pct ? '#dc2626' : '#059669', fontWeight: 700 }}>
                      {foreignMatterPct}%
                    </td>
                    <td style={{ padding: '6px 8px', textAlign: 'right' }}>&lt;= {schedule.permissible_foreign_matter_pct}%</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', color: '#dc2626' }}>
                      {calcResult.foreign_matter_excess_pct > 0 ? `-${calcResult.foreign_matter_excess_pct}%` : 'Nil'}
                    </td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', color: calcResult.foreign_matter_deduction_quintals > 0 ? '#dc2626' : '#059669', fontWeight: 700 }}>
                      -{calcResult.foreign_matter_deduction_quintals.toFixed(2)} Qtl
                    </td>
                  </tr>

                  {/* Net Weight Summary Line */}
                  <tr style={{ backgroundColor: '#f8fafc', fontWeight: 700, borderBottom: '1px solid #cbd5e1' }}>
                    <td style={{ padding: '6px 8px' }}>--</td>
                    <td style={{ padding: '6px 8px', color: '#0f172a' }}>
                      {isMarathi ? 'निव्वळ देय वजन (Net Payable Weight)' : 'Net Payable Weight after Foreign Matter:'}
                    </td>
                    <td colSpan={3} style={{ padding: '6px 8px', textAlign: 'right' }}>--</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', color: '#0284c7', fontSize: '0.85rem' }}>
                      {calcResult.net_weight_quintals.toFixed(2)} Qtl
                    </td>
                  </tr>

                  {/* Row 3: Base Rate */}
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '6px 8px' }}>3</td>
                    <td style={{ padding: '6px 8px', fontWeight: 600 }}>
                      {isMarathi ? 'करार आधार दर (Contract Base Price)' : 'Tender Base Price Per Quintal'}
                    </td>
                    <td style={{ padding: '6px 8px', textAlign: 'right' }}>₹{basePrice}/Qtl</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right' }}>--</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right' }}>--</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 700 }}>₹{basePrice}/Qtl</td>
                  </tr>

                  {/* Row 4: Moisture Price Deduction */}
                  <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: calcResult.moisture_deduction_per_quintal > 0 ? '#fffbeb' : 'transparent' }}>
                    <td style={{ padding: '6px 8px' }}>4</td>
                    <td style={{ padding: '6px 8px' }}>
                      {isMarathi ? 'आर्द्रता दर कपात (Moisture Price Penalty)' : 'Moisture Refraction Price Cut'}
                    </td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', color: moisturePct > schedule.permissible_moisture_pct ? '#dc2626' : '#059669', fontWeight: 700 }}>
                      {moisturePct}%
                    </td>
                    <td style={{ padding: '6px 8px', textAlign: 'right' }}>&lt;= {schedule.permissible_moisture_pct}%</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', color: '#dc2626' }}>
                      {calcResult.moisture_excess_pct > 0 ? `-${calcResult.moisture_penalty_rate_applied_pct}%` : 'Nil'}
                    </td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', color: calcResult.moisture_deduction_per_quintal > 0 ? '#dc2626' : '#059669', fontWeight: 700 }}>
                      -₹{calcResult.moisture_deduction_per_quintal}/Qtl
                    </td>
                  </tr>

                  {/* Row 5: Damaged Grains */}
                  <tr style={{ borderBottom: '1px solid #cbd5e1', backgroundColor: calcResult.damaged_deduction_per_quintal > 0 ? '#fffbeb' : 'transparent' }}>
                    <td style={{ padding: '6px 8px' }}>5</td>
                    <td style={{ padding: '6px 8px' }}>
                      {isMarathi ? 'किडके/सुरकुतलेले दाणे कपात (Damaged Cut)' : 'Damaged / Shriveled Deduction'}
                    </td>
                    <td style={{ padding: '6px 8px', textAlign: 'right' }}>{damagedPct}%</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right' }}>&lt;= {schedule.permissible_damaged_grains_pct}%</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right' }}>
                      {calcResult.damaged_excess_pct > 0 ? `-${calcResult.damaged_penalty_rate_applied_pct}%` : 'Nil'}
                    </td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', color: calcResult.damaged_deduction_per_quintal > 0 ? '#dc2626' : '#059669', fontWeight: 700 }}>
                      -₹{calcResult.damaged_deduction_per_quintal}/Qtl
                    </td>
                  </tr>

                  {/* Net Rate Summary Line */}
                  <tr style={{ backgroundColor: '#f8fafc', fontWeight: 700, borderBottom: '2px solid #cbd5e1' }}>
                    <td style={{ padding: '6px 8px' }}>--</td>
                    <td style={{ padding: '6px 8px', color: '#0f172a' }}>
                      {isMarathi ? 'निव्वळ देय दर (Final Net Rate)' : 'Net Payable Price Per Quintal:'}
                    </td>
                    <td colSpan={3} style={{ padding: '6px 8px', textAlign: 'right' }}>--</td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', color: '#059669', fontSize: '0.85rem' }}>
                      ₹{calcResult.net_price_per_quintal.toLocaleString()}/Qtl
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Total Payout Summary Box */}
              <div
                style={{
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#065f46', fontWeight: 700 }}>
                    {isMarathi ? 'एकूण शेतकरी देयक (Net Settlement Payout)' : 'Total Farmer Net Bank Disbursement'}
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#064e3b' }}>
                    ₹{calcResult.net_total_amount.toLocaleString()}{' '}
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#047857' }}>
                      ({calcResult.net_weight_quintals.toFixed(2)} Qtl × ₹{calcResult.net_price_per_quintal.toLocaleString()})
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                    {isMarathi ? 'मूळ स्थूल मूल्य:' : 'Original Gross Value:'} ₹{calcResult.gross_total_amount.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#dc2626' }}>
                    {isMarathi ? 'एकूण अपवर्तन वजावट:' : 'Total Refraction Deductions:'} -₹{calcResult.total_refraction_discount_amount.toLocaleString()} ({calcResult.effective_deduction_pct}%)
                  </div>
                </div>
              </div>

              {/* Statutory Signatures & Seal */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  marginTop: '10px',
                  paddingTop: '10px',
                  borderTop: '1px dashed #cbd5e1',
                  fontSize: '0.72rem',
                  color: '#475569'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>
                    {isMarathi ? 'शेतकरी / पुरवठादार स्वाक्षरी' : 'Farmer / FPO Representative'}
                  </div>
                  <div style={{ color: '#94a3b8', marginTop: '20px' }}>__________________________</div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid #059669', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px', fontSize: '0.58rem', fontWeight: 800, textAlign: 'center', textTransform: 'uppercase' }}>
                    MSAMB<br/>PASS
                  </div>
                  <span style={{ fontSize: '0.65rem', color: '#059669', fontWeight: 700 }}>Gate QC Verified</span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>
                    {isMarathi ? 'अधिकृत वेब्रिज व लॅब इन्स्पेक्टर' : 'Authorized Mill Weighbridge Officer'}
                  </div>
                  <div style={{ color: '#94a3b8', marginTop: '20px' }}>__________________________</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls (Hidden during print) */}
        <div
          className="no-print"
          style={{
            padding: '14px 24px',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
            <HelpCircle size={13} style={{ display: 'inline', marginRight: '4px' }} />
            {isMarathi
              ? 'ही पावती महाराष्ट्र कृषी उत्पन्न बाजार समिती नियम ३८ अन्वये वैध कायदेशीर पुरावा आहे.'
              : 'Binding statutory document recognized under Model APMC Act 1963 Section 38.'}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn-gov-secondary"
              onClick={onClose}
              style={{ fontSize: '0.82rem', padding: '6px 14px' }}
            >
              {isMarathi ? 'बंद करा' : 'Close'}
            </button>

            {onApplyRefraction && (
              <button
                type="button"
                className="btn-gov-primary"
                onClick={() => {
                  onApplyRefraction(calcResult);
                  onClose();
                }}
                style={{ fontSize: '0.82rem', padding: '6px 16px', backgroundColor: '#065f46' }}
              >
                ✓ {isMarathi ? 'करारामध्ये अपवर्तन दर लागू करा' : 'Apply Refraction Rate to Contract'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
