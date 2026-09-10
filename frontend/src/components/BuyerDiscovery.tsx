import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Clock, Award, Lock, Eye, Zap, 
  Send, X, CheckCircle2
} from 'lucide-react';
import { api, type User, type ProduceLot, type RFQ } from '../services/api';
import { translations, type Language } from '../utils/i18n';

interface BuyerDiscoveryProps {
  currentUser: User | null;
  onNavigateToContracts: (contractId?: number) => void;
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
  lang = 'EN' 
}) => {
  const t = translations[lang];
  const [lots, setLots] = useState<ProduceLot[]>([]);
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [selectedLot, setSelectedLot] = useState<ProduceLot | null>(null);
  const [activeRfq, setActiveRfq] = useState<RFQ | null>(null);
  const [assayModalLot, setAssayModalLot] = useState<ProduceLot | null>(null);

  // Filters
  const [selectedCommodity, setSelectedCommodity] = useState<string>('All');
  const [selectedGrade, setSelectedGrade] = useState<string>('All');
  const [selectedVolume, setSelectedVolume] = useState<string>('All');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');

  // Negotiation Console Inputs
  const [counterBid, setCounterBid] = useState<number>(2420);
  const [counterNote, setCounterNote] = useState<string>('Proposing rate with 50% advance locked in escrow today.');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [allLots, allRfqs] = await Promise.all([
        api.getLots(),
        api.getRFQs()
      ]);
      setLots(allLots);
      setRfqs(allRfqs);
      if (allLots.length > 0 && !selectedLot) {
        setSelectedLot(allLots[0]);
        matchOrCreateRFQ(allLots[0], allRfqs);
      }
    } catch (e) {
      console.error('Error loading marketplace data:', e);
    }
  };

  const matchOrCreateRFQ = (lot: ProduceLot, currentRfqs: RFQ[]) => {
    const existing = currentRfqs.find(r => r.lot_id === lot.id);
    if (existing) {
      setActiveRfq(existing);
      setCounterBid(existing.current_offered_price || lot.base_price_per_quintal);
    } else {
      // Dummy visual RFQ session until initiated
      const tempRfq: RFQ = {
        id: Date.now(),
        lot_id: lot.id,
        buyer_id: currentUser?.id || 8,
        buyer_name: currentUser?.name || 'Sahyadri Agro Processing Ltd',
        farmer_id: lot.farmer_id,
        farmer_name: lot.farmer_name,
        commodity: lot.commodity,
        quantity_quintals: lot.quantity_quintals,
        initial_offer_price: lot.base_price_per_quintal - 50,
        current_offered_price: lot.base_price_per_quintal - 50,
        status: 'PENDING',
        delivery_timeline_days: lot.expected_delivery_days || 3,
        delivery_address: 'APMC Central Logistics Processing Terminal, Sector 19, Vashi',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        messages: [
          {
            id: 1,
            rfq_id: Date.now(),
            sender_id: lot.farmer_id,
            sender_name: lot.farmer_name,
            sender_role: 'FARMER',
            offered_price: lot.base_price_per_quintal,
            message_text: `Official asking rate for Lot #${lot.id}: ₹${lot.base_price_per_quintal}/qtl. Moisture index ${lot.moisture_percent}%.`,
            created_at: new Date(Date.now() - 3600 * 1000 * 2).toISOString()
          }
        ]
      };
      setActiveRfq(tempRfq);
      setCounterBid(lot.base_price_per_quintal - 30);
    }
  };

  const handleSelectLot = (lot: ProduceLot) => {
    setSelectedLot(lot);
    matchOrCreateRFQ(lot, rfqs);
    // Scroll smoothly to negotiation desk
    const desk = document.getElementById('negotiation-desk');
    if (desk) {
      desk.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCounterSubmit = async () => {
    if (!selectedLot || !activeRfq) return;
    setIsSubmitting(true);
    try {
      let rfqId = activeRfq.id;
      // If it's a new unsaved session, create it first
      const exists = rfqs.some(r => r.id === rfqId);
      if (!exists) {
        const created = await api.createRFQ({
          lot_id: selectedLot.id,
          buyer_id: currentUser?.id || 8,
          buyer_name: currentUser?.name || 'Sahyadri Agro Processing Ltd (Pravin Joshi)',
          farmer_id: selectedLot.farmer_id,
          farmer_name: selectedLot.farmer_name,
          commodity: selectedLot.commodity,
          quantity_quintals: selectedLot.quantity_quintals,
          initial_offer_price: counterBid,
          delivery_timeline_days: selectedLot.expected_delivery_days || 3,
          delivery_address: 'APMC Central Logistics Terminal, Vashi Navi Mumbai',
          first_message: counterNote
        });
        rfqId = created.id;
      } else {
        await api.counterOffer(rfqId, {
          sender_id: currentUser?.id || 8,
          sender_name: currentUser?.name || 'Sahyadri Agro Processing Ltd (Pravin Joshi)',
          sender_role: 'BUYER',
          offered_price: counterBid,
          message_text: counterNote
        });
      }

      const allRfqs = await api.getRFQs();
      setRfqs(allRfqs);
      const updated = allRfqs.find(r => r.id === rfqId);
      if (updated) setActiveRfq(updated);
      setCounterNote('');
    } catch (err) {
      console.error('Error submitting counter offer:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptTermsAndSign = async () => {
    if (!activeRfq) return;
    setIsSubmitting(true);
    try {
      const res = await api.acceptRFQ(activeRfq.id);
      onNavigateToContracts(res.contract.id);
    } catch (err) {
      console.error('Error accepting terms:', err);
    } finally {
      setIsSubmitting(false);
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

  const totalQuintals = selectedLot?.quantity_quintals || 400;
  const totalDealValue = totalQuintals * counterBid;
  const escrowAdvance = Math.round(totalDealValue * 0.5);
  const askingRate = selectedLot?.base_price_per_quintal || 2450;
  const savingPerQtl = askingRate - counterBid;

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
                        backgroundColor: isChosen ? '#059669' : '#065f46'
                      }}
                      onClick={() => handleSelectLot(lot)}
                    >
                      <Zap size={14} /> {isChosen ? 'Selected in Console' : t.openOfferNegotiate}
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

      {/* 4. Bilateral RFQ Negotiation Console */}
      <div id="negotiation-desk">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              ● DIRECT TRANSACTION WORKSPACE
            </div>
            <h3 style={{ fontSize: '1.25rem', color: '#0f172a' }}>{t.rfqConsoleTitle}</h3>
          </div>

          <span style={{ 
            backgroundColor: '#fffbeb', 
            color: '#b45309', 
            border: '1px solid #fde68a', 
            fontSize: '0.74rem', 
            fontWeight: 700, 
            padding: '4px 12px', 
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#d97706' }} />
            Active Lot #{selectedLot?.id || 819} • Bilateral Channel
          </span>
        </div>

        {/* Split Cards: Left Lot Specs & Right Negotiation Desk */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '20px' }}>
          {/* Left Card: Lot Specs & Escrow Milestones */}
          <div className="gov-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>LOT #MH-{selectedLot?.district?.slice(0, 3)?.toUpperCase() || 'NSK'}-{selectedLot?.id || 819}</span>
                <span className="badge-grade-a">{selectedLot?.quality_grade || 'Grade A+ Certified'}</span>
              </div>
              <h4 style={{ fontSize: '1.3rem', color: '#0f172a' }}>
                {(selectedLot?.quantity_quintals ? selectedLot.quantity_quintals / 10 : 40)} MT {selectedLot?.commodity} ({selectedLot?.variety})
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {selectedLot?.farmer_name || 'Nashik Kisan Samruddhi FPO'} • MSIS Certified Aggregation
              </p>
            </div>

            {/* 4 mini spec boxes */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t.totalLotWeight}</div>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>{selectedLot?.quantity_quintals || 400} Quintals</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{(selectedLot?.quantity_quintals ? selectedLot.quantity_quintals / 10 : 40)} Metric Tonnes</div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t.lasalgaonAvg}</div>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#059669' }}>₹2,380 / qtl</div>
                <div style={{ fontSize: '0.68rem', color: '#059669' }}>+2.9% prevailing APMC</div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Moisture & QC</div>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>{selectedLot?.moisture_percent || 11.4}% (Optimal)</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>NABL Lab Certified</div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t.dispatchReadiness}</div>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>Ready in {selectedLot?.expected_delivery_days || 3} Days</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>FOB APMC Cold Hub</div>
              </div>
            </div>

            {/* Escrow Milestone Protection 4 Steps */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Escrow Milestone Protection
                </span>
                <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={13} /> RBI Escrow Backed
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', textAlign: 'center' }}>
                <div style={{ padding: '6px', backgroundColor: '#ecfdf5', borderRadius: 'var(--radius-sm)', border: '1px solid #a7f3d0' }}>
                  <div style={{ width: '18px', height: '18px', margin: '0 auto 4px', borderRadius: '50%', backgroundColor: '#065f46', color: '#fff', fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>1</div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#065f46' }}>50% Advance</div>
                </div>

                <div style={{ padding: '6px', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                  <div style={{ width: '18px', height: '18px', margin: '0 auto 4px', borderRadius: '50%', backgroundColor: '#94a3b8', color: '#fff', fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>2</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Dispatch</div>
                </div>

                <div style={{ padding: '6px', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                  <div style={{ width: '18px', height: '18px', margin: '0 auto 4px', borderRadius: '50%', backgroundColor: '#94a3b8', color: '#fff', fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>3</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>QC Sign-off</div>
                </div>

                <div style={{ padding: '6px', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                  <div style={{ width: '18px', height: '18px', margin: '0 auto 4px', borderRadius: '50%', backgroundColor: '#94a3b8', color: '#fff', fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>4</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Release</div>
                </div>
              </div>
            </div>

            {/* Negotiation Audit Trail & Message History */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                {t.bidHistoryTitle}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                {activeRfq?.messages && activeRfq.messages.length > 0 ? (
                  activeRfq.messages.map((m, idx) => {
                    const isBuyer = m.sender_role === 'BUYER';
                    return (
                      <div 
                        key={idx} 
                        style={{ 
                          padding: '8px 10px', 
                          borderRadius: 'var(--radius-xs)', 
                          backgroundColor: isBuyer ? '#f0f9ff' : '#ecfdf5',
                          border: `1px solid ${isBuyer ? '#bae6fd' : '#bbf7d0'}`,
                          fontSize: '0.74rem'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                          <strong style={{ color: isBuyer ? '#0284c7' : '#059669' }}>
                            {m.sender_name} ({m.sender_role})
                          </strong>
                          <span style={{ fontWeight: 800, color: '#0f172a' }}>
                            ₹{m.offered_price} / qtl
                          </span>
                        </div>
                        <div style={{ color: '#475569' }}>{m.message_text}</div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Initial session opened. Submit a counter-offer below to start negotiation.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Card: Pricing & RFQ Inputs */}
          <div className="gov-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Comparative Price Boxes */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Lock size={12} /> FPO Asking Rate
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                    ₹{askingRate} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>/ Quintal</span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Base lot asking price</div>
                </div>

                <div style={{ backgroundColor: '#f0fdf4', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 600 }}>
                    {t.yourCounterBid}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#065f46' }}>₹</span>
                    <input 
                      type="number" 
                      value={counterBid}
                      onChange={(e) => setCounterBid(Number(e.target.value))}
                      style={{ 
                        fontSize: '1.25rem', 
                        fontWeight: 800, 
                        color: '#065f46', 
                        border: 'none', 
                        backgroundColor: 'transparent',
                        padding: 0,
                        width: '110px'
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#15803d' }}>
                    Saving: <strong>₹{savingPerQtl}/qtl</strong> vs asking
                  </div>
                </div>
              </div>

              {/* Message / Terms Note Input */}
              <div>
                <label style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px', display: 'block' }}>
                  Counter-Offer Note & Terms:
                </label>
                <input 
                  type="text" 
                  value={counterNote}
                  onChange={(e) => setCounterNote(e.target.value)}
                  placeholder="e.g. Can do ₹2,420 if delivered within 3 days..."
                  style={{ width: '100%', padding: '7px 10px', fontSize: '0.8rem' }}
                />
              </div>

              {/* Breakdown Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                  <span>{t.totalLotWeight}</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{totalQuintals} Quintals ({(totalQuintals / 10).toFixed(1)} MT)</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                  <span>Proposed Counter Rate</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>₹{counterBid} / qtl</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                  <span>APMC Cess & Portal Surcharge (0.0%)</span>
                  <span style={{ fontWeight: 600, color: '#059669' }}>₹0 (Govt. Subsidized)</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                  <div>
                    <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>{t.totalDealValue}</strong>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Contract Total (Pre-tax)</div>
                  </div>
                  <strong style={{ fontSize: '1.25rem', color: '#0f172a' }}>
                    ₹{totalDealValue.toLocaleString()}
                  </strong>
                </div>
              </div>

              {/* Green Escrow Callout */}
              <div style={{ 
                backgroundColor: '#ecfdf5', 
                border: '1px solid #a7f3d0', 
                borderRadius: 'var(--radius-sm)', 
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={18} color="#059669" />
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#065f46' }}>
                      {t.escrowAdvanceReq}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#059669' }}>
                      Locked in SBI Nodal Escrow until physical QC sign-off
                    </div>
                  </div>
                </div>

                <strong style={{ fontSize: '1.2rem', color: '#065f46', fontFamily: 'var(--font-display)' }}>
                  ₹{escrowAdvance.toLocaleString()}
                </strong>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="btn-gov-secondary"
                style={{ flex: 1, justifyContent: 'center', padding: '11px', fontSize: '0.86rem' }}
                disabled={isSubmitting}
                onClick={handleCounterSubmit}
              >
                <Send size={14} /> {t.submitCounterOffer}
              </button>

              <button 
                className="btn-gov-primary"
                style={{ flex: 1, justifyContent: 'center', padding: '11px', fontSize: '0.86rem' }}
                disabled={isSubmitting}
                onClick={handleAcceptTermsAndSign}
              >
                <CheckCircle2 size={14} /> {t.acceptTermsSign}
              </button>
            </div>
          </div>
        </div>
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
