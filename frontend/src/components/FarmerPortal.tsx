import React, { useState, useEffect } from 'react';
import { 
  Package, ShieldCheck, Clock, ArrowRight, 
  Printer, Plus, 
  MessageSquare, Building2, PhoneCall, X, QrCode, Check
} from 'lucide-react';
import { api, type User, type ProduceLot, type RFQ, type Contract } from '../services/api';
import { translations, type Language } from '../utils/i18n';

interface FarmerPortalProps {
  currentUser: User | null;
  onNavigateToRFQs: (lot?: ProduceLot) => void;
  lang?: Language;
  onRequireAuth?: (message?: string, onComplete?: () => void) => void;
}

const CROP_IMAGES: Record<string, string> = {
  Onion: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80',
  Soybean: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=600&auto=format&fit=crop&q=80',
  Tomato: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
  Wheat: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80',
  Cotton: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=600&auto=format&fit=crop&q=80',
  Orange: 'https://images.unsplash.com/photo-1557800636-894a64c1696f?w=600&auto=format&fit=crop&q=80'
};

function getCropImage(commodity: string): string {
  for (const [crop, url] of Object.entries(CROP_IMAGES)) {
    if (commodity.toLowerCase().includes(crop.toLowerCase())) {
      return url;
    }
  }
  return 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&auto=format&fit=crop&q=80';
}

export const FarmerPortal: React.FC<FarmerPortalProps> = ({ currentUser, onNavigateToRFQs, lang = 'EN', onRequireAuth }) => {
  const t = translations[lang];
  const [lots, setLots] = useState<ProduceLot[]>([]);
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [showAddHarvestModal, setShowAddHarvestModal] = useState<boolean>(false);
  const [qrModalLot, setQrModalLot] = useState<ProduceLot | null>(null);
  const [showIncomingOffers, setShowIncomingOffers] = useState<boolean>(false);
  const [counterPriceInput, setCounterPriceInput] = useState<Record<number, number>>({});
  const [lotSuccessMsg, setLotSuccessMsg] = useState<string>('');

  // New Harvest Form State
  const [newCommodity, setNewCommodity] = useState<string>('Nasik Red Onion');
  const [newVariety, setNewVariety] = useState<string>('Grade A Garwa');
  const [newVolume, setNewVolume] = useState<number>(30); // MT
  const [newRate, setNewRate] = useState<number>(2450); // ₹/qtl
  const [newGrade, setNewGrade] = useState<string>('Grade A+');
  const [newMoisture, setNewMoisture] = useState<number>(11.2);
  const [newDeliveryDays, setNewDeliveryDays] = useState<number>(3);
  const [newHub, setNewHub] = useState<string>('Lasalgaon APMC Cold Hub');

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    try {
      const [allLots, allRfqs, allContracts] = await Promise.all([
        api.getLots(),
        api.getRFQs(),
        api.getContracts()
      ]);
      setLots(allLots);
      setRfqs(allRfqs);
      setContracts(allContracts);
    } catch (e) {
      console.error('Error loading farmer data:', e);
    }
  };

  const handleCreateLot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.createLot({
        farmer_id: currentUser?.id || 1,
        farmer_name: currentUser?.name || 'Ramesh Patil (Nashik FPO)',
        farmer_phone: currentUser?.phone || '9822012345',
        commodity: newCommodity,
        variety: newVariety,
        quantity_quintals: newVolume * 10,
        base_price_per_quintal: newRate,
        quality_grade: newGrade,
        moisture_percent: newMoisture,
        expected_delivery_days: newDeliveryDays,
        mandi_name: newHub,
        district: currentUser?.district || 'Nashik',
        description: `${newGrade} certified batch with ${newMoisture}% moisture index. Stored at ${newHub}.`
      });

      setShowAddHarvestModal(false);
      await loadData();
      setLotSuccessMsg(`✓ Lot #${created.id} successfully listed! ${newVolume} MT (${newVolume * 10} Qtl) is now live across institutional buyer network.`);
      setTimeout(() => setLotSuccessMsg(''), 6000);
    } catch (err) {
      console.error('Error creating lot:', err);
    }
  };

  const handleFarmerCounter = async (rfqId: number) => {
    const price = counterPriceInput[rfqId];
    if (!price) return;
    try {
      await api.counterOffer(rfqId, {
        sender_id: currentUser?.id || 1,
        sender_name: currentUser?.name || 'Farmer FPO',
        sender_role: 'FARMER',
        offered_price: price,
        message_text: `Farmer FPO counter-offer: ₹${price}/qtl. Assay guaranteed.`
      });
      await loadData();
      alert(`Counter-offer of ₹${price}/qtl transmitted to buyer.`);
    } catch (err) {
      console.error('Error countering offer:', err);
    }
  };

  const handleFarmerAccept = async (rfqId: number) => {
    try {
      const res = await api.acceptRFQ(rfqId);
      await loadData();
      alert(`Offer Accepted! Digital Contract #${res.contract.contract_number} has been generated. Advance escrow pending buyer lock.`);
    } catch (err) {
      console.error('Error accepting RFQ:', err);
    }
  };

  const handleOpenDirectBid = () => {
    const doNav = () => onNavigateToRFQs();
    if (onRequireAuth && !currentUser) {
      onRequireAuth(
        lang === 'MR'
          ? 'थेट संस्थात्मक खरेदीदार चॅनेल सुरू करण्यासाठी कृपया लॉगिन करा.'
          : 'Connecting to direct institutional buyer channels requires authentication. Please sign in first.',
        doNav
      );
    } else {
      doNav();
    }
  };

  // Aggregated Dynamic Stats
  const totalQuintalsListed = lots.reduce((acc, l) => acc + (Number(l.quantity_quintals) || 0), 0);
  const totalMT = (totalQuintalsListed / 10).toFixed(1);
  const totalEscrowSecured = contracts.reduce((acc, c) => acc + (c.escrow?.advance_amount || 0), 0);
  const activeInquiriesCount = rfqs.filter(r => r.status === 'PENDING' || r.status === 'COUNTERED').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingTop: '16px' }}>
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
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#059669' }} />
            {t.fpoBadge}
          </div>
          <h2 style={{ fontSize: '1.65rem', color: '#0f172a' }}>{t.farmerTitle}</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {t.farmerSubtitle}
          </p>
        </div>

        {/* Right Action Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn-gov-secondary"
            onClick={() => {
              const toggleOffers = () => setShowIncomingOffers(!showIncomingOffers);
              if (onRequireAuth && !currentUser) {
                onRequireAuth(
                  lang === 'MR' 
                    ? 'खरेदीदारांच्या ऑफर्स पाहण्यासाठी कृपया प्रथम लॉगिन करा.' 
                    : 'Viewing incoming buyer offers requires authentication. Please sign in first.',
                  toggleOffers
                );
              } else {
                toggleOffers();
              }
            }}
            style={{ 
              backgroundColor: showIncomingOffers ? '#ecfdf5' : '#ffffff',
              borderColor: showIncomingOffers ? '#a7f3d0' : 'var(--border-card)',
              color: showIncomingOffers ? '#065f46' : '#334155'
            }}
          >
            <MessageSquare size={14} /> {t.viewOffers} ({activeInquiriesCount})
          </button>

          <button 
            className="btn-gov-primary"
            onClick={() => {
              const openAddLot = () => setShowAddHarvestModal(true);
              if (onRequireAuth && !currentUser) {
                onRequireAuth(
                  lang === 'MR' 
                    ? 'नवीन शेतमाल नोंदवण्यासाठी कृपया शेतकरी म्हणून लॉगिन करा.' 
                    : 'Listing a new harvest lot requires a verified farmer account. Please sign in first.',
                  openAddLot
                );
              } else {
                openAddLot();
              }
            }}
          >
            <Plus size={16} /> {t.listNewHarvest}
          </button>
        </div>
      </div>

      {/* Success Banner */}
      {lotSuccessMsg && (
        <div style={{
          backgroundColor: '#ecfdf5',
          border: '1px solid #a7f3d0',
          color: '#065f46',
          padding: '12px 16px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.84rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Check size={16} />
          <span>{lotSuccessMsg}</span>
        </div>
      )}

      {/* 2. Top 3 Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        {/* Card 1 */}
        <div className="gov-card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {t.totalListedStock}
              </span>
              <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-xs)', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
                <Package size={16} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '4px' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-display)' }}>
                {totalQuintalsListed}
              </span>
              <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#64748b' }}>
                Quintals ({totalMT} MT)
              </span>
            </div>

            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              <strong style={{ color: '#059669' }}>● {lots.length} {t.activeHarvestLots}</strong> • APMC Certified Yards
            </p>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              <span>Godown Capacity</span>
              <strong>68% Utilized</strong>
            </div>
            <div style={{ height: '4px', backgroundColor: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: '68%', height: '100%', backgroundColor: '#059669' }} />
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="gov-card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {t.safeEscrowBalance}
              </span>
              <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-xs)', backgroundColor: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
                <Building2 size={16} />
              </div>
            </div>

            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669', fontFamily: 'var(--font-display)', marginBottom: '4px' }}>
              ₹{(totalEscrowSecured || 640000).toLocaleString()}
            </div>

            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={14} color="#059669" /> Held in RBI-Regulated Nodal Escrow
            </p>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              <span>Next Payout Window</span>
              <strong>T+24h post APMC Gate Inspection</strong>
            </div>
            <div style={{ height: '4px', backgroundColor: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: '85%', height: '100%', backgroundColor: '#0284c7' }} />
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="gov-card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {t.pendingInquiries}
              </span>
              <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-xs)', backgroundColor: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
                <Clock size={16} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '4px' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-display)' }}>
                {activeInquiriesCount}
              </span>
              <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#64748b' }}>
                Active Buyer Bids
              </span>
            </div>

            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Highest Bid: <strong style={{ color: '#059669' }}>₹2,420/qtl</strong> • Escrow Guaranteed
            </p>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              <span>Bilateral Response Time</span>
              <strong>&lt; 30 mins</strong>
            </div>
            <div style={{ height: '4px', backgroundColor: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: '55%', height: '100%', backgroundColor: '#d97706' }} />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Incoming Offers Drawer (Interactive Negotiation for Farmers) */}
      {showIncomingOffers && (
        <div className="gov-card" style={{ padding: '20px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={16} color="#065f46" />
              <h4 style={{ fontSize: '1rem', color: '#065f46' }}>{t.incomingOffersTitle}</h4>
            </div>
            <button onClick={() => setShowIncomingOffers(false)} style={{ background: 'transparent', color: '#64748b' }}>
              <X size={18} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {rfqs.map(r => (
              <div 
                key={r.id} 
                style={{ 
                  backgroundColor: '#ffffff', 
                  borderRadius: 'var(--radius-sm)', 
                  border: '1px solid #e2e8f0', 
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{r.buyer_name}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Commodity: <strong>{r.commodity}</strong> • Qty: <strong>{r.quantity_quintals} Qtl</strong> • Ref: RFQ #{r.id}
                    </div>
                  </div>
                  <span className="badge-amber-tag">
                    Current Offer: ₹{r.current_offered_price} / qtl
                  </span>
                </div>

                {r.messages && r.messages.length > 0 && (
                  <div style={{ backgroundColor: '#f8fafc', padding: '8px 12px', borderRadius: 'var(--radius-xs)', fontSize: '0.75rem', color: '#475569' }}>
                    💬 Last message: <em>"{r.messages[r.messages.length - 1].message_text}"</em>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginTop: '4px' }}>
                  <input 
                    type="number" 
                    placeholder="Enter counter ₹/qtl"
                    value={counterPriceInput[r.id] || ''}
                    onChange={(e) => setCounterPriceInput({ ...counterPriceInput, [r.id]: Number(e.target.value) })}
                    style={{ width: '150px', padding: '6px 10px', fontSize: '0.78rem' }}
                  />

                  <button 
                    className="btn-gov-secondary"
                    onClick={() => {
                      const doCounter = () => handleFarmerCounter(r.id);
                      if (onRequireAuth && !currentUser) {
                        onRequireAuth(
                          lang === 'MR' 
                            ? 'प्रति-ऑफर पाठवण्यासाठी कृपया लॉगिन करा.' 
                            : 'Submitting a counter-offer requires authentication. Please sign in first.',
                          doCounter
                        );
                      } else {
                        doCounter();
                      }
                    }}
                    style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                  >
                    {t.counterOfferBtn}
                  </button>

                  <button 
                    className="btn-gov-primary"
                    onClick={() => {
                      const doAccept = () => handleFarmerAccept(r.id);
                      if (onRequireAuth && !currentUser) {
                        onRequireAuth(
                          lang === 'MR' 
                            ? 'ऑफर स्वीकारण्यासाठी कृपया लॉगिन करा.' 
                            : 'Accepting buyer contract offer requires authentication. Please sign in first.',
                          doAccept
                        );
                      } else {
                        doAccept();
                      }
                    }}
                    style={{ padding: '6px 14px', fontSize: '0.75rem' }}
                  >
                    {t.acceptOffer}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Main Split Section: Active Lots (Left - Big) & Direct Institutional Buyers (Right - Thin Sidebar) */}
      <div className="farmer-portal-grid">
        {/* Left Column: Dynamic Harvest Lots (Wide) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#0f172a' }}>{t.activeHarvestLots}</h3>
              <span style={{ backgroundColor: '#ecfdf5', color: '#065f46', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                {lots.length} Batches Listed
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>Total Volume: <strong style={{ color: '#0f172a' }}>{totalQuintalsListed} Quintals</strong></span>
              <span style={{ color: '#cbd5e1' }}>•</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>Sort by:</span>
                <span style={{ fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}>Recent Activity ▾</span>
              </div>
            </div>
          </div>

          {/* Render Dynamic Lots */}
          {lots.map(lot => (
            <div key={lot.id} className="gov-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ position: 'relative', width: '70px', height: '70px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', flexShrink: 0 }}>
                  <img 
                    src={getCropImage(lot.commodity)} 
                    alt={lot.commodity}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span style={{ position: 'absolute', bottom: '2px', left: '2px', backgroundColor: 'rgba(0,0,0,0.75)', color: '#fff', fontSize: '0.58rem', padding: '1px 4px', borderRadius: '2px', fontWeight: 700 }}>
                    LOT #{lot.id}
                  </span>
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h4 style={{ fontSize: '1.05rem', color: '#0f172a' }}>{lot.commodity} ({lot.variety})</h4>
                      <span className="badge-grade-a">{lot.quality_grade}</span>
                    </div>
                    <span className={lot.status === 'UNDER_CONTRACT' ? 'badge-blue-tag' : 'badge-amber-tag'}>
                      ● {lot.status === 'UNDER_CONTRACT' ? 'Under Contract' : `${lot.expected_delivery_days} Days Dispatch`}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {lot.mandi_name || 'APMC Nodal Hub'} • {lot.district}, Maharashtra
                  </div>
                </div>
              </div>

              {/* 4 Metrics Strip */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>{t.availableQty}</div>
                  <strong style={{ fontSize: '0.82rem', color: '#0f172a' }}>{lot.quantity_quintals} qtl ({(lot.quantity_quintals / 10).toFixed(1)} MT)</strong>
                </div>
                <div>
                  <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>{t.askingRate}</div>
                  <strong style={{ fontSize: '0.86rem', color: '#059669' }}>₹{lot.base_price_per_quintal} / qtl</strong>
                </div>
                <div>
                  <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>{t.moistureIndex}</div>
                  <strong style={{ fontSize: '0.82rem', color: '#0f172a' }}>{lot.moisture_percent}% (NABL Tested)</strong>
                </div>
                <div>
                  <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>{t.apmcParity}</div>
                  <strong style={{ fontSize: '0.82rem', color: '#059669' }}>+₹120 / qtl</strong>
                </div>
              </div>

              {/* Action Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Tag: MH-{lot.district.slice(0, 3).toUpperCase()}-{lot.id}
                </span>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    className="btn-gov-secondary" 
                    style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                    onClick={() => {
                      const openQr = () => setQrModalLot(lot);
                      if (onRequireAuth && !currentUser) {
                        onRequireAuth(
                          lang === 'MR' 
                            ? 'QR ट्रेसिबिलिटी टॅग प्रिंट करण्यासाठी कृपया लॉगिन करा.' 
                            : 'Generating APMC traceability QR tag requires authentication. Please sign in first.',
                          openQr
                        );
                      } else {
                        openQr();
                      }
                    }}
                  >
                    <QrCode size={13} /> {t.printQrTag}
                  </button>
                  <button 
                    className="btn-gov-primary" 
                    style={{ padding: '6px 14px', fontSize: '0.75rem' }}
                    onClick={() => {
                      const navOffers = () => onNavigateToRFQs(lot);
                      if (onRequireAuth && !currentUser) {
                        onRequireAuth(
                          lang === 'MR' 
                            ? 'खरेदीदारांशी थेट वाटाघाटी करण्यासाठी कृपया लॉगिन करा.' 
                            : 'Accessing buyer RFQ negotiation for this lot requires authentication. Please sign in first.',
                          navOffers
                        );
                      } else {
                        navOffers();
                      }
                    }}
                  >
                    {t.viewOffers} <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Direct Institutional Buyers & MSP Floor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="gov-card" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <h4 style={{ fontSize: '0.98rem', color: '#0f172a' }}>{t.directBuyers}</h4>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verified wholesale procurement standing RFQs</div>
              </div>
              <ShieldCheck size={16} color="#059669" />
            </div>

            {/* Buyer 1 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: '#065f46', color: '#fff', fontSize: '0.7rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      RR
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.84rem', color: '#0f172a' }}>Reliance Retail Agro Hub</strong>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Institutional Partner • Pre-approved Escrow</div>
                    </div>
                  </div>
                  <span className="badge-grade-a">HIGH MATCH</span>
                </div>

                <div style={{ fontSize: '0.76rem', color: '#475569', display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                  <span>Requirement: <strong>100 MT Nasik Onion</strong></span>
                  <span style={{ color: '#059669', fontWeight: 700 }}>₹2,580 / qtl</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Delivery Window: Within 4 Days • Gate Weighment Guarantee
                </div>

                <button 
                  className="btn-gov-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '6px', fontSize: '0.76rem', marginTop: '8px' }}
                  onClick={handleOpenDirectBid}
                >
                  <MessageSquare size={12} /> Direct Bid Channel
                </button>
              </div>

              {/* Buyer 2 */}
              <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: '#0284c7', color: '#fff', fontSize: '0.7rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      BB
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.84rem', color: '#0f172a' }}>BigBasket Direct Farm Sourcing</strong>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Pre-cleared 50% Escrow Advance</div>
                    </div>
                  </div>
                  <span className="badge-amber-tag">URGENT</span>
                </div>

                <div style={{ fontSize: '0.76rem', color: '#475569', display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                  <span>Requirement: <strong>85 MT Soybean (JS-335)</strong></span>
                  <span style={{ color: '#059669', fontWeight: 700 }}>₹4,890 / qtl</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Drop-off: Pune Chakan Cold Logistics Hub
                </div>

                <button 
                  className="btn-gov-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '6px', fontSize: '0.76rem', marginTop: '8px' }}
                  onClick={handleOpenDirectBid}
                >
                  <MessageSquare size={12} /> Direct Bid Channel
                </button>
              </div>

              {/* Buyer 3 */}
              <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: '#b45309', color: '#fff', fontSize: '0.68rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      SA
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.84rem', color: '#0f172a' }}>Sahyadri Agro Processing Ltd</strong>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Export Processing Mega Hub</div>
                    </div>
                  </div>
                  <span className="badge-blue-tag">STANDING RFQ</span>
                </div>

                <div style={{ fontSize: '0.76rem', color: '#475569', display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                  <span>Requirement: <strong>40 MT Tomato / Onion</strong></span>
                  <span style={{ color: '#059669', fontWeight: 700 }}>₹2,450 / qtl</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Inspection: Dindori Mega Food Park
                </div>

                <button 
                  className="btn-gov-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '6px', fontSize: '0.76rem', marginTop: '8px' }}
                  onClick={handleOpenDirectBid}
                >
                  <MessageSquare size={12} /> Direct Bid Channel
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              <span>Need direct mandi arbitration support?</span>
              <span style={{ color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                <PhoneCall size={12} /> 1800-233-AGRO
              </span>
            </div>
          </div>

          {/* Govt. MSP Floor Guarantee Box */}
          <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 'var(--radius-md)', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <ShieldCheck size={18} color="#059669" />
              <strong style={{ fontSize: '0.88rem', color: '#065f46' }}>{t.mspFloorTitle}</strong>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#065f46', lineHeight: 1.4, marginBottom: '8px' }}>
              {t.mspFloorDesc}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: '#065f46', borderTop: '1px solid #a7f3d0', paddingTop: '6px' }}>
              <span>Soybean MSP: <strong>₹4,892/qtl</strong> • Cotton MSP: <strong>₹7,122/qtl</strong></span>
              <span>● Fully Protected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal 1: List New Harvest Batch */}
      {showAddHarvestModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '540px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.15rem', color: '#0f172a' }}>{t.publishBatchTitle}</h3>
              <button onClick={() => setShowAddHarvestModal(false)} style={{ background: 'transparent', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateLot} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a', marginBottom: '4px', display: 'block' }}>
                  {t.commodityLabel}
                </label>
                <select 
                  value={newCommodity} 
                  onChange={(e) => {
                    const c = e.target.value;
                    setNewCommodity(c);
                    if (c === 'Onion') { setNewVariety('Nasik Red (Garwa)'); setNewRate(2450); }
                    else if (c === 'Soybean') { setNewVariety('JS-335 Certified'); setNewRate(4890); }
                    else if (c === 'Tomato') { setNewVariety('Hybrid Abhinav'); setNewRate(1950); }
                    else if (c === 'Wheat') { setNewVariety('Lokwan Desi Sharbati'); setNewRate(2810); }
                    else if (c === 'Cotton') { setNewVariety('Medium Long Staple'); setNewRate(7120); }
                  }}
                >
                  <option value="Onion">Onion (कांदा)</option>
                  <option value="Soybean">Soybean (सोयाबीन)</option>
                  <option value="Tomato">Tomato (टोमॅटो)</option>
                  <option value="Wheat">Wheat (गहू)</option>
                  <option value="Cotton">Cotton (कापूस)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a', marginBottom: '4px', display: 'block' }}>
                    {t.harvestVolumeLabel}
                  </label>
                  <input 
                    type="number" 
                    min={1}
                    value={newVolume} 
                    onChange={(e) => setNewVolume(Number(e.target.value))} 
                    required
                  />
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    = {newVolume * 10} Quintals
                  </span>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a', marginBottom: '4px', display: 'block' }}>
                    {t.baseAskingRateLabel}
                  </label>
                  <input 
                    type="number" 
                    value={newRate} 
                    onChange={(e) => setNewRate(Number(e.target.value))} 
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a', marginBottom: '4px', display: 'block' }}>
                    {t.qualityGradeLabel}
                  </label>
                  <select value={newGrade} onChange={(e) => setNewGrade(e.target.value)}>
                    <option value="Grade A+">Grade A+ (Export Quality)</option>
                    <option value="Grade A">Grade A (Standard Commercial)</option>
                    <option value="Grade B">Grade B (Processing Grade)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a', marginBottom: '4px', display: 'block' }}>
                    {t.moistureLabel}
                  </label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={newMoisture} 
                    onChange={(e) => setNewMoisture(Number(e.target.value))} 
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a', marginBottom: '4px', display: 'block' }}>
                    {t.expectedDeliveryDaysLabel}
                  </label>
                  <input 
                    type="number" 
                    min={1} 
                    max={14}
                    value={newDeliveryDays} 
                    onChange={(e) => setNewDeliveryDays(Number(e.target.value))} 
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a', marginBottom: '4px', display: 'block' }}>
                    {t.storageHubLabel}
                  </label>
                  <input 
                    type="text" 
                    value={newHub} 
                    onChange={(e) => setNewHub(e.target.value)} 
                  />
                </div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0', fontSize: '0.76rem', color: '#64748b' }}>
                ℹ️ Once submitted, your harvest will be tagged with a QR-code and published for institutional bidding across the AgroConnect buyer network.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button type="button" className="btn-gov-secondary" onClick={() => setShowAddHarvestModal(false)}>
                  {t.cancelBtn}
                </button>
                <button type="submit" className="btn-gov-primary">
                  {t.publishLotBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Official Printable QR Traceability Tag */}
      {qrModalLot && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '420px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <QrCode size={18} color="#065f46" />
                <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>APMC Digital Custody Tag</strong>
              </div>
              <button onClick={() => setQrModalLot(null)} style={{ background: 'transparent', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>

            {/* Printable Badge Body */}
            <div style={{
              border: '2px dashed #065f46',
              borderRadius: 'var(--radius-sm)',
              padding: '16px',
              backgroundColor: '#f8fafc',
              textAlign: 'left'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#065f46', textTransform: 'uppercase' }}>
                  GOVERNMENT OF MAHARASHTRA • MSIS NODAL HUB
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                  BATCH CUSTODY IDENTIFICATION TAG
                </div>
              </div>

              {/* Visual Simulated QR Code */}
              <div style={{ display: 'flex', justifyContent: 'center', margin: '12px 0' }}>
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <rect width="120" height="120" fill="#ffffff" rx="8" />
                  {/* Position squares */}
                  <rect x="10" y="10" width="30" height="30" fill="#0f172a" />
                  <rect x="15" y="15" width="20" height="20" fill="#ffffff" />
                  <rect x="20" y="20" width="10" height="10" fill="#065f46" />
                  
                  <rect x="80" y="10" width="30" height="30" fill="#0f172a" />
                  <rect x="85" y="15" width="20" height="20" fill="#ffffff" />
                  <rect x="90" y="20" width="10" height="10" fill="#065f46" />

                  <rect x="10" y="80" width="30" height="30" fill="#0f172a" />
                  <rect x="15" y="85" width="20" height="20" fill="#ffffff" />
                  <rect x="20" y="90" width="10" height="10" fill="#065f46" />

                  {/* QR Data Grid Matrix */}
                  <rect x="50" y="15" width="6" height="6" fill="#0f172a" />
                  <rect x="62" y="22" width="6" height="6" fill="#0f172a" />
                  <rect x="48" y="35" width="6" height="6" fill="#0f172a" />
                  <rect x="65" y="48" width="6" height="6" fill="#0f172a" />
                  <rect x="35" y="55" width="6" height="6" fill="#0f172a" />
                  <rect x="50" y="65" width="6" height="6" fill="#0f172a" />
                  <rect x="80" y="60" width="6" height="6" fill="#0f172a" />
                  <rect x="95" y="70" width="6" height="6" fill="#0f172a" />
                  <rect x="55" y="85" width="6" height="6" fill="#0f172a" />
                  <rect x="68" y="95" width="6" height="6" fill="#0f172a" />
                </svg>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.74rem', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                <div><strong>TAG ID:</strong> MH-{qrModalLot.district.slice(0, 3).toUpperCase()}-LOT-{qrModalLot.id}</div>
                <div><strong>COMMODITY:</strong> {qrModalLot.commodity} ({qrModalLot.variety})</div>
                <div><strong>VOLUME:</strong> {qrModalLot.quantity_quintals} Qtl ({(qrModalLot.quantity_quintals / 10).toFixed(1)} MT)</div>
                <div><strong>LAB GRADE:</strong> {qrModalLot.quality_grade} (Moisture: {qrModalLot.moisture_percent}%)</div>
                <div><strong>FARMER / FPO:</strong> {qrModalLot.farmer_name}</div>
                <div><strong>APMC HUB:</strong> {qrModalLot.mandi_name}</div>
              </div>

              <div style={{ marginTop: '10px', padding: '6px 8px', backgroundColor: '#ecfdf5', borderRadius: '4px', fontSize: '0.68rem', color: '#065f46', textAlign: 'center', fontWeight: 600 }}>
                ✓ NABL Laboratory Seal & RBI Escrow Guaranteed
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
              <button 
                className="btn-gov-secondary" 
                style={{ flex: 1 }}
                onClick={() => setQrModalLot(null)}
              >
                Close
              </button>
              <button 
                className="btn-gov-primary"
                style={{ flex: 1 }}
                onClick={() => {
                  window.print();
                }}
              >
                <Printer size={14} /> Print Custody Label
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerPortal;
