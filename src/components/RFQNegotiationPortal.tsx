import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Send, CheckCircle2, ArrowLeft,
  Lock, RefreshCw, Eye, Sparkles, X, ChevronRight, QrCode, Award
} from 'lucide-react';
import { api, type User, type ProduceLot, type RFQ } from '../services/api';
import { subscribeToRFQSession } from '../services/supabase';
import { BuyerScorecardModal } from './BuyerScorecardModal';
import { translations, type Language } from '../utils/i18n';

interface RFQNegotiationPortalProps {
  currentUser: User | null;
  selectedLot: ProduceLot | null;
  initialRfqId?: number | null;
  onNavigateToContracts: (contractId: number) => void;
  onBackToMarketplace: () => void;
  lang?: Language;
}

export const RFQNegotiationPortal: React.FC<RFQNegotiationPortalProps> = ({
  currentUser,
  selectedLot: propLot,
  initialRfqId,
  onNavigateToContracts,
  onBackToMarketplace,
  lang = 'EN'
}) => {
  const t = translations[lang];
  const [currentLot, setCurrentLot] = useState<ProduceLot | null>(propLot);
  const [allLots, setAllLots] = useState<ProduceLot[]>([]);
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [activeRfq, setActiveRfq] = useState<RFQ | null>(null);
  const [counterBid, setCounterBid] = useState<number>(propLot?.base_price_per_quintal || 2400);
  const [counterNote, setCounterNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);
  const [showAssayModal, setShowAssayModal] = useState<boolean>(false);
  const [scorecardBuyerName, setScorecardBuyerName] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    loadPortalData();
  }, [propLot?.id, initialRfqId]);

  // Realtime Supabase RFQ listener
  useEffect(() => {
    if (!activeRfq?.id) return;
    const channel = subscribeToRFQSession(activeRfq.id, async () => {
      const refreshedRfqs = await api.getRFQs();
      setRfqs(refreshedRfqs);
      const updated = refreshedRfqs.find(r => r.id === activeRfq.id);
      if (updated) {
        setActiveRfq(updated);
      }
    });

    return () => {
      if (channel) channel.unsubscribe();
    };
  }, [activeRfq?.id]);

  const loadPortalData = async () => {
    try {
      const isFarmer = currentUser?.role === 'FARMER';
      const isBuyer = currentUser?.role === 'BUYER';

      const [fetchedLots, fetchedRfqs] = await Promise.all([
        api.getLots(),
        api.getRFQs(undefined, currentUser?.id)
      ]);

      let relevantLots = isFarmer && currentUser
        ? fetchedLots.filter(l => l.farmer_id === currentUser.id || l.farmer_name === currentUser.name)
        : fetchedLots;

      // Preserve propLot (including virtual FPO collective pool batches with ID >= 9000)
      if (propLot && !relevantLots.find(l => l.id === propLot.id)) {
        relevantLots = [propLot, ...relevantLots];
      }

      const relevantRfqs = isFarmer && currentUser
        ? fetchedRfqs.filter(r => r.farmer_id === currentUser.id || r.farmer_name === currentUser.name)
        : (isBuyer && currentUser
            ? fetchedRfqs.filter(r => r.buyer_id === currentUser.id || r.buyer_name === currentUser.name)
            : fetchedRfqs);

      setAllLots(relevantLots);
      setRfqs(relevantRfqs);

      // If no relevant lots in DB, clear any stale prop lot
      if (relevantLots.length === 0) {
        setCurrentLot(null);
        setActiveRfq(null);
        return;
      }

      // Determine target lot
      let targetLot = propLot;
      // Validate propLot still exists in relevantLots
      if (targetLot && !relevantLots.find(l => l.id === targetLot!.id)) {
        targetLot = null;
      }
      if (!targetLot && initialRfqId) {
        const matchingRfq = relevantRfqs.find(r => r.id === initialRfqId);
        if (matchingRfq) {
          targetLot = relevantLots.find(l => l.id === matchingRfq.lot_id) || null;
        }
      }
      if (!targetLot && relevantLots.length > 0) {
        targetLot = relevantLots[0];
      }

      if (targetLot) {
        setCurrentLot(targetLot);
        bindRfqSession(targetLot, relevantRfqs);
      } else {
        setCurrentLot(null);
        setActiveRfq(null);
      }
    } catch (err) {
      console.error('Error loading RFQ portal data:', err);
    }
  };

  const bindRfqSession = (lot: ProduceLot, currentRfqs: RFQ[]) => {
    const existing = currentRfqs.find(r => r.lot_id === lot.id);
    if (existing) {
      setActiveRfq(existing);
      setCounterBid(existing.current_offered_price || lot.base_price_per_quintal);
    } else {
      setActiveRfq(null);
      setCounterBid(lot.base_price_per_quintal);
    }
  };

  const handleSelectDifferentLot = (lot: ProduceLot) => {
    if (currentUser?.role === 'FARMER' && lot.farmer_id !== currentUser.id && lot.farmer_name !== currentUser.name) {
      alert('Access restricted: You can only negotiate contracts for your own produce batches.');
      return;
    }
    setCurrentLot(lot);
    bindRfqSession(lot, rfqs);
    setFeedbackBanner(null);
  };

  const handleCounterSubmit = async () => {
    if (!currentLot) return;
    if (currentUser?.role === 'FARMER' && currentLot.farmer_id !== currentUser.id && currentLot.farmer_name !== currentUser.name) {
      alert('Access restricted: You cannot submit counter-offers on another farmer\'s produce lot.');
      return;
    }
    if (!activeRfq && (currentUser?.role === 'FARMER' || currentUser?.role === 'FPO')) {
      alert('As a producer/seller, you can submit counter-offers after an institutional buyer initiates a procurement bid.');
      return;
    }
    setIsSubmitting(true);
    try {
      if (!activeRfq) {
        // Create live RFQ directly in Supabase
        const created = await api.createRFQ({
          lot_id: currentLot.id,
          buyer_id: currentUser?.id || 8,
          buyer_name: currentUser?.name || 'Institutional Buyer',
          farmer_id: currentLot.farmer_id,
          farmer_name: currentLot.farmer_name,
          commodity: currentLot.commodity,
          quantity_quintals: currentLot.quantity_quintals,
          initial_offer_price: counterBid,
          delivery_timeline_days: currentLot.expected_delivery_days || 3,
          delivery_address: currentUser?.district ? `${currentUser.district} Logistics Hub` : `${currentLot.mandi_name || 'APMC Central Logistics Yard'}`,
          first_message: counterNote || `Initial procurement offer placed at ₹${counterBid}/qtl.`
        });
        setActiveRfq(created);
        setRfqs(prev => [created, ...prev]);
        setFeedbackBanner(`✓ Initial procurement bid of ₹${counterBid.toLocaleString()}/qtl submitted to Supabase!`);
      } else {
        const effectiveRole = currentUser?.role || 'BUYER';
        const senderName = currentUser?.name || (effectiveRole === 'BUYER' ? 'Institutional Buyer' : 'Farmer FPO');
        const updated = await api.counterOffer(activeRfq.id, {
          sender_id: currentUser?.id || (effectiveRole === 'BUYER' ? 8 : (currentLot?.farmer_id || 1)),
          sender_name: senderName,
          sender_role: effectiveRole,
          offered_price: counterBid,
          message_text: counterNote || `Counter-offer: ₹${counterBid}/qtl.`
        });
        setActiveRfq(updated);
        setRfqs(prev => prev.map(r => r.id === updated.id ? updated : r));
        setFeedbackBanner(`✓ Counter-offer of ₹${counterBid.toLocaleString()}/qtl transmitted to Supabase!`);
      }

      setCounterNote('');
      setTimeout(() => setFeedbackBanner(null), 5000);
    } catch (err: any) {
      console.error('Error submitting counter offer:', err);
      setFeedbackBanner(`Error submitting offer: ${err?.message || 'Please check connection'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptTermsAndSign = async () => {
    if (!activeRfq) return;
    if (currentUser?.role === 'FARMER' && activeRfq.farmer_id !== currentUser.id && activeRfq.farmer_name !== currentUser.name) {
      alert('Access restricted: You cannot accept contract terms on another farmer\'s RFQ.');
      return;
    }
    if (currentUser?.role === 'BUYER' && activeRfq.buyer_id !== currentUser.id && activeRfq.buyer_name !== currentUser.name) {
      alert('Access restricted: You cannot accept contract terms on another buyer\'s RFQ.');
      return;
    }
    const lastMessage = activeRfq.messages && activeRfq.messages.length > 0 ? activeRfq.messages[activeRfq.messages.length - 1] : null;
    if (lastMessage && lastMessage.sender_role === currentUser?.role) {
      alert('Bilateral Rule: You cannot accept your own counter-offer. Please wait for the counterparty to accept or submit a counter.');
      return;
    }
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

  // Calculations
  const lotWeightQuintals = currentLot?.quantity_quintals || 0;
  const lotWeightMT = (lotWeightQuintals / 10).toFixed(1);
  const askingRate = currentLot?.base_price_per_quintal || 0;
  const savingPerQtl = askingRate - counterBid;
  const totalDealValue = counterBid * lotWeightQuintals;
  const escrowAdvance = Math.round(totalDealValue * 0.5);

  // Empty state: no lots in database
  if (!currentLot) {
    return (
      <div style={{ padding: '24px 0 48px', minHeight: '80vh', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={onBackToMarketplace}
            className="btn-gov-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '0.82rem', fontWeight: 600 }}
          >
            <ArrowLeft size={15} />
            {t.backToMarketplace}
          </button>
        </div>
        <div className="gov-card" style={{ padding: '60px 30px', textAlign: 'center' }}>
          <ShieldCheck size={48} style={{ margin: '0 auto 16px', color: '#94a3b8' }} />
          <h3 style={{ fontSize: '1.3rem', color: '#0f172a', marginBottom: '8px' }}>
            {currentUser?.role === 'FARMER'
              ? (lang === 'MR' ? 'तुमचा कोणताही शेतमाल वाटाघाटीसाठी उपलब्ध नाही' : 'No Harvest Lots Under Negotiation For Your Account')
              : (lang === 'MR' ? 'कोणताही शेतमाल उपलब्ध नाही' : 'No Harvest Lots Available for Negotiation')}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 20px', lineHeight: 1.5 }}>
            {currentUser?.role === 'FARMER'
              ? (lang === 'MR'
                  ? 'तुमच्या खात्याखाली कोणताही शेतमाल नोंदवलेला नाही. खरेदीदारांकडून थेट बोली मिळवण्यासाठी कृपया शेतकरी पोर्टलवरून शेतमाल नोंदवा.'
                  : 'You do not have any harvest batches listed under your account. List produce in the Farmer Portal to receive institutional buyer bids.')
              : (lang === 'MR'
                  ? 'सध्या कोणत्याही शेतकऱ्याने शेतमाल सूचीबद्ध केलेला नाही. कृपया शेतकरी पोर्टलवरून शेतमाल नोंदणी करा किंवा नंतर पुन्हा तपासा.'
                  : 'No farmer produce lots are currently listed in the marketplace. Farmers can list their harvest from the Farmer Portal, or check back after new mandi arrivals.')}
          </p>
          <button className="btn-gov-primary" onClick={onBackToMarketplace} style={{ margin: '0 auto' }}>
            {lang === 'MR' ? 'बाजारपेठेवर परत जा' : 'Back to Marketplace'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 0 48px', minHeight: '80vh', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Breadcrumb & Navigation Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={onBackToMarketplace}
            className="btn-gov-secondary"
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              padding: '8px 14px', 
              fontSize: '0.82rem',
              fontWeight: 600
            }}
          >
            <ArrowLeft size={15} />
            {t.backToMarketplace}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span>{t.marketplaceTab}</span>
            <ChevronRight size={13} />
            <strong style={{ color: '#0f172a' }}>{t.rfqConsoleTitle}</strong>
          </div>
        </div>

        {/* Status Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ 
            backgroundColor: '#ecfdf5', 
            color: '#065f46', 
            border: '1px solid #a7f3d0', 
            fontSize: '0.74rem', 
            fontWeight: 700, 
            padding: '5px 12px', 
            borderRadius: 'var(--radius-full)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10b981' }} />
            Active Lot #{currentLot?.id} • Bilateral Channel
          </span>

          <span style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            color: '#475569',
            fontSize: '0.72rem',
            padding: '5px 10px',
            borderRadius: 'var(--radius-full)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Sparkles size={12} color="#059669" />
            Live Supabase WebSocket
          </span>
        </div>
      </div>

      {/* 2. Feedback Banner */}
      {feedbackBanner && (
        <div style={{
          backgroundColor: '#ecfdf5',
          border: '1px solid #10b981',
          color: '#065f46',
          padding: '12px 18px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.85rem',
          fontWeight: 600,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} color="#059669" />
            <span>{feedbackBanner}</span>
          </div>
          <button onClick={() => setFeedbackBanner(null)} style={{ background: 'transparent', border: 'none', color: '#065f46', cursor: 'pointer' }}>
            <X size={15} />
          </button>
        </div>
      )}

      {/* 3. Header Title Block */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>
            ● DIRECT TRANSACTION WORKSPACE
          </div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
            {t.rfqConsoleTitle}
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>
            Official Government of Maharashtra Direct Produce Counter-Bidding & RBI-Regulated Escrow Lock Portal
          </p>
        </div>

        {/* Quick Lot Selector dropdown / chips */}
        {allLots.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Switch Batch:
            </span>
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
              {allLots.slice(0, 4).map(lot => {
                const isCurrent = currentLot?.id === lot.id;
                return (
                  <button
                    key={lot.id}
                    onClick={() => handleSelectDifferentLot(lot)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      border: isCurrent ? '1px solid #059669' : '1px solid #e2e8f0',
                      backgroundColor: isCurrent ? '#ecfdf5' : '#ffffff',
                      color: isCurrent ? '#065f46' : '#475569',
                      cursor: 'pointer'
                    }}
                  >
                    #{lot.id} {lot.commodity} ({lot.quality_grade})
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 4. Split Cards: Left Produce Specs & Right Negotiation Desk */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '22px' }}>
        
        {/* Left Card: Lot Specs, Milestones & Audit Trail */}
        <div className="gov-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                LOT #MH-{currentLot?.district?.slice(0, 3)?.toUpperCase() || 'NSK'}-{currentLot?.id || 819}
              </span>
              <span className="badge-grade-a">
                {currentLot?.quality_grade || 'Grade A+ Certified'}
              </span>
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
              {lotWeightMT} MT {currentLot?.commodity} ({currentLot?.variety})
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                {currentLot?.farmer_name || 'Nashik Kisan Samruddhi FPO'} • MSIS Certified Aggregation
              </p>
              <button
                onClick={() => setShowAssayModal(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0284c7',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                <Eye size={13} /> {t.reviewBatchSpecs}
              </button>
            </div>
          </div>

          {/* 4 Mini Spec Boxes */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t.totalLotWeight}</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>{lotWeightQuintals} Quintals</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{lotWeightMT} Metric Tonnes</div>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t.lasalgaonAvg}</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#059669' }}>₹2,380 / qtl</div>
              <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600 }}>+2.9% prevailing APMC</div>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Moisture & QC</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>{currentLot?.moisture_percent || 11.4}% (Optimal)</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>NABL Lab Certified</div>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t.dispatchReadiness}</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>Ready in {currentLot?.expected_delivery_days || 3} Days</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>FOB APMC Cold Hub</div>
            </div>
          </div>

          {/* Escrow Milestone Protection 4 Steps */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                ESCROW MILESTONE PROTECTION
              </span>
              <span style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={14} /> RBI Escrow Backed
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', textAlign: 'center' }}>
              <div style={{ padding: '8px 6px', backgroundColor: '#ecfdf5', borderRadius: 'var(--radius-sm)', border: '1px solid #a7f3d0' }}>
                <div style={{ width: '20px', height: '20px', margin: '0 auto 4px', borderRadius: '50%', backgroundColor: '#065f46', color: '#fff', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>1</div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#065f46' }}>50% Advance</div>
              </div>

              <div style={{ padding: '8px 6px', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                <div style={{ width: '20px', height: '20px', margin: '0 auto 4px', borderRadius: '50%', backgroundColor: '#94a3b8', color: '#fff', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>2</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Dispatch</div>
              </div>

              <div style={{ padding: '8px 6px', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                <div style={{ width: '20px', height: '20px', margin: '0 auto 4px', borderRadius: '50%', backgroundColor: '#94a3b8', color: '#fff', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>3</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>QC Sign-off</div>
              </div>

              <div style={{ padding: '8px 6px', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                <div style={{ width: '20px', height: '20px', margin: '0 auto 4px', borderRadius: '50%', backgroundColor: '#94a3b8', color: '#fff', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>4</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Release</div>
              </div>
            </div>
          </div>

          {/* Negotiation Audit Trail & Message History */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a' }}>
                {t.bidHistoryTitle}
              </div>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                {activeRfq?.messages?.length || 0} Events Recorded
              </span>
            </div>

            {/* MSAMB Statutory Verification Callout */}
            <div style={{
              padding: '8px 12px',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Award size={15} color="#16a34a" />
                <span style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 600 }}>
                  {lang === 'MR' 
                    ? 'MSAMB सत्यता निर्देशांक: ९९.२% वेळेवर एस्क्रो सेटलमेंट • सरासरी ४.२ तास' 
                    : 'MSAMB Credibility Index: 99.2% On-Time Escrow • Avg 4.2h Settlement'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setScorecardBuyerName(activeRfq?.buyer_name || 'Nagpur Agro-Processing Pvt Ltd')}
                style={{
                  fontSize: '0.7rem',
                  color: '#059669',
                  fontWeight: 700,
                  background: 'none',
                  border: 'none',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                {lang === 'MR' ? 'प्रमाणपत्र पहा' : 'View Scorecard'}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '230px', overflowY: 'auto', paddingRight: '4px' }}>
              {activeRfq?.messages && activeRfq.messages.length > 0 ? (
                activeRfq.messages.map((m, idx) => {
                  const isBuyer = m.sender_role === 'BUYER';
                  return (
                    <div 
                      key={idx} 
                      style={{ 
                        padding: '10px 12px', 
                        borderRadius: 'var(--radius-sm)', 
                        backgroundColor: isBuyer ? '#f0f9ff' : '#ecfdf5',
                        border: `1px solid ${isBuyer ? '#bae6fd' : '#bbf7d0'}`,
                        fontSize: '0.76rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', flexWrap: 'wrap', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <strong style={{ color: isBuyer ? '#0284c7' : '#059669', fontSize: '0.78rem' }}>
                            {m.sender_name}
                          </strong>
                          {isBuyer && (
                            <button
                              type="button"
                              onClick={() => setScorecardBuyerName(m.sender_name)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                padding: '2px 7px',
                                fontSize: '0.64rem',
                                fontWeight: 700,
                                borderRadius: 'var(--radius-full)',
                                backgroundColor: '#ecfdf5',
                                border: '1px solid #86efac',
                                color: '#166534',
                                cursor: 'pointer'
                              }}
                              title="View MSAMB Payment Reliability Scorecard"
                            >
                              <Award size={10} color="#16a34a" />
                              <span>MSAMB 99.2% Escrow</span>
                            </button>
                          )}
                        </div>
                        <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.85rem' }}>
                          ₹{m.offered_price} / qtl
                        </span>
                      </div>
                      <div style={{ color: '#475569', lineHeight: 1.4 }}>{m.message_text}</div>
                    </div>
                  );
                })
              ) : (
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', padding: '16px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-sm)' }}>
                  Initial negotiation session opened. Submit a counter-offer below to begin direct APMC messaging.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Card: Pricing, Calculator & Action Desk */}
        <div className="gov-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '18px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Comparative Price Boxes */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '14px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                  <Lock size={13} /> FPO Asking Rate
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                  ₹{askingRate} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>/ Quintal</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>Base lot asking price</div>
              </div>

              <div style={{ backgroundColor: '#f0fdf4', padding: '14px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 700, marginBottom: '2px' }}>
                  {t.yourCounterBid}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#065f46' }}>₹</span>
                  <input 
                    type="number" 
                    value={counterBid}
                    onChange={(e) => setCounterBid(Number(e.target.value))}
                    style={{ 
                      fontSize: '1.35rem', 
                      fontWeight: 800, 
                      color: '#065f46', 
                      border: 'none', 
                      backgroundColor: 'transparent',
                      padding: 0,
                      width: '120px',
                      outline: 'none'
                    }}
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: savingPerQtl >= 0 ? '#15803d' : '#b45309', marginTop: '2px' }}>
                  {savingPerQtl >= 0 ? (
                    <span>Saving: <strong>₹{savingPerQtl}/qtl</strong> vs asking</span>
                  ) : (
                    <span>Premium: <strong>+₹{Math.abs(savingPerQtl)}/qtl</strong> over asking</span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Adjustment Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>QUICK PRESETS:</span>
              <button 
                onClick={() => setCounterBid(askingRate - 50)} 
                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '2px 8px', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}
              >
                -₹50/qtl
              </button>
              <button 
                onClick={() => setCounterBid(askingRate - 30)} 
                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '2px 8px', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}
              >
                -₹30/qtl
              </button>
              <button 
                onClick={() => setCounterBid(askingRate)} 
                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '2px 8px', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}
              >
                Match Asking (₹{askingRate})
              </button>
              <button 
                onClick={() => setCounterBid(askingRate > 70 ? askingRate - 70 : askingRate)} 
                style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', borderRadius: '4px', padding: '2px 8px', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 700 }}
              >
                APMC Floor (₹{askingRate > 70 ? askingRate - 70 : askingRate})
              </button>
            </div>

            {/* Message / Terms Note Input */}
            <div>
              <label style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '6px', display: 'block' }}>
                Counter-Offer Note & Delivery Terms:
              </label>
              <input 
                type="text" 
                value={counterNote}
                onChange={(e) => setCounterNote(e.target.value)}
                placeholder="e.g. Can do ₹2,420 if delivered within 3 days with moisture <= 11.4%..."
                style={{ 
                  width: '100%', 
                  padding: '9px 12px', 
                  fontSize: '0.82rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: '#ffffff'
                }}
              />
            </div>

            {/* Financial Breakdown Table */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>{t.totalLotWeight}</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{lotWeightQuintals} Quintals ({lotWeightMT} MT)</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>Proposed Counter Rate</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>₹{counterBid.toLocaleString()} / qtl</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>APMC Cess & Portal Surcharge (0.0%)</span>
                <span style={{ fontWeight: 700, color: '#059669' }}>₹0 (Govt. Subsidized)</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                <div>
                  <strong style={{ fontSize: '0.96rem', color: '#0f172a' }}>{t.totalDealValue}</strong>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Contract Total (Pre-tax)</div>
                </div>
                <strong style={{ fontSize: '1.35rem', color: '#0f172a' }}>
                  ₹{totalDealValue.toLocaleString()}
                </strong>
              </div>
            </div>

            {/* Green Escrow Callout */}
            <div style={{ 
              backgroundColor: '#ecfdf5', 
              border: '1px solid #a7f3d0', 
              borderRadius: 'var(--radius-sm)', 
              padding: '14px 18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={20} color="#059669" />
                </div>
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#065f46' }}>
                    {t.escrowAdvanceReq}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#059669' }}>
                    Locked in SBI Nodal Escrow until physical QC sign-off
                  </div>
                </div>
              </div>

              <strong style={{ fontSize: '1.3rem', color: '#065f46', fontFamily: 'var(--font-display)' }}>
                ₹{escrowAdvance.toLocaleString()}
              </strong>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
            <button 
              className="btn-gov-secondary"
              style={{ flex: 1, justifyContent: 'center', padding: '12px', fontSize: '0.88rem' }}
              disabled={isSubmitting || (!activeRfq && (currentUser?.role === 'FARMER' || currentUser?.role === 'FPO'))}
              onClick={handleCounterSubmit}
              title={(!activeRfq && (currentUser?.role === 'FARMER' || currentUser?.role === 'FPO')) ? 'Awaiting buyer offer' : undefined}
            >
              {isSubmitting ? <RefreshCw size={15} className="animate-spin" /> : <Send size={15} />}
              {(!activeRfq && (currentUser?.role === 'FARMER' || currentUser?.role === 'FPO')) ? 'Awaiting Buyer Offer' : t.submitCounterOffer}
            </button>

            {(() => {
              const lastMessage = activeRfq?.messages && activeRfq.messages.length > 0 ? activeRfq.messages[activeRfq.messages.length - 1] : null;
              const isMyOffer = lastMessage ? (lastMessage.sender_role === currentUser?.role) : false;
              const canAccept = !!activeRfq && !isMyOffer;
              return (
                <button 
                  className="btn-gov-primary" 
                  style={{ flex: 1, justifyContent: 'center', padding: '12px', fontSize: '0.88rem', opacity: (!canAccept || isSubmitting) ? 0.6 : 1 }}
                  disabled={isSubmitting || !canAccept}
                  onClick={handleAcceptTermsAndSign}
                  title={!activeRfq ? 'No active RFQ session' : isMyOffer ? 'Awaiting counterparty acceptance' : 'Accept terms and sign contract'}
                >
                  <CheckCircle2 size={15} /> {t.acceptTermsSign}
                </button>
              );
            })()}
          </div>
        </div>
      </div>

      {/* 5. Statutory Guarantees & Safeguards Footer */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '8px' }}>
        <div className="gov-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <ShieldCheck size={18} color="#059669" />
            <h4 style={{ fontSize: '0.92rem', color: '#0f172a', margin: 0 }}>100% RBI Escrow Backed</h4>
          </div>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0 }}>
            Advance deposit of 50% remains frozen in an RBI-compliant escrow account until delivery gate weighment and moisture sign-off.
          </p>
        </div>

        <div className="gov-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <QrCode size={18} color="#0284c7" />
            <h4 style={{ fontSize: '0.92rem', color: '#0f172a', margin: 0 }}>NABL Certified QC Guarantee</h4>
          </div>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0 }}>
            Every harvest lot carries an MSAMB cryptographic assay certificate ensuring exact grading, moisture bounds, and shelf-life parity.
          </p>
        </div>

        <div className="gov-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Sparkles size={18} color="#d97706" />
            <h4 style={{ fontSize: '0.92rem', color: '#0f172a', margin: 0 }}>Maharashtra APMC Act 1963</h4>
          </div>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0 }}>
            Contracts signed in this workspace are statutory e-contracts with automatic 3-tier arbitration backed by the State Agricultural Marketing Board.
          </p>
        </div>
      </div>

      {/* 6. Modal: NABL Assay Specs Certificate */}
      {showAssayModal && currentLot && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={22} color="#059669" />
                <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>NABL Laboratory Assay Certificate</strong>
              </div>
              <button onClick={() => setShowAssayModal(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: 'var(--radius-sm)', padding: '16px', backgroundColor: '#f8fafc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>CERTIFICATE REF</div>
                  <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>NABL-MH-2026-{currentLot.id}</strong>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>TEST STATUS</div>
                  <span className="badge-grade-a">PASS • {currentLot.quality_grade}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.78rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Commodity:</span>
                  <div><strong>{currentLot.commodity} ({currentLot.variety})</strong></div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Lot Volume:</span>
                  <div><strong>{currentLot.quantity_quintals} Quintals ({lotWeightMT} MT)</strong></div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Moisture Content:</span>
                  <div><strong style={{ color: '#059669' }}>{currentLot.moisture_percent}% (Dry Standard)</strong></div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Foreign Matter:</span>
                  <div><strong>{currentLot.quality_grade?.includes('A+') ? '0.3' : currentLot.quality_grade?.includes('A') ? '0.5' : '0.7'}% (Permissible &lt;1.0%)</strong></div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Damaged / Discolored:</span>
                  <div><strong>{currentLot.quality_grade?.includes('A+') ? '0.5' : currentLot.quality_grade?.includes('A') ? '0.8' : '1.2'}% (Permissible &lt;2.0%)</strong></div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Harvest Hub:</span>
                  <div><strong>{currentLot.mandi_name || 'Lasalgaon APMC'}</strong></div>
                </div>
              </div>

              <div style={{ marginTop: '14px', padding: '10px 12px', backgroundColor: '#ecfdf5', borderRadius: 'var(--radius-xs)', fontSize: '0.74rem', color: '#065f46', lineHeight: 1.4 }}>
                ✓ Certified by Maharashtra State Agricultural Marketing Board (MSAMB) electronic grading terminal. This lot qualifies for direct institutional procurement without secondary mandi auction.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button className="btn-gov-primary" onClick={() => setShowAssayModal(false)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MSAMB Statutory Buyer Credibility & Payment Reliability Scorecard Modal */}
      {scorecardBuyerName && (
        <BuyerScorecardModal
          buyerName={scorecardBuyerName}
          onClose={() => setScorecardBuyerName(null)}
          lang={lang}
        />
      )}
    </div>
  );
};

export default RFQNegotiationPortal;
