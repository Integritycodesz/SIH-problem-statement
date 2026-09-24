import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Clock, Award, Eye, Zap, 
  X, ArrowRight, Users, Sparkles, Package, Building2
} from 'lucide-react';
import { api, type User, type ProduceLot } from '../services/api';
import type { FPOPooledBatch } from '../types';
import { AIQualityAssayModal } from './AIQualityAssayModal';
import { BuyerDemandBoard } from './BuyerDemandBoard';
import { translations, type Language } from '../utils/i18n';

interface BuyerDiscoveryProps {
  currentUser: User | null;
  onNavigateToContracts: (contractId?: number) => void;
  onNavigateToNegotiation?: (lot: ProduceLot) => void;
  lang?: Language;
}

const CROP_IMAGES: Record<string, string> = {
  Onion: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=80',
  Soybean: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&auto=format&fit=crop&q=80',
  Tomato: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80',
  Wheat: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop&q=80',
  Cotton: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=800&auto=format&fit=crop&q=80',
  Orange: 'https://images.unsplash.com/photo-1557800636-894a64c1696f?w=800&auto=format&fit=crop&q=80'
};

function getCropImage(commodity: string): string {
  for (const [crop, url] of Object.entries(CROP_IMAGES)) {
    if (commodity.toLowerCase().includes(crop.toLowerCase())) {
      return url;
    }
  }
  return 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80';
}

export const BuyerDiscovery: React.FC<BuyerDiscoveryProps> = ({ 
  currentUser, 
  onNavigateToContracts,
  onNavigateToNegotiation,
  lang = 'EN' 
}) => {
  const t = translations[lang];
  const [lots, setLots] = useState<ProduceLot[]>([]);
  const [selectedLot, setSelectedLot] = useState<ProduceLot | null>(null);
  const [assayModalLot, setAssayModalLot] = useState<ProduceLot | null>(null);

  // Option 1 & 2: FPO Bulk Consignments & Kisan Vision AI Quality State & Reverse RFQ Demands
  const [buyerTab, setBuyerTab] = useState<'INDIVIDUAL_LOTS' | 'FPO_POOLS' | 'DEMANDS'>('INDIVIDUAL_LOTS');
  const [fpoPools, setFpoPools] = useState<FPOPooledBatch[]>([]);
  const [selectedPoolForBreakdown, setSelectedPoolForBreakdown] = useState<FPOPooledBatch | null>(null);
  const [kisanVisionModalOpen, setKisanVisionModalOpen] = useState<boolean>(false);
  const [kisanVisionTargetCommodity, setKisanVisionTargetCommodity] = useState<string>('Onion');

  // Filters
  const [selectedCommodity, setSelectedCommodity] = useState<string>('All');
  const [selectedGrade, setSelectedGrade] = useState<string>('All');
  const [selectedVolume, setSelectedVolume] = useState<string>('All');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [allLots, allPools] = await Promise.all([
        api.getLots(),
        api.getPooledBatches().catch(() => [])
      ]);
      setLots(allLots);
      setFpoPools(allPools);
      if (allLots.length > 0 && !selectedLot) {
        setSelectedLot(allLots[0]);
      }
    } catch (e) {
      console.error('Error loading marketplace data:', e);
    }
  };

  const handleSelectLot = (lot: ProduceLot) => {
    setSelectedLot(lot);
    if (onNavigateToNegotiation) {
      onNavigateToNegotiation(lot);
    }
  };

  const handleInitiateBulkRFQ = (pool: FPOPooledBatch) => {
    if (onNavigateToNegotiation) {
      const poolAsLot: ProduceLot = {
        id: 9000 + pool.id,
        farmer_id: pool.members[0]?.farmer_id || 1,
        farmer_name: pool.fpo_name,
        farmer_phone: pool.fpo_contact_phone,
        mandi_id: 1,
        mandi_name: pool.central_hub_location,
        district: pool.district,
        state: pool.state,
        commodity: pool.commodity,
        variety: pool.variety,
        quantity_quintals: pool.collected_volume_quintals,
        quality_grade: pool.quality_grade,
        moisture_percent: 10.5,
        base_price_per_quintal: pool.unit_base_price,
        expected_delivery_days: 5,
        description: `Institutional bulk consignment pooled by ${pool.fpo_name} (${pool.members.length} member smallholder farmers). Central hub: ${pool.central_hub_location}.`,
        status: 'AVAILABLE',
        created_at: pool.created_at
      };
      onNavigateToNegotiation(poolAsLot);
    }
  };

  // Filter dynamic lots
  const filteredLots = lots.filter(lot => {
    const matchesCommodity = selectedCommodity === 'All' || lot.commodity.toLowerCase().includes(selectedCommodity.toLowerCase());
    const matchesGrade = selectedGrade === 'All' || lot.quality_grade.toLowerCase().includes(selectedGrade.toLowerCase());
    const matchesRegion = selectedRegion === 'All' || lot.district.toLowerCase().includes(selectedRegion.toLowerCase());

    const volumeMT = lot.quantity_quintals / 10;
    const matchesVolume = 
      selectedVolume === 'All' || 
      (selectedVolume.includes('20') && volumeMT >= 20) ||
      (selectedVolume.includes('40') && volumeMT >= 40) ||
      (selectedVolume.includes('80') && volumeMT >= 80);

    return matchesCommodity && matchesGrade && matchesRegion && matchesVolume;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingTop: '16px' }}>
      {/* 1. Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
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
            <ShieldCheck size={13} /> Verified Institutional Agro Portal • Govt. of Maharashtra
          </div>
          <h2 style={{ fontSize: '1.65rem', color: '#0f172a' }}>{t.marketplaceTitle}</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {(currentUser?.role === 'FARMER' || currentUser?.role === 'FPO')
              ? (lang === 'MR'
                  ? 'सर्व शेतकरी व FPO चा नोंदणीकृत शेतमाल, थेट बाजारभाव, NABL गुणवत्ता प्रत व साठ्याची उपलब्धता पहा.'
                  : 'Explore all registered harvest batches, compare mandi price parity, and inspect NABL quality assays across Maharashtra.')
              : t.marketplaceSubtitle}
          </p>
        </div>

        {/* Right Stats Box */}
        <div className="gov-card" style={{ display: 'flex', alignItems: 'center', padding: '10px 18px', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {t.activeLotsCount}
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#059669', fontFamily: 'var(--font-display)' }}>
              {lots.length}
            </div>
          </div>
          <div style={{ width: '1px', height: '30px', backgroundColor: 'var(--border-card)' }} />
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {t.dailyTrading}
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-display)' }}>
              {(lots.reduce((acc, l) => acc + (l.quantity_quintals || 0), 0) / 10).toFixed(0)} <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>MT</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Procurement Mode Switcher: Individual Lots vs FPO Bulk Consignments */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', paddingBottom: '2px', overflowX: 'auto' }}>
        <button
          type="button"
          onClick={() => setBuyerTab('INDIVIDUAL_LOTS')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            fontSize: '0.86rem',
            fontWeight: 700,
            border: 'none',
            borderBottom: buyerTab === 'INDIVIDUAL_LOTS' ? '3px solid #059669' : '3px solid transparent',
            backgroundColor: buyerTab === 'INDIVIDUAL_LOTS' ? '#ecfdf5' : 'transparent',
            color: buyerTab === 'INDIVIDUAL_LOTS' ? '#065f46' : '#64748b',
            borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
            cursor: 'pointer',
            transition: 'all 0.15s',
            whiteSpace: 'nowrap'
          }}
        >
          <Package size={16} />
          <span>{lang === 'MR' ? 'वैयक्तिक शेतमाल नोंदी' : 'Individual Farmer Batches'}</span>
          <span style={{ fontSize: '0.7rem', backgroundColor: buyerTab === 'INDIVIDUAL_LOTS' ? '#a7f3d0' : '#e2e8f0', color: buyerTab === 'INDIVIDUAL_LOTS' ? '#065f46' : '#475569', padding: '1px 7px', borderRadius: '10px' }}>
            {filteredLots.length} Matches
          </span>
        </button>

        <button
          type="button"
          onClick={() => setBuyerTab('FPO_POOLS')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            fontSize: '0.86rem',
            fontWeight: 700,
            border: 'none',
            borderBottom: buyerTab === 'FPO_POOLS' ? '3px solid #059669' : '3px solid transparent',
            backgroundColor: buyerTab === 'FPO_POOLS' ? '#ecfdf5' : 'transparent',
            color: buyerTab === 'FPO_POOLS' ? '#065f46' : '#64748b',
            borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
            cursor: 'pointer',
            transition: 'all 0.15s',
            whiteSpace: 'nowrap'
          }}
        >
          <Users size={16} />
          <span>{lang === 'MR' ? 'FPO संस्थात्मक लॉट्स' : 'FPO Bulk Consignments'}</span>
          <span style={{ fontSize: '0.7rem', backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #86efac', padding: '1px 7px', borderRadius: '10px', fontWeight: 800 }}>
            {fpoPools.length} Bulk
          </span>
        </button>

        <button
          type="button"
          onClick={() => setBuyerTab('DEMANDS')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            fontSize: '0.86rem',
            fontWeight: 700,
            border: 'none',
            borderBottom: buyerTab === 'DEMANDS' ? '3px solid #0284c7' : '3px solid transparent',
            backgroundColor: buyerTab === 'DEMANDS' ? '#f0f9ff' : 'transparent',
            color: buyerTab === 'DEMANDS' ? '#0369a1' : '#64748b',
            borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
            cursor: 'pointer',
            transition: 'all 0.15s',
            whiteSpace: 'nowrap'
          }}
        >
          <Building2 size={16} />
          <span>{lang === 'MR' ? 'खरेदीदार थेट मागणी (Reverse RFQs)' : 'Live Buyer Demands (Reverse RFQs)'}</span>
          <span style={{ fontSize: '0.7rem', backgroundColor: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', padding: '1px 7px', borderRadius: '10px', fontWeight: 800 }}>
            Tenders
          </span>
        </button>
      </div>

      {buyerTab === 'INDIVIDUAL_LOTS' && (
        <>
          {/* 3. Filter Bar */}
          <div className="gov-card" style={{ padding: '14px 18px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
              {t.filterCommodity}
            </label>
            <select value={selectedCommodity} onChange={(e) => setSelectedCommodity(e.target.value)}>
              <option value="All">{t.allCommodities}</option>
              <option value="Onion">Onion (कांदा)</option>
              <option value="Soybean">Soybean (सोयाबीन)</option>
              <option value="Tomato">Tomato (टोमॅटो)</option>
              <option value="Wheat">Wheat (गहू)</option>
              <option value="Cotton">Cotton (कापूस)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
              {t.filterGrade}
            </label>
            <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)}>
              <option value="All">All Quality Grades</option>
              <option value="Grade A+">Grade A+ (Export Ready)</option>
              <option value="Grade A">Grade A (Standard Commercial)</option>
              <option value="Grade B">Grade B (Processing Grade)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
              {t.filterVolume}
            </label>
            <select value={selectedVolume} onChange={(e) => setSelectedVolume(e.target.value)}>
              <option value="All">All Volumes</option>
              <option value="Min: 20 Metric Tonnes">Min: 20 Metric Tonnes</option>
              <option value="Min: 40 Metric Tonnes">Min: 40 Metric Tonnes</option>
              <option value="Min: 80 Metric Tonnes">Min: 80 Metric Tonnes</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
              {t.filterRegion}
            </label>
            <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)}>
              <option value="All">All Regions (Maharashtra)</option>
              <option value="Nashik">Nashik Cluster</option>
              <option value="Pune">Pune & Western Ghats</option>
              <option value="Latur">Marathwada Hub (Latur)</option>
              <option value="Ahmednagar">Ahmednagar Hub</option>
              <option value="Nagpur">Vidarbha Hub (Nagpur)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Available Farmer Lots (Dynamic Filtered Grid) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ fontSize: '1.05rem', color: '#0f172a' }}>{t.activeHarvestLots}</h3>
            <span style={{ 
              backgroundColor: '#f1f5f9', 
              color: '#475569', 
              fontSize: '0.74rem', 
              fontWeight: 700, 
              padding: '2px 8px', 
              borderRadius: 'var(--radius-full)' 
            }}>
              {filteredLots.length} Active Matches
            </span>
          </div>

          <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={14} /> Quality Assured by State Nodal Labs & MSAMB
          </span>
        </div>

        {/* Dynamic Lots Grid or Clean Empty State */}
        {filteredLots.length === 0 ? (
          <div className="gov-card" style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <ShieldCheck size={40} style={{ margin: '0 auto 12px', color: '#94a3b8' }} />
            <h4 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '6px' }}>
              {lang === 'MR' ? 'कोणताही शेतमाल सापडला नाही' : 'No Matching Harvest Lots Found'}
            </h4>
            <p style={{ fontSize: '0.82rem', maxWidth: '440px', margin: '0 auto 16px', lineHeight: 1.5 }}>
              {lang === 'MR'
                ? 'निवडलेल्या निकषांनुसार सध्या कोणताही शेतमाल उपलब्ध नाही. फिल्टर रीसेट करा किंवा वेगळी कमोडिटी निवडा.'
                : 'No verified farmer lots match your current commodity or volume criteria. Try resetting the filters or check back after new mandi arrivals.'}
            </p>
            <button 
              className="btn-gov-secondary"
              onClick={() => {
                setSelectedCommodity('All');
                setSelectedGrade('All');
                setSelectedVolume('All');
                setSelectedRegion('All');
              }}
              style={{ margin: '0 auto' }}
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {filteredLots.map(lot => {
              const isChosen = selectedLot?.id === lot.id;
              return (
                <div 
                  key={lot.id} 
                  className="gov-card" 
                  style={{ 
                    overflow: 'hidden', 
                    display: 'flex', 
                    flexDirection: 'column',
                    border: isChosen ? '2px solid #059669' : '1px solid var(--border-card)',
                    boxShadow: isChosen ? '0 4px 12px rgba(5, 150, 105, 0.15)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ position: 'relative', height: '160px' }}>
                    <img 
                      src={getCropImage(lot.commodity)} 
                      alt={lot.commodity}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '6px' }}>
                      <span className="badge-grade-a">{lot.quality_grade}</span>
                      <span style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#ffffff', padding: '2px 6px', fontSize: '0.68rem', borderRadius: 'var(--radius-xs)', fontWeight: 600 }}>
                        #LOT-{lot.id}
                      </span>
                    </div>
                    <span style={{
                      position: 'absolute',
                      bottom: '10px',
                      right: '10px',
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      color: '#0f172a',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-full)'
                    }}>
                      📍 {lot.district}, MH
                    </span>
                  </div>

                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', gap: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                          {lot.farmer_name}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 700 }}>★ {lot.quality_grade?.includes('A+') ? '4.9' : lot.quality_grade?.includes('A') ? '4.7' : '4.3'}</span>
                      </div>
                      <h4 style={{ fontSize: '1.05rem', color: '#0f172a' }}>{lot.commodity} ({lot.variety})</h4>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {lot.description || 'Assay certified harvest with optimal storage stability and low moisture.'}
                      </p>
                    </div>

                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Available Volume</div>
                        <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>{(lot.quantity_quintals / 10).toFixed(1)} MT ({lot.quantity_quintals} qtl)</strong>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Asking Rate</div>
                        <strong style={{ fontSize: '1.05rem', color: '#059669' }}>₹{lot.base_price_per_quintal} <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ qtl</span></strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      {(currentUser?.role === 'FARMER' || currentUser?.role === 'FPO') ? (
                        (currentUser && (lot.farmer_id === currentUser.id || lot.farmer_name === currentUser.name)) ? (
                          <div style={{ 
                            flex: 1, 
                            textAlign: 'center', 
                            padding: '9px', 
                            fontSize: '0.8rem',
                            backgroundColor: '#ecfdf5',
                            color: '#065f46',
                            borderRadius: 'var(--radius-sm)',
                            fontWeight: 700,
                            border: '1px solid #a7f3d0'
                          }}>
                            {lang === 'MR' ? '✓ तुमचा शेतमाल' : '✓ Your Listed Batch'}
                          </div>
                        ) : (
                          <button 
                            className="btn-gov-secondary"
                            style={{ 
                              flex: 1, 
                              justifyContent: 'center', 
                              padding: '9px', 
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              borderColor: '#cbd5e1',
                              backgroundColor: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                            onClick={() => setAssayModalLot(lot)}
                          >
                            <Eye size={14} /> {lang === 'MR' ? 'तपशील व प्रत पहा' : 'Inspect Quality & Specs'}
                          </button>
                        )
                      ) : (
                        <button 
                          className="btn-gov-primary"
                          style={{ 
                            flex: 1, 
                            justifyContent: 'center', 
                            padding: '9px', 
                            fontSize: '0.8rem',
                            backgroundColor: '#065f46'
                          }}
                          onClick={() => handleSelectLot(lot)}
                        >
                          <Zap size={14} /> {t.openOfferNegotiate}
                        </button>
                      )}
                      <button 
                        className="btn-gov-secondary" 
                        style={{ padding: '9px 12px' }}
                        title="Review Batch Specs"
                        onClick={() => setAssayModalLot(lot)}
                      >
                        <Eye size={15} />
                      </button>
                      <button 
                        className="btn-gov-secondary" 
                        style={{ padding: '9px 12px', color: '#047857', backgroundColor: '#f0fdf4', borderColor: '#a7f3d0' }}
                        title="View Kisan Vision AI Quality Assay"
                        onClick={() => {
                          setKisanVisionTargetCommodity(lot.commodity);
                          setKisanVisionModalOpen(true);
                        }}
                      >
                        <Sparkles size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  )}

  {/* Option 1: FPO Bulk Consignments Grid for Institutional Buyers */}
  {buyerTab === 'FPO_POOLS' && (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Institutional Bulk Aggregation Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
        color: '#ffffff',
        borderRadius: 'var(--radius-md)',
        padding: '24px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 4px 20px rgba(30, 58, 138, 0.2)'
      }}>
        <div style={{ maxWidth: '680px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255,255,255,0.15)', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 700, marginBottom: '8px' }}>
            <Users size={13} /> Institutional Bulk Aggregation • Direct Farm Gate FPO Sourcing
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 6px 0', color: '#ffffff' }}>
            FPO Bulk Consignments (500 – 2,000 Quintals)
          </h3>
          <p style={{ fontSize: '0.84rem', color: '#dbeafe', margin: 0, lineHeight: 1.5 }}>
            Directly procure large commercial container volumes aggregated across verified smallholder consortia in Maharashtra. Eliminates mandi brokerage fees, provides NABL multi-spectral quality certification, and executes under statutory APMC Act Section 29 escrow protection.
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.72rem', color: '#bfdbfe', textTransform: 'uppercase', display: 'block', fontWeight: 700 }}>
            Available Bulk Volume
          </span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>
            {(fpoPools.reduce((acc, p) => acc + p.collected_volume_quintals, 0) / 10).toFixed(0)} MT
          </div>
          <span style={{ fontSize: '0.74rem', color: '#93c5fd' }}>
            Across {fpoPools.length} Certified Consortia
          </span>
        </div>
      </div>

      {/* FPO Bulk Cards Grid */}
      {fpoPools.length === 0 ? (
        <div className="gov-card" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <Users size={36} color="#94a3b8" style={{ margin: '0 auto 12px auto' }} />
          <h4 style={{ color: '#1e293b', marginBottom: '6px' }}>No Active FPO Consignments</h4>
          <p style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '440px', margin: '0 auto 16px auto' }}>
            There are currently no active institutional bulk aggregation pools listed by farmer producer organizations. Check back as FPO cooperatives launch new harvest pools.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '20px' }}>
          {fpoPools.map(pool => {
            const fillPercent = Math.min(100, Math.round((pool.collected_volume_quintals / pool.target_volume_quintals) * 100));
            const isReady = pool.status === 'READY_FOR_INSTITUTIONAL_RFQ' || fillPercent >= 100;
            const totalConsignmentValue = pool.collected_volume_quintals * pool.unit_base_price;

            return (
              <div
                key={pool.id}
              className="gov-card"
              style={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
                border: isReady ? '2px solid #2563eb' : '1px solid var(--border-card)',
                boxShadow: isReady ? '0 4px 14px rgba(37, 99, 235, 0.15)' : 'none'
              }}
            >
              <div>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: isReady ? '#eff6ff' : '#ecfdf5',
                        color: isReady ? '#1d4ed8' : '#047857',
                        border: isReady ? '1px solid #bfdbfe' : '1px solid #a7f3d0'
                      }}>
                        {isReady ? '★ Ready for Institutional Procurement' : '● Aggregation in Progress'}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>
                        FPO Reg: {pool.fpo_registration_number}
                      </span>
                    </div>
                    <h4 style={{ fontSize: '1.18rem', color: '#0f172a', margin: 0 }}>
                      {pool.fpo_name}
                    </h4>
                    <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                      Cluster Coordinator: <strong>{pool.fpo_contact_person}</strong> ({pool.fpo_contact_phone})
                    </p>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>Base Rate</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669' }}>
                      ₹{pool.unit_base_price} <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>/ qtl</span>
                    </span>
                  </div>
                </div>

                {/* Commodity & Central Hub */}
                <div style={{ backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Consignment Produce:</span>
                    <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block' }}>
                      {pool.commodity} — {pool.variety} ({pool.quality_grade})
                    </strong>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Central Cold Storage Hub:</span>
                    <div style={{ fontSize: '0.76rem', fontWeight: 600, color: '#475569' }}>
                      📍 {pool.central_hub_location}
                    </div>
                  </div>
                </div>

                {/* Volume Fulfilled Progress Bar */}
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px' }}>
                    <span>
                      Available Consolidated Batch: <strong>{pool.collected_volume_quintals}</strong> / {pool.target_volume_quintals} Qtl ({(pool.collected_volume_quintals / 10).toFixed(1)} MT)
                    </span>
                    <strong style={{ color: isReady ? '#2563eb' : '#059669' }}>
                      {fillPercent}% Consolidated
                    </strong>
                  </div>
                  <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${fillPercent}%`,
                        height: '100%',
                        backgroundColor: isReady ? '#2563eb' : '#059669',
                        transition: 'width 0.4s ease'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    <span>Consortium of {pool.members.length} verified smallholders</span>
                    <span>Estimated Value: <strong>₹{(totalConsignmentValue / 100000).toFixed(2)} Lakhs</strong></span>
                  </div>
                </div>

                {/* Smallholder breakdown pills */}
                <div style={{ marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                    Contributing Smallholder Share Breakdown
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {pool.members.slice(0, 4).map((m, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.72rem',
                          backgroundColor: '#ffffff',
                          border: '1px solid #cbd5e1',
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-xs)',
                          color: '#334155',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <strong>{m.farmer_name}</strong>: {m.quantity_quintals} Qtl ({m.payout_share_percent}%)
                      </span>
                    ))}
                    {pool.members.length > 4 && (
                      <span style={{ fontSize: '0.72rem', color: '#64748b', padding: '3px 6px', fontWeight: 600 }}>
                        +{pool.members.length - 4} more farmers
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '12px', flexWrap: 'wrap' }}>
                <button
                  className="btn-gov-secondary"
                  onClick={() => setSelectedPoolForBreakdown(pool)}
                  style={{ flex: 1, minWidth: '150px', padding: '9px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Users size={14} /> View Member Split
                </button>

                <button
                  className="btn-gov-secondary"
                  onClick={() => {
                    setKisanVisionTargetCommodity(pool.commodity);
                    setKisanVisionModalOpen(true);
                  }}
                  style={{ padding: '9px 14px', fontSize: '0.78rem', color: '#047857', backgroundColor: '#f0fdf4', borderColor: '#a7f3d0', display: 'flex', alignItems: 'center', gap: '6px' }}
                  title="Inspect Produce with Kisan Vision AI"
                >
                  <Sparkles size={14} /> AI Quality Assay
                </button>

                {currentUser?.role === 'FARMER' ? (
                  <div style={{
                    flex: 1,
                    minWidth: '170px',
                    padding: '9px 14px',
                    fontSize: '0.8rem',
                    backgroundColor: '#eff6ff',
                    color: '#1e40af',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 700,
                    textAlign: 'center',
                    border: '1px solid #bfdbfe'
                  }}>
                    {lang === 'MR' ? '✓ FPO संकलन पूल' : '✓ FPO Aggregated Pool'}
                  </div>
                ) : (
                  <button
                    className="btn-gov-primary"
                    onClick={() => handleInitiateBulkRFQ(pool)}
                    style={{ flex: 1, minWidth: '170px', padding: '9px 14px', fontSize: '0.8rem', backgroundColor: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <Zap size={14} /> Initiate Bulk RFQ ({pool.collected_volume_quintals} Qtl)
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    )}
    </div>
  )}

  {/* Option 3: Institutional Buyer Demand Aggregation (Reverse RFQ / Procurement Tenders) */}
  {buyerTab === 'DEMANDS' && (
    <div style={{ marginTop: '6px' }}>
      <BuyerDemandBoard
        currentUser={currentUser}
        onNavigateToContracts={onNavigateToContracts}
        lang={lang}
      />
    </div>
  )}

      {/* 4. Dedicated Bilateral RFQ Workspace Callout Banner */}
      <div style={{
        backgroundColor: '#f0fdf4',
        border: '1px solid #bbf7d0',
        borderRadius: 'var(--radius-md)',
        padding: '22px 26px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            width: '46px', 
            height: '46px', 
            borderRadius: '50%', 
            backgroundColor: '#065f46', 
            color: '#ffffff', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(6, 95, 70, 0.18)'
          }}>
            <Zap size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              ● DIRECT TRANSACTION WORKSPACE
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '2px 0 4px' }}>
              {t.rfqConsoleTitle}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Direct FPO counter-negotiation, multi-round bid audit trail, and 50% RBI escrow advance locking in a dedicated transaction portal.
            </p>
          </div>
        </div>

        <button
          className="btn-gov-primary"
          style={{ padding: '11px 20px', fontSize: '0.85rem' }}
          onClick={() => {
            if (onNavigateToNegotiation && (selectedLot || lots[0])) {
              onNavigateToNegotiation(selectedLot || lots[0]);
            }
          }}
        >
          <span>Open Bilateral RFQ Workspace</span>
          <ArrowRight size={15} />
        </button>
      </div>

      {/* 5. Three Feature Highlights */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        <div className="gov-card" style={{ padding: '20px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', marginBottom: '10px' }}>
            <ShieldCheck size={18} />
          </div>
          <h4 style={{ fontSize: '0.95rem', color: '#0f172a', marginBottom: '4px' }}>100% Escrow Protection</h4>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Funds remain locked in RBI-regulated escrow account until recipient digitally completes quality inspection at receiving warehouse.
          </p>
          <span style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            RBI Mandated Scheme →
          </span>
        </div>

        <div className="gov-card" style={{ padding: '20px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706', marginBottom: '10px' }}>
            <Clock size={18} />
          </div>
          <h4 style={{ fontSize: '0.95rem', color: '#0f172a', marginBottom: '4px' }}>24-hr Quality Inspection</h4>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Take delivery at your facility and evaluate grading against the official assay report. Instant dispute arbitration if variance exceeds 3%.
          </p>
          <span style={{ fontSize: '0.74rem', color: '#d97706', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            NABL Certified QC →
          </span>
        </div>

        <div className="gov-card" style={{ padding: '20px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7', marginBottom: '10px' }}>
            <Award size={18} />
          </div>
          <h4 style={{ fontSize: '0.95rem', color: '#0f172a', marginBottom: '4px' }}>Zero Middleman Commission</h4>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Direct farm-gate to corporate buyer linkage. Transparent settlement removes aadhatya fees and unaccounted mandi deductions.
          </p>
          <span style={{ fontSize: '0.74rem', color: '#0284c7', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            MSIS State Initiative →
          </span>
        </div>
      </div>

      {/* Modal: NABL Assay Specs Certificate */}
      {assayModalLot && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={20} color="#059669" />
                <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>NABL Laboratory Assay Certificate</strong>
              </div>
              <button onClick={() => setAssayModalLot(null)} style={{ background: 'transparent', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: 'var(--radius-sm)', padding: '14px', backgroundColor: '#f8fafc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '10px' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>CERTIFICATE REF</div>
                  <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>NABL-MH-2026-{assayModalLot.id}</strong>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>TEST STATUS</div>
                  <span className="badge-grade-a">PASS • GRADE A</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.76rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Commodity:</span>
                  <div><strong>{assayModalLot.commodity} ({assayModalLot.variety})</strong></div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Lot Volume:</span>
                  <div><strong>{assayModalLot.quantity_quintals} Quintals</strong></div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Moisture Content:</span>
                  <div><strong style={{ color: '#059669' }}>{assayModalLot.moisture_percent}% (Dry Standard)</strong></div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Foreign Matter:</span>
                  <div><strong>{assayModalLot.quality_grade?.includes('A+') ? '0.3' : assayModalLot.quality_grade?.includes('A') ? '0.5' : '0.7'}% (Permissible &lt;1.0%)</strong></div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Damaged / Discolored:</span>
                  <div><strong>{assayModalLot.quality_grade?.includes('A+') ? '0.5' : assayModalLot.quality_grade?.includes('A') ? '0.8' : '1.2'}% (Permissible &lt;2.0%)</strong></div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Harvest Hub:</span>
                  <div><strong>{assayModalLot.mandi_name || 'Lasalgaon APMC'}</strong></div>
                </div>
              </div>

              <div style={{ marginTop: '14px', padding: '10px', backgroundColor: '#ecfdf5', borderRadius: 'var(--radius-xs)', fontSize: '0.72rem', color: '#065f46', lineHeight: 1.4 }}>
                ✓ Certified by Maharashtra State Agricultural Marketing Board (MSAMB) electronic grading terminal. This lot qualifies for direct institutional procurement without secondary mandi auction.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '14px' }}>
              <button className="btn-gov-primary" onClick={() => setAssayModalLot(null)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Kisan Vision AI Computer Vision Quality Assay */}
      <AIQualityAssayModal
        isOpen={kisanVisionModalOpen}
        onClose={() => setKisanVisionModalOpen(false)}
        initialCommodity={kisanVisionTargetCommodity}
        contextMode="INSPECTION"
      />

      {/* Modal: FPO Pool Composition & Member Distribution Breakdown */}
      {selectedPoolForBreakdown && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '640px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase' }}>
                  <Users size={14} /> Institutional Consignment Pool Composition
                </div>
                <h3 style={{ fontSize: '1.2rem', color: '#0f172a', margin: '2px 0 0 0' }}>
                  {selectedPoolForBreakdown.fpo_name}
                </h3>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                  {selectedPoolForBreakdown.commodity} ({selectedPoolForBreakdown.variety}) • Reg: {selectedPoolForBreakdown.fpo_registration_number}
                </p>
              </div>
              <button
                onClick={() => setSelectedPoolForBreakdown(null)}
                style={{ background: 'transparent', color: '#64748b', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Consignment Target Snapshot */}
            <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 'var(--radius-sm)', padding: '12px 16px', marginBottom: '16px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#1e40af', display: 'block' }}>Target Consignment</span>
                <strong style={{ fontSize: '1rem', color: '#1e40af' }}>{selectedPoolForBreakdown.target_volume_quintals} Qtl</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#1e40af', display: 'block' }}>Consolidated Volume</span>
                <strong style={{ fontSize: '1rem', color: '#1d4ed8' }}>{selectedPoolForBreakdown.collected_volume_quintals} Qtl</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#1e40af', display: 'block' }}>Total Escrow Pool</span>
                <strong style={{ fontSize: '1rem', color: '#0f172a' }}>
                  ₹{((selectedPoolForBreakdown.collected_volume_quintals * selectedPoolForBreakdown.unit_base_price) / 100000).toFixed(2)}L
                </strong>
              </div>
            </div>

            {/* Member Allocation Table */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: '14px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', textAlign: 'left' }}>
                    <th style={{ padding: '8px 12px', fontWeight: 700 }}>Farmer Member</th>
                    <th style={{ padding: '8px 12px', fontWeight: 700 }}>District</th>
                    <th style={{ padding: '8px 12px', fontWeight: 700 }}>Pooled Qty</th>
                    <th style={{ padding: '8px 12px', fontWeight: 700 }}>Payout Share</th>
                    <th style={{ padding: '8px 12px', fontWeight: 700 }}>Est. Escrow Value</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPoolForBreakdown.members.map((member, i) => {
                    const memberValue = Math.round(member.quantity_quintals * selectedPoolForBreakdown.unit_base_price);
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px 12px', fontWeight: 600, color: '#0f172a' }}>
                          {member.farmer_name}
                          {member.lot_id && <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block' }}>Lot #{member.lot_id}</span>}
                        </td>
                        <td style={{ padding: '8px 12px', color: '#475569' }}>{member.district}</td>
                        <td style={{ padding: '8px 12px', fontWeight: 700, color: '#0f172a' }}>{member.quantity_quintals} Qtl</td>
                        <td style={{ padding: '8px 12px' }}>
                          <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '1px 6px', borderRadius: '4px', fontWeight: 700, fontSize: '0.72rem' }}>
                            {member.payout_share_percent}%
                          </span>
                        </td>
                        <td style={{ padding: '8px 12px', fontWeight: 700, color: '#059669' }}>
                          ₹{memberValue.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ fontSize: '0.72rem', color: '#475569', backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: 'var(--radius-xs)', marginBottom: '14px' }}>
              🛡️ <strong>Statutory Escrow Nodal Protection:</strong> Buyers execute a single master digital contract with the registered FPO entity. Upon gate delivery and inspection release, the payment gateway automatically splits the payout directly into each farmer's Aadhaar-linked bank account without intermediary handling.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                className="btn-gov-secondary"
                onClick={() => setSelectedPoolForBreakdown(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn-gov-primary"
                style={{ backgroundColor: '#1e40af' }}
                onClick={() => {
                  const pool = selectedPoolForBreakdown;
                  setSelectedPoolForBreakdown(null);
                  handleInitiateBulkRFQ(pool);
                }}
              >
                <Zap size={14} /> Initiate Bulk RFQ ({selectedPoolForBreakdown.collected_volume_quintals} Qtl)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyerDiscovery;
