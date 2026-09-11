import React, { useState, useEffect } from 'react';
import { 
  Package, ShieldCheck, Clock, ArrowRight, 
  Printer, Plus, 
  MessageSquare, Building2, X, QrCode, Check,
  Trash2, AlertTriangle, Users, Sparkles
} from 'lucide-react';
import { api, type User, type ProduceLot, type RFQ, type Contract, type CommodityPrice, type BuyerDemand, type BuyerReliabilityScorecard } from '../services/api';
import type { FPOPooledBatch, AIQualityAssayResult } from '../types';
import { AIQualityAssayModal } from './AIQualityAssayModal';
import { BuyerScorecardModal } from './BuyerScorecardModal';
import { translations, type Language } from '../utils/i18n';

interface FarmerPortalProps {
  currentUser: User | null;
  onNavigateToRFQs: (lot?: ProduceLot) => void;
  onNavigateToDemands?: () => void;
  lang?: Language;
  onRequireAuth?: (message?: string, onComplete?: () => void) => void;
  initialLotPrefill?: { commodity: string; variety?: string; price: number; mandi?: string } | null;
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

export const FarmerPortal: React.FC<FarmerPortalProps> = ({ 
  currentUser, 
  onNavigateToRFQs, 
  onNavigateToDemands,
  lang = 'EN', 
  onRequireAuth,
  initialLotPrefill
}) => {
  const t = translations[lang];
  const isMarathi = lang === 'MR';
  const [lots, setLots] = useState<ProduceLot[]>([]);
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [showAddHarvestModal, setShowAddHarvestModal] = useState<boolean>(false);
  const [qrModalLot, setQrModalLot] = useState<ProduceLot | null>(null);
  const [showIncomingOffers, setShowIncomingOffers] = useState<boolean>(false);
  const [counterPriceInput, setCounterPriceInput] = useState<Record<number, number>>({});
  const [lotSuccessMsg, setLotSuccessMsg] = useState<string>('');
  const [deleteConfirmLot, setDeleteConfirmLot] = useState<ProduceLot | null>(null);
  const [isDeletingLot, setIsDeletingLot] = useState<boolean>(false);
  const [lotFilterTab, setLotFilterTab] = useState<'ALL' | 'MY'>('ALL');

  // Option 1 & 2: FPO Batch Pooling & Kisan Vision AI State
  const [activeMainTab, setActiveMainTab] = useState<'LOTS' | 'FPO_POOLS'>('LOTS');
  const [showAssayModal, setShowAssayModal] = useState<boolean>(false);
  const [appliedAssayResult, setAppliedAssayResult] = useState<AIQualityAssayResult | null>(null);
  const [fpoPools, setFpoPools] = useState<FPOPooledBatch[]>([]);
  const [selectedPoolForBreakdown, setSelectedPoolForBreakdown] = useState<FPOPooledBatch | null>(null);
  const [contributeModalPool, setContributeModalPool] = useState<FPOPooledBatch | null>(null);
  const [contributeQuantity, setContributeQuantity] = useState<number | ''>('');
  const [contributeSelectedLotId, setContributeSelectedLotId] = useState<number | ''>('');
  const [showCreatePoolModal, setShowCreatePoolModal] = useState<boolean>(false);
  const [newPoolCommodity, setNewPoolCommodity] = useState<string>('Onion');
  const [newPoolVariety, setNewPoolVariety] = useState<string>('Garwa Grade A (Export Quality)');
  const [newPoolTargetQty, setNewPoolTargetQty] = useState<number | ''>(600);
  const [newPoolPrice, setNewPoolPrice] = useState<number | ''>(2550);
  const [newPoolHub, setNewPoolHub] = useState<string>('Dindori Agro-Processing & Cold Storage Cluster, Nashik');
  const [newPoolFpoName, setNewPoolFpoName] = useState<string>('Sahyadri Farmers Producer Co. Ltd.');

  // New Harvest Form State
  const [newCommodity, setNewCommodity] = useState<string>('Onion');
  const [newVariety, setNewVariety] = useState<string>('');
  const [newVolume, setNewVolume] = useState<number | ''>('');
  const [newRate, setNewRate] = useState<number | ''>('');
  const [newGrade, setNewGrade] = useState<string>('Grade A');
  const [newMoisture, setNewMoisture] = useState<number | ''>('');
  const [newDeliveryDays, setNewDeliveryDays] = useState<number | ''>('');
  const [newHub, setNewHub] = useState<string>('');

  const [mspPrices, setMspPrices] = useState<CommodityPrice[]>([]);
  const [buyerDemands, setBuyerDemands] = useState<BuyerDemand[]>([]);
  const [selectedScorecard, setSelectedScorecard] = useState<BuyerReliabilityScorecard | null>(null);
  const [showScorecardModal, setShowScorecardModal] = useState<boolean>(false);

  // Gap 4: AI Matchmaker State
  const [matchesPerLot, setMatchesPerLot] = useState<Record<number, BuyerMatch[]>>({});
  const [expandedMatchLotId, setExpandedMatchLotId] = useState<number | null>(null);
  const [pitchTargetLot, setPitchTargetLot] = useState<ProduceLot | null>(null);
  const [pitchTargetBuyer, setPitchTargetBuyer] = useState<BuyerMatch | null>(null);
  const [pitchPrice, setPitchPrice] = useState<number | ''>('');
  const [pitchCustomMsg, setPitchCustomMsg] = useState<string>('');
  const [isPitching, setIsPitching] = useState<boolean>(false);

  // Gap 5: Logistics & Transit Gate Pass State
  const [showLogisticsModal, setShowLogisticsModal] = useState<boolean>(false);
  const [activeLogisticsBooking, setActiveLogisticsBooking] = useState<LogisticsBooking | null>(null);
  const [logisticsModalTab, setLogisticsModalTab] = useState<'PROGRESSION' | 'E_GATE_PASS' | 'BOOK_TRUCK'>('PROGRESSION');
  const [isUpdatingTransit, setIsUpdatingTransit] = useState<boolean>(false);
  const [bookTransporterName, setBookTransporterName] = useState<string>('Mahatruck Krishi Logistics Federation');
  const [bookVehicleNo, setBookVehicleNo] = useState<string>('MH-12-RN-8821');
  const [bookVehicleType, setBookVehicleType] = useState<string>('10-Ton Eicher Pro (120 Qtl Capacity)');
  const [bookDriverName, setBookDriverName] = useState<string>('Tukaram Gaikwad');
  const [bookDriverPhone, setBookDriverPhone] = useState<string>('+91 98224 88210');
  const [bookPickupLocation, setBookPickupLocation] = useState<string>('Latur APMC Yard / Farmgate Hub');
  const [bookDeliveryLocation, setBookDeliveryLocation] = useState<string>('ADM Agro MIDC Processing Silo, Latur');
  const [bookNetWeight, setBookNetWeight] = useState<number | ''>(120);
  const [isBookingTruck, setIsBookingTruck] = useState<boolean>(false);

  useEffect(() => {
    loadData();
  }, [currentUser]);

  useEffect(() => {
    if (initialLotPrefill) {
      if (initialLotPrefill.commodity) setNewCommodity(initialLotPrefill.commodity);
      if (initialLotPrefill.variety) setNewVariety(initialLotPrefill.variety);
      if (initialLotPrefill.price) setNewRate(initialLotPrefill.price);
      if (initialLotPrefill.mandi) setNewHub(initialLotPrefill.mandi);
      setShowAddHarvestModal(true);
    }
  }, [initialLotPrefill]);

  const loadData = async () => {
    try {
      const [allLots, allRfqs, allContracts, allMsp, allPools, allDemands] = await Promise.all([
        api.getLots(),
        api.getRFQs(),
        api.getContracts(),
        api.getMSPFloorPrices().catch(() => []),
        api.getPooledBatches().catch(() => []),
        api.getBuyerDemands().catch(() => [])
      ]);
      setLots(allLots);
      setRfqs(allRfqs);
      setContracts(allContracts);
      setMspPrices(allMsp);
      setFpoPools(allPools);
      setBuyerDemands(allDemands);
    } catch (e) {
      console.error('Error loading farmer data:', e);
    }
  };

  const handleApplyAssayResult = (result: AIQualityAssayResult) => {
    setAppliedAssayResult(result);
    if (result.commodity) setNewCommodity(result.commodity);
    if (result.grade_code === 'A') setNewGrade('Grade A');
    else if (result.grade_code === 'B') setNewGrade('Grade B');
    else setNewGrade('Grade B');
    setNewMoisture(result.estimated_moisture_percent);

    api.saveQualityAssay({
      certificate_id: result.assay_id,
      farmer_id: currentUser?.id || null,
      commodity: result.commodity,
      variety: result.sample_name || 'Standard Grade',
      overall_grade: result.predicted_grade,
      moisture_percent: result.estimated_moisture_percent,
      color_uniformity_score: result.uniformity_score || 94.0,
      defect_percentage: result.blemish_percentage || 2.5,
      purity_index: result.confidence_score || 98.0,
      sample_image_url: result.image_url || ''
    }).catch(e => console.warn('[FarmerPortal] Assay save notice:', e));

    setLotSuccessMsg(`✓ Kisan Vision Assay Applied & Logged: ${result.predicted_grade} (${result.estimated_moisture_percent}% moisture, Cert #${result.assay_id})`);
    setTimeout(() => setLotSuccessMsg(''), 5000);
  };

  const handleContributeLot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contributeModalPool) return;
    if (!currentUser) {
      if (onRequireAuth) {
        onRequireAuth('Please sign in to contribute to an FPO collective pool.', () => {});
      }
      return;
    }
    const qty = Number(contributeQuantity);
    if (!qty || qty <= 0) {
      alert('Please enter a valid quantity in quintals.');
      return;
    }

    try {
      const updated = await api.contributeLotToPool(contributeModalPool.id, {
        farmerId: currentUser.id,
        farmerName: currentUser.name,
        farmerPhone: currentUser.phone || '+91 98220 99887',
        district: currentUser.district || contributeModalPool.district,
        quantityQuintals: qty,
        lotId: contributeSelectedLotId ? Number(contributeSelectedLotId) : undefined,
        grade: contributeModalPool.quality_grade
      });

      setFpoPools(prev => prev.map(p => p.id === updated.id ? updated : p));
      setContributeModalPool(null);
      setContributeQuantity('');
      setContributeSelectedLotId('');
      setLotSuccessMsg(`✓ Successfully contributed ${qty} Quintals into "${updated.fpo_name}" (${updated.commodity})! Your guaranteed payout share is locked.`);
      setTimeout(() => setLotSuccessMsg(''), 7000);
    } catch (err: any) {
      console.error('Error contributing to pool:', err);
      alert(`Failed to contribute: ${err?.message || 'Unknown error'}`);
    }
  };

  const handleCreatePool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      if (onRequireAuth) onRequireAuth('Please sign in to initiate an FPO pooled batch.');
      return;
    }
    try {
      const created = await api.createPooledBatch({
        fpo_name: newPoolFpoName || `${currentUser.district} Farmers Producer Co. Ltd.`,
        fpo_registration_number: `MH-${currentUser.district?.slice(0, 3).toUpperCase() || 'NSK'}-FPO-${Date.now().toString().slice(-4)}`,
        fpo_contact_person: currentUser.name,
        fpo_contact_phone: currentUser.phone || '+91 98220 12345',
        district: currentUser.district || 'Nashik',
        central_hub_location: newPoolHub || 'District APMC Cold Storage Terminal',
        commodity: newPoolCommodity,
        variety: newPoolVariety,
        target_volume_quintals: Number(newPoolTargetQty) || 500,
        unit_base_price: Number(newPoolPrice) || 2500,
        description: `Collective institutional consignment formed for ${newPoolCommodity}. Managed under Maharashtra State APMC FPO guidelines.`
      });

      setFpoPools(prev => [created, ...prev]);
      setShowCreatePoolModal(false);
      setLotSuccessMsg(`✓ New FPO Pooled Batch #${created.id} initiated! Farmers can now aggregate lots towards the ${created.target_volume_quintals} Qtl target.`);
      setTimeout(() => setLotSuccessMsg(''), 7000);
    } catch (err: any) {
      console.error('Error creating pool:', err);
      alert(`Failed to create pool: ${err?.message || 'Unknown error'}`);
    }
  };

  const handleCreateLot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      if (onRequireAuth) {
        onRequireAuth(
          lang === 'MR' 
            ? 'नवीन शेतमाल नोंदवण्यासाठी कृपया शेतकरी म्हणून लॉगिन करा.' 
            : 'Please sign in with a verified farmer account to list produce.',
          () => setShowAddHarvestModal(true)
        );
      } else {
        alert(lang === 'MR' ? 'कृपया प्रथम लॉगिन करा.' : 'Authentication required to list produce.');
      }
      return;
    }

    try {
      const created = await api.createLot({
        farmer_id: currentUser.id,
        farmer_name: currentUser.name,
        farmer_phone: currentUser.phone || '',
        commodity: newCommodity || 'Onion',
        variety: newVariety || 'Standard Grade',
        quantity_quintals: (Number(newVolume) || 1) * 10,
        base_price_per_quintal: Number(newRate) || 2000,
        quality_grade: newGrade,
        moisture_percent: Number(newMoisture) || 11.0,
        expected_delivery_days: Number(newDeliveryDays) || 3,
        mandi_name: newHub || 'Terminal APMC Yard',
        district: currentUser.district || 'Nashik',
        description: `${newGrade} certified batch with ${newMoisture || 11}% moisture index. Stored at ${newHub || 'APMC Yard'}.`
      });

      setShowAddHarvestModal(false);
      setNewVariety('');
      setNewVolume('');
      setNewRate('');
      setNewMoisture('');
      setNewDeliveryDays('');
      setNewHub('');
      await loadData();
      setLotSuccessMsg(`✓ Lot #${created.id} successfully listed! ${newVolume} MT (${(Number(newVolume) || 1) * 10} Qtl) is now live across institutional buyer network.`);
      setTimeout(() => setLotSuccessMsg(''), 6000);
    } catch (err) {
      console.error('Error creating lot:', err);
    }
  };

  const handleFarmerCounter = async (rfqId: number) => {
    const price = counterPriceInput[rfqId];
    if (!price) return;
    if (!currentUser) {
      if (onRequireAuth) onRequireAuth('Please sign in to submit a counter-offer.');
      return;
    }
    try {
      await api.counterOffer(rfqId, {
        sender_id: currentUser.id,
        sender_name: currentUser.name,
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

  const handleInitiateDeleteLot = (lot: ProduceLot) => {
    if (!currentUser) {
      if (onRequireAuth) {
        onRequireAuth(
          lang === 'MR'
            ? 'शेतमाल काढण्यासाठी कृपया शेतकरी म्हणून लॉगिन करा.'
            : 'Please sign in with your farmer account to manage or remove your produce batch.',
          () => setDeleteConfirmLot(lot)
        );
      } else {
        alert(lang === 'MR' ? 'कृपया प्रथम लॉगिन करा.' : 'Authentication required to remove a lot.');
      }
      return;
    }

    if (lot.status === 'UNDER_CONTRACT') {
      alert(
        lang === 'MR'
          ? 'हा शेतमाल सक्रिय कराराअंतर्गत (Active Contract) आहे आणि एस्क्रो रक्कम जोडलेली आहे. करार पूर्ण किंवा रद्द केल्याशिवाय हा शेतमाल काढता येत नाही.'
          : 'Cannot remove lot: This batch is currently tied to an active contract with escrow funds in holding. Please resolve or cancel the contract in the Escrow & Contracts portal first.'
      );
      return;
    }

    // Check ownership if user is a FARMER
    if (
      currentUser.role === 'FARMER' &&
      lot.farmer_id &&
      lot.farmer_id !== currentUser.id &&
      lot.farmer_name !== currentUser.name
    ) {
      alert(
        lang === 'MR'
          ? 'तुम्ही केवळ तुमच्या स्वतःच्या शेतमालाची नोंदणी काढू शकता.'
          : 'Access restricted: You can only remove produce lots listed under your own account.'
      );
      return;
    }

    setDeleteConfirmLot(lot);
  };

  const handleConfirmDeleteLot = async () => {
    if (!deleteConfirmLot) return;
    setIsDeletingLot(true);
    try {
      await api.deleteLot(deleteConfirmLot.id);
      setLotSuccessMsg(
        lang === 'MR'
          ? `✓ शेतमाल #${deleteConfirmLot.id} (${deleteConfirmLot.commodity}) बाजारातून यशस्वीरित्या काढण्यात आला.`
          : `✓ Lot #${deleteConfirmLot.id} (${deleteConfirmLot.commodity}) successfully delisted and removed from marketplace.`
      );
      setTimeout(() => setLotSuccessMsg(''), 6000);
      setDeleteConfirmLot(null);
      await loadData();
    } catch (err: any) {
      console.error('Error deleting lot:', err);
      alert(`Failed to remove lot: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsDeletingLot(false);
    }
  };

  // Aggregated Dynamic Stats
  const totalQuintalsListed = lots.reduce((acc, l) => acc + (Number(l.quantity_quintals) || 0), 0);
  const totalMT = (totalQuintalsListed / 10).toFixed(1);
  const totalEscrowSecured = contracts.reduce((acc, c) => acc + (c.escrow?.advance_amount || 0), 0);
  const activeInquiriesCount = rfqs.filter(r => r.status === 'PENDING' || r.status === 'COUNTERED').length;
  const godownUtilizationPercent = Math.min(100, Math.max(15, Math.round((totalQuintalsListed / 1500) * 100)));
  const completedContracts = contracts.filter(c => c.status === 'COMPLETED').length;
  const escrowSettledPercent = contracts.length > 0 ? Math.round((completedContracts / contracts.length) * 100) : 100;

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
            className="btn-gov-secondary"
            onClick={() => setShowLogisticsModal(true)}
            style={{ 
              backgroundColor: showLogisticsModal ? '#eff6ff' : '#ffffff',
              borderColor: showLogisticsModal ? '#93c5fd' : 'var(--border-card)',
              color: showLogisticsModal ? '#1d4ed8' : '#334155',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Truck size={14} color="#2563eb" /> {lang === 'MR' ? 'वाहतूक व ई-गेट पास' : 'Logistics & Gate Pass'}
          </button>

          <button 
            className="btn-gov-primary"
            onClick={() => {
              if (currentUser?.role === 'BUYER') {
                alert(lang === 'MR' 
                  ? 'प्रवेश मर्यादित: तुम्ही संस्थात्मक खरेदीदार (Corporate Buyer) म्हणून लॉगिन आहात. केवळ शेतकरी किंवा FPO शेतमाल सूचीबद्ध करू शकतात.' 
                  : 'Access Restricted: You are signed in as a Corporate Buyer. Produce listings can only be created by verified Farmers or FPOs.');
                return;
              }
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

      {/* Buyer Observer Mode Banner (RBAC Guard) */}
      {currentUser?.role === 'BUYER' && (
        <div style={{
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          color: '#1e40af',
          padding: '10px 16px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.8rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={16} color="#2563eb" />
            <span>
              {lang === 'MR'
                ? `खरेदीदार वाचक मोड: तुम्ही ${currentUser.name} (संस्थात्मक खरेदीदार) म्हणून शेतकरी गट नोंदणी पाहत आहात.`
                : `Corporate Buyer Observer Mode: You are viewing farmer aggregated lots as ${currentUser.name}. Produce registration is restricted to Farmer/FPO accounts.`}
            </span>
          </div>
          <button 
            onClick={() => onNavigateToRFQs()} 
            className="btn-gov-primary" 
            style={{ fontSize: '0.74rem', padding: '4px 10px', backgroundColor: '#2563eb' }}
          >
            {lang === 'MR' ? 'खरेदी बाजारात जा' : 'Go to Marketplace'}
          </button>
        </div>
      )}

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

      {/* 2. Mode Selector: Individual Batches vs FPO Collective Pooling Hub */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', paddingBottom: '2px', overflowX: 'auto' }}>
        <button
          type="button"
          onClick={() => setActiveMainTab('LOTS')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            fontSize: '0.86rem',
            fontWeight: 700,
            border: 'none',
            borderBottom: activeMainTab === 'LOTS' ? '3px solid #059669' : '3px solid transparent',
            backgroundColor: activeMainTab === 'LOTS' ? '#ecfdf5' : 'transparent',
            color: activeMainTab === 'LOTS' ? '#065f46' : '#64748b',
            borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
            cursor: 'pointer',
            transition: 'all 0.15s',
            whiteSpace: 'nowrap'
          }}
        >
          <Package size={16} />
          <span>{lang === 'MR' ? 'वैयक्तिक शेतमाल नोंदी' : 'Individual Produce Batches'}</span>
          <span style={{ fontSize: '0.7rem', backgroundColor: activeMainTab === 'LOTS' ? '#a7f3d0' : '#e2e8f0', color: activeMainTab === 'LOTS' ? '#065f46' : '#475569', padding: '1px 7px', borderRadius: '10px' }}>
            {lots.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('FPO_POOLS')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            fontSize: '0.86rem',
            fontWeight: 700,
            border: 'none',
            borderBottom: activeMainTab === 'FPO_POOLS' ? '3px solid #059669' : '3px solid transparent',
            backgroundColor: activeMainTab === 'FPO_POOLS' ? '#ecfdf5' : 'transparent',
            color: activeMainTab === 'FPO_POOLS' ? '#065f46' : '#64748b',
            borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
            cursor: 'pointer',
            transition: 'all 0.15s',
            whiteSpace: 'nowrap'
          }}
        >
          <Users size={16} />
          <span>{lang === 'MR' ? 'सामूहिक शेतकरी गट (FPO Pooling Hub)' : 'FPO Collective Pooling Hub (Institutional Aggregation)'}</span>
          <span style={{ fontSize: '0.7rem', backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #86efac', padding: '1px 7px', borderRadius: '10px', fontWeight: 800 }}>
            {fpoPools.length} Active Consortia
          </span>
        </button>
      </div>

      {activeMainTab === 'LOTS' && (
        <>
          {/* Top 3 Metric Cards */}
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
              <strong>{godownUtilizationPercent}% Utilized</strong>
            </div>
            <div style={{ height: '4px', backgroundColor: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: `${godownUtilizationPercent}%`, height: '100%', backgroundColor: '#059669' }} />
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
              ₹{totalEscrowSecured.toLocaleString()}
            </div>

            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={14} color="#059669" /> Held in RBI-Regulated Nodal Escrow
            </p>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              <span>Next Payout Window</span>
              <strong>{contracts.length > 0 ? `${completedContracts}/${contracts.length} Contracts Settled` : 'T+24h post APMC Gate Inspection'}</strong>
            </div>
            <div style={{ height: '4px', backgroundColor: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: `${escrowSettledPercent}%`, height: '100%', backgroundColor: '#0284c7' }} />
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#0f172a' }}>{t.activeHarvestLots}</h3>
              <span style={{ backgroundColor: '#ecfdf5', color: '#065f46', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                {lots.length} Batches Listed
              </span>

              {/* Filter Pills: All Batches vs My Batches */}
              {currentUser && (
                <div style={{ display: 'inline-flex', gap: '3px', backgroundColor: '#f1f5f9', padding: '2px', borderRadius: 'var(--radius-full)' }}>
                  <button
                    type="button"
                    onClick={() => setLotFilterTab('ALL')}
                    style={{
                      padding: '3px 10px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      borderRadius: 'var(--radius-full)',
                      border: 'none',
                      backgroundColor: lotFilterTab === 'ALL' ? '#ffffff' : 'transparent',
                      color: lotFilterTab === 'ALL' ? '#0f172a' : '#64748b',
                      boxShadow: lotFilterTab === 'ALL' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {t.allBatches} ({lots.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setLotFilterTab('MY')}
                    style={{
                      padding: '3px 10px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      borderRadius: 'var(--radius-full)',
                      border: 'none',
                      backgroundColor: lotFilterTab === 'MY' ? '#ffffff' : 'transparent',
                      color: lotFilterTab === 'MY' ? '#065f46' : '#64748b',
                      boxShadow: lotFilterTab === 'MY' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {t.myBatches} ({lots.filter(l => l.farmer_id === currentUser.id || l.farmer_name === currentUser.name).length})
                  </button>
                </div>
              )}
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

          {/* Render Dynamic Lots or Clean Empty State */}
          {(() => {
            const myLots = currentUser ? lots.filter(l => l.farmer_id === currentUser.id || l.farmer_name === currentUser.name) : [];
            const displayedLots = (lotFilterTab === 'MY' && currentUser) ? myLots : lots;

            if (displayedLots.length === 0) {
              return (
                <div className="gov-card" style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Package size={36} style={{ margin: '0 auto 12px', color: '#94a3b8' }} />
                  <h4 style={{ fontSize: '1.05rem', color: '#0f172a', marginBottom: '6px' }}>
                    {lotFilterTab === 'MY' 
                      ? (lang === 'MR' ? 'तुमचा कोणताही शेतमाल नोंदवलेला नाही' : 'No Harvest Batches Listed Under Your Account')
                      : (lang === 'MR' ? 'कोणताही शेतमाल नोंदवलेला नाही' : 'No Harvest Batches Listed Yet')}
                  </h4>
                  <p style={{ fontSize: '0.82rem', maxWidth: '420px', margin: '0 auto 16px', lineHeight: 1.5 }}>
                    {lotFilterTab === 'MY'
                      ? (lang === 'MR'
                          ? 'तुमचा पहिला शेतमाल नोंदवण्यासाठी वर दिलेल्या "+ नवीन शेतमाल नोंदवा" बटणावर क्लिक करा.'
                          : 'You have not listed any batches yet under this account. Click "+ List New Harvest" above to publish your first batch.')
                      : (lang === 'MR'
                          ? 'थेट संस्थात्मक खरेदीदारांकडून स्पर्धात्मक भाव आणि ५०% आगाऊ एस्क्रो हमी मिळवण्यासाठी तुमचा पहिला शेतमाल नोंदवा.'
                          : 'List your first crop batch to receive direct bilateral bids, NABL quality grading, and RBI-regulated escrow payments.')}
                  </p>
                  <button 
                    className="btn-gov-primary"
                    onClick={() => setShowAddHarvestModal(true)}
                    style={{ margin: '0 auto' }}
                  >
                    <Plus size={15} /> {t.listNewHarvest}
                  </button>
                </div>
              );
            }

            return displayedLots.map(lot => {
              const isUserOwner = currentUser ? (
                currentUser.role === 'OFFICIAL' ||
                lot.farmer_id === currentUser.id ||
                lot.farmer_name === currentUser.name
              ) : false;
              const canInitiateDelete = isUserOwner || !currentUser || !lot.farmer_id;

              return (
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <h4 style={{ fontSize: '1.05rem', color: '#0f172a' }}>{lot.commodity} ({lot.variety})</h4>
                          <span className="badge-grade-a">{lot.quality_grade}</span>
                          {isUserOwner && (
                            <span style={{ 
                              backgroundColor: '#ecfdf5', 
                              color: '#065f46', 
                              border: '1px solid #a7f3d0', 
                              fontSize: '0.66rem', 
                              fontWeight: 700, 
                              padding: '1px 6px', 
                              borderRadius: '4px' 
                            }}>
                              {lang === 'MR' ? 'तुमचा शेतमाल' : 'Your Batch'}
                            </span>
                          )}
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

                  {/* GAP 4: AUTOMATED AI BUYER MATCHMAKING ENGINE */}
                  {(() => {
                    const matches = matchesPerLot[lot.id] || [];
                    const topMatch = matches[0];
                    const isExpanded = expandedMatchLotId === lot.id;
                    const displayMatches = isExpanded ? matches : matches.slice(0, 2);

                    return (
                      <div style={{ 
                        backgroundColor: '#f0fdf4', 
                        border: '1px solid #bbf7d0', 
                        borderRadius: 'var(--radius-sm)', 
                        padding: '12px 14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                      }}>
                        {/* Header with Top Match % Pill */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <div style={{ 
                              width: '26px', 
                              height: '26px', 
                              borderRadius: '50%', 
                              backgroundColor: '#059669', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              color: '#ffffff' 
                            }}>
                              <Sparkles size={14} />
                            </div>
                            <div>
                              <strong style={{ fontSize: '0.86rem', color: '#065f46' }}>
                                {matches.length} {lang === 'MR' ? 'पडताळणी केलेले खरेदीदार मॅच झाले' : 'Verified Buyers Matched for Your'} {lot.commodity} {lot.variety ? `(${lot.variety})` : ''} Lot
                              </strong>
                              <div style={{ fontSize: '0.7rem', color: '#047857' }}>
                                {lang === 'MR' ? 'अंतराचे निकष, आर्द्रता हमी व थेट खरेदीदारांच्या बोलींवर आधारित एआय स्कोर' : 'Ranked via Haversine distance, NABL assay specs, and pre-funded escrow standing bids'}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {topMatch && (
                              <span style={{ 
                                backgroundColor: '#059669', 
                                color: '#ffffff', 
                                fontSize: '0.72rem', 
                                fontWeight: 800, 
                                padding: '3px 9px', 
                                borderRadius: '12px',
                                boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)'
                              }}>
                                Top: {topMatch.match_score}% Match
                              </span>
                            )}
                            {matches.length > 2 && (
                              <button
                                type="button"
                                onClick={() => setExpandedMatchLotId(isExpanded ? null : lot.id)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#047857',
                                  fontSize: '0.74rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  textDecoration: 'underline'
                                }}
                              >
                                {isExpanded 
                                  ? (lang === 'MR' ? 'कमी माहिती ▴' : 'Show Less ▴') 
                                  : (lang === 'MR' ? `सर्व ${matches.length} खरेदीदार ▾` : `Show All (${matches.length}) ▾`)}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Matched Buyer Cards Grid */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {displayMatches.map(match => (
                            <div 
                              key={match.buyer_id}
                              style={{ 
                                backgroundColor: '#ffffff', 
                                border: '1px solid #e2e8f0', 
                                borderRadius: 'var(--radius-xs)', 
                                padding: '10px 12px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '10px'
                              }}
                            >
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1, minWidth: '220px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                  <strong style={{ fontSize: '0.86rem', color: '#0f172a' }}>{match.company_name}</strong>
                                  <span style={{ 
                                    backgroundColor: match.match_score >= 95 ? '#dcfce7' : '#e0f2fe', 
                                    color: match.match_score >= 95 ? '#15803d' : '#0369a1', 
                                    border: `1px solid ${match.match_score >= 95 ? '#86efac' : '#7dd3fc'}`,
                                    fontSize: '0.7rem', 
                                    fontWeight: 800, 
                                    padding: '1px 6px', 
                                    borderRadius: '4px' 
                                  }}>
                                    {match.match_score}% Match
                                  </span>
                                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                    • {match.distance_km} km away ({match.district})
                                  </span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.74rem', color: '#475569', flexWrap: 'wrap' }}>
                                  <span>
                                    Standing Bid: <strong style={{ color: '#059669', fontSize: '0.82rem' }}>₹{match.standing_bid_price.toLocaleString()}/qtl</strong>
                                    {match.price_difference > 0 && (
                                      <span style={{ color: '#059669', fontWeight: 700, marginLeft: '4px' }}>
                                        (+₹{match.price_difference} over ask)
                                      </span>
                                    )}
                                  </span>
                                  <span style={{ color: '#cbd5e1' }}>|</span>
                                  <span>Moisture Spec: <strong>≤{match.moisture_spec_max}%</strong></span>
                                  <span style={{ color: '#cbd5e1' }}>|</span>
                                  <span style={{ color: '#0284c7', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                    <ShieldCheck size={12} /> Escrow Verified
                                  </span>
                                </div>

                                {/* Match highlight tags */}
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                                  {match.match_reasons.slice(0, 2).map((reason, rIdx) => (
                                    <span 
                                      key={rIdx}
                                      style={{ 
                                        backgroundColor: '#f1f5f9', 
                                        color: '#334155', 
                                        fontSize: '0.66rem', 
                                        padding: '1px 6px', 
                                        borderRadius: '3px',
                                        fontWeight: 500
                                      }}
                                    >
                                      ✓ {reason}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* 1-Click Send Direct Lot Pitch Action */}
                              <button
                                className="btn-gov-primary"
                                style={{ 
                                  padding: '7px 14px', 
                                  fontSize: '0.76rem', 
                                  backgroundColor: '#059669',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  whiteSpace: 'nowrap'
                                }}
                                onClick={() => handleOpenPitchModal(lot, match)}
                              >
                                <Send size={13} /> {t.pitchLotBtn}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Action Footer */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Tag: MH-{lot.district.slice(0, 3).toUpperCase()}-{lot.id}
                    </span>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button 
                        className="btn-gov-secondary" 
                        style={{ padding: '6px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', borderColor: '#bfdbfe', color: '#1d4ed8', backgroundColor: '#eff6ff' }}
                        onClick={() => handleOpenLogisticsForLot(lot)}
                      >
                        <Truck size={13} /> {lang === 'MR' ? 'वाहतूक व ई-गेट पास' : 'Logistics & Gate Pass'}
                      </button>
                      {/* Remove / Delist Lot Action */}
                      {canInitiateDelete && (
                        <button 
                          className="btn-gov-secondary" 
                          style={{ 
                            padding: '6px 10px', 
                            fontSize: '0.75rem',
                            color: lot.status === 'UNDER_CONTRACT' ? '#94a3b8' : '#dc2626',
                            borderColor: lot.status === 'UNDER_CONTRACT' ? '#e2e8f0' : '#fecaca',
                            backgroundColor: lot.status === 'UNDER_CONTRACT' ? '#f8fafc' : '#fff5f5',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: lot.status === 'UNDER_CONTRACT' ? 'not-allowed' : 'pointer'
                          }}
                          title={
                            lot.status === 'UNDER_CONTRACT'
                              ? (lang === 'MR' ? 'सक्रिय करार असलेला शेतमाल काढता येत नाही' : 'Cannot remove lot under active contract')
                              : (lang === 'MR' ? 'शेतमाल नोंदणी काढा' : 'Delist & Remove Batch')
                          }
                          onClick={() => handleInitiateDeleteLot(lot)}
                        >
                          <Trash2 size={13} /> {t.removeLot}
                        </button>
                      )}

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
              );
            });
          })()}
        </div>

        {/* Right Column: Direct Institutional Buyers & MSP Floor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="gov-card" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <h4 style={{ fontSize: '0.98rem', color: '#0f172a', margin: 0 }}>
                  {isMarathi ? 'थेट संस्थात्मक खरेदीदार मागण्या' : 'Live Institutional Buyer Demands'}
                </h4>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  {isMarathi ? 'महाराष्ट्र प्रक्रिया उद्योग व थेट निविदा (Reverse RFQs)' : 'Direct tenders from food processors & oil mills'}
                </div>
              </div>
              <Building2 size={18} color="#059669" />
            </div>

            {/* Dynamic Buyer Demand Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(buyerDemands.length > 0 ? buyerDemands.slice(0, 3) : (api as any).DEFAULT_BUYER_DEMANDS.slice(0, 3)).map((d: any) => {
                const rem = d.required_quantity_quintals - d.fulfilled_quantity_quintals;
                const card = d.credibility_scorecard || (api as any).BUYER_CREDIBILITY_SCORECARDS[d.buyer_id];
                return (
                  <div key={d.id} style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <div>
                        <strong style={{ fontSize: '0.86rem', color: '#0f172a' }}>{d.company_name}</strong>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{d.delivery_hub}</div>
                      </div>
                      <span className="badge-grade-a">
                        {d.commodity}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                      <span style={{ fontSize: '0.76rem', color: '#475569' }}>
                        {isMarathi ? 'खरेदी दर:' : 'Target Offer:'} <strong style={{ color: '#059669', fontSize: '0.88rem' }}>₹{d.target_price_per_quintal}/qtl</strong>
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        {rem} Qtl {isMarathi ? 'शिल्लक' : 'Needed'}
                      </span>
                    </div>

                    {/* MSAMB Credibility Scorecard button */}
                    <div style={{ marginTop: '8px', display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedScorecard(card);
                          setShowScorecardModal(true);
                        }}
                        style={{
                          flex: 1,
                          backgroundColor: '#ecfdf5',
                          border: '1px solid #a7f3d0',
                          color: '#065f46',
                          borderRadius: '4px',
                          padding: '4px 6px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px'
                        }}
                      >
                        <ShieldCheck size={12} color="#059669" />
                        <span>MSAMB: {card?.overall_reliability_score || 99.2}★ (99.2% Escrow)</span>
                      </button>

                      <button
                        type="button"
                        className="btn-gov-primary"
                        onClick={() => {
                          if (onNavigateToDemands) {
                            onNavigateToDemands();
                          }
                        }}
                        style={{ padding: '4px 10px', fontSize: '0.72rem', whiteSpace: 'nowrap' }}
                      >
                        {isMarathi ? 'मागणी पूर्ण करा' : 'Fulfill'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Nav CTA to Buyer Demand Board */}
            <button
              className="btn-gov-secondary"
              onClick={() => {
                if (onNavigateToDemands) {
                  onNavigateToDemands();
                }
              }}
              style={{ width: '100%', justifyContent: 'center', padding: '8px', fontSize: '0.78rem', marginTop: '12px', fontWeight: 700 }}
            >
              <span>{isMarathi ? 'सर्व संस्थात्मक खरेदी मागण्या पहा (Reverse RFQ) →' : 'Browse All Corporate Procurement Demands →'}</span>
            </button>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: '#065f46', borderTop: '1px solid #a7f3d0', paddingTop: '6px', flexWrap: 'wrap', gap: '6px' }}>
              <span>
                {mspPrices.length > 0
                  ? mspPrices.slice(0, 2).map(m => `${m.commodity} MSP: ₹${m.msp_price}/qtl`).join(' • ')
                  : 'Soybean MSP: ₹4,892/qtl • Cotton MSP: ₹7,122/qtl'}
              </span>
              <span>● Fully Protected</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )}

  {/* Option 1: FPO Collective Pooling Hub (सामूहिक शेतकरी गट) */}
  {activeMainTab === 'FPO_POOLS' && (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* FPO Pooling Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
        color: '#ffffff',
        borderRadius: 'var(--radius-md)',
        padding: '24px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 4px 20px rgba(6, 78, 59, 0.15)'
      }}>
        <div style={{ maxWidth: '650px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255,255,255,0.15)', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 700, marginBottom: '8px' }}>
            <Users size={13} /> SIH PS 26132 • FPO Collective Bargaining Engine
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 6px 0', color: '#ffffff' }}>
            Smallholder Farmer Collective Batch Pooling
          </h3>
          <p style={{ fontSize: '0.84rem', color: '#d1fae5', margin: 0, lineHeight: 1.5 }}>
            Smallholder farmers (1–2 acres) combine fragmented 20–50 Qtl harvest lots into 500–2,000 Qtl institutional bulk consignments. Unlocks bulk transport savings, direct corporate procurement contracts, and guaranteed automated escrow dividend splits.
          </p>
        </div>

        <button
          className="btn-gov-primary"
          onClick={() => {
            const openModal = () => setShowCreatePoolModal(true);
            if (onRequireAuth && !currentUser) {
              onRequireAuth('Starting an FPO consortium requires a verified lead farmer or FPO account.', openModal);
            } else {
              openModal();
            }
          }}
          style={{ backgroundColor: '#10b981', color: '#ffffff', fontWeight: 700, padding: '10px 18px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={16} /> Launch New FPO Consignment Pool
        </button>
      </div>

      {/* FPO Pooling Key Stat Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <div className="gov-card" style={{ padding: '16px 20px' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Target Pooled Consignments
          </span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
            {fpoPools.reduce((acc, p) => acc + p.target_volume_quintals, 0).toLocaleString()} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Qtl ({(fpoPools.reduce((acc, p) => acc + p.target_volume_quintals, 0) / 10).toFixed(0)} MT)</span>
          </div>
          <p style={{ fontSize: '0.74rem', color: '#059669', margin: 0 }}>
            Across {fpoPools.length} Active Regional Consortia
          </p>
        </div>

        <div className="gov-card" style={{ padding: '16px 20px' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Aggregated Volume Collected
          </span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#059669', margin: '4px 0' }}>
            {fpoPools.reduce((acc, p) => acc + p.collected_volume_quintals, 0).toLocaleString()} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Qtl</span>
          </div>
          <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: 0 }}>
            {fpoPools.length > 0 ? Math.round((fpoPools.reduce((acc, p) => acc + p.collected_volume_quintals, 0) / Math.max(1, fpoPools.reduce((acc, p) => acc + p.target_volume_quintals, 0))) * 100) : 0}% of Target Volume Fulfilled
          </p>
        </div>

        <div className="gov-card" style={{ padding: '16px 20px' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Unified Smallholders
          </span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#d97706', margin: '4px 0' }}>
            {fpoPools.reduce((acc, p) => acc + (p.members?.length || 0), 0)} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Farmers</span>
          </div>
          <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: 0 }}>
            Zero Intermediary Commissions
          </p>
        </div>
      </div>

      {/* Active FPO Batches List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.15rem', color: '#0f172a', margin: 0 }}>
            Active Institutional Consignment Pools ({fpoPools.length})
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>
            ● Regulated under Maharashtra State APMC Act 1963 Section 29
          </span>
        </div>

        {fpoPools.length === 0 ? (
          <div className="gov-card" style={{ padding: '40px 20px', textAlign: 'center' }}>
            <Users size={36} color="#94a3b8" style={{ margin: '0 auto 12px auto' }} />
            <h4 style={{ color: '#1e293b', marginBottom: '6px' }}>No Active FPO Consignment Pools</h4>
            <p style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '420px', margin: '0 auto 16px auto' }}>
              No consignment pools have been launched yet. Click "Launch New Collective Pool" above to initiate a bulk aggregation batch for your cooperative.
            </p>
            <button className="btn-gov-primary" onClick={() => setShowCreatePoolModal(true)} style={{ margin: '0 auto' }}>
              <Plus size={15} /> Launch First FPO Pool
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '20px' }}>
            {fpoPools.map(pool => {
              const fillPercent = Math.min(100, Math.round((pool.collected_volume_quintals / pool.target_volume_quintals) * 100));
              const remainingQtl = Math.max(0, pool.target_volume_quintals - pool.collected_volume_quintals);
              const isReady = pool.status === 'READY_FOR_INSTITUTIONAL_RFQ' || fillPercent >= 100;

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
                    border: isReady ? '2px solid #0284c7' : '1px solid var(--border-card)',
                    boxShadow: isReady ? '0 4px 14px rgba(2, 132, 199, 0.12)' : 'none'
                  }}
                >
                  <div>
                    {/* Top Badges & FPO Title */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
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
                            {isReady ? '★ Ready for Institutional Procurement' : '● Open for Farmer Lots'}
                          </span>
                          <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>
                            Reg: {pool.fpo_registration_number}
                          </span>
                        </div>
                        <h4 style={{ fontSize: '1.15rem', color: '#0f172a', margin: 0 }}>
                          {pool.fpo_name}
                        </h4>
                        <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                          Lead: <strong>{pool.fpo_contact_person}</strong> • {pool.fpo_contact_phone}
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
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Pooled Commodity:</span>
                        <strong style={{ fontSize: '0.86rem', color: '#0f172a', display: 'block' }}>
                          {pool.commodity} — {pool.variety} ({pool.quality_grade})
                        </strong>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Central Aggregation Hub:</span>
                        <div style={{ fontSize: '0.76rem', fontWeight: 600, color: '#475569' }}>
                          📍 {pool.central_hub_location}
                        </div>
                      </div>
                    </div>

                    {/* Consignment Target Volume Progress Bar */}
                    <div style={{ marginBottom: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px' }}>
                        <span>
                          Progress: <strong>{pool.collected_volume_quintals}</strong> / {pool.target_volume_quintals} Quintals ({(pool.collected_volume_quintals / 10).toFixed(1)} / {(pool.target_volume_quintals / 10).toFixed(1)} MT)
                        </span>
                        <strong style={{ color: isReady ? '#0284c7' : '#059669' }}>
                          {fillPercent}% Fulfilled
                        </strong>
                      </div>
                      <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${fillPercent}%`,
                            height: '100%',
                            backgroundColor: isReady ? '#0284c7' : '#059669',
                            transition: 'width 0.4s ease'
                          }}
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        <span>{pool.members.length} Smallholders Contributed</span>
                        <span>{remainingQtl > 0 ? `${remainingQtl} Qtl needed to dispatch` : 'Target Consignment Complete'}</span>
                      </div>
                    </div>

                    {/* Contributing Farmers Micro-Pills */}
                    <div style={{ marginBottom: '10px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                        Contributing Members & Escrow Split
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

                  {/* Action Bar */}
                  <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '12px', flexWrap: 'wrap' }}>
                    <button
                      className="btn-gov-secondary"
                      onClick={() => setSelectedPoolForBreakdown(pool)}
                      style={{ flex: 1, minWidth: '160px', padding: '8px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <Users size={14} /> View Member Split
                    </button>

                    <button
                      className="btn-gov-primary"
                      onClick={() => {
                        const openModal = () => setContributeModalPool(pool);
                        if (onRequireAuth && !currentUser) {
                          onRequireAuth('Contributing to an FPO pool requires a verified farmer account.', openModal);
                        } else {
                          openModal();
                        }
                      }}
                      style={{ flex: 1, minWidth: '160px', padding: '8px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <span>🤝</span> Contribute My Lot
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  )}

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
              {/* Option 2: Kisan Vision AI Computer Vision Quality Assay */}
              <div style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #a7f3d0',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div style={{ flex: 1, minWidth: '220px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: '#065f46' }}>
                    <Sparkles size={15} color="#059669" />
                    <span>Kisan Vision AI Computer Vision Quality Assay</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#047857', marginTop: '2px' }}>
                    Auto-scan produce photo to measure diameter, blemish defect %, moisture & AGMARKNET grade
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAssayModal(true)}
                  className="btn-gov-primary"
                  style={{ fontSize: '0.75rem', padding: '6px 14px', backgroundColor: '#059669', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>📷</span> Scan with AI Vision
                </button>
              </div>

              {/* Applied Assay Banner */}
              {appliedAssayResult && (
                <div style={{
                  backgroundColor: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  borderRadius: 'var(--radius-xs)',
                  padding: '8px 12px',
                  fontSize: '0.75rem',
                  color: '#065f46',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '6px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Check size={14} color="#059669" />
                    <span>
                      <strong>Assay Verified:</strong> {appliedAssayResult.predicted_grade} ({appliedAssayResult.confidence_score}% confidence) • Moisture: {appliedAssayResult.estimated_moisture_percent}% • Cert #{appliedAssayResult.assay_id}
                    </span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setShowAssayModal(true)} 
                    style={{ color: '#059669', fontWeight: 700, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.72rem' }}
                  >
                    Re-scan
                  </button>
                </div>
              )}

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
                    onChange={(e) => setNewVolume(e.target.value === '' ? '' : Number(e.target.value))} 
                    placeholder="e.g. 25 MT"
                    required
                  />
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    = {newVolume ? Number(newVolume) * 10 : 0} Quintals
                  </span>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a', marginBottom: '4px', display: 'block' }}>
                    {t.baseAskingRateLabel}
                  </label>
                  <input 
                    type="number" 
                    value={newRate} 
                    onChange={(e) => setNewRate(e.target.value === '' ? '' : Number(e.target.value))} 
                    placeholder="e.g. 2450 ₹/qtl"
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
                    onChange={(e) => setNewMoisture(e.target.value === '' ? '' : Number(e.target.value))} 
                    placeholder="e.g. 10.5%"
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
                    onChange={(e) => setNewDeliveryDays(e.target.value === '' ? '' : Number(e.target.value))} 
                    placeholder="e.g. 3 days"
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
                    placeholder="e.g. Lasalgaon APMC Cold Hub"
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

      {/* Modal 3: Delist & Remove Produce Lot Confirmation */}
      {deleteConfirmLot && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '460px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626', flexShrink: 0 }}>
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', color: '#0f172a' }}>
                    {lang === 'MR' ? 'शेतमाल नोंदणी काढायची आहे का?' : 'Remove Produce Lot?'}
                  </h3>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    LOT #{deleteConfirmLot.id} • Tag: MH-{deleteConfirmLot.district ? deleteConfirmLot.district.slice(0, 3).toUpperCase() : 'AGR'}-{deleteConfirmLot.id}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => !isDeletingLot && setDeleteConfirmLot(null)} 
                disabled={isDeletingLot}
                style={{ background: 'transparent', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-sm)', padding: '12px 14px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Commodity:</span>
                <strong style={{ color: '#0f172a' }}>{deleteConfirmLot.commodity} ({deleteConfirmLot.variety})</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Volume:</span>
                <strong style={{ color: '#0f172a' }}>{deleteConfirmLot.quantity_quintals} Quintals ({(deleteConfirmLot.quantity_quintals / 10).toFixed(1)} MT)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Asking Base Price:</span>
                <strong style={{ color: '#059669' }}>₹{deleteConfirmLot.base_price_per_quintal} / qtl</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Storage Hub:</span>
                <span style={{ color: '#475569' }}>{deleteConfirmLot.mandi_name}</span>
              </div>
            </div>

            <div style={{ backgroundColor: '#fff5f5', border: '1px solid #fecaca', borderRadius: 'var(--radius-sm)', padding: '10px 12px', fontSize: '0.78rem', color: '#991b1b', marginBottom: '16px', lineHeight: 1.45 }}>
              ⚠️ <strong>Warning:</strong> {lang === 'MR'
                ? 'हा शेतमाल कायमचा काढला जाईल आणि सर्व संस्थात्मक खरेदीदार यादीतून हटवला जाईल. या शेतमालावरील सर्व चालू द्विपक्षीय मागण्या (RFQs) आपोआप रद्द होतील.'
                : 'This produce lot will be delisted immediately from the marketplace. Any pending buyer RFQs or open counter-bids associated with this lot will be cancelled.'}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                type="button" 
                className="btn-gov-secondary" 
                onClick={() => setDeleteConfirmLot(null)}
                disabled={isDeletingLot}
              >
                {t.cancelBtn}
              </button>
              <button 
                type="button" 
                onClick={handleConfirmDeleteLot}
                disabled={isDeletingLot}
                style={{
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 16px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: isDeletingLot ? 'not-allowed' : 'pointer',
                  opacity: isDeletingLot ? 0.7 : 1
                }}
              >
                <Trash2 size={14} />
                {isDeletingLot 
                  ? (lang === 'MR' ? 'हटवत आहे...' : 'Removing...') 
                  : (lang === 'MR' ? 'होय, शेतमाल काढा' : 'Yes, Delist & Remove')}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal 4: Kisan Vision AI Quality Assay Modal */}
      <AIQualityAssayModal
        isOpen={showAssayModal}
        onClose={() => setShowAssayModal(false)}
        onApplyGrade={handleApplyAssayResult}
        initialCommodity={newCommodity}
        contextMode="LISTING"
      />

      {/* Modal 5: FPO Pool Composition & Member Breakdown Modal */}
      {selectedPoolForBreakdown && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '640px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>
                  <Users size={14} /> FPO Consignment Roster & Escrow Allocation
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
            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-sm)', padding: '12px 16px', marginBottom: '16px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#065f46', display: 'block' }}>Target Consignment</span>
                <strong style={{ fontSize: '1rem', color: '#065f46' }}>{selectedPoolForBreakdown.target_volume_quintals} Qtl</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#065f46', display: 'block' }}>Collected So Far</span>
                <strong style={{ fontSize: '1rem', color: '#059669' }}>{selectedPoolForBreakdown.collected_volume_quintals} Qtl</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#065f46', display: 'block' }}>Total Escrow Pool</span>
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
                          <span style={{ backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '1px 6px', borderRadius: '4px', fontWeight: 700, fontSize: '0.72rem' }}>
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

            <div style={{ fontSize: '0.72rem', color: '#64748b', backgroundColor: '#f8fafc', padding: '8px 12px', borderRadius: 'var(--radius-xs)', marginBottom: '14px' }}>
              🛡️ <strong>Statutory Escrow Guarantee:</strong> When the institutional buyer releases milestone escrow payments, funds are automatically divided into each farmer's registered bank account in proportion to their certified contribution percentage.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                className="btn-gov-secondary"
                onClick={() => setSelectedPoolForBreakdown(null)}
              >
                Close Roster
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 6: Contribute My Lot to FPO Pool */}
      {contributeModalPool && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>
                  🤝 Smallholder Lot Aggregation
                </span>
                <h3 style={{ fontSize: '1.2rem', color: '#0f172a', margin: '2px 0 0 0' }}>
                  Contribute to {contributeModalPool.fpo_name}
                </h3>
              </div>
              <button
                onClick={() => setContributeModalPool(null)}
                style={{ background: 'transparent', color: '#64748b', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleContributeLot} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Commodity:</span>
                  <strong>{contributeModalPool.commodity} ({contributeModalPool.quality_grade})</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Target Consignment:</span>
                  <strong>{contributeModalPool.collected_volume_quintals} / {contributeModalPool.target_volume_quintals} Qtl</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Base Payout Rate:</span>
                  <strong style={{ color: '#059669' }}>₹{contributeModalPool.unit_base_price} / qtl</strong>
                </div>
              </div>

              {/* Option to choose existing lot if available */}
              {lots.filter(l => !currentUser || l.farmer_id === currentUser.id || l.farmer_name === currentUser.name).length > 0 && (
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a', marginBottom: '4px', display: 'block' }}>
                    Select from Your Listed Harvest Batches (Optional):
                  </label>
                  <select
                    value={contributeSelectedLotId}
                    onChange={(e) => {
                      const id = e.target.value === '' ? '' : Number(e.target.value);
                      setContributeSelectedLotId(id);
                      if (id) {
                        const matched = lots.find(l => l.id === id);
                        if (matched) setContributeQuantity(matched.quantity_quintals);
                      }
                    }}
                  >
                    <option value="">-- Enter manual quantity or pick listed lot --</option>
                    {lots
                      .filter(l => !currentUser || l.farmer_id === currentUser.id || l.farmer_name === currentUser.name)
                      .map(l => (
                        <option key={l.id} value={l.id}>
                          LOT #{l.id} — {l.commodity} ({l.quantity_quintals} Qtl / {(l.quantity_quintals / 10).toFixed(1)} MT)
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a', marginBottom: '4px', display: 'block' }}>
                  Quantity to Contribute (in Quintals):
                </label>
                <input
                  type="number"
                  min={10}
                  max={contributeModalPool.target_volume_quintals - contributeModalPool.collected_volume_quintals + 500}
                  value={contributeQuantity}
                  onChange={(e) => setContributeQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 50 Quintals (5 MT)"
                  required
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
                  = {contributeQuantity ? (Number(contributeQuantity) / 10).toFixed(1) : 0} Metric Tonnes
                </span>
              </div>

              {/* Live Escrow Calculation Preview */}
              {Number(contributeQuantity) > 0 && (
                <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: '0.78rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#065f46' }}>Estimated Payout Share:</span>
                    <strong style={{ color: '#047857' }}>
                      {(((Number(contributeQuantity)) / (contributeModalPool.collected_volume_quintals + Number(contributeQuantity))) * 100).toFixed(2)}% of Escrow
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#065f46' }}>Guaranteed Minimum Value:</span>
                    <strong style={{ color: '#047857', fontSize: '0.9rem' }}>
                      ₹{(Number(contributeQuantity) * contributeModalPool.unit_base_price).toLocaleString()}
                    </strong>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button
                  type="button"
                  className="btn-gov-secondary"
                  onClick={() => setContributeModalPool(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-gov-primary"
                  style={{ backgroundColor: '#059669' }}
                >
                  Confirm Contribution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 7: Launch New FPO Consignment Pool */}
      {showCreatePoolModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>
                  ● APMC Section 29 Registered Consortia
                </span>
                <h3 style={{ fontSize: '1.2rem', color: '#0f172a', margin: '2px 0 0 0' }}>
                  Launch New FPO Consignment Pool
                </h3>
              </div>
              <button
                onClick={() => setShowCreatePoolModal(false)}
                style={{ background: 'transparent', color: '#64748b', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePool} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a', marginBottom: '4px', display: 'block' }}>
                  FPO / Cooperative Name:
                </label>
                <input
                  type="text"
                  value={newPoolFpoName}
                  onChange={(e) => setNewPoolFpoName(e.target.value)}
                  placeholder="e.g. Sahyadri Farmers Producer Co. Ltd."
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a', marginBottom: '4px', display: 'block' }}>
                    Commodity:
                  </label>
                  <select
                    value={newPoolCommodity}
                    onChange={(e) => {
                      const c = e.target.value;
                      setNewPoolCommodity(c);
                      if (c === 'Onion') { setNewPoolVariety('Garwa Grade A (Export Quality)'); setNewPoolPrice(2550); }
                      else if (c === 'Soybean') { setNewPoolVariety('Yellow JS-335 (High Protein)'); setNewPoolPrice(5120); }
                      else if (c === 'Cotton') { setNewPoolVariety('Medium Staple LRA-5166'); setNewPoolPrice(7350); }
                    }}
                  >
                    <option value="Onion">Onion (कांदा)</option>
                    <option value="Soybean">Soybean (सोयाबीन)</option>
                    <option value="Cotton">Cotton (कापूस)</option>
                    <option value="Tomato">Tomato (टोमॅटो)</option>
                    <option value="Wheat">Wheat (गहू)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a', marginBottom: '4px', display: 'block' }}>
                    Target Volume (Quintals):
                  </label>
                  <input
                    type="number"
                    min={100}
                    step={50}
                    value={newPoolTargetQty}
                    onChange={(e) => setNewPoolTargetQty(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 500 Qtl"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a', marginBottom: '4px', display: 'block' }}>
                    Base Target Price (₹/qtl):
                  </label>
                  <input
                    type="number"
                    value={newPoolPrice}
                    onChange={(e) => setNewPoolPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 2500"
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a', marginBottom: '4px', display: 'block' }}>
                    Variety / Specification:
                  </label>
                  <input
                    type="text"
                    value={newPoolVariety}
                    onChange={(e) => setNewPoolVariety(e.target.value)}
                    placeholder="e.g. Garwa Grade A"
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a', marginBottom: '4px', display: 'block' }}>
                  Central Aggregation & Cold Storage Depot:
                </label>
                <input
                  type="text"
                  value={newPoolHub}
                  onChange={(e) => setNewPoolHub(e.target.value)}
                  placeholder="e.g. Dindori Agro-Processing & Cold Storage Cluster, Nashik"
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button
                  type="button"
                  className="btn-gov-secondary"
                  onClick={() => setShowCreatePoolModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-gov-primary"
                  style={{ backgroundColor: '#059669' }}
                >
                  Publish Consignment Pool
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MSAMB Buyer Credibility Scorecard Modal */}
      <BuyerScorecardModal
        isOpen={showScorecardModal}
        onClose={() => setShowScorecardModal(false)}
        scorecard={selectedScorecard}
        lang={lang}
      />
    </div>
  );
};

export default FarmerPortal;
