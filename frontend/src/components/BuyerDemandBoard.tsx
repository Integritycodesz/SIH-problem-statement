import React, { useState, useEffect } from 'react';
import { 
  Building2, ShieldCheck, Clock, 
  ArrowRight, Search, Plus, CheckCircle2,
  X, ChevronRight, Truck, Scale, Sprout, QrCode
} from 'lucide-react';
import { api, type User, type BuyerDemand, type ProduceLot, type BuyerReliabilityScorecard, type ConsignmentPool, type DigitalGatePass, type ForwardContractOffer } from '../services/api';
import { subscribeToBuyerDemands } from '../services/supabase';
import { BuyerScorecardModal } from './BuyerScorecardModal';
import { CorporateProcurementDashboard } from './CorporateProcurementDashboard';
import { QualityRefractionModal } from './QualityRefractionModal';
import { TruckloadOptimizerModal } from './TruckloadOptimizerModal';
import { DigitalGatePassModal } from './DigitalGatePassModal';
import { WeighbridgeVerificationTerminal } from './WeighbridgeVerificationTerminal';
import { PreHarvestForwardContractModal } from './PreHarvestForwardContractModal';
import { AIQualityAssayModal } from './AIQualityAssayModal';
import { calculateQualityRefraction, getCommodityRefractionSchedule } from '../utils/refraction';
import { INITIAL_CONSIGNMENT_POOLS } from '../utils/logisticsOptimizer';
import { INITIAL_GATE_PASSES } from '../utils/gatePass';
import { INITIAL_FORWARD_CONTRACT_OFFERS } from '../utils/forwardContracts';
import { type Language } from '../utils/i18n';

interface BuyerDemandBoardProps {
  currentUser: User | null;
  onNavigateToContracts: (contractId: number) => void;
  onRequireAuth?: (message?: string, onComplete?: () => void) => void;
  lang?: Language;
}

const CROP_IMAGES: Record<string, string> = {
  Soybean: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=600&auto=format&fit=crop&q=80',
  Onion: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80',
  Wheat: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80',
  Cotton: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=600&auto=format&fit=crop&q=80',
  Gram: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=600&auto=format&fit=crop&q=80',
  Tomato: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80'
};

function getCropImage(commodity: string): string {
  for (const [crop, url] of Object.entries(CROP_IMAGES)) {
    if (commodity.toLowerCase().includes(crop.toLowerCase())) {
      return url;
    }
  }
  return 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&auto=format&fit=crop&q=80';
}

export const BuyerDemandBoard: React.FC<BuyerDemandBoardProps> = ({
  currentUser,
  onNavigateToContracts,
  onRequireAuth,
  lang = 'EN'
}) => {
  const isMarathi = lang === 'MR';
  const isFarmer = currentUser?.role === 'FARMER' || currentUser?.role === 'FPO';
  const isBuyer = currentUser?.role === 'BUYER';

  const [demands, setDemands] = useState<BuyerDemand[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCommodity, setSelectedCommodity] = useState<string>('All');
  const [selectedHub, setSelectedHub] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [scorecardModalOpen, setScorecardModalOpen] = useState<boolean>(false);
  const [activeScorecard, setActiveScorecard] = useState<BuyerReliabilityScorecard | null>(null);
  const [isAssayModalOpen, setIsAssayModalOpen] = useState<boolean>(false);

  const [fulfillModalOpen, setFulfillModalOpen] = useState<boolean>(false);
  const [targetDemand, setTargetDemand] = useState<BuyerDemand | null>(null);
  const [farmerLots, setFarmerLots] = useState<ProduceLot[]>([]);
  const [selectedLotId, setSelectedLotId] = useState<number | ''>('');
  const [commitQuantity, setCommitQuantity] = useState<number | ''>('');
  const [isFulfilling, setIsFulfilling] = useState<boolean>(false);
  const [fulfillSuccessMsg, setFulfillSuccessMsg] = useState<string | null>(null);
  const [createdContractId, setCreatedContractId] = useState<number | null>(null);

  // Post Demand Modal state (for corporate buyers)
  const [postDemandModalOpen, setPostDemandModalOpen] = useState<boolean>(false);
  const [newCommodity, setNewCommodity] = useState<string>('Soybean');
  const [newVariety, setNewVariety] = useState<string>('');
  const [newVolume, setNewVolume] = useState<number | ''>('');
  const [newPrice, setNewPrice] = useState<number | ''>('');
  const [newGrade, setNewGrade] = useState<string>('Grade A');
  const [newMoisture, setNewMoisture] = useState<number | ''>('');
  const [newHub, setNewHub] = useState<string>('');
  const [newDeadline, setNewDeadline] = useState<string>('');
  const [newNotes, setNewNotes] = useState<string>('');
  const [isPostingDemand, setIsPostingDemand] = useState<boolean>(false);

  // Statutory Quality Refraction Modal states
  const [refractionModalOpen, setRefractionModalOpen] = useState<boolean>(false);
  const [targetRefractionDemand, setTargetRefractionDemand] = useState<BuyerDemand | null>(null);

  // Phase 3: Logistics Consignment Pool Modal
  const [truckloadModalOpen, setTruckloadModalOpen] = useState<boolean>(false);
  const [activeTruckloadPool, setActiveTruckloadPool] = useState<ConsignmentPool | undefined>(undefined);

  // Phase 4: Digital Gate Pass & Weighbridge Terminal
  const [gatePassModalOpen, setGatePassModalOpen] = useState<boolean>(false);
  const [activeGatePass, setActiveGatePass] = useState<DigitalGatePass | undefined>(undefined);
  const [showWeighbridgeSection, setShowWeighbridgeSection] = useState<boolean>(false);

  // Phase 5: Pre-Harvest Forward Contracts
  const [forwardModalOpen, setForwardModalOpen] = useState<boolean>(false);
  const [activeForwardOffer, setActiveForwardOffer] = useState<ForwardContractOffer | undefined>(undefined);

  // Pre-Check Refraction in Fulfillment Modal
  const [enableRefractionPreCheck, setEnableRefractionPreCheck] = useState<boolean>(false);
  const [preCheckMoisture, setPreCheckMoisture] = useState<number>(12.8);
  const [preCheckForeignMatter, setPreCheckForeignMatter] = useState<number>(1.8);
  const [preCheckDamaged, setPreCheckDamaged] = useState<number>(1.5);

  useEffect(() => {
    loadDemands();

    const sub = subscribeToBuyerDemands((payload) => {
      console.log('[BuyerDemandBoard] Realtime demand event:', payload);
      loadDemands(false);
    });

    return () => {
      if (sub) sub.unsubscribe();
    };
  }, []);

  const loadDemands = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const data = await api.getBuyerDemands();
      setDemands(data);
    } catch (err) {
      console.error('Error loading buyer demands:', err);
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  const handleOpenScorecard = (card: BuyerReliabilityScorecard) => {
    setActiveScorecard(card);
    setScorecardModalOpen(true);
  };

  const handleOpenRefraction = (demand: BuyerDemand) => {
    setTargetRefractionDemand(demand);
    setRefractionModalOpen(true);
  };

  const handleOpenFulfillModal = async (demand: BuyerDemand) => {
    if (isBuyer) {
      alert(isMarathi 
        ? 'खरेदीदार इतर खरेदीदारांच्या निविदा पूर्ण करू शकत नाहीत. कृपया शेतकरी किंवा FPO खात्यात प्रवेश करा.' 
        : 'Buyers cannot fulfill tenders posted by other buyers. Please switch to a Farmer or FPO profile.');
      return;
    }
    if (!currentUser) {
      if (onRequireAuth) {
        onRequireAuth(
          isMarathi 
            ? 'संस्थात्मक खरेदी मागणी पूर्ण करण्यासाठी कृपया प्रथम शेतकरी खात्यात लॉगिन करा.' 
            : 'Please sign in as a verified farmer or FPO to commit produce against corporate demand.',
          () => handleOpenFulfillModal(demand)
        );
      }
      return;
    }

    setTargetDemand(demand);
    setFulfillSuccessMsg(null);
    setCommitQuantity('');
    setSelectedLotId('');

    // Fetch farmer's own lots if any
    try {
      const lots = await api.getLots();
      const matchingLots = lots.filter(l => 
        l.commodity.toLowerCase().includes(demand.commodity.toLowerCase()) && 
        (l.status === 'AVAILABLE' || l.status === 'UNDER_NEGOTIATION')
      );
      setFarmerLots(matchingLots);
      if (matchingLots.length > 0) {
        setSelectedLotId(matchingLots[0].id);
        const remainingDemand = demand.required_quantity_quintals - demand.fulfilled_quantity_quintals;
        setCommitQuantity(Math.min(matchingLots[0].quantity_quintals, remainingDemand));
      } else {
        const remainingDemand = demand.required_quantity_quintals - demand.fulfilled_quantity_quintals;
        setCommitQuantity(Math.min(100, remainingDemand));
      }
    } catch {
      setFarmerLots([]);
    }

    setFulfillModalOpen(true);
  };

  const handleFulfillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetDemand) return;
    const qty = Number(commitQuantity);
    if (!qty || qty <= 0) return;

    if (!currentUser) {
      if (onRequireAuth) {
        onRequireAuth(
          isMarathi 
            ? 'संस्थात्मक खरेदी मागणी पूर्ण करण्यासाठी कृपया प्रथम शेतकरी खात्यात लॉगिन करा.' 
            : 'Please sign in as a verified farmer or FPO to commit produce against corporate demand.',
          () => handleOpenFulfillModal(targetDemand)
        );
      } else {
        alert(isMarathi ? 'कृपया प्रथम लॉगिन करा.' : 'Please sign in to commit produce.');
      }
      return;
    }

    setIsFulfilling(true);
    try {
      const effectiveRefraction = enableRefractionPreCheck
        ? calculateQualityRefraction(
            {
              gross_weight_quintals: qty,
              base_price_per_quintal: targetDemand.target_price_per_quintal,
              tested_moisture_pct: preCheckMoisture,
              tested_foreign_matter_pct: preCheckForeignMatter,
              tested_damaged_pct: preCheckDamaged
            },
            targetDemand.refraction_schedule || getCommodityRefractionSchedule(targetDemand.commodity)
          )
        : undefined;

      const { contract, updatedDemand } = await api.fulfillBuyerDemand(
        targetDemand.id,
        qty,
        targetDemand.target_price_per_quintal,
        currentUser,
        Number(selectedLotId) || (targetDemand.id * 100),
        effectiveRefraction
      );

      setCreatedContractId(contract.id);
      setDemands(prev => prev.map(d => d.id === updatedDemand.id ? updatedDemand : d));
      setFulfillSuccessMsg(
        isMarathi 
          ? `यशस्वी! ${qty} क्विंटल शेतमालाचा करार AGC-MH-${contract.contract_number.slice(-8)} तयार झाला. ५०% एस्क्रो अग्रीम सुरक्षित!`
          : `Success! Binding contract ${contract.contract_number} initialized. 50% advance locked in MSAMB escrow account!`
      );

      setTimeout(() => {
        setFulfillModalOpen(false);
        onNavigateToContracts(contract.id);
      }, 1800);

    } catch (err: any) {
      alert(err.message || 'Error fulfilling demand');
    } finally {
      setIsFulfilling(false);
    }
  };

  const handlePostDemandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      if (onRequireAuth) {
        onRequireAuth(
          isMarathi 
            ? 'खरेदी मागणी प्रकाशित करण्यासाठी कृपया खरेदीदार खात्यात लॉगिन करा.' 
            : 'Please sign in as an institutional buyer to publish procurement demand.',
          () => setPostDemandModalOpen(true)
        );
      } else {
        alert(isMarathi ? 'कृपया प्रथम खरेदीदार म्हणून लॉगिन करा.' : 'Please sign in as a verified Buyer to post procurement demands.');
      }
      return;
    }

    setIsPostingDemand(true);
    try {
      const created = await api.createBuyerDemand({
        buyer_id: currentUser.id,
        buyer_name: currentUser.name,
        company_name: currentUser.name,
        commodity: newCommodity,
        variety: newVariety,
        required_quantity_quintals: Number(newVolume),
        target_price_per_quintal: Number(newPrice),
        quality_grade_required: newGrade,
        max_moisture_percent: Number(newMoisture),
        delivery_hub: newHub,
        delivery_deadline: newDeadline,
        notes: newNotes
      });

      setDemands(prev => [created, ...prev]);
      setPostDemandModalOpen(false);
      alert(isMarathi ? 'नवीन खरेदी मागणी यशस्वीपणे प्रकाशित झाली!' : 'Procurement notice published successfully to the Demand Board!');
    } catch (err: any) {
      alert(err.message || 'Error creating demand');
    } finally {
      setIsPostingDemand(false);
    }
  };

  // Filter logic
  const filteredDemands = demands.filter(d => {
    const matchCommodity = selectedCommodity === 'All' || d.commodity.toLowerCase().includes(selectedCommodity.toLowerCase());
    const matchHub = selectedHub === 'All' || d.delivery_hub.toLowerCase().includes(selectedHub.toLowerCase());
    const matchSearch = !searchQuery.trim() || 
      d.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.commodity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.delivery_hub.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCommodity && matchHub && matchSearch;
  });

  const totalDemandVolume = demands.reduce((acc, d) => acc + d.required_quantity_quintals, 0);
  const totalFulfilledVolume = demands.reduce((acc, d) => acc + d.fulfilled_quantity_quintals, 0);
  const totalEscrowCapitalLakhs = Math.round(demands.reduce((acc, d) => acc + (d.required_quantity_quintals * d.target_price_per_quintal), 0) / 100000);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* If current user is a corporate buyer: render Executive Corporate Procurement Dashboard */}
      {isBuyer && (
        <CorporateProcurementDashboard 
          currentUser={currentUser} 
          lang={lang} 
          onRefreshDemands={loadDemands} 
        />
      )}

      {/* 1. Header Banner with Macro Metrics */}
      <div style={{
        backgroundColor: '#064e3b',
        background: 'linear-gradient(135deg, #04362a 0%, #064e3b 60%, #065f46 100%)',
        color: '#ffffff',
        borderRadius: '16px',
        padding: '28px 32px',
        boxShadow: '0 10px 25px -5px rgba(6, 78, 59, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '780px', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{
              backgroundColor: '#34d399',
              color: '#064e3b',
              fontWeight: 800,
              fontSize: '0.68rem',
              padding: '2px 8px',
              borderRadius: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              {isMarathi ? 'थेट संस्थात्मक निविदा' : 'DIRECT REVERSE RFQ TENDERS'}
            </span>
            <span style={{ fontSize: '0.78rem', color: '#a7f3d0' }}>
              • {isMarathi ? 'महाराष्ट्र प्रक्रिया उद्योग व खरेदीदार मागणी फलक' : 'Maharashtra Food Processors, Exporters & Oil Mills'}
            </span>
          </div>

          <h2 style={{ fontSize: '1.9rem', fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.02em', color: '#ffffff' }}>
            {isMarathi ? 'खरेदीदार मागणी फलक (Reverse RFQ)' : 'Live Buyer Procurement Demands'}
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#d1fae5', margin: 0, lineHeight: 1.5 }}>
            {isMarathi 
              ? 'मोठ्या तेलगिरण्या, अन्न प्रक्रिया उद्योग व निर्यातदारांच्या थेट खरेदी मागण्या तपासा. हमीभावापेक्षा जास्त दर आणि १००% एस्क्रो सुरक्षा मिळवा.'
              : 'Institutional processors and mills post bulk procurement notices with pre-approved escrow advances. Select a demand to fulfill directly.'
            }
          </p>
        </div>

        {/* Action button on right */}
        <div style={{
          position: 'absolute',
          right: '32px',
          top: '32px',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '12px'
        }}>
          {isFarmer ? (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(52, 211, 153, 0.45)',
              padding: '9px 16px',
              borderRadius: 'var(--radius-sm)',
              color: '#ffffff',
              fontSize: '0.84rem',
              fontWeight: 700,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)'
            }}>
              <ShieldCheck size={16} color="#34d399" />
              <span>{isMarathi ? '🌾 शेतकरी / FPO थेट पुरवठादार केंद्र' : '🌾 Farmer / FPO Direct Supply Desk'}</span>
            </div>
          ) : (
            <button
              className="btn-gov-primary"
              style={{
                backgroundColor: '#34d399',
                color: '#064e3b',
                border: 'none',
                fontWeight: 800,
                padding: '10px 18px',
                fontSize: '0.86rem',
                boxShadow: '0 4px 12px rgba(52, 211, 153, 0.3)'
              }}
              onClick={() => {
                if (!currentUser && onRequireAuth) {
                  onRequireAuth(
                    isMarathi ? 'खरेदी निविदा प्रकाशित करण्यासाठी कृपया खरेदीदार खात्यात लॉगिन करा.' : 'Please sign in as an institutional buyer to post procurement tenders.',
                    () => setPostDemandModalOpen(true)
                  );
                } else {
                  setPostDemandModalOpen(true);
                }
              }}
            >
              <Plus size={16} />
              <span>{isMarathi ? '+ खरेदी मागणी प्रकाशित करा' : '+ Post Procurement Demand'}</span>
            </button>
          )}
        </div>

        {/* Bottom Banner Stat Tiles */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.15)',
          position: 'relative',
          zIndex: 2
        }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: '#a7f3d0', textTransform: 'uppercase', fontWeight: 700 }}>
              {isMarathi ? 'सक्रिय कॉर्पोरेट मागणी' : 'Total Active Demand'}
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff' }}>
              {totalDemandVolume.toLocaleString()} <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Qtl</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', color: '#a7f3d0', textTransform: 'uppercase', fontWeight: 700 }}>
              {isMarathi ? 'पूर्ण झालेली खरेदी' : 'Fulfilled Volume'}
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#34d399' }}>
              {totalFulfilledVolume.toLocaleString()} <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Qtl ({Math.round((totalFulfilledVolume / (totalDemandVolume || 1)) * 100)}%)</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', color: '#a7f3d0', textTransform: 'uppercase', fontWeight: 700 }}>
              {isMarathi ? 'एस्क्रो वचनबद्ध भांडवल' : 'Escrow Capital Committed'}
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff' }}>
              ₹{totalEscrowCapitalLakhs} <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Lakhs</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', color: '#a7f3d0', textTransform: 'uppercase', fontWeight: 700 }}>
              {isMarathi ? 'सरासरी एस्क्रो वेळेवर दर' : 'MSAMB Escrow Reliability'}
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#34d399' }}>
              99.2% <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>✓ Zero Default</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Institutional Operations & Logistics Master Suite Bar */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '12px',
        padding: '12px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            backgroundColor: '#0f172a',
            color: '#38bdf8',
            fontSize: '0.68rem',
            fontWeight: 800,
            padding: '3px 8px',
            borderRadius: '4px',
            letterSpacing: '0.04em'
          }}>
            MSAMB SUITE
          </span>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b' }}>
            {isMarathi ? 'प्रक्रिया उद्योग व लॉजिस्टिक्स टूल्स (Phases 3, 4, 5)' : 'Institutional Procurement & Logistics Suite'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {/* Phase 3 Button */}
          <button
            type="button"
            onClick={() => {
              setActiveTruckloadPool(INITIAL_CONSIGNMENT_POOLS[0]);
              setTruckloadModalOpen(true);
            }}
            style={{
              backgroundColor: '#eff6ff',
              color: '#1d4ed8',
              border: '1px solid #bfdbfe',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Truck size={14} color="#2563eb" />
            <span>{isMarathi ? '🚚 वाहतूक व ट्रकलोड' : '🚚 Truckload Optimizer (P3)'}</span>
          </button>

          {/* Phase 4 Weighbridge Terminal Toggle */}
          <button
            type="button"
            onClick={() => setShowWeighbridgeSection(!showWeighbridgeSection)}
            style={{
              backgroundColor: showWeighbridgeSection ? '#064e3b' : '#ecfdf5',
              color: showWeighbridgeSection ? '#ffffff' : '#047857',
              border: '1px solid #a7f3d0',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Scale size={14} color={showWeighbridgeSection ? '#34d399' : '#059669'} />
            <span>{showWeighbridgeSection ? (isMarathi ? 'वजनकाटा बंद करा' : 'Hide Weighbridge') : (isMarathi ? '⚖️ मिल वजनकाटा टर्मिनल' : '⚖️ Mill Weighbridge Terminal (P4)')}</span>
          </button>

          {/* Phase 4 Gate Pass Button */}
          <button
            type="button"
            onClick={() => {
              setActiveGatePass(INITIAL_GATE_PASSES[0]);
              setGatePassModalOpen(true);
            }}
            style={{
              backgroundColor: '#f8fafc',
              color: '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <QrCode size={14} color="#059669" />
            <span>{isMarathi ? '🎫 ई-गेट पास' : '🎫 Digital Gate Pass (P4)'}</span>
          </button>

          {/* Phase 5 Forward Contracts Button */}
          <button
            type="button"
            onClick={async () => {
              const offers = await api.getForwardContractOffers();
              setActiveForwardOffer(offers[0] || INITIAL_FORWARD_CONTRACT_OFFERS[0]);
              setForwardModalOpen(true);
            }}
            style={{
              backgroundColor: '#f0fdf4',
              color: '#15803d',
              border: '1px solid #bbf7d0',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Sprout size={14} color="#16a34a" />
            <span>{isMarathi ? '🌱 पूर्व-हंगाम करार (Form C)' : '🌱 Forward Contracts (P5)'}</span>
          </button>

          {/* AI Optical Quality Assay Lab Button */}
          <button
            type="button"
            onClick={() => setIsAssayModalOpen(true)}
            style={{
              backgroundColor: '#f5f3ff',
              color: '#6d28d9',
              border: '1px solid #ddd6fe',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Computer Vision Grain Quality Assay"
          >
            <span>🔬</span>
            <span>{isMarathi ? '🔬 एआय धान्य गुणवत्ता' : '🔬 AI Quality Lab (CV)'}</span>
          </button>
        </div>
      </div>

      {/* Collapsible Mill Weighbridge Terminal Section (Phase 4) */}
      {showWeighbridgeSection && (
        <WeighbridgeVerificationTerminal
          onOpenGatePassModal={(gp) => {
            setActiveGatePass(gp);
            setGatePassModalOpen(true);
          }}
          lang={lang}
        />
      )}

      {/* 3. Filter & Search Bar */}
      <div className="gov-card" style={{ padding: '14px 18px', display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', flex: 1 }}>
          
          {/* Search box */}
          <div style={{ position: 'relative', minWidth: '240px', flex: '1 1 240px' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text"
              placeholder={isMarathi ? 'कंपनी, पीक किंवा हब शोधा...' : 'Search processor, crop or hub...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '32px', fontSize: '0.82rem', height: '36px' }}
            />
          </div>

          {/* Commodity chips */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['All', 'Soybean', 'Cotton', 'Onion', 'Wheat', 'Gram'].map(crop => (
              <button
                key={crop}
                onClick={() => setSelectedCommodity(crop)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: selectedCommodity === crop ? 700 : 500,
                  backgroundColor: selectedCommodity === crop ? '#065f46' : '#f1f5f9',
                  color: selectedCommodity === crop ? '#ffffff' : '#475569',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                {crop}
              </button>
            ))}
          </div>
        </div>

        {/* Hub selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
            {isMarathi ? 'प्रक्रिया हब:' : 'Processing Hub:'}
          </span>
          <select
            value={selectedHub}
            onChange={(e) => setSelectedHub(e.target.value)}
            className="form-input"
            style={{ fontSize: '0.82rem', height: '36px', padding: '4px 10px', minWidth: '160px' }}
          >
            <option value="All">{isMarathi ? 'सर्व जिल्हे / हब' : 'All Maharashtra Hubs'}</option>
            <option value="Nagpur">Nagpur MIDC</option>
            <option value="Akola">Akola Solvent Cluster</option>
            <option value="Pune">Pune Narayangaon Hub</option>
            <option value="Nashik">Nashik Dindori Park</option>
            <option value="Wardha">Wardha Ginning Yard</option>
          </select>
        </div>
      </div>

      {/* 3. Demands Grid */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
          Connecting to verified Maharashtra institutional procurement feed...
        </div>
      ) : filteredDemands.length === 0 ? (
        <div className="gov-card" style={{ padding: '48px', textAlign: 'center' }}>
          <Building2 size={40} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <h4 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '6px' }}>
            {isMarathi ? 'कोणतीही मागणी आढळली नाही' : 'No active procurement tenders match your filter'}
          </h4>
          <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '0 0 16px' }}>
            {isMarathi ? 'कृपया फिल्टर बदला किंवा नवीन खरेदी मागणी तपासा.' : 'Try changing your commodity filter or searching another district hub.'}
          </p>
          <button 
            className="btn-gov-secondary" 
            onClick={() => { setSelectedCommodity('All'); setSelectedHub('All'); setSearchQuery(''); }}
            style={{ fontSize: '0.82rem' }}
          >
            {isMarathi ? 'सर्व मागण्या दाखवा' : 'Reset Filters'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
          {filteredDemands.map((demand) => {
            const cropImg = getCropImage(demand.commodity);
            const remainingQty = Math.max(demand.required_quantity_quintals - demand.fulfilled_quantity_quintals, 0);
            const fulfillmentPct = Math.min(Math.round((demand.fulfilled_quantity_quintals / demand.required_quantity_quintals) * 100), 100);
            const scorecard = demand.credibility_scorecard || (api as any).BUYER_CREDIBILITY_SCORECARDS[demand.buyer_id];

            return (
              <div 
                key={demand.id} 
                className="gov-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
              >
                {/* Card Top Banner with Crop Thumbnail & Buyer Name */}
                <div style={{ position: 'relative', height: '110px', overflow: 'hidden' }}>
                  <img 
                    src={cropImg} 
                    alt={demand.commodity} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.72)' }} 
                  />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.85) 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '12px 16px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        backgroundColor: '#10b981',
                        color: '#ffffff',
                        fontSize: '0.66rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        textTransform: 'uppercase'
                      }}>
                        {demand.company_type.replace('_', ' ')}
                      </span>

                      <span style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        color: '#065f46',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Clock size={11} />
                        {demand.delivery_deadline}
                      </span>
                    </div>

                    <div>
                      <strong style={{ color: '#ffffff', fontSize: '1.02rem', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
                        {demand.company_name}
                      </strong>
                      <div style={{ color: '#cbd5e1', fontSize: '0.72rem' }}>
                        {demand.buyer_name}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', gap: '14px' }}>
                  
                  <div>
                    {/* Commodity & Target Buying Price */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                          {demand.commodity}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                          {demand.variety}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#059669', fontFamily: 'var(--font-display)' }}>
                          ₹{demand.target_price_per_quintal.toLocaleString()}
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>/qtl</span>
                        </div>
                        <span style={{ 
                          fontSize: '0.68rem', 
                          fontWeight: 700, 
                          color: '#065f46', 
                          backgroundColor: '#ecfdf5', 
                          padding: '1px 6px', 
                          borderRadius: '4px',
                          border: '1px solid #a7f3d0'
                        }}>
                          Pre-Funded Escrow
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar of Volume Fulfilled */}
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '4px' }}>
                        <span style={{ color: '#64748b' }}>
                          {isMarathi ? 'खरेदी प्रगती:' : 'Procurement Progress:'} <strong>{demand.fulfilled_quantity_quintals} / {demand.required_quantity_quintals} Qtl</strong>
                        </span>
                        <strong style={{ color: fulfillmentPct >= 100 ? '#059669' : '#0284c7' }}>
                          {fulfillmentPct}%
                        </strong>
                      </div>

                      <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${fulfillmentPct}%`,
                          height: '100%',
                          backgroundColor: fulfillmentPct >= 100 ? '#10b981' : '#0284c7',
                          borderRadius: '4px',
                          transition: 'width 0.4s'
                        }} />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748b', marginTop: '3px' }}>
                        <span>{isMarathi ? 'शिल्लक मागणी:' : 'Remaining quota:'} <strong>{remainingQty} Qtl</strong></span>
                        <span style={{ color: '#059669', fontWeight: 600 }}>✓ APMC Parity Cleared</span>
                      </div>
                    </div>

                    {/* Quality Specs Grid */}
                    <div style={{ 
                      backgroundColor: '#f8fafc', 
                      border: '1px solid #f1f5f9', 
                      borderRadius: '8px', 
                      padding: '8px 12px',
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '6px',
                      fontSize: '0.74rem',
                      marginBottom: '10px'
                    }}>
                      <div>
                        <span style={{ color: '#64748b' }}>{isMarathi ? 'गुणवत्ता प्रत:' : 'Quality Grade:'} </span>
                        <strong style={{ color: '#0f172a' }}>{demand.quality_grade_required}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>{isMarathi ? 'कमाल ओलावा:' : 'Max Moisture:'} </span>
                        <strong style={{ color: '#0f172a' }}>&lt; {demand.max_moisture_percent}%</strong>
                      </div>
                      <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '4px', color: '#475569' }}>
                        <Truck size={12} color="#0284c7" />
                        <span><strong>{isMarathi ? 'हब:' : 'Hub:'}</strong> {demand.delivery_hub}</span>
                      </div>
                    </div>

                    {/* Notes if any */}
                    {demand.notes && (
                      <div style={{ fontSize: '0.71rem', color: '#64748b', fontStyle: 'italic', marginBottom: '10px', lineHeight: 1.4 }}>
                        "{demand.notes}"
                      </div>
                    )}
                  </div>

                  {/* Card Actions: 1) View Scorecard 2) Fulfill Demand */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                    
                    {/* Clickable MSAMB Credibility Index Banner */}
                    <button
                      type="button"
                      onClick={() => handleOpenScorecard(scorecard)}
                      style={{
                        backgroundColor: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background-color 0.15s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ShieldCheck size={14} color="#059669" />
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#065f46' }}>
                          {isMarathi ? 'एमएसएएमबी विश्वसनीयता:' : 'MSAMB Credibility Index:'} <strong>{scorecard?.overall_reliability_score || '99.2'}★</strong>
                        </span>
                      </div>
                      <span style={{ fontSize: '0.68rem', color: '#047857', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <span>{scorecard?.escrow_on_time_rate || '99.2'}% {isMarathi ? 'एस्क्रो' : 'Escrow'}</span>
                        <ChevronRight size={12} />
                      </span>
                    </button>

                    {/* Clickable Statutory Refraction Schedule & Calculator */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenRefraction(demand)}
                        style={{
                          backgroundColor: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          padding: '6px 8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.15s'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Scale size={13} color="#0284c7" />
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#334155' }}>
                            {isMarathi ? 'अपवर्तन कोष्टक' : 'Refraction Matrix'}
                          </span>
                        </div>
                        <ChevronRight size={11} color="#0284c7" />
                      </button>

                      {/* Truckload Optimizer Quick Launch Button */}
                      <button
                        type="button"
                        onClick={() => {
                          const matchPool = INITIAL_CONSIGNMENT_POOLS.find(p => p.commodity.toLowerCase().includes(demand.commodity.toLowerCase())) || INITIAL_CONSIGNMENT_POOLS[0];
                          setActiveTruckloadPool({
                            ...matchPool,
                            destination_mill: demand.company_name,
                            destination_hub: demand.delivery_hub,
                            commodity: demand.commodity
                          });
                          setTruckloadModalOpen(true);
                        }}
                        style={{
                          backgroundColor: '#eff6ff',
                          border: '1px solid #bfdbfe',
                          borderRadius: '6px',
                          padding: '6px 8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.15s'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Truck size={13} color="#2563eb" />
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#1d4ed8' }}>
                            {isMarathi ? 'ट्रकलोड पूल' : 'Truckload Pool'}
                          </span>
                        </div>
                        <ChevronRight size={11} color="#2563eb" />
                      </button>
                    </div>

                    {/* Primary Action Button: Strictly Role-Isolated */}
                    {isBuyer ? (
                      // If the current logged in user is a corporate buyer
                      (demand.buyer_id === currentUser?.id || 
                       demand.company_name?.toLowerCase().includes(currentUser?.name?.toLowerCase() || '') ||
                       currentUser?.name?.toLowerCase().includes(demand.company_name?.toLowerCase() || '') ||
                       demand.buyer_name?.toLowerCase().includes(currentUser?.name?.toLowerCase() || '')) ? (
                        <div style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '10px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: '#eff6ff',
                          color: '#1e40af',
                          border: '1px solid #bfdbfe'
                        }}>
                          <CheckCircle2 size={16} color="#2563eb" />
                          <span>{isMarathi ? 'तुमची सक्रिय खरेदी निविदा' : 'Your Procurement Tender'}</span>
                        </div>
                      ) : (
                        <div style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '10px',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: '#f1f5f9',
                          color: '#64748b',
                          border: '1px solid #e2e8f0'
                        }}>
                          <Building2 size={15} color="#94a3b8" />
                          <span>{isMarathi ? 'संस्थात्मक खरेदीदार निविदा' : 'Institutional Buyer Tender'}</span>
                        </div>
                      )
                    ) : (
                      // If user is a Farmer, FPO, or guest
                      <button
                        className="btn-gov-primary"
                        disabled={remainingQty <= 0}
                        onClick={() => {
                          if (!currentUser && onRequireAuth) {
                            onRequireAuth(
                              isMarathi ? 'शेतमाल पुरवठा करण्यासाठी कृपया शेतकरी किंवा FPO खात्यात लॉगिन करा.' : 'Please sign in as a Farmer or FPO to supply produce to this demand.',
                              () => handleOpenFulfillModal(demand)
                            );
                          } else {
                            handleOpenFulfillModal(demand);
                          }
                        }}
                        style={{
                          width: '100%',
                          justifyContent: 'center',
                          padding: '10px',
                          fontSize: '0.86rem',
                          fontWeight: 700,
                          backgroundColor: remainingQty <= 0 ? '#94a3b8' : '#065f46'
                        }}
                      >
                        {remainingQty <= 0 ? (
                          <span>{isMarathi ? 'मागणी पूर्ण झाली' : 'Demand 100% Fulfilled'}</span>
                        ) : (
                          <>
                            <span>{isMarathi ? 'मागणी पूर्ण करा (Fulfill Demand)' : 'Fulfill this Demand'}</span>
                            <ArrowRight size={15} />
                          </>
                        )}
                      </button>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. MODAL: Fulfill Demand & Lock Contract */}
      {fulfillModalOpen && targetDemand && (
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
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            maxWidth: '560px',
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            <div style={{
              backgroundColor: '#065f46',
              padding: '18px 22px',
              color: '#ffffff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                  {isMarathi ? 'संस्थात्मक खरेदी मागणी पूर्ण करा' : 'Commit Harvest & Fulfill Demand'}
                </h3>
                <div style={{ fontSize: '0.74rem', color: '#a7f3d0' }}>
                  {targetDemand.company_name} • {targetDemand.commodity}
                </div>
              </div>
              <button 
                onClick={() => setFulfillModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFulfillSubmit} style={{ padding: '20px 24px' }}>
              
              {fulfillSuccessMsg && (
                <div style={{
                  backgroundColor: '#ecfdf5',
                  border: '1px solid #6ee7b7',
                  color: '#065f46',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={18} color="#059669" />
                    <span>{fulfillSuccessMsg}</span>
                  </div>
                  {createdContractId && (
                    <button
                      type="button"
                      className="btn-gov-primary"
                      onClick={() => {
                        setFulfillModalOpen(false);
                        onNavigateToContracts(createdContractId);
                      }}
                      style={{ padding: '6px 12px', fontSize: '0.78rem', whiteSpace: 'nowrap' }}
                    >
                      <span>{isMarathi ? 'करार पहा →' : 'View Contract →'}</span>
                    </button>
                  )}
                </div>
              )}

              {/* Verified Buyer Credentials Highlight */}
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '12px 14px',
                marginBottom: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>
                    {isMarathi ? 'अधिकृत संस्थात्मक खरेदीदार' : 'Certified Corporate Buyer'}
                  </div>
                  <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>{targetDemand.company_name}</strong>
                  <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>
                    ✓ 99.2% Escrow Track Record • MH-PUN-TR-2024-8891
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Target Rate</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#059669' }}>
                    ₹{targetDemand.target_price_per_quintal}/qtl
                  </div>
                </div>
              </div>

              {/* Lot selector if farmer has lots */}
              {farmerLots.length > 0 && (
                <div style={{ marginBottom: '14px' }}>
                  <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                    {isMarathi ? 'तुमचा नोंदणीकृत शेतमाल लॉट निवडा:' : 'Select Your Registered Harvest Lot:'}
                  </label>
                  <select
                    className="form-input"
                    value={selectedLotId}
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      setSelectedLotId(id);
                      const lot = farmerLots.find(l => l.id === id);
                      if (lot) {
                        const rem = targetDemand.required_quantity_quintals - targetDemand.fulfilled_quantity_quintals;
                        setCommitQuantity(Math.min(lot.quantity_quintals, rem));
                      }
                    }}
                    style={{ fontSize: '0.84rem' }}
                  >
                    {farmerLots.map(l => (
                      <option key={l.id} value={l.id}>
                        Lot #{l.id} — {l.commodity} ({l.variety || 'Standard'}) • {l.quantity_quintals} Qtl Available
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Quantity input */}
              <div style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                  {isMarathi ? 'मागणीसाठी वचनबद्ध करायचे प्रमाण (क्विंटल):' : 'Quantity to Commit Against Demand (Quintals):'}
                </label>
                <input 
                  type="number"
                  min={1}
                  max={targetDemand.required_quantity_quintals - targetDemand.fulfilled_quantity_quintals}
                  value={commitQuantity}
                  onChange={(e) => setCommitQuantity(e.target.value ? Number(e.target.value) : '')}
                  required
                  className="form-input"
                  style={{ fontSize: '1rem', fontWeight: 700 }}
                  placeholder="e.g. 100"
                />
                <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '3px', display: 'block' }}>
                  {isMarathi ? 'कमाल शिल्लक मागणी:' : 'Max available quota:'} {targetDemand.required_quantity_quintals - targetDemand.fulfilled_quantity_quintals} Quintals
                </span>
              </div>

              {/* Statutory Refraction Pre-Check Option */}
              {Number(commitQuantity) > 0 && (
                <div style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: enableRefractionPreCheck ? '10px' : '0' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 700, color: '#1e293b', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={enableRefractionPreCheck}
                        onChange={(e) => setEnableRefractionPreCheck(e.target.checked)}
                        style={{ accentColor: '#065f46', width: '16px', height: '16px' }}
                      />
                      <span>{isMarathi ? 'वैधानिक गुणवत्ता अपवर्तन पूर्व-तपासणी लागू करा (APMC Rule 38)' : 'Apply Statutory Quality Refraction Pre-Check (APMC Rule 38)'}</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => handleOpenRefraction(targetDemand)}
                      style={{
                        backgroundColor: '#eff6ff',
                        color: '#1e40af',
                        border: '1px solid #bfdbfe',
                        borderRadius: '6px',
                        padding: '3px 8px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Scale size={12} />
                      <span>{isMarathi ? 'सविस्तर कोष्टक' : 'Full Schedule'}</span>
                    </button>
                  </div>

                  {enableRefractionPreCheck && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #cbd5e1' }}>
                      <div>
                        <label style={{ fontSize: '0.72rem', color: '#475569', display: 'block', marginBottom: '2px' }}>
                          {isMarathi ? 'चाचणी आर्द्रता (Moisture %):' : 'Assayed Moisture (%):'}
                        </label>
                        <input
                          type="number"
                          step={0.1}
                          min={8}
                          max={18}
                          value={preCheckMoisture}
                          onChange={(e) => setPreCheckMoisture(Number(e.target.value))}
                          className="form-input"
                          style={{ height: '30px', fontSize: '0.78rem' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.72rem', color: '#475569', display: 'block', marginBottom: '2px' }}>
                          {isMarathi ? 'कचरा/माती (Foreign Matter %):' : 'Foreign Matter (%):'}
                        </label>
                        <input
                          type="number"
                          step={0.1}
                          min={0}
                          max={5}
                          value={preCheckForeignMatter}
                          onChange={(e) => setPreCheckForeignMatter(Number(e.target.value))}
                          className="form-input"
                          style={{ height: '30px', fontSize: '0.78rem' }}
                        />
                      </div>

                      {/* Live Refraction Math Preview */}
                      {(() => {
                        const ref = calculateQualityRefraction(
                          {
                            gross_weight_quintals: Number(commitQuantity),
                            base_price_per_quintal: targetDemand.target_price_per_quintal,
                            tested_moisture_pct: preCheckMoisture,
                            tested_foreign_matter_pct: preCheckForeignMatter,
                            tested_damaged_pct: preCheckDamaged
                          },
                          targetDemand.refraction_schedule || getCommodityRefractionSchedule(targetDemand.commodity)
                        );
                        return (
                          <div style={{ gridColumn: 'span 2', backgroundColor: '#ffffff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.72rem', color: '#334155' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                              <span>{isMarathi ? 'निव्वळ देय वजन:' : 'Net Payable Weight:'} <strong>{ref.net_weight_quintals.toFixed(2)} Qtl</strong> (कपात: -{ref.foreign_matter_deduction_quintals} Qtl)</span>
                              <span style={{ color: ref.total_price_deduction_per_quintal > 0 ? '#dc2626' : '#059669', fontWeight: 700 }}>
                                ₹{ref.net_price_per_quintal}/qtl (कपात: -₹{ref.total_price_deduction_per_quintal})
                              </span>
                            </div>
                            <div style={{ color: '#065f46', fontWeight: 700, fontSize: '0.78rem', marginTop: '4px' }}>
                              {isMarathi ? 'अंतिम देयक रक्कम:' : 'Adjusted Final Payout:'} ₹{ref.net_total_amount.toLocaleString()}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}

              {/* Calculation Preview Box */}
              {Number(commitQuantity) > 0 && (
                <div style={{
                  backgroundColor: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  marginBottom: '16px'
                }}>
                  {(() => {
                    const ref = enableRefractionPreCheck 
                      ? calculateQualityRefraction(
                          {
                            gross_weight_quintals: Number(commitQuantity),
                            base_price_per_quintal: targetDemand.target_price_per_quintal,
                            tested_moisture_pct: preCheckMoisture,
                            tested_foreign_matter_pct: preCheckForeignMatter,
                            tested_damaged_pct: preCheckDamaged
                          },
                          targetDemand.refraction_schedule || getCommodityRefractionSchedule(targetDemand.commodity)
                        )
                      : null;

                    const effectiveTotal = ref ? ref.net_total_amount : Math.round(Number(commitQuantity) * targetDemand.target_price_per_quintal);
                    const effectiveAdvance = Math.round(effectiveTotal * 0.5);
                    const effectiveBalance = effectiveTotal - effectiveAdvance;

                    return (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                          <span style={{ color: '#065f46' }}>{isMarathi ? 'एकूण देय करार मूल्य:' : 'Total Deal Value:'}</span>
                          <strong style={{ color: '#065f46', fontSize: '0.98rem' }}>
                            ₹{effectiveTotal.toLocaleString()}
                            {ref && (
                              <span style={{ fontSize: '0.7rem', color: '#047857', fontWeight: 500, marginLeft: '6px' }}>
                                (Refraction Adjusted)
                              </span>
                            )}
                          </strong>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: '#047857', borderTop: '1px solid #a7f3d0', paddingTop: '6px' }}>
                          <span>{isMarathi ? '५०% एस्क्रो अग्रीम (रवानगीपूर्वी सुरक्षित):' : '50% Advance (Locked in Escrow):'}</span>
                          <strong>₹{effectiveAdvance.toLocaleString()}</strong>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: '#047857', marginTop: '4px' }}>
                          <span>{isMarathi ? '५०% उर्वरित रक्कम (गेट तपासणीनंतर):' : '50% Balance (On Gate Weighment):'}</span>
                          <strong>₹{effectiveBalance.toLocaleString()}</strong>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {/* Terms Checkbox */}
              <div style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.4, marginBottom: '18px' }}>
                {isMarathi
                  ? 'मी पुष्टी करतो की शेतमाल विहित गुणवत्ता (Grade A) व ओलावा निकषांनुसार आहे. हा करार महाराष्ट्र एपीएमसी कायदा १९६३ अंतर्गत कायदेशीररित्या बंधनकारक आहे.'
                  : 'I confirm the produce meets the stipulated quality (Grade A) and moisture standards. This transaction is governed under the Maharashtra APMC Act, 1963.'
                }
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button 
                  type="button" 
                  className="btn-gov-secondary"
                  onClick={() => setFulfillModalOpen(false)}
                  style={{ fontSize: '0.84rem' }}
                >
                  {isMarathi ? 'रद्द करा' : 'Cancel'}
                </button>

                <button 
                  type="submit" 
                  className="btn-gov-primary"
                  disabled={isFulfilling || !Number(commitQuantity)}
                  style={{ fontSize: '0.84rem', padding: '10px 20px' }}
                >
                  {isFulfilling ? 'Initializing Contract...' : (isMarathi ? 'करार व एस्क्रो लॉक करा' : 'Confirm & Generate Contract')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL: Post Procurement Demand (For Institutional Buyers) */}
      {postDemandModalOpen && (
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
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            maxWidth: '580px',
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            <div style={{
              backgroundColor: '#065f46',
              padding: '18px 22px',
              color: '#ffffff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                  {isMarathi ? 'नवीन संस्थात्मक खरेदी मागणी प्रकाशित करा' : 'Post Institutional Procurement Demand (Reverse RFQ)'}
                </h3>
                <div style={{ fontSize: '0.74rem', color: '#a7f3d0' }}>
                  {currentUser?.name} • {currentUser?.district} Hub
                </div>
              </div>
              <button 
                onClick={() => setPostDemandModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePostDemandSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">{isMarathi ? 'शेतमाल:' : 'Commodity:'}</label>
                  <select
                    className="form-input"
                    value={newCommodity}
                    onChange={(e) => setNewCommodity(e.target.value)}
                  >
                    <option value="Soybean">Soybean (सोयाबीन)</option>
                    <option value="Cotton">Cotton (कापूस)</option>
                    <option value="Onion">Onion (कांदा)</option>
                    <option value="Wheat">Wheat (गहू)</option>
                    <option value="Gram">Gram / Chana (चना)</option>
                    <option value="Tomato">Tomato (टोमॅटो)</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">{isMarathi ? 'प्रकार / जात:' : 'Variety / Spec:'}</label>
                  <input 
                    type="text"
                    value={newVariety}
                    onChange={(e) => setNewVariety(e.target.value)}
                    className="form-input"
                    placeholder="e.g. JS-335 Solvent Grade"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">{isMarathi ? 'आवश्यक प्रमाण (क्विंटल):' : 'Required Volume (Qtl):'}</label>
                  <input 
                    type="number"
                    value={newVolume}
                    onChange={(e) => setNewVolume(e.target.value ? Number(e.target.value) : '')}
                    className="form-input"
                    min={10}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">{isMarathi ? 'खरेदी दर (₹/क्विंटल):' : 'Target Offer Rate (₹/Qtl):'}</label>
                  <input 
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value ? Number(e.target.value) : '')}
                    className="form-input"
                    min={500}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">{isMarathi ? 'गुणवत्ता प्रत:' : 'Quality Grade:'}</label>
                  <select
                    className="form-input"
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value)}
                  >
                    <option value="Grade A+">Grade A+ (Export / Top Quality)</option>
                    <option value="Grade A">Grade A (Standard Commercial)</option>
                    <option value="Grade B">Grade B (Fair Average Quality)</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">{isMarathi ? 'कमाल ओलावा %:' : 'Max Moisture %:'}</label>
                  <input 
                    type="number"
                    step="0.1"
                    value={newMoisture}
                    onChange={(e) => setNewMoisture(e.target.value ? Number(e.target.value) : '')}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label">{isMarathi ? 'वितरण हब / प्रक्रिया युनिट:' : 'Delivery Processing Hub:'}</label>
                <input 
                  type="text"
                  value={newHub}
                  onChange={(e) => setNewHub(e.target.value)}
                  className="form-input"
                  placeholder="e.g. Nagpur MIDC Crushing Unit, Hingna"
                  required
                />
              </div>

              <div>
                <label className="form-label">{isMarathi ? 'वितरण अंतिम मुदत:' : 'Delivery Deadline:'}</label>
                <input 
                  type="text"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="form-input"
                  placeholder="e.g. Sep 30, 2026"
                  required
                />
              </div>

              <div>
                <label className="form-label">{isMarathi ? 'विशेष सूचना व तपशील:' : 'Procurement Notes & Specifications:'}</label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="form-input"
                  rows={2}
                  placeholder="e.g. Immediate requirement. 50% escrow advance pre-funded. Gate electronic weighment within 90 minutes."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  className="btn-gov-secondary"
                  onClick={() => setPostDemandModalOpen(false)}
                >
                  {isMarathi ? 'रद्द करा' : 'Cancel'}
                </button>

                <button 
                  type="submit" 
                  className="btn-gov-primary"
                  disabled={isPostingDemand}
                  style={{ padding: '10px 20px' }}
                >
                  {isPostingDemand ? 'Publishing...' : (isMarathi ? 'मागणी प्रकाशित करा' : 'Publish Procurement Notice')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: MSAMB Buyer Credibility Index Scorecard */}
      <BuyerScorecardModal
        isOpen={scorecardModalOpen}
        onClose={() => setScorecardModalOpen(false)}
        scorecard={activeScorecard}
        lang={lang}
      />

      {/* 7. MODAL: Statutory Quality Refraction Calculator & Weighbridge Slip */}
      {targetRefractionDemand && (
        <QualityRefractionModal
          isOpen={refractionModalOpen}
          onClose={() => setRefractionModalOpen(false)}
          commodity={targetRefractionDemand.commodity}
          basePricePerQuintal={targetRefractionDemand.target_price_per_quintal}
          initialQuantityQuintals={targetRefractionDemand.required_quantity_quintals - targetRefractionDemand.fulfilled_quantity_quintals || 100}
          customSchedule={targetRefractionDemand.refraction_schedule}
          companyName={targetRefractionDemand.company_name}
          onApplyRefraction={(res) => {
            setPreCheckMoisture(res.params.tested_moisture_pct);
            setPreCheckForeignMatter(res.params.tested_foreign_matter_pct);
            setPreCheckDamaged(res.params.tested_damaged_pct);
            setEnableRefractionPreCheck(true);
            if (targetDemand && targetDemand.id === targetRefractionDemand.id) {
              setCommitQuantity(res.params.gross_weight_quintals);
            }
          }}
          lang={lang}
        />
      )}

      {/* 8. MODAL: Phase 3 Multi-Lot Consignment & Truckload Optimizer */}
      <TruckloadOptimizerModal
        isOpen={truckloadModalOpen}
        onClose={() => setTruckloadModalOpen(false)}
        initialPool={activeTruckloadPool}
        commodity={activeTruckloadPool?.commodity || 'Soybean'}
        destinationHub={activeTruckloadPool?.destination_hub || 'Nagpur Hingna Industrial Area'}
        lang={lang}
      />

      {/* 9. MODAL: Phase 4 Digital e-Gate Pass */}
      <DigitalGatePassModal
        isOpen={gatePassModalOpen}
        onClose={() => setGatePassModalOpen(false)}
        gatePass={activeGatePass}
        lang={lang}
      />

      {/* 10. MODAL: Phase 5 Pre-Harvest Forward Contracts & Form C */}
      <PreHarvestForwardContractModal
        isOpen={forwardModalOpen}
        onClose={() => setForwardModalOpen(false)}
        offer={activeForwardOffer}
        currentUser={currentUser}
        lang={lang}
      />

      {/* 11. MODAL: AI Optical Grain Quality Assay Lab */}
      <AIQualityAssayModal
        isOpen={isAssayModalOpen}
        onClose={() => setIsAssayModalOpen(false)}
        initialCommodity="Soybean"
        contextMode="INSPECTION"
      />

    </div>
  );
};
