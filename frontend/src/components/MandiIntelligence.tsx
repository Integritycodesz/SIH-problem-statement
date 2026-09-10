import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, MapPin, Search, 
  Truck, ArrowRight, ShieldCheck, Share2, 
  MessageSquare, Lock, Calendar, Award, Zap
} from 'lucide-react';
import { api, type CommodityPrice, type Mandi, type TransportCalcResult } from '../services/api';
import { subscribeToCommodityPrices } from '../services/supabase';
import { translations, type Language } from '../utils/i18n';

interface MandiIntelligenceProps {
  lang?: Language;
}

export const MandiIntelligence: React.FC<MandiIntelligenceProps> = ({ lang = 'EN' }) => {
  const t = translations[lang];
  const [activeCrop, setActiveCrop] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [prices, setPrices] = useState<CommodityPrice[]>([]);
  const [mandis, setMandis] = useState<Mandi[]>([]);
  const [trendPoints, setTrendPoints] = useState<any[]>([]);
  const [lastLiveUpdate, setLastLiveUpdate] = useState<string | null>(null);

  // Transport Calculator State
  const [harvestQty, setHarvestQty] = useState<number>(50);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('6-Wheeler (50 Qtl)');
  const [originMandiId, setOriginMandiId] = useState<number>(1);
  const [destMandiId, setDestMandiId] = useState<number>(5);
  const [transportResult, setTransportResult] = useState<TransportCalcResult | null>(null);

  // Alert State
  const [alertPhone, setAlertPhone] = useState<string>('+91 98220 12345');
  const [alertSet, setAlertSet] = useState<boolean>(false);

  useEffect(() => {
    loadPricesAndMandis();
  }, [activeCrop]);

  useEffect(() => {
    // Supabase Realtime Listener
    const channel = subscribeToCommodityPrices((payload) => {
      console.log('[Supabase Realtime] Price update received in MandiIntelligence:', payload);
      setLastLiveUpdate(`Updated ${payload.new?.commodity || 'APMC'} modal rate just now!`);
      loadPricesAndMandis();
      setTimeout(() => setLastLiveUpdate(null), 5000);
    });

    return () => {
      if (channel) channel.unsubscribe();
    };
  }, []);

  useEffect(() => {
    recalculateTransport();
  }, [harvestQty, selectedVehicle, originMandiId, destMandiId, activeCrop]);

  const loadPricesAndMandis = async () => {
    try {
      const [pList, mList, trends] = await Promise.all([
        api.getPrices(activeCrop === 'All' ? undefined : activeCrop),
        api.getMandis(),
        api.getHistoricalTrends(activeCrop === 'All' ? 'Onion' : activeCrop)
      ]);
      setPrices(pList);
      setMandis(mList);
      if (trends?.data_points) {
        setTrendPoints(trends.data_points);
      }
    } catch (err) {
      console.error('Error loading Mandi intelligence:', err);
    }
  };

  const recalculateTransport = async () => {
    try {
      const res = await api.calculateTransport({
        from_mandi_id: originMandiId,
        to_mandi_id: destMandiId,
        commodity: activeCrop === 'All' ? 'Onion' : activeCrop,
        quantity_quintals: harvestQty,
        vehicle_type: selectedVehicle
      });
      setTransportResult(res);
    } catch (err) {
      console.error('Error calculating transport:', err);
    }
  };

  // Filtered price rows
  const filteredPrices = prices.filter(p => {
    const matchesSearch = 
      p.mandi_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.commodity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.variety.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Top gainer
  const topGainer = [...prices].sort((a, b) => (b.change_24h || 0) - (a.change_24h || 0))[0] || prices[0];

  // Dynamic calculations for transport
  const destMandiObj = mandis.find(m => m.id === destMandiId) || mandis[0] || { name: 'Lasalgaon APMC', district: 'Nashik' };
  const destPriceRecord = prices.find(p => p.mandi_id === destMandiId) || prices[0];
  const ratePerQtl = destPriceRecord?.modal_price || 2450;
  const grossRealization = harvestQty * ratePerQtl;
  const freightDeduction = transportResult?.freight_cost || (selectedVehicle.includes('25') ? 2200 : selectedVehicle.includes('100') ? 5800 : 3500);
  const mandiHandling = Math.round(grossRealization * 0.018);
  const netInHand = grossRealization - freightDeduction - mandiHandling;

  // Build SVG points for trendline
  const svgWidth = 300;
  const svgHeight = 60;
  let polylinePoints = '0,45 60,40 120,38 180,30 240,22 300,10';
  let polygonPoints = '0,55 0,45 60,40 120,38 180,30 240,22 300,10 300,55';

  if (trendPoints.length > 1) {
    const minP = Math.min(...trendPoints.map(p => p.modal_price));
    const maxP = Math.max(...trendPoints.map(p => p.modal_price));
    const range = maxP - minP || 1;

    const coords = trendPoints.map((pt, idx) => {
      const x = Math.round((idx / (trendPoints.length - 1)) * svgWidth);
      const y = Math.round(svgHeight - 10 - ((pt.modal_price - minP) / range) * (svgHeight - 20));
      return `${x},${y}`;
    });

    polylinePoints = coords.join(' ');
    polygonPoints = `0,${svgHeight} ` + coords.join(' ') + ` ${svgWidth},${svgHeight}`;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingTop: '16px' }}>
      {/* 1. Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#059669' }}>
              Live Benchmark Feed • Telemetry Active
            </span>
            {lastLiveUpdate && (
              <span style={{ 
                backgroundColor: '#ecfdf5', 
                color: '#065f46', 
                border: '1px solid #a7f3d0', 
                padding: '1px 8px', 
                borderRadius: '10px',
                fontSize: '0.7rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Zap size={11} color="#059669" /> {lastLiveUpdate}
              </span>
            )}
          </div>
          <h2 style={{ fontSize: '1.6rem', color: '#0f172a' }}>{t.mandiIntelTitle}</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {t.mandiIntelSubtitle}
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
              Maharashtra APMC Network
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
              {t.avgFarmgatePremium}
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
              vs Middleman Price
            </span>
          </div>

          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Realized surplus directly deposited via RBI-compliant escrow DBT
          </p>

          <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600, borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
            7-Day trendline: <strong>+₹190/qtl avg across Maharashtra</strong>
          </div>
        </div>

        {/* Card 2 */}
        <div className="gov-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {t.reportingMandis}
            </span>
            <Calendar size={16} color="#0284c7" />
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-display)' }}>
              585
            </span>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b' }}>
              APMCs Synced
            </span>
          </div>

          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Electronic weighbridges integrated with e-NAM & MSAMB ledger
          </p>

          <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600, borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
            ● 100% daily price telemetry operational in state
          </div>
        </div>

        {/* Card 3 */}
        <div className="gov-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {t.topGainerToday}
            </span>
            <Award size={16} color="#d97706" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
              {topGainer?.mandi_name || 'Lasalgaon APMC'} • {topGainer?.commodity || 'Onion'}
            </span>
            <span style={{ 
              backgroundColor: '#ecfdf5', 
              color: '#059669', 
              fontSize: '0.75rem', 
              fontWeight: 700, 
              padding: '2px 8px', 
              borderRadius: 'var(--radius-full)' 
            }}>
              +{topGainer?.change_24h || 3.8}%
            </span>
          </div>

          <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#059669', marginBottom: '4px' }}>
            ₹{topGainer?.modal_price || 2420} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ Quintal ({topGainer?.variety})</span>
          </p>

          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
            MSP Floor: <strong>₹{topGainer?.msp_price || 1900}/qtl</strong> • Parity: <strong>+₹{(topGainer?.modal_price || 2420) - (topGainer?.msp_price || 1900)}/qtl</strong>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder={t.searchMandiPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '34px', backgroundColor: '#ffffff', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-card)' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
          {[
            { id: 'All', label: t.allCropsFilter },
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
                border: activeCrop === c.id ? 'none' : '1px solid var(--border-card)',
                whiteSpace: 'nowrap'
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Split Section: APMC Daily Arrivals Table (Left) + Assay Labs & Trend (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '20px' }}>
        {/* Left: Dynamic Prices Table */}
        <div className="gov-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', color: '#0f172a' }}>APMC Daily Arrivals & Live Discovery</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Government verified terminal rates with electronic lot assays ({filteredPrices.length} reporting centers)
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
                  <th style={{ padding: '10px 8px', fontWeight: 600 }}>{t.marketTableMandi}</th>
                  <th style={{ padding: '10px 8px', fontWeight: 600 }}>{t.marketTableCrop}</th>
                  <th style={{ padding: '10px 8px', fontWeight: 600 }}>{t.marketTableModal}</th>
                  <th style={{ padding: '10px 8px', fontWeight: 600 }}>{t.marketTableShift}</th>
                  <th style={{ padding: '10px 8px', fontWeight: 600 }}>{t.marketTableAction}</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrices.map((p) => {
                  const isPositive = (p.change_24h || 0) > 0;
                  const isNegative = (p.change_24h || 0) < 0;
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{p.mandi_name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Arrivals: <strong>{p.arrivals_tonnes} tonnes</strong>
                        </div>
                      </td>

                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                          <span style={{ fontWeight: 600, color: '#0f172a' }}>{p.commodity}</span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', paddingLeft: '12px' }}>{p.variety}</div>
                      </td>

                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>₹{p.modal_price}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          Range: ₹{p.min_price} - ₹{p.max_price}
                        </div>
                      </td>

                      <td style={{ padding: '12px 8px' }}>
                        <span style={{ 
                          backgroundColor: isPositive ? '#ecfdf5' : isNegative ? '#fef2f2' : '#f1f5f9',
                          color: isPositive ? '#059669' : isNegative ? '#dc2626' : '#64748b',
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-xs)',
                          fontWeight: 700,
                          fontSize: '0.75rem'
                        }}>
                          {isPositive ? `+${p.change_24h}%` : `${p.change_24h}%`}
                        </span>
                      </td>

                      <td style={{ padding: '12px 8px' }}>
                        <button 
                          className="btn-gov-outline-green"
                          style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                          onClick={() => {
                            setDestMandiId(p.mandi_id || 1);
                            const calcSection = document.getElementById('transport-calc-section');
                            if (calcSection) calcSection.scrollIntoView({ behavior: 'smooth' });
                          }}
                        >
                          {t.calcNetProfit} <ArrowRight size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>Quotes are median auction rates per quintal (100 kg).</span>
            <span style={{ color: '#059669', fontWeight: 600, cursor: 'pointer' }}>
              Displaying {filteredPrices.length} Verified Mandis →
            </span>
          </div>
        </div>

        {/* Right: Assay Labs Card & Dynamic 7-Day Direction Chart */}
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
                QC CERTIFIED APMC HUB
              </span>
            </div>

            <div style={{ padding: '14px' }}>
              <h4 style={{ fontSize: '0.95rem', color: '#0f172a', marginBottom: '4px' }}>Lasalgaon On-Site Assay Labs</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Automated moisture and size grading assures transparent lot classification before open-cry auctions.
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Standard Moisture Limit:</span>
                <strong style={{ color: '#059669' }}>≤ 11.2% (Dry Export Standard)</strong>
              </div>
            </div>
          </div>

          {/* 7-Day Direction Card with Dynamic Trendline */}
          <div className="gov-card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>7-Day Price Direction</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Maharashtra {activeCrop === 'All' ? 'Onion' : activeCrop} Benchmark Index
                </div>
              </div>
              <span style={{ color: '#059669' }}><TrendingUp size={16} /></span>
            </div>

            {/* Dynamic SVG Trendline */}
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: '60px' }}>
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#059669" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <polygon points={polygonPoints} fill="url(#chartGrad)" />
              <polyline points={polylinePoints} fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" />
            </svg>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              <span>7D Ago: ₹{trendPoints[0]?.modal_price || 2320}</span>
              <span style={{ color: '#059669', fontWeight: 700 }}>
                Latest: ₹{trendPoints[trendPoints.length - 1]?.modal_price || 2420}/qtl
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. GIS Haversine Net-in-Hand Transport Calculator */}
      <div id="transport-calc-section" className="gov-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
              <Truck size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#0f172a' }}>{t.calcTitle}</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {t.calcSubtitle}
              </p>
            </div>
          </div>

          <span style={{ backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={14} /> GIS Haversine Precision • Zero Hidden Cut
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
          {/* Left Inputs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600, marginBottom: '6px' }}>
                <span style={{ color: '#0f172a' }}>{t.harvestQtyDispatch}</span>
                <span style={{ color: '#059669' }}>{harvestQty} Quintals ({(harvestQty / 10).toFixed(1)} MT)</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="number" 
                  min={5}
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

            {/* Origin & Destination Selectors */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.74rem', fontWeight: 600, color: '#0f172a', marginBottom: '4px', display: 'block' }}>
                  ORIGIN HARVEST MANDI
                </label>
                <select value={originMandiId} onChange={(e) => setOriginMandiId(Number(e.target.value))}>
                  {mandis.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.district})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.74rem', fontWeight: 600, color: '#0f172a', marginBottom: '4px', display: 'block' }}>
                  {t.destApmc}
                </label>
                <select value={destMandiId} onChange={(e) => setDestMandiId(Number(e.target.value))}>
                  {mandis.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.district})</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0', fontSize: '0.76rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Truck size={14} color="#059669" />
              <span>
                GIS Haul Distance: <strong>{transportResult?.distance_km || 145} km</strong> • Est. Transit: <strong>{transportResult?.estimated_transit_hours || 4.2} hrs</strong>
              </span>
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
                Arbitrage & Net Settlement
              </span>
              <span style={{ 
                fontSize: '0.72rem', 
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: transportResult?.viability_status === 'HIGHLY_VIABLE' ? '#ecfdf5' : '#fffbeb',
                color: transportResult?.viability_status === 'HIGHLY_VIABLE' ? '#065f46' : '#b45309'
              }}>
                {transportResult?.viability_status === 'HIGHLY_VIABLE' ? '● HIGH ARBITRAGE GAIN' : '● MARGINAL VIABILITY'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#475569' }}>Gross Realization ({destMandiObj?.name || 'Selected Mandi'} @ ₹{ratePerQtl}/qtl)</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>₹{grossRealization.toLocaleString()}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#475569' }}>Live Freight Deduction ({transportResult?.distance_km || 145} km haul)</span>
                <span style={{ fontWeight: 700, color: '#dc2626' }}>-₹{freightDeduction.toLocaleString()}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#475569' }}>APMC Cess & Weighment Handling (1.8%)</span>
                <span style={{ fontWeight: 700, color: '#dc2626' }}>-₹{mandiHandling.toLocaleString()}</span>
              </div>
            </div>

            {/* Net in-hand highlight */}
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
                  {t.netInHandTransfer}
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#065f46', fontFamily: 'var(--font-display)' }}>
                  ₹{netInHand.toLocaleString()}
                </div>
              </div>

              <div style={{ textAlign: 'right', fontSize: '0.7rem', color: '#065f46' }}>
                <div>DIRECT DEPOSIT</div>
                <strong>T+24 Hours via DBT Escrow</strong>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="btn-gov-primary"
                style={{ flex: 1, justifyContent: 'center', padding: '10px' }}
                onClick={() => alert(`Rate Locked! Net take-home ₹${netInHand.toLocaleString()} guaranteed via AgroConnect Escrow.`)}
              >
                <Lock size={15} /> {t.lockRateBookTransport}
              </button>

              <button 
                className="btn-gov-secondary"
                style={{ padding: '10px 14px' }}
                title="Share Estimate"
                onClick={() => alert(`Estimate summary shared for ${harvestQty} Qtl dispatch to ${destMandiObj.name}.`)}
              >
                <Share2 size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Daily Mandi Bhav WhatsApp / SMS Alerts */}
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
          <button 
            className="btn-gov-primary"
            style={{ padding: '7px 14px', fontSize: '0.8rem' }}
            onClick={() => {
              setAlertSet(true);
              alert(`Daily price alerts registered for ${alertPhone}! You will receive real-time APMC auction updates.`);
            }}
          >
            {alertSet ? '✓ Alert Active' : 'Set Alert'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MandiIntelligence;
