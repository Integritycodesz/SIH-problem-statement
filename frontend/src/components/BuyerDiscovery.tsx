import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Clock, Award, Eye, Zap, 
  X, ArrowRight
} from 'lucide-react';
import { api, type User, type ProduceLot } from '../services/api';
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
  currentUser: _currentUser, 
  onNavigateToContracts: _onNavigateToContracts,
  onNavigateToNegotiation,
  lang = 'EN' 
}) => {
  const t = translations[lang];
  const [lots, setLots] = useState<ProduceLot[]>([]);
  const [selectedLot, setSelectedLot] = useState<ProduceLot | null>(null);
  const [assayModalLot, setAssayModalLot] = useState<ProduceLot | null>(null);

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
      const allLots = await api.getLots();
      setLots(allLots);
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
            {t.marketplaceSubtitle}
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

      {/* 2. Filter Bar */}
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

        {/* Dynamic Lots Grid */}
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
                      <span style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 700 }}>★ 4.9</span>
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
                    <button 
                      className="btn-gov-secondary" 
                      style={{ padding: '9px 12px' }}
                      title="Review Batch Specs"
                      onClick={() => setAssayModalLot(lot)}
                    >
                      <Eye size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

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
                  <div><strong>0.4% (Permissible &lt;1.0%)</strong></div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Damaged / Discolored:</span>
                  <div><strong>0.8% (Permissible &lt;2.0%)</strong></div>
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
    </div>
  );
};

export default BuyerDiscovery;
