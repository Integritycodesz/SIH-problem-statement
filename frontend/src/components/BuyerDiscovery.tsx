import React, { useState } from 'react';
import { 
  ShieldCheck, FileText, 
  Clock, Award, Lock, Eye, Zap
} from 'lucide-react';
import type { User } from '../services/api';

interface BuyerDiscoveryProps {
  currentUser: User | null;
  onNavigateToContracts: () => void;
}

export const BuyerDiscovery: React.FC<BuyerDiscoveryProps> = ({ onNavigateToContracts }) => {
  const [selectedCommodity, setSelectedCommodity] = useState<string>('Lasalgaon Onion');
  const [selectedGrade, setSelectedGrade] = useState<string>('Grade A+ (Export Ready)');
  const [selectedVolume, setSelectedVolume] = useState<string>('Min: 20 Metric Tonnes');
  const [selectedRegion, setSelectedRegion] = useState<string>('Nashik Cluster (50 km)');

  // Active RFQ State
  const [counterBid, setCounterBid] = useState<number>(2420);
  const totalQuintals = 400; // 40 MT
  const totalDealValue = totalQuintals * counterBid;
  const escrowAdvance = Math.round(totalDealValue * 0.5);
  const savingPerQtl = 2500 - counterBid;

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
          <h2 style={{ fontSize: '1.65rem', color: '#0f172a' }}>Wholesale Produce Marketplace</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Connect directly with verified Maharashtra Farmer Producer Organizations (FPOs), review lab-tested batches, and place binding digital escrow offers.
          </p>
        </div>

        {/* Right Stats Box */}
        <div className="gov-card" style={{ display: 'flex', alignItems: 'center', padding: '10px 18px', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Active Lots
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#059669', fontFamily: 'var(--font-display)' }}>
              142
            </div>
          </div>
          <div style={{ width: '1px', height: '30px', backgroundColor: 'var(--border-card)' }} />
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Daily Trading
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-display)' }}>
              1,840 <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>MT</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Filter Bar */}
      <div className="gov-card" style={{ padding: '14px 18px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
              Commodity
            </label>
            <select value={selectedCommodity} onChange={(e) => setSelectedCommodity(e.target.value)}>
              <option value="Lasalgaon Onion">Lasalgaon Onion</option>
              <option value="Soybean (JS-335)">Soybean (JS-335)</option>
              <option value="Tomato Hybrid (Abhinav)">Tomato Hybrid (Abhinav)</option>
              <option value="Lokwan Wheat">Lokwan Wheat</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
              Quality Grade
            </label>
            <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)}>
              <option value="Grade A+ (Export Ready)">Grade A+ (Export Ready)</option>
              <option value="Grade A (Standard Commercial)">Grade A (Standard Commercial)</option>
              <option value="Grade B (Processing Grade)">Grade B (Processing Grade)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
              Minimum Volume
            </label>
            <select value={selectedVolume} onChange={(e) => setSelectedVolume(e.target.value)}>
              <option value="Min: 20 Metric Tonnes">Min: 20 Metric Tonnes</option>
              <option value="Min: 40 Metric Tonnes">Min: 40 Metric Tonnes</option>
              <option value="Min: 80 Metric Tonnes">Min: 80 Metric Tonnes</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
              FPO Region
            </label>
            <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)}>
              <option value="Nashik Cluster (50 km)">Nashik Cluster (50 km)</option>
              <option value="Pune & Western Ghats">Pune & Western Ghats</option>
              <option value="Marathwada Hub (Latur)">Marathwada Hub (Latur)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Available Farmer Lots (3 Active Matches) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ fontSize: '1.05rem', color: '#0f172a' }}>Available Farmer Lots</h3>
            <span style={{ 
              backgroundColor: '#f1f5f9', 
              color: '#475569', 
              fontSize: '0.74rem', 
              fontWeight: 700, 
              padding: '2px 8px', 
              borderRadius: 'var(--radius-full)' 
            }}>
              3 Active Matches
            </span>
          </div>

          <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={14} /> Quality Assured by State Nodal Labs
          </span>
        </div>

        {/* 3 Cards Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          {/* Lot Card 1: Onion */}
          <div className="gov-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'relative', height: '170px' }}>
              <img 
                src="https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=80" 
                alt="Lasalgaon Red Onion Sacks"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '6px' }}>
                <span className="badge-grade-a">Grade A+</span>
                <span style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#ffffff', padding: '2px 6px', fontSize: '0.68rem', borderRadius: 'var(--radius-xs)', fontWeight: 600 }}>
                  #MH-NSK-9021
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
                📍 Lasalgaon, Nashik
              </span>
            </div>

            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', gap: '10px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    NASHIK KISAN SAMRUDDHI FPO
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 700 }}>★ 4.9</span>
                </div>
                <h4 style={{ fontSize: '1.1rem', color: '#0f172a' }}>Lasalgaon Red Onion</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Medium-large bulbs (55mm+), low moisture (&lt;12%), 3-month ambient storage life certified.
                </p>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Available Volume</div>
                  <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>40 MT</strong>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Asking Rate</div>
                  <strong style={{ fontSize: '1.05rem', color: '#059669' }}>₹2,450 <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ qtl</span></strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button 
                  className="btn-gov-primary"
                  style={{ flex: 1, justifyContent: 'center', padding: '9px', fontSize: '0.82rem' }}
                >
                  <Zap size={14} /> Open Offer & Negotiate
                </button>
                <button className="btn-gov-secondary" style={{ padding: '9px 12px' }}>
                  <FileText size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* Lot Card 2: Soybean */}
          <div className="gov-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'relative', height: '170px' }}>
              <img 
                src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&auto=format&fit=crop&q=80" 
                alt="Soybean Harvester"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '6px' }}>
                <span className="badge-grade-a">Grade A</span>
                <span style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#ffffff', padding: '2px 6px', fontSize: '0.68rem', borderRadius: 'var(--radius-xs)', fontWeight: 600 }}>
                  #MH-LTR-4412
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
                📍 Latur Mandi Hub
              </span>
            </div>

            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', gap: '10px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    MARATHWADA AGRO PRODUCER CO.
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 700 }}>★ 4.8</span>
                </div>
                <h4 style={{ fontSize: '1.1rem', color: '#0f172a' }}>Soybean (JS-335)</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  High oil content (19.2%), cleaned and machine sorted. Moisture 10% max with negligible foreign matter.
                </p>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Available Volume</div>
                  <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>85 MT</strong>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Asking Rate</div>
                  <strong style={{ fontSize: '1.05rem', color: '#059669' }}>₹4,890 <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ qtl</span></strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button 
                  className="btn-gov-secondary"
                  style={{ flex: 1, justifyContent: 'center', padding: '9px', fontSize: '0.82rem' }}
                >
                  <Eye size={14} /> Review Batch Specs
                </button>
                <button className="btn-gov-secondary" style={{ padding: '9px 12px' }}>
                  <FileText size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* Lot Card 3: Tomato */}
          <div className="gov-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'relative', height: '170px' }}>
              <img 
                src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80" 
                alt="Tomato Crates"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '6px' }}>
                <span className="badge-grade-a">Grade A</span>
                <span style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#ffffff', padding: '2px 6px', fontSize: '0.68rem', borderRadius: 'var(--radius-xs)', fontWeight: 600 }}>
                  #MH-PUN-3108
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
                📍 Narayangaon, Pune
              </span>
            </div>

            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', gap: '10px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    SAHYADRI VALLEY FPC
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 700 }}>★ 4.7</span>
                </div>
                <h4 style={{ fontSize: '1.1rem', color: '#0f172a' }}>Tomato Hybrid (Abhinav)</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Uniform red firm fruit, 90-100g, thick pericarp suitable for long distance reefer transit. Harvested 12h ago.
                </p>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Available Volume</div>
                  <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>22 MT</strong>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Asking Rate</div>
                  <strong style={{ fontSize: '1.05rem', color: '#059669' }}>₹1,950 <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ qtl</span></strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button 
                  className="btn-gov-secondary"
                  style={{ flex: 1, justifyContent: 'center', padding: '9px', fontSize: '0.82rem' }}
                >
                  <Eye size={14} /> Review Batch Specs
                </button>
                <button className="btn-gov-secondary" style={{ padding: '9px 12px' }}>
                  <FileText size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bilateral RFQ Negotiation Console */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              ● DIRECT TRANSACTION WORKSPACE
            </div>
            <h3 style={{ fontSize: '1.25rem', color: '#0f172a' }}>Bilateral RFQ Negotiation Console</h3>
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
            Round 1: Open for Submission
          </span>
        </div>

        {/* Split Cards: Left Lot Specs & Right Negotiation Desk */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '20px' }}>
          {/* Left Card */}
          <div className="gov-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>LOT #MH-NSK-9021</span>
                <span className="badge-grade-a">Grade A+ Certified</span>
              </div>
              <h4 style={{ fontSize: '1.3rem', color: '#0f172a' }}>40 MT Lasalgaon Red Onion</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Nashik Kisan Samruddhi FPO • 1,200 Smallholder Farmer Members
              </p>
            </div>

            {/* 4 mini spec boxes */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Lot Weight</div>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>400 Quintals</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>40 Metric Tonnes</div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Lasalgaon Mandi Avg</div>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#059669' }}>₹2,380 / qtl</div>
                <div style={{ fontSize: '0.68rem', color: '#059669' }}>+2.9% prevailing</div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Moisture & QC</div>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>11.4% (Dry)</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>NABL Lab Certified</div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Dispatch Readiness</div>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>Ready in 24h</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>FOB Nashik Yard</div>
              </div>
            </div>

            {/* Escrow Milestone Protection */}
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

            <div style={{ backgroundColor: '#ecfdf5', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid #a7f3d0', fontSize: '0.74rem', color: '#065f46', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={16} />
              <span>FPO Board Verified • CIN: U01400MH2018PTC1189 • Escrow KYC Approved</span>
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
                    ₹2,500 <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>/ Quintal</span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Fixed rate set by FPO</div>
                </div>

                <div style={{ backgroundColor: '#f0fdf4', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 600 }}>
                    Your Counter Bid (₹ / qtl)
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
                        width: '100px'
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#15803d' }}>
                    Saving: <strong>₹{savingPerQtl}/qtl</strong> • APMC +1.7%
                  </div>
                </div>
              </div>

              {/* Breakdown Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                  <span>Total Quantity</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>400 Quintals (40 MT)</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                  <span>Proposed Counter Rate</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>₹{counterBid} / qtl</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                  <span>APMC Cess & Portal Fee (0.0%)</span>
                  <span style={{ fontWeight: 600, color: '#059669' }}>₹0 (Govt. Subsidized)</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                  <div>
                    <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>Total Deal Value</strong>
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
                      50% Escrow Advance Required
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#059669' }}>
                      Held safely until physical lot sign-off
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
                onClick={() => alert(`Counter-offer of ₹${counterBid}/qtl transmitted to Nashik Kisan Samruddhi FPO.`)}
              >
                Submit Counter Offer
              </button>

              <button 
                className="btn-gov-primary"
                style={{ flex: 1, justifyContent: 'center', padding: '11px', fontSize: '0.86rem' }}
                onClick={() => {
                  alert(`Terms Accepted! Contract generated for ₹${totalDealValue.toLocaleString()} and 50% advance locked.`);
                  onNavigateToContracts();
                }}
              >
                Accept Terms & Sign
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Three Feature Highlights at Bottom */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        <div className="gov-card" style={{ padding: '20px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', marginBottom: '10px' }}>
            <ShieldCheck size={18} />
          </div>
          <h4 style={{ fontSize: '0.95rem', color: '#0f172a', marginBottom: '4px' }}>100% Escrow Protection</h4>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Funds remain locked in RBI-regulated escrow account until recipient digitally completes quality inspection at receiving warehouse.
          </p>
          <span style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
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
          <span style={{ fontSize: '0.74rem', color: '#d97706', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
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
          <span style={{ fontSize: '0.74rem', color: '#0284c7', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
            MSIS State Initiative →
          </span>
        </div>
      </div>
    </div>
  );
};
