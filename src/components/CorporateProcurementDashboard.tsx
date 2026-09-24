import React, { useState, useEffect } from 'react';
import { 
  TrendingDown, Award, Target, 
  Settings, CheckCircle2,
  Calculator, Sparkles, X, Check
} from 'lucide-react';
import { api, type User, type BuyerReliabilityScorecard } from '../services/api';
import type { CorporateProcurementKPIs } from '../types';
import { type Language } from '../utils/i18n';

interface CorporateProcurementDashboardProps {
  currentUser: User | null;
  lang?: Language;
  onRefreshDemands?: () => void;
}

export const CorporateProcurementDashboard: React.FC<CorporateProcurementDashboardProps> = ({
  currentUser,
  lang = 'EN',
  onRefreshDemands
}) => {
  const isMarathi = lang === 'MR';

  const [scorecard, setScorecard] = useState<BuyerReliabilityScorecard | null>(null);
  const [kpis, setKpis] = useState<CorporateProcurementKPIs | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Target Adjuster Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editTargetQty, setEditTargetQty] = useState<number>(0);
  const [editCommodity, setEditCommodity] = useState<string>('Soybean');
  const [editBenchmarkPrice, setEditBenchmarkPrice] = useState<number>(4880);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessBanner, setSaveSuccessBanner] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, [currentUser?.id, currentUser?.name]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const buyerIdentifier = currentUser?.id || currentUser?.name || 3;
      const [sc, kpiData] = await Promise.all([
        api.getBuyerScorecard(buyerIdentifier),
        api.getCorporateProcurementKPIs(buyerIdentifier)
      ]);
      setScorecard(sc);
      setKpis(kpiData);
      setEditTargetQty(kpiData.target_quintals);
      setEditCommodity(kpiData.target_commodity);
      setEditBenchmarkPrice(kpiData.apmc_benchmark_per_qtl);
    } catch (e) {
      console.warn('[Corporate Dashboard] Error loading procurement KPIs:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editTargetQty < 0) return;

    setIsSaving(true);
    try {
      const buyerIdentifier = currentUser?.id || currentUser?.name || 3;
      const updated = await api.updateBuyerProcurementTarget(
        buyerIdentifier,
        editTargetQty,
        editCommodity,
        editBenchmarkPrice
      );
      setScorecard(updated);

      // Re-calculate KPIs
      const refreshedKpis = await api.getCorporateProcurementKPIs(buyerIdentifier);
      setKpis(refreshedKpis);

      setSaveSuccessBanner(
        isMarathi 
          ? `यशस्वी! मासिक खरेदी उद्दिष्ट ${editTargetQty.toLocaleString()} क्विंटलवर अद्ययावत केले.` 
          : `Success! Monthly procurement target updated to ${editTargetQty.toLocaleString()} Qtl.`
      );

      setTimeout(() => {
        setSaveSuccessBanner(null);
        setIsModalOpen(false);
        if (onRefreshDemands) onRefreshDemands();
      }, 1200);

    } catch (err: any) {
      alert(err.message || 'Error updating procurement target');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading && !kpis) {
    return (
      <div style={{
        padding: '24px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        color: '#64748b'
      }}>
        <div className="animate-spin" style={{ width: '20px', height: '20px', border: '2px solid #cbd5e1', borderTopColor: '#065f46', borderRadius: '50%' }} />
        <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>
          {isMarathi ? 'कॉर्पोरेट खरेदी कार्यप्रदर्शन लोड होत आहे...' : 'Loading Corporate Procurement Desk & Savings Analytics...'}
        </span>
      </div>
    );
  }

  const currentKPIs: CorporateProcurementKPIs = kpis || {
    target_quintals: 0,
    procured_quintals: 0,
    fulfillment_pct: 0,
    wap_achieved_per_qtl: 0,
    apmc_benchmark_per_qtl: 4880,
    savings_per_qtl: 0,
    total_net_savings_lakhs: 0,
    target_commodity: 'Soybean',
    active_contracts_count: 0
  };

  const remainingQuota = Math.max(currentKPIs.target_quintals - currentKPIs.procured_quintals, 0);

  return (
    <div style={{
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      borderRadius: '18px',
      border: '1px solid #cbd5e1',
      boxShadow: '0 4px 16px rgba(15, 23, 42, 0.06)',
      padding: '24px 28px',
      marginBottom: '26px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Top Background Decorative Hue */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '320px',
        height: '100%',
        background: 'radial-gradient(circle at top right, rgba(52, 211, 153, 0.12) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* 1. Header Row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{
              backgroundColor: '#eff6ff',
              color: '#1e40af',
              border: '1px solid #bfdbfe',
              fontSize: '0.68rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              {isMarathi ? 'संस्थात्मक खरेदी केंद्र' : 'CORPORATE SOURCING DESK'}
            </span>
            <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
              • {isMarathi ? 'खरीप २०२६ गाळप हंगाम' : 'Kharif 2026 Processing Cycle'}
            </span>
          </div>

          <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            {scorecard?.company_name || currentUser?.name || 'Institutional Agribusiness'}
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
            {isMarathi ? 'अधिकृत एपीएमसी परवाना' : 'APMC Statutory License'}: <strong>{scorecard?.msamb_license_number || 'MH-AKL-CORP-2023-9082'}</strong> • {isMarathi ? 'नोडल एस्क्रो भागीदार' : 'Nodal Escrow Partner'}: <strong>SBI MSAMB Node</strong>
          </p>
        </div>

        {/* Action Button: Adjust Sourcing Target */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-gov-secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.82rem',
              fontWeight: 700,
              padding: '8px 14px',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1'
            }}
          >
            <Settings size={15} color="#059669" />
            <span>{isMarathi ? 'मासिक उद्दिष्ट बदला' : 'Adjust Monthly Target'}</span>
          </button>
        </div>
      </div>

      {/* 2. Monthly Procurement Quota Progress Bar */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Target size={16} color="#059669" />
            </div>
            <div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                {isMarathi ? 'मासिक खरेदी उद्दिष्ट प्रगती' : 'Monthly Procurement Target Progress'}
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                {currentKPIs.target_quintals > 0 ? (
                  <>
                    {currentKPIs.procured_quintals.toLocaleString()} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>/ {currentKPIs.target_quintals.toLocaleString()} Qtl ({currentKPIs.target_commodity})</span>
                  </>
                ) : (
                  <>
                    0 Qtl Sourced <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>({currentKPIs.target_commodity})</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{
              backgroundColor: currentKPIs.fulfillment_pct >= 80 ? '#ecfdf5' : '#f8fafc',
              color: currentKPIs.fulfillment_pct > 0 ? '#065f46' : '#64748b',
              border: currentKPIs.fulfillment_pct > 0 ? '1px solid #a7f3d0' : '1px solid #cbd5e1',
              padding: '3px 10px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 800
            }}>
              {currentKPIs.fulfillment_pct}% {isMarathi ? 'पूर्ण झाले' : 'Fulfilled'}
            </span>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
              {currentKPIs.target_quintals > 0 
                ? (remainingQuota > 0 
                    ? (isMarathi ? `उर्वरित कोटा: ${remainingQuota.toLocaleString()} क्विंटल` : `${remainingQuota.toLocaleString()} Qtl to meet capacity`)
                    : (isMarathi ? 'उद्दिष्ट १००% साध्य झाले!' : 'Capacity 100% Sourced!'))
                : (isMarathi ? 'मासिक खरेदी उद्दिष्ट सेट करा' : 'Click "Adjust Monthly Target" to set capacity quota')
              }
            </div>
          </div>
        </div>

        {/* Multi-segmented Progress Bar */}
        <div style={{
          height: '14px',
          width: '100%',
          backgroundColor: '#e2e8f0',
          borderRadius: '7px',
          overflow: 'hidden',
          display: 'flex',
          position: 'relative'
        }}>
          <div 
            style={{
              width: `${Math.min(currentKPIs.fulfillment_pct, 100)}%`,
              background: 'linear-gradient(90deg, #059669 0%, #10b981 100%)',
              transition: 'width 0.6s ease-in-out',
              borderRadius: '7px'
            }}
          />
        </div>

        {/* Progress Breakdown Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '0.72rem', color: '#64748b' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: currentKPIs.procured_quintals > 0 ? '#059669' : '#94a3b8', display: 'inline-block' }} />
            {isMarathi ? 'थेट करार व एस्क्रो लॉक' : 'Committed Direct Contracts'}: <strong>{currentKPIs.procured_quintals.toLocaleString()} Qtl</strong>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#cbd5e1', display: 'inline-block' }} />
            {isMarathi ? 'उर्वरित खुली क्षमता' : 'Pending Quota'}: <strong>{remainingQuota.toLocaleString()} Qtl</strong>
          </span>
        </div>
      </div>

      {/* 3. Three Strategic KPI & Cost Arbitrage Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '16px'
      }}>
        {/* Card 1: Weighted Average Price (WAP) */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '16px 18px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              {isMarathi ? 'सरासरी खरेदी दर (WAP)' : 'Weighted Avg Purchase (WAP)'}
            </span>
            <div style={{ width: '26px', height: '26px', borderRadius: '6px', backgroundColor: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calculator size={14} color="#0284c7" />
            </div>
          </div>

          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '2px' }}>
            ₹{currentKPIs.wap_achieved_per_qtl.toLocaleString()} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748b' }}>/ Qtl</span>
          </div>

          <div style={{ fontSize: '0.72rem', color: currentKPIs.wap_achieved_per_qtl > 0 ? '#059669' : '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
            <CheckCircle2 size={12} color={currentKPIs.wap_achieved_per_qtl > 0 ? '#059669' : '#94a3b8'} />
            <span>
              {currentKPIs.wap_achieved_per_qtl > 0 
                ? (isMarathi ? 'थेट FPO खरेदीद्वारे निश्चित' : 'Achieved via Direct Reverse-RFQ')
                : (isMarathi ? 'कोणताही खरेदी करार झालेला नाही' : 'No procurement executed yet')
              }
            </span>
          </div>
        </div>

        {/* Card 2: Prevailing APMC Mandi Spot Benchmark */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '16px 18px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              {isMarathi ? 'बाजार समिती तुलनात्मक भाव' : 'Prevailing APMC Benchmark'}
            </span>
            <div style={{ width: '26px', height: '26px', borderRadius: '6px', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={14} color="#059669" />
            </div>
          </div>

          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '2px' }}>
            ₹{currentKPIs.apmc_benchmark_per_qtl.toLocaleString()} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748b' }}>/ Qtl</span>
          </div>

          <div style={{ fontSize: '0.72rem', color: currentKPIs.savings_per_qtl > 0 ? '#166534' : '#64748b', fontWeight: 700 }}>
            {currentKPIs.savings_per_qtl > 0 
              ? (isMarathi 
                ? `थेट फायदा: ₹${currentKPIs.savings_per_qtl}/क्विंटल निव्वळ बचत (APMC लँडेड खर्चाविरुद्ध)` 
                : `Direct Advantage: ₹${currentKPIs.savings_per_qtl}/Qtl savings vs APMC landed cost`)
              : (isMarathi 
                ? `थेट एपीएमसी स्पॉट बेंचमार्क (${currentKPIs.target_commodity})` 
                : `Live Agmarknet APMC Spot Rate (${currentKPIs.target_commodity})`)
            }
          </div>
        </div>

        {/* Card 3: Net Capital Saved */}
        <div style={{
          backgroundColor: '#ecfdf5',
          borderRadius: '12px',
          border: '1px solid #a7f3d0',
          padding: '16px 18px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#065f46', textTransform: 'uppercase' }}>
              {isMarathi ? 'एकूण निव्वळ भांडवल बचत' : 'Net Intermediary Savings'}
            </span>
            <div style={{ width: '26px', height: '26px', borderRadius: '6px', backgroundColor: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingDown size={15} color="#065f46" />
            </div>
          </div>

          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#065f46', marginBottom: '2px' }}>
            ₹{currentKPIs.total_net_savings_lakhs.toLocaleString()} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#047857' }}>Lakhs</span>
          </div>

          <div style={{ fontSize: '0.71rem', color: '#047857', lineHeight: 1.3 }}>
            {currentKPIs.total_net_savings_lakhs > 0
              ? (isMarathi 
                ? '३.५% बाजार शुल्क व दलाली शून्य + थेट खरेदी फायदा' 
                : 'Zero 3.5% APMC cess/dalali + direct price arbitrage')
              : (isMarathi 
                ? 'थेट खरेदी करार पूर्ण झाल्यावर निव्वळ बचत मोजली जाईल' 
                : 'Zero intermediary savings until direct contracts are fulfilled')
            }
          </div>
        </div>
      </div>

      {/* 4. MODAL: Adjust Monthly Procurement Target */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}
        onClick={() => setIsModalOpen(false)}
        >
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            maxWidth: '480px',
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              backgroundColor: '#064e3b',
              padding: '18px 22px',
              color: '#ffffff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Target size={18} color="#34d399" />
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                  {isMarathi ? 'मासिक खरेदी उद्दिष्ट निश्चित करा' : 'Configure Sourcing Quota'}
                </h4>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveTarget} style={{ padding: '22px' }}>
              {saveSuccessBanner && (
                <div style={{
                  backgroundColor: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  color: '#065f46',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '16px'
                }}>
                  <Check size={16} />
                  <span>{saveSuccessBanner}</span>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '6px', display: 'block' }}>
                    {isMarathi ? 'प्राथमिक शेतमाल (Commodity)' : 'Target Commodity'}
                  </label>
                  <select
                    value={editCommodity}
                    onChange={(e) => {
                      const chosen = e.target.value;
                      setEditCommodity(chosen);
                      const benchmark = api.getBenchmarkForCommodity(chosen);
                      if (benchmark > 0) {
                        setEditBenchmarkPrice(benchmark);
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.88rem'
                    }}
                  >
                    <option value="Soybean">Soybean (सोयाबीन) — APMC Benchmark: ₹4,880/Qtl</option>
                    <option value="Cotton">Cotton (कापूस) — APMC Benchmark: ₹7,220/Qtl</option>
                    <option value="Gram">Gram / Chana (हरभरा) — APMC Benchmark: ₹5,510/Qtl</option>
                    <option value="Wheat">Wheat (गहू) — APMC Benchmark: ₹2,480/Qtl</option>
                    <option value="Onion">Onion (कांदा) — APMC Benchmark: ₹1,860/Qtl</option>
                    <option value="Maize">Maize (मका) — APMC Benchmark: ₹2,260/Qtl</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '6px', display: 'block' }}>
                    {isMarathi ? 'मासिक खरेदी उद्दिष्ट (क्विंटल)' : 'Monthly Sourcing Target (Quintals)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={editTargetQty}
                    onChange={(e) => setEditTargetQty(Number(e.target.value))}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      fontWeight: 700
                    }}
                  />
                  <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '3px', display: 'block' }}>
                    {isMarathi ? 'उदा. ५,००० क्विंटल (५०० मेट्रिक टन)' : 'e.g. 5,000 Qtl (500 Metric Tonnes for milling cycle)'}
                  </span>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '6px', display: 'block' }}>
                    {isMarathi ? 'बाजार समिती स्पॉट दर बेंचमार्क (₹/क्विंटल)' : 'Prevailing APMC Spot Benchmark (₹/Qtl)'}
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="10"
                    value={editBenchmarkPrice}
                    onChange={(e) => setEditBenchmarkPrice(Number(e.target.value))}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      fontWeight: 700
                    }}
                  />
                  <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '3px', display: 'block' }}>
                    {isMarathi ? 'स्थानिक बाजार समितीचा सरासरी चालू भाव' : 'Prevailing spot price from nearby APMC mandis'}
                  </span>
                </div>
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                <button
                  type="button"
                  className="btn-gov-secondary"
                  onClick={() => setIsModalOpen(false)}
                  style={{ fontSize: '0.82rem', padding: '8px 16px' }}
                >
                  {isMarathi ? 'रद्द करा' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="btn-gov-primary"
                  disabled={isSaving}
                  style={{ fontSize: '0.82rem', padding: '8px 20px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  {isSaving ? (
                    <span>{isMarathi ? 'अद्ययावत होत आहे...' : 'Saving...'}</span>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      <span>{isMarathi ? 'उद्दिष्ट जतन करा' : 'Save Sourcing Quota'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
