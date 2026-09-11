import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Truck, 
  CheckCircle2, 
  TrendingUp, 
  Fuel, 
  MapPin, 
  ShieldCheck, 
  Printer, 
  X, 
  Users, 
  Scale, 
  FileText
} from 'lucide-react';
import type { ConsignmentPool, VehicleOption, PooledLotItem } from '../types';
import { 
  STANDARD_COMMERCIAL_VEHICLES, 
  calculateConsignmentFreight, 
  INITIAL_CONSIGNMENT_POOLS 
} from '../utils/logisticsOptimizer';
import { type Language } from '../utils/i18n';

interface TruckloadOptimizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  demandId?: number;
  initialPool?: ConsignmentPool;
  destinationHub?: string;
  commodity?: string;
  lang: Language;
}

export const TruckloadOptimizerModal: React.FC<TruckloadOptimizerModalProps> = ({
  isOpen,
  onClose,
  initialPool,
  commodity = 'Soybean',
  lang
}) => {
  const isMr = lang === 'MR';
  
  // Selected pool or active working pool
  const activePool = initialPool || INITIAL_CONSIGNMENT_POOLS[0];

  const [selectedVehicle, setSelectedVehicle] = useState<VehicleOption>(activePool.vehicle);
  const [distanceKm, setDistanceKm] = useState<number>(activePool.total_distance_km || 140);
  const [lots, setLots] = useState<PooledLotItem[]>(activePool.lots);
  
  // Form for adding a new farmer lot to pool
  const [showAddLotForm, setShowAddLotForm] = useState(false);
  const [newFarmerName, setNewFarmerName] = useState('');
  const [newVillage, setNewVillage] = useState('');
  const [newQuantity, setNewQuantity] = useState<number>(40);

  const [activeTab, setActiveTab] = useState<'OPTIMIZER' | 'WAYBILL_SLIP'>('OPTIMIZER');

  // Recalculate freight whenever lots, vehicle, or distance changes
  const freightCalc = calculateConsignmentFreight(
    lots.map(({ freight_share_inr, individual_freight_inr, freight_savings_inr, ...rest }) => rest),
    selectedVehicle,
    distanceKm
  );

  // Close on escape key and manage print body class
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.classList.add('has-print-modal');

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('has-print-modal');
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAddLot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFarmerName || newQuantity <= 0) return;

    const newLot: PooledLotItem = {
      id: `lot-dyn-${Date.now()}`,
      farmer_id: Math.floor(10 + Math.random() * 90),
      farmer_name: newFarmerName,
      farmer_phone: '+91 98231 99012',
      village: newVillage || 'Local Cluster APMC',
      district: 'Wardha',
      commodity: commodity,
      variety: 'Standard FAQ',
      quantity_quintals: Number(newQuantity),
      pickup_order: lots.length + 1,
      pickup_status: 'QUEUED',
      freight_share_inr: 0,
      individual_freight_inr: 0,
      freight_savings_inr: 0
    };

    setLots([...lots, newLot]);
    setNewFarmerName('');
    setNewVillage('');
    setNewQuantity(40);
    setShowAddLotForm(false);
  };

  const handleRemoveLot = (lotId: string | number) => {
    setLots(lots.filter(l => l.id !== lotId));
  };

  const handlePrint = () => {
    window.print();
  };

  const modalContent = (
    <div 
      className="refraction-print-modal"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '16px',
        overflowY: 'auto'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="refraction-print-card"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '920px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}
      >
        {/* Modal Header */}
        <div style={{
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #334155'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <Truck size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
                  {isMr ? 'मल्टी-लॉट शेतमाल वाहतूक व ट्रकलोड ऑप्टिमायझर' : 'Multi-Lot Consignment & Truckload Logistics Optimizer'}
                </h3>
                <span style={{
                  backgroundColor: '#1e293b',
                  color: '#60a5fa',
                  border: '1px solid #3b82f6',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}>
                  PHASE 3 LOGISTICS
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
                {isMr 
                  ? 'अनेक शेतकऱ्यांच्या छोट्या लॉट्सचे एकत्रित करून ४०% पर्यंत वाहतूक खर्च व डिझेल बचत करा' 
                  : 'Aggregate smallholder harvest lots into consolidated commercial truckloads to slash freight by up to 40%'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="no-print">
            <button
              onClick={() => setActiveTab(activeTab === 'OPTIMIZER' ? 'WAYBILL_SLIP' : 'OPTIMIZER')}
              style={{
                backgroundColor: activeTab === 'WAYBILL_SLIP' ? '#2563eb' : '#334155',
                color: '#ffffff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <FileText size={14} />
              <span>{activeTab === 'WAYBILL_SLIP' ? (isMr ? 'ऑप्टिमायझर कडे जा' : 'Back to Optimizer') : (isMr ? 'लॉजिस्टिक्स बिल्टी पहा' : 'View Waybill Slip')}</span>
            </button>

            <button
              onClick={handlePrint}
              style={{
                backgroundColor: '#059669',
                color: '#ffffff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Printer size={14} />
              <span>{isMr ? 'प्रिंट बिल्टी' : 'Print Waybill'}</span>
            </button>

            <button
              onClick={onClose}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {activeTab === 'OPTIMIZER' ? (
            <div>
              {/* Savings & ESG Metric Banner */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '12px',
                marginBottom: '20px'
              }}>
                <div style={{
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <TrendingUp size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>
                      {isMr ? 'एकूण लॉजिस्टिक्स बचत' : 'Total Freight Savings'}
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#14532d' }}>
                      ₹{freightCalc.totalSavingsInr.toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#15803d' }}>
                      {isMr ? 'वैयक्तिक वाहतुकीच्या तुलनेत' : 'vs standalone individual dispatch'}
                    </div>
                  </div>
                </div>

                <div style={{
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Scale size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#1e40af', fontWeight: 700, textTransform: 'uppercase' }}>
                      {isMr ? 'एकत्रित दर / क्विंटल' : 'Pooled Rate / Quintal'}
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1e3a8a' }}>
                      ₹{freightCalc.pooledRatePerQtl} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748b' }}>/ Qtl</span>
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#3b82f6' }}>
                      {isMr ? `₹${freightCalc.avgIndividualRatePerQtl} ऐवजी` : `vs standard ₹${freightCalc.avgIndividualRatePerQtl}/Qtl`}
                    </div>
                  </div>
                </div>

                <div style={{
                  backgroundColor: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Fuel size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#065f46', fontWeight: 700, textTransform: 'uppercase' }}>
                      {isMr ? 'डिझेल बचत' : 'Diesel Conserved'}
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#064e3b' }}>
                      {freightCalc.dieselSavedLiters} L
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#047857' }}>
                      {freightCalc.carbonEmissionReducedKg} kg CO₂ {isMr ? 'कमी प्रदूषण' : 'offset'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Truck Load Visualizer Bed */}
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Truck size={18} color="#2563eb" />
                    <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>
                      {isMr ? selectedVehicle.name_mr : selectedVehicle.name_en}
                    </span>
                    <span style={{
                      backgroundColor: '#e0e7ff',
                      color: '#4338ca',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: '4px'
                    }}>
                      {selectedVehicle.wheels} • {selectedVehicle.capacity_quintals} Qtl ({selectedVehicle.capacity_tonnes}T)
                    </span>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      fontWeight: 900,
                      fontSize: '0.92rem',
                      color: freightCalc.utilizationPct >= 85 ? '#059669' : freightCalc.utilizationPct >= 60 ? '#d97706' : '#dc2626'
                    }}>
                      {freightCalc.totalLoadedQuintals} / {selectedVehicle.capacity_quintals} Qtl ({freightCalc.utilizationPct}% {isMr ? 'भरले' : 'Filled'})
                    </span>
                  </div>
                </div>

                {/* Dynamic Truck Visual Meter */}
                <div style={{
                  height: '24px',
                  backgroundColor: '#e2e8f0',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  position: 'relative',
                  display: 'flex',
                  border: '1px solid #cbd5e1'
                }}>
                  <div style={{
                    width: `${freightCalc.utilizationPct}%`,
                    backgroundColor: freightCalc.utilizationPct >= 85 ? '#10b981' : freightCalc.utilizationPct >= 60 ? '#3b82f6' : '#f59e0b',
                    transition: 'width 0.4s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingRight: '8px',
                    color: '#ffffff',
                    fontSize: '0.72rem',
                    fontWeight: 800
                  }}>
                    {freightCalc.utilizationPct > 15 ? `${freightCalc.utilizationPct}%` : ''}
                  </div>
                </div>

                {/* Vehicle Selection Carousel */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
                  gap: '8px',
                  marginTop: '12px'
                }}>
                  {STANDARD_COMMERCIAL_VEHICLES.map((v) => {
                    const isSelected = selectedVehicle.type === v.type;
                    return (
                      <button
                        key={v.type}
                        type="button"
                        onClick={() => setSelectedVehicle(v)}
                        style={{
                          textAlign: 'left',
                          backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                          border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '8px 10px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.76rem', fontWeight: 800, color: isSelected ? '#1e40af' : '#1e293b' }}>
                            {v.capacity_quintals} Qtl ({v.wheels})
                          </span>
                          {isSelected && <CheckCircle2 size={14} color="#2563eb" />}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                          {isMr ? v.name_mr.split('(')[0] : v.name_en.split('(')[0]}
                        </div>
                        <div style={{ fontSize: '0.66rem', color: '#059669', fontWeight: 700 }}>
                          ₹{v.base_rate_per_km}/km • {v.carrier_partner.split(' ')[0]}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Destination & Distance Input */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '12px 16px',
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={18} color="#dc2626" />
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>
                      {isMr ? 'गंतव्य प्रक्रिया केंद्र / मिल' : 'Destination Processing Mill'}
                    </div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a' }}>
                      {activePool.destination_mill}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>
                    {isMr ? 'एकूण अंतर:' : 'Trip Distance:'}
                  </span>
                  <input
                    type="number"
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(Math.max(10, Number(e.target.value)))}
                    style={{
                      width: '70px',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.84rem',
                      fontWeight: 700
                    }}
                  />
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>km</span>
                </div>
              </div>

              {/* Pooled Lots List */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={16} color="#2563eb" />
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      {isMr ? 'एकत्रित केलेले शेतकरी लॉट्स' : 'Aggregated Farmer Consignment Lots'} ({lots.length})
                    </h4>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAddLotForm(!showAddLotForm)}
                    style={{
                      backgroundColor: '#eff6ff',
                      color: '#2563eb',
                      border: '1px solid #bfdbfe',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {showAddLotForm ? (isMr ? 'रद्द करा' : 'Cancel') : (isMr ? '+ शेतकरी लॉट जोडा' : '+ Pool Another Lot')}
                  </button>
                </div>

                {/* Add Lot Inline Form */}
                {showAddLotForm && (
                  <form onSubmit={handleAddLot} style={{
                    backgroundColor: '#f8fafc',
                    border: '1px dashed #3b82f6',
                    borderRadius: '10px',
                    padding: '12px',
                    marginBottom: '12px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr)) 80px',
                    gap: '8px',
                    alignItems: 'flex-end'
                  }}>
                    <div>
                      <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569' }}>
                        {isMr ? 'शेतकऱ्याचे नाव' : 'Farmer / FPO'}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Patil"
                        value={newFarmerName}
                        onChange={(e) => setNewFarmerName(e.target.value)}
                        style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569' }}>
                        {isMr ? 'गाव / तालुका' : 'Village / Hub'}
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Deoli, Wardha"
                        value={newVillage}
                        onChange={(e) => setNewVillage(e.target.value)}
                        style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569' }}>
                        {isMr ? 'वजन (क्विंटल)' : 'Qty (Quintals)'}
                      </label>
                      <input
                        type="number"
                        required
                        min="5"
                        max="200"
                        value={newQuantity}
                        onChange={(e) => setNewQuantity(Number(e.target.value))}
                        style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                      />
                    </div>

                    <button
                      type="submit"
                      style={{
                        backgroundColor: '#2563eb',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '7px 12px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {isMr ? 'जोडा' : 'Add'}
                    </button>
                  </form>
                )}

                {/* Table of Lots */}
                <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1', textAlign: 'left', color: '#475569' }}>
                        <th style={{ padding: '8px 12px' }}>#</th>
                        <th style={{ padding: '8px 12px' }}>{isMr ? 'शेतकरी / गाव' : 'Farmer / Village'}</th>
                        <th style={{ padding: '8px 12px' }}>{isMr ? 'शेतमाल' : 'Commodity'}</th>
                        <th style={{ padding: '8px 12px' }}>{isMr ? 'वजन' : 'Quantity'}</th>
                        <th style={{ padding: '8px 12px' }}>{isMr ? 'एकत्रित भाडे' : 'Pooled Freight'}</th>
                        <th style={{ padding: '8px 12px' }}>{isMr ? 'शेतकरी बचत' : 'Net Savings'}</th>
                        <th style={{ padding: '8px 12px' }} className="no-print"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {freightCalc.enrichedLots.map((lot, idx) => (
                        <tr key={lot.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 700 }}>{idx + 1}</td>
                          <td style={{ padding: '8px 12px' }}>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{lot.farmer_name}</div>
                            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{lot.village} ({lot.district})</div>
                          </td>
                          <td style={{ padding: '8px 12px' }}>
                            <span style={{ backgroundColor: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>
                              {lot.commodity} • {lot.variety}
                            </span>
                          </td>
                          <td style={{ padding: '8px 12px', fontWeight: 800, color: '#1e293b' }}>
                            {lot.quantity_quintals} Qtl
                          </td>
                          <td style={{ padding: '8px 12px', fontWeight: 700, color: '#2563eb' }}>
                            ₹{lot.freight_share_inr.toLocaleString('en-IN')}
                            <div style={{ fontSize: '0.66rem', color: '#64748b' }}>
                              (@ ₹{freightCalc.pooledRatePerQtl}/Qtl)
                            </div>
                          </td>
                          <td style={{ padding: '8px 12px', fontWeight: 800, color: '#059669' }}>
                            +₹{lot.freight_savings_inr.toLocaleString('en-IN')}
                          </td>
                          <td style={{ padding: '8px 12px' }} className="no-print">
                            {lots.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveLot(lot.id)}
                                style={{ backgroundColor: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '0.72rem' }}
                              >
                                ✕
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Carrier Details Footer */}
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={20} color="#059669" />
                  <div>
                    <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#0f172a' }}>
                      {selectedVehicle.carrier_partner}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                      {isMr ? 'अधिकृत MSAMB कृषी-वाहतूकदार' : 'MSAMB Authorized Agri-Logistics Carrier'} • Truck: {activePool.vehicle_number}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setActiveTab('WAYBILL_SLIP')}
                    style={{
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <FileText size={15} />
                    <span>{isMr ? 'लॉजिस्टिक्स बिल्टी व वे बिल जनरेट करा' : 'Generate Consignment Waybill'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Printable Consignment Waybill & Transport Bilty */
            <div style={{
              backgroundColor: '#ffffff',
              border: '2px solid #0f172a',
              borderRadius: '8px',
              padding: '24px',
              fontFamily: 'serif',
              color: '#0f172a'
            }}>
              {/* Waybill Header */}
              <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '12px', marginBottom: '16px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#475569' }}>
                  MAHARASHTRA STATE AGRICULTURAL MARKETING BOARD (MSAMB)
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, margin: '4px 0', textTransform: 'uppercase' }}>
                  CONSOLIDATED AGRI-FREIGHT WAYBILL & BILTY
                </h2>
                <div style={{ fontSize: '0.78rem', color: '#334155' }}>
                  (Under Central Motor Vehicles Rules & APMC Multi-Lot Direct Procurement Framework)
                </div>
              </div>

              {/* Waybill Metadata Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px', fontSize: '0.82rem' }}>
                <div>
                  <div><strong>Waybill / Pool Code:</strong> {activePool.pool_code}</div>
                  <div><strong>Transport Carrier:</strong> {selectedVehicle.carrier_partner}</div>
                  <div><strong>Vehicle No:</strong> {activePool.vehicle_number} ({selectedVehicle.wheels})</div>
                  <div><strong>Driver:</strong> {activePool.driver_name} ({activePool.driver_phone})</div>
                </div>
                <div>
                  <div><strong>Destination Hub:</strong> {activePool.destination_hub}</div>
                  <div><strong>Consignee Mill:</strong> {activePool.destination_mill}</div>
                  <div><strong>Security Seal No:</strong> {activePool.security_seal_number}</div>
                  <div><strong>Dispatch ETA:</strong> {activePool.dispatch_eta}</div>
                </div>
              </div>

              {/* Waybill Lots Breakdown */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', marginBottom: '16px', border: '1px solid #0f172a' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #0f172a' }}>
                    <th style={{ padding: '6px', border: '1px solid #0f172a' }}>Stop #</th>
                    <th style={{ padding: '6px', border: '1px solid #0f172a' }}>Farmer Consignor</th>
                    <th style={{ padding: '6px', border: '1px solid #0f172a' }}>Village / District</th>
                    <th style={{ padding: '6px', border: '1px solid #0f172a' }}>Commodity</th>
                    <th style={{ padding: '6px', border: '1px solid #0f172a' }}>Weight (Qtl)</th>
                    <th style={{ padding: '6px', border: '1px solid #0f172a' }}>Freight Share (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {freightCalc.enrichedLots.map((lot, idx) => (
                    <tr key={lot.id}>
                      <td style={{ padding: '6px', textAlign: 'center', border: '1px solid #0f172a' }}>{idx + 1}</td>
                      <td style={{ padding: '6px', border: '1px solid #0f172a' }}><strong>{lot.farmer_name}</strong></td>
                      <td style={{ padding: '6px', border: '1px solid #0f172a' }}>{lot.village}, {lot.district}</td>
                      <td style={{ padding: '6px', border: '1px solid #0f172a' }}>{lot.commodity} ({lot.variety})</td>
                      <td style={{ padding: '6px', textAlign: 'right', border: '1px solid #0f172a' }}>{lot.quantity_quintals} Qtl</td>
                      <td style={{ padding: '6px', textAlign: 'right', border: '1px solid #0f172a' }}>₹{lot.freight_share_inr.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                  <tr style={{ fontWeight: 800, backgroundColor: '#f8fafc' }}>
                    <td colSpan={4} style={{ padding: '8px', textAlign: 'right', border: '1px solid #0f172a' }}>TOTAL CARGO WEIGHT & FREIGHT:</td>
                    <td style={{ padding: '8px', textAlign: 'right', border: '1px solid #0f172a' }}>{freightCalc.totalLoadedQuintals} Qtl</td>
                    <td style={{ padding: '8px', textAlign: 'right', border: '1px solid #0f172a' }}>₹{freightCalc.totalFreightInr.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>

              {/* Statutory Signatures */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginTop: '30px', textAlign: 'center', fontSize: '0.75rem' }}>
                <div>
                  <div style={{ borderBottom: '1px dashed #0f172a', height: '40px', marginBottom: '6px' }}></div>
                  <div>FPO Logistics Coordinator</div>
                </div>
                <div>
                  <div style={{ borderBottom: '1px dashed #0f172a', height: '40px', marginBottom: '6px' }}></div>
                  <div>Assigned Carrier Driver</div>
                </div>
                <div>
                  <div style={{ borderBottom: '1px dashed #0f172a', height: '40px', marginBottom: '6px' }}></div>
                  <div>Mill Gate Receiver & Weighbridge</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
