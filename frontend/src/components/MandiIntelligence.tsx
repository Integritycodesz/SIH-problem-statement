import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, MapPin, Search, 
  Truck, ArrowRight, ShieldCheck, Share2, 
  MessageSquare, Lock, Calendar, Award
} from 'lucide-react';
import { subscribeToCommodityPrices } from '../services/supabase';

export const MandiIntelligence: React.FC = () => {
  const [activeCrop, setActiveCrop] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const channel = subscribeToCommodityPrices((payload) => {
      console.log('[Supabase Realtime] Price update received in MandiIntelligence:', payload);
    });
    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, []);
  
  // Transport Calculator State
  const [harvestQty, setHarvestQty] = useState<number>(50);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('6-Wheeler (50 Qtl)');
  const [destinationMandi, setDestinationMandi] = useState<string>('Lasalgaon APMC (₹2,450/qtl • ~45 km haul)');
  const [alertPhone, setAlertPhone] = useState<string>('+91 98765 43210');
  const [alertSet, setAlertSet] = useState<boolean>(false);

  // Dynamic calculation for Net-in-Hand
  const ratePerQtl = destinationMandi.includes('2,700') ? 2700 : destinationMandi.includes('4,820') ? 4820 : 2450;
  const grossRealization = harvestQty * ratePerQtl;
  const freightDeduction = selectedVehicle.includes('25') ? 2200 : selectedVehicle.includes('100') ? 5800 : 3500;
  const mandiHandling = Math.round(grossRealization * 0.018);
  const netInHand = grossRealization - freightDeduction - mandiHandling;

  const tableRows = [
    {
      mandi: 'Lasalgaon',
      mandiSub: 'Nashik • 28,400 qtl arrival',
      crop: 'Onion (कांदा)',
      grade: 'Grade-A Garwa',
      dotColor: '#ef4444',
      modal: '₹2,450',
      range: 'Range: ₹1,600-₹2,620',
      shift: '+3.2%',
      shiftPositive: true
    },
    {
      mandi: 'Vashi APMC',
      mandiSub: 'Navi Mumbai • Terminal Yard',
      crop: 'Onion (कांदा)',
      grade: 'Export Quality',
      dotColor: '#ef4444',
      modal: '₹2,700',
      range: 'Range: ₹2,200-₹2,850',
      shift: '+2.8%',
      shiftPositive: true
    },
    {
      mandi: 'Pune Gultekdi',
      mandiSub: 'Pune Central • High Volume',
      crop: 'Soybean (सोयाबीन)',
      grade: 'Yellow Regular (10% Moist)',
      dotColor: '#eab308',
      modal: '₹4,820',
      range: 'MSP Ref: ₹4,892',
      shift: '0.0%',
      shiftNeutral: true
    },
    {
      mandi: 'Pimpalgaon',
      mandiSub: "Nashik • Asia's Tomato Hub",
      crop: 'Tomato (टोमॅटो)',
      grade: 'Hybrid Red Fresh',
      dotColor: '#ef4444',
      modal: '₹1,850',
      range: 'Range: ₹1,500-₹2,100',
      shift: '+4.5%',
      shiftPositive: true
    },
    {
      mandi: 'Solapur Main',
      mandiSub: 'Solapur • Southern Gateway',
      crop: 'Onion (कांदा)',
      grade: 'Medium Golta Red',
      dotColor: '#ef4444',
      modal: '₹2,310',
      range: 'Range: ₹1,700-₹2,420',
      shift: '-1.1%',
      shiftNegative: true
    }
  ];

  const filteredRows = tableRows.filter(r => {
    const matchesCrop = activeCrop === 'All' || r.crop.toLowerCase().includes(activeCrop.toLowerCase());
    const matchesSearch = r.mandi.toLowerCase().includes(searchQuery.toLowerCase()) || r.crop.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCrop && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingTop: '16px' }}>
      {/* 1. Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#059669' }}>
              Live Benchmark Feed • Updated 8 mins ago
            </span>
          </div>
          <h2 style={{ fontSize: '1.6rem', color: '#0f172a' }}>Mandi Price Intelligence</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Real-time modal rates, arrival telemetry, and net realization across 585 APMC yards
          </p>
        </div>

        <div style={{ 
          backgroundColor: '#ffffff', 
          border: '1px solid var(--border-card)', 
          borderRadius: 'var(--radius-sm)', 
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <MapPin size={16} color="#059669" />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Active Regional Hub
            </div>
            <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>
              Nashik Rural Agro-Cluster
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top 3 Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        {/* Card 1 */}
        <div className="gov-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Avg Farmgate Premium
            </span>
            <span style={{ backgroundColor: '#ecfdf5', color: '#059669', padding: '3px 6px', borderRadius: 'var(--radius-xs)', display: 'flex', alignItems: 'center' }}>
              <TrendingUp size={14} />
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-display)' }}>
              +11.2%
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669' }}>
              vs MSP Base
            </span>
          </div>

          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Realized surplus over unorganized village middlemen quotes
          </p>

          <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600, borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
            7-Day trendline: <strong>+₹190/qtl avg</strong>
          </div>
        </div>

        {/* Card 2 */}
        <div className="gov-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Reporting Mandis
            </span>
            <Calendar size={16} color="#0284c7" />
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-display)' }}>
              585
            </span>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b' }}>
              APMCs Online
            </span>
          </div>

          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Synchronized with electronic weighbridges and e-NAM ledger
          </p>

          <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600, borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
            ● 100% telemetry operational in Maharashtra
          </div>
        </div>

        {/* Card 3 */}
        <div className="gov-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Today's Top Gainer
            </span>
            <Award size={16} color="#d97706" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
              Lasalgaon Onion
            </span>
            <span style={{ 
              backgroundColor: '#ecfdf5', 
              color: '#059669', 
              fontSize: '0.75rem', 
              fontWeight: 700, 
              padding: '2px 8px', 
              borderRadius: 'var(--radius-full)' 
            }}>
              +3.2%
            </span>
          </div>

          <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#059669', marginBottom: '4px' }}>
            ₹2,450 <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ Quintal (Grade A Garwa)</span>
          </p>

          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
            ↑ Up ₹80 from yesterday's modal closing
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Search Mandi, District or Commodity..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '34px', backgroundColor: '#ffffff', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-card)' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
          {[
            { id: 'All', label: 'All Crops' },
            { id: 'Onion', label: 'Onion (कांदा)' },
            { id: 'Soybean', label: 'Soybean (सोयाबीन)' },
            { id: 'Cotton', label: 'Cotton (कापूस)' },
            { id: 'Tomato', label: 'Tomato (टोमॅटो)' },
            { id: 'Wheat', label: 'Wheat (गहू)' }
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCrop(c.id)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                fontWeight: 600,
                backgroundColor: activeCrop === c.id ? '#065f46' : '#ffffff',
                color: activeCrop === c.id ? '#ffffff' : '#475569',
                border: activeCrop === c.id ? 'none' : '1px solid var(--border-card)'
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Split Section: APMC Daily Arrivals Table (Left) + Assay Labs & Trend (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '20px' }}>
        {/* Left: Table */}
        <div className="gov-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', color: '#0f172a' }}>APMC Daily Arrivals & Live Discovery</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Government verified terminal rates with electronic lot assays
              </p>
            </div>
            <span style={{ 
              backgroundColor: '#ecfdf5', 
              color: '#065f46', 
              fontSize: '0.72rem', 
              fontWeight: 700, 
              padding: '3px 8px', 
              borderRadius: 'var(--radius-full)', 
              border: '1px solid #a7f3d0' 
            }}>
              MSAMB Certified
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-card)', color: '#64748b', textAlign: 'left' }}>
                  <th style={{ padding: '10px 8px', fontWeight: 600 }}>MARKET (MANDI)</th>
                  <th style={{ padding: '10px 8px', fontWeight: 600 }}>COMMODITY</th>
                  <th style={{ padding: '10px 8px', fontWeight: 600 }}>MODAL RATE</th>
                  <th style={{ padding: '10px 8px', fontWeight: 600 }}>24H SHIFT</th>
                  <th style={{ padding: '10px 8px', fontWeight: 600 }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 8px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{row.mandi}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{row.mandiSub}</div>
                    </td>

                    <td style={{ padding: '12px 8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: row.dotColor }} />
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>{row.crop}</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', paddingLeft: '12px' }}>{row.grade}</div>
                    </td>

                    <td style={{ padding: '12px 8px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>{row.modal}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{row.range}</div>
                    </td>

                    <td style={{ padding: '12px 8px' }}>
                      <span style={{ 
                        backgroundColor: row.shiftPositive ? '#ecfdf5' : row.shiftNegative ? '#fef2f2' : '#f1f5f9',
                        color: row.shiftPositive ? '#059669' : row.shiftNegative ? '#dc2626' : '#64748b',
                        padding: '2px 6px',
                        borderRadius: 'var(--radius-xs)',
                        fontWeight: 700,
                        fontSize: '0.75rem'
                      }}>
                        {row.shift}
                      </span>
                    </td>

                    <td style={{ padding: '12px 8px' }}>
                      <button 
                        className="btn-gov-outline-green"
                        style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                      >
                        Calculate Net Profit <ArrowRight size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>Rates are median auction quotes per quintal (100 kg).</span>
            <span style={{ color: '#059669', fontWeight: 600, cursor: 'pointer' }}>View All 585 Mandis →</span>
          </div>
        </div>

        {/* Right: Assay Labs Card & 7-Day Direction Chart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Photo Card */}
          <div className="gov-card" style={{ overflow: 'hidden' }}>
            <div style={{ position: 'relative', height: '140px' }}>
              <img 
                src="https://images.unsplash.com/photo-1595855759920-86582396756a?w=800&auto=format&fit=crop&q=80" 
                alt="Lasalgaon Assay Labs"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <span style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                backgroundColor: '#065f46',
                color: '#ffffff',
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 'var(--radius-xs)'
              }}>
                QC CERTIFIED HUB
              </span>
            </div>

            <div style={{ padding: '14px' }}>
              <h4 style={{ fontSize: '0.95rem', color: '#0f172a', marginBottom: '4px' }}>Lasalgaon On-Site Assay Labs</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Automated moisture and size grading assures transparent lot classification before open-cry auctions.
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Standard Moisture Limit:</span>
                <strong style={{ color: '#059669' }}>≤ 10.5%</strong>
              </div>
            </div>
          </div>

          {/* 7-Day Direction Card */}
          <div className="gov-card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>7-Day Price Direction</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Maharashtra Onion Index</div>
              </div>
              <span style={{ color: '#059669' }}><TrendingUp size={16} /></span>
            </div>

            {/* SVG Trendline */}
            <svg viewBox="0 0 300 60" style={{ width: '100%', height: '60px' }}>
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#059669" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <polygon points="0,55 0,45 60,40 120,38 180,30 240,22 300,10 300,55" fill="url(#chartGrad)" />
              <polyline points="0,45 60,40 120,38 180,30 240,22 300,10" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" />
            </svg>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              <span>7D Ago: ₹2,180</span>
              <span style={{ color: '#059669', fontWeight: 700 }}>Latest: ₹2,450/qtl</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Net-in-Hand Transport Calculator */}
      <div className="gov-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
              <Truck size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#0f172a' }}>Net-in-Hand Transport Calculator</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Calculate real take-home earnings deducting live freight, handling, and mandi cess
              </p>
            </div>
          </div>

          <span style={{ backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={14} /> Zero Hidden Cut
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
          {/* Left Inputs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600, marginBottom: '6px' }}>
                <span style={{ color: '#0f172a' }}>HARVEST QUANTITY FOR DISPATCH</span>
                <span style={{ color: '#059669' }}>{harvestQty} Quintals ({(harvestQty / 10).toFixed(1)} Metric Tons)</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="number" 
                  value={harvestQty}
                  onChange={(e) => setHarvestQty(Number(e.target.value))}
                  style={{ flex: 1 }}
                />
                <span style={{ padding: '8px 14px', backgroundColor: '#f1f5f9', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-sm)', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                  Quintals
                </span>
              </div>
            </div>

            {/* Vehicle options */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {['Mini Truck (25 Qtl)', '6-Wheeler (50 Qtl)', '10-Wheeler (100 Qtl)'].map(v => (
                <button
                  key={v}
                  onClick={() => setSelectedVehicle(v)}
                  style={{
                    flex: 1,
                    padding: '8px 6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: selectedVehicle === v ? '#ecfdf5' : '#ffffff',
                    color: selectedVehicle === v ? '#065f46' : '#475569',
                    border: `1px solid ${selectedVehicle === v ? '#a7f3d0' : 'var(--border-card)'}`
                  }}
                >
                  {v}
                </button>
              ))}
            </div>

            {/* Destination Mandi */}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a', marginBottom: '6px', display: 'block' }}>
                DESTINATION APMC MARKET
              </label>
              <select 
                value={destinationMandi}
                onChange={(e) => setDestinationMandi(e.target.value)}
              >
                <option value="Lasalgaon APMC (₹2,450/qtl • ~45 km haul)">Lasalgaon APMC (₹2,450/qtl • ~45 km haul)</option>
                <option value="Vashi APMC Navi Mumbai (₹2,700/qtl • ~190 km haul)">Vashi APMC Navi Mumbai (₹2,700/qtl • ~190 km haul)</option>
                <option value="Pune Gultekdi APMC (₹4,820/qtl • ~210 km haul)">Pune Gultekdi APMC (₹4,820/qtl • ~210 km haul)</option>
              </select>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0', fontSize: '0.76rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Truck size={14} color="#059669" />
              <span>Verified Fleet Rate: <strong>₹70/qtl per 100km</strong> tariff with GPS-tracked convoy.</span>
            </div>
          </div>

          {/* Right Settlement Breakdown Card */}
          <div style={{ 
            backgroundColor: '#ffffff', 
            border: '1px solid var(--border-card)', 
            borderRadius: 'var(--radius-md)', 
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Settlement Breakdown
              </span>
              <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={14} /> Escrow Guaranteed
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#475569' }}>Gross Crop Realization (Lot Total)</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>₹{grossRealization.toLocaleString()}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#475569' }}>Aggregated Freight Deduction</span>
                <span style={{ fontWeight: 700, color: '#dc2626' }}>-₹{freightDeduction.toLocaleString()}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#475569' }}>Govt Cess & Mandi Handling (1.8%)</span>
                <span style={{ fontWeight: 700, color: '#dc2626' }}>-₹{mandiHandling.toLocaleString()}</span>
              </div>
            </div>

            {/* Net in-hand green highlight */}
            <div style={{ 
              backgroundColor: '#ecfdf5', 
              border: '1px solid #a7f3d0', 
              borderRadius: 'var(--radius-sm)', 
              padding: '12px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#065f46', textTransform: 'uppercase' }}>
                  Net In-Hand Bank Transfer
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#065f46', fontFamily: 'var(--font-display)' }}>
                  ₹{netInHand.toLocaleString()}
                </div>
              </div>

              <div style={{ textAlign: 'right', fontSize: '0.7rem', color: '#065f46' }}>
                <div>DIRECT DEPOSIT</div>
                <strong>T+24 Hours via DBT</strong>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="btn-gov-primary"
                style={{ flex: 1, justifyContent: 'center', padding: '10px' }}
                onClick={() => alert(`Rate Locked! ₹${netInHand.toLocaleString()} guaranteed via AgroConnect DBT Escrow.`)}
              >
                <Lock size={15} /> Lock Rate & Book Transport
              </button>

              <button 
                className="btn-gov-secondary"
                style={{ padding: '10px 14px' }}
                title="Share Estimate"
              >
                <Share2 size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Daily Mandi Bhav Notification Strip */}
      <div className="gov-card" style={{ 
        padding: '14px 20px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        flexWrap: 'wrap', 
        gap: '12px',
        backgroundColor: '#ffffff'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
            <MessageSquare size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>
              Daily Mandi Bhav on WhatsApp & SMS
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              Receive 8:00 AM auction closing rates in Marathi or English directly on your phone.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input 
            type="text" 
            value={alertPhone}
            onChange={(e) => setAlertPhone(e.target.value)}
            style={{ width: '160px', padding: '6px 10px', fontSize: '0.8rem' }}
          />
          <select style={{ width: '100px', padding: '6px 8px', fontSize: '0.8rem' }}>
            <option>English</option>
            <option>मराठी</option>
          </select>
          <button 
            className="btn-gov-primary"
            style={{ padding: '7px 14px', fontSize: '0.8rem' }}
            onClick={() => setAlertSet(true)}
          >
            {alertSet ? '✓ Alert Active' : 'Set Alert'}
          </button>
        </div>
      </div>
    </div>
  );
};
