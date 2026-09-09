import React, { useState } from 'react';
import { 
  Package, ShieldCheck, Clock, ArrowRight, 
  Printer, FileText, SlidersHorizontal, Plus, 
  MessageSquare, Building2, PhoneCall, X
} from 'lucide-react';
import type { User } from '../services/api';

interface FarmerPortalProps {
  currentUser: User | null;
  onNavigateToRFQs: () => void;
}

export const FarmerPortal: React.FC<FarmerPortalProps> = ({ onNavigateToRFQs }) => {
  const [showAddHarvestModal, setShowAddHarvestModal] = useState<boolean>(false);
  const [newCommodity, setNewCommodity] = useState<string>('Nasik Red Onion');
  const [newVolume, setNewVolume] = useState<number>(30);
  const [newRate, setNewRate] = useState<number>(2450);

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
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#059669' }} />
            FPO ID: MH-NSK-2024-912 • Govt. Certified Custody Hub
          </div>
          <h2 style={{ fontSize: '1.65rem', color: '#0f172a' }}>Farmer Produce & Harvest Lots</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Manage your aggregated harvest inventory, inspect verified institutional buyer offers, and track escrow-secured settlements with state APMC assurance.
          </p>
        </div>

        {/* Right Action Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-gov-secondary">
            <SlidersHorizontal size={14} /> Lot Filters
          </button>

          <button 
            className="btn-gov-primary"
            onClick={() => setShowAddHarvestModal(true)}
          >
            <Plus size={16} /> List New Harvest
          </button>
        </div>
      </div>

      {/* 2. Top 3 Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        {/* Card 1 */}
        <div className="gov-card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Total Listed Stock
              </span>
              <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-xs)', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
                <Package size={16} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '4px' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-display)' }}>
                185
              </span>
              <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#64748b' }}>
                Quintals (18.5 MT)
              </span>
            </div>

            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              <strong style={{ color: '#059669' }}>● 3 active lots</strong> • Lasalgaon & Pune Hubs
            </p>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              <span>Warehouse Capacity</span>
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
                Safe Escrow Balance
              </span>
              <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-xs)', backgroundColor: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
                <Building2 size={16} />
              </div>
            </div>

            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669', fontFamily: 'var(--font-display)', marginBottom: '4px' }}>
              ₹6,40,000
            </div>

            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={14} color="#059669" /> Held in SBI Mandi Custody Escrow
            </p>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              <span>Next Payout Cycle</span>
              <strong>28 Nov, 14:00 IST</strong>
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
                Pending Inquiries
              </span>
              <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-xs)', backgroundColor: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
                <Clock size={16} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '4px' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-display)' }}>
                4
              </span>
              <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#64748b' }}>
                Wholesale Buyers
              </span>
            </div>

            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Highest Bid: <strong style={{ color: '#059669' }}>₹2,580/qtl</strong> • +5.3% vs APMC
            </p>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              <span>Avg Response Speed</span>
              <strong>42 mins</strong>
            </div>
            <div style={{ height: '4px', backgroundColor: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: '45%', height: '100%', backgroundColor: '#d97706' }} />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Split Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '20px' }}>
        {/* Left Column: Active Harvest Lots */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1.05rem', color: '#0f172a' }}>Active Harvest Lots</h3>
              <span style={{ backgroundColor: '#ecfdf5', color: '#065f46', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                3 Batches Listed
              </span>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Sort by: <strong>Recent Activity ▾</strong>
            </div>
          </div>

          {/* Lot 1: Nasik Red Onion */}
          <div className="gov-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ position: 'relative', width: '70px', height: '70px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', flexShrink: 0 }}>
                <img 
                  src="https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&auto=format&fit=crop&q=80" 
                  alt="Onion lot"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span style={{ position: 'absolute', bottom: '2px', left: '2px', backgroundColor: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '0.58rem', padding: '1px 4px', borderRadius: '2px', fontWeight: 700 }}>
                  LOT #819
                </span>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h4 style={{ fontSize: '1.05rem', color: '#0f172a' }}>Nasik Red Onion</h4>
                    <span className="badge-grade-a">Grade A</span>
                  </div>
                  <span className="badge-amber-tag">● 3 Active Inquiries</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Lasalgaon Cold Hub • Bay 14-C
                </div>
              </div>
            </div>

            {/* 4 Metrics Strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
              <div>
                <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>AVAILABLE QTY</div>
                <strong style={{ fontSize: '0.82rem', color: '#0f172a' }}>45 MT (450 qtl)</strong>
              </div>
              <div>
                <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>ASKING RATE</div>
                <strong style={{ fontSize: '0.86rem', color: '#059669' }}>₹2,450 / qtl</strong>
              </div>
              <div>
                <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>MOISTURE INDEX</div>
                <strong style={{ fontSize: '0.82rem', color: '#0f172a' }}>11.4% (Optimal)</strong>
              </div>
              <div>
                <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>APMC PARITY</div>
                <strong style={{ fontSize: '0.82rem', color: '#059669' }}>+₹120 / qtl</strong>
              </div>
            </div>

            {/* Action Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Tag: ANSK-ON-045-819
              </span>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-gov-secondary" style={{ padding: '6px 10px', fontSize: '0.75rem' }}>
                  <Printer size={13} /> Print QR Tag
                </button>
                <button 
                  className="btn-gov-primary" 
                  style={{ padding: '6px 14px', fontSize: '0.75rem' }}
                  onClick={onNavigateToRFQs}
                >
                  View Offers (3) <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* Lot 2: JS-335 Yellow Soybean */}
          <div className="gov-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ position: 'relative', width: '70px', height: '70px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', flexShrink: 0 }}>
                <img 
                  src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=400&auto=format&fit=crop&q=80" 
                  alt="Soybean Silo"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span style={{ position: 'absolute', bottom: '2px', left: '2px', backgroundColor: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '0.58rem', padding: '1px 4px', borderRadius: '2px', fontWeight: 700 }}>
                  LOT #612
                </span>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h4 style={{ fontSize: '1.05rem', color: '#0f172a' }}>JS-335 Yellow Soybean</h4>
                    <span className="badge-blue-tag">State Certified</span>
                  </div>
                  <span className="badge-grade-a">🔒 Advance Deposited (50%)</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Akola Agrilogistics Park • Silo 03
                </div>
              </div>
            </div>

            {/* 4 Metrics Strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
              <div>
                <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>BATCH VOLUME</div>
                <strong style={{ fontSize: '0.82rem', color: '#0f172a' }}>30 MT (300 qtl)</strong>
              </div>
              <div>
                <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>CONTRACT PRICE</div>
                <strong style={{ fontSize: '0.86rem', color: '#059669' }}>₹4,820 / qtl</strong>
              </div>
              <div>
                <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>ESCROW GUARANTEE</div>
                <strong style={{ fontSize: '0.82rem', color: '#0284c7' }}>₹7,23,000</strong>
              </div>
              <div>
                <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>DISPATCH DATE</div>
                <strong style={{ fontSize: '0.82rem', color: '#0f172a' }}>30 Nov 2024</strong>
              </div>
            </div>

            {/* Action Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Contract Buyer: <strong>BigBasket Regional Processing Hub</strong>
              </span>

              <button 
                className="btn-gov-primary" 
                style={{ padding: '6px 14px', fontSize: '0.75rem' }}
                onClick={() => alert('Viewing binding APMC digital contract signed under MSIS escrow rules.')}
              >
                <FileText size={13} /> View Contract
              </button>
            </div>
          </div>

          {/* Lot 3: Lokwan Desi Wheat */}
          <div className="gov-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ position: 'relative', width: '70px', height: '70px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', flexShrink: 0 }}>
                <img 
                  src="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&auto=format&fit=crop&q=80" 
                  alt="Wheat assay sample"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span style={{ position: 'absolute', bottom: '2px', left: '2px', backgroundColor: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '0.58rem', padding: '1px 4px', borderRadius: '2px', fontWeight: 700 }}>
                  LOT #790
                </span>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h4 style={{ fontSize: '1.05rem', color: '#0f172a' }}>Lokwan Desi Wheat</h4>
                    <span style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '0.68rem', padding: '2px 6px', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
                      Sharbati Sub-type
                    </span>
                  </div>
                  <span className="badge-blue-tag">🔄 Assaying In Progress</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Chhatrapati Sambhajinagar APMC • Godown 02
                </div>
              </div>
            </div>

            {/* 4 Metrics Strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
              <div>
                <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>BATCH VOLUME</div>
                <strong style={{ fontSize: '0.82rem', color: '#0f172a' }}>25 MT (250 qtl)</strong>
              </div>
              <div>
                <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>TARGET BASE</div>
                <strong style={{ fontSize: '0.86rem', color: '#0f172a' }}>₹2,750 / qtl</strong>
              </div>
              <div>
                <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>LAB SAMPLE</div>
                <strong style={{ fontSize: '0.82rem', color: '#64748b' }}>MSAMB #402</strong>
              </div>
              <div>
                <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>EXPECTED ASSAY</div>
                <strong style={{ fontSize: '0.82rem', color: '#0284c7' }}>Today, 18:00</strong>
              </div>
            </div>

            {/* Action Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Digital assay cert will auto-publish to marketplace upon verification.
              </span>

              <button className="btn-gov-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                Update Lot Notes
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Direct Institutional Buyers & MSP Guarantee */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="gov-card" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <h4 style={{ fontSize: '0.98rem', color: '#0f172a' }}>Direct Institutional Buyers</h4>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verified wholesale procurement RFQs</div>
              </div>
              <ShieldCheck size={16} color="#059669" />
            </div>

            {/* 3 Buyer Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Buyer 1 */}
              <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: '#065f46', color: '#fff', fontSize: '0.7rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      RR
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.84rem', color: '#0f172a' }}>Reliance Retail Hub</strong>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Institutional Partner</div>
                    </div>
                  </div>
                  <span className="badge-grade-a">HIGH MATCH</span>
                </div>

                <div style={{ fontSize: '0.76rem', color: '#475569', display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                  <span>Requirement: <strong>100 MT Nasik Onion</strong></span>
                  <span style={{ color: '#059669', fontWeight: 700 }}>₹2,580 / qtl</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Delivery Window: Within 4 Days
                </div>

                <button 
                  className="btn-gov-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '6px', fontSize: '0.76rem', marginTop: '8px' }}
                  onClick={() => alert('Contacting Reliance Procurement Hub. Direct negotiation channel opened.')}
                >
                  <MessageSquare size={12} /> Contact Buyer
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
                      <strong style={{ fontSize: '0.84rem', color: '#0f172a' }}>BigBasket B2B Supply</strong>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Pre-cleared Escrow</div>
                    </div>
                  </div>
                  <span className="badge-amber-tag">URGENT</span>
                </div>

                <div style={{ fontSize: '0.76rem', color: '#475569', display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                  <span>Requirement: <strong>50 MT Soybean (JS-335)</strong></span>
                  <span style={{ color: '#059669', fontWeight: 700 }}>₹4,850 / qtl</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Drop-off: Pune Chakan Hub
                </div>

                <button 
                  className="btn-gov-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '6px', fontSize: '0.76rem', marginTop: '8px' }}
                  onClick={() => alert('Contacting BigBasket Procurement Desk.')}
                >
                  <MessageSquare size={12} /> Contact Buyer
                </button>
              </div>

              {/* Buyer 3 */}
              <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: '#b45309', color: '#fff', fontSize: '0.68rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      ITC
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.84rem', color: '#0f172a' }}>ITC Agri Business</strong>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>e-Choupal Verified</div>
                    </div>
                  </div>
                  <span style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '0.68rem', padding: '2px 6px', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
                    STANDING RFQ
                  </span>
                </div>

                <div style={{ fontSize: '0.76rem', color: '#475569', display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                  <span>Requirement: <strong>40 MT Lokwan Wheat</strong></span>
                  <span style={{ color: '#059669', fontWeight: 700 }}>₹2,810 / qtl</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Inspection: Farm Gate Collection
                </div>

                <button 
                  className="btn-gov-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '6px', fontSize: '0.76rem', marginTop: '8px' }}
                  onClick={() => alert('Connecting with ITC Agri Procurement Representative.')}
                >
                  <MessageSquare size={12} /> Contact Buyer
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              <span>Need direct mandi support?</span>
              <span style={{ color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                <PhoneCall size={12} /> Call Kisan Desk
              </span>
            </div>
          </div>

          {/* Govt. MSP Floor Guarantee Box */}
          <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 'var(--radius-md)', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <ShieldCheck size={18} color="#059669" />
              <strong style={{ fontSize: '0.88rem', color: '#065f46' }}>Govt. MSP Floor Guarantee</strong>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#065f46', lineHeight: 1.4, marginBottom: '8px' }}>
              All harvest contracts initiated via AgroConnect include guaranteed MSP floor settlement backed by the Maharashtra State Agricultural Marketing Board (MSAMB).
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: '#065f46', borderTop: '1px solid #a7f3d0', paddingTop: '6px' }}>
              <span>Current Soy MSP: <strong>₹4,892/qtl</strong></span>
              <span>● Fully Protected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: List New Harvest */}
      {showAddHarvestModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', color: '#0f172a' }}>List New Harvest Batch (Govt. Assay Certified)</h3>
              <button onClick={() => setShowAddHarvestModal(false)} style={{ background: 'transparent', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a', marginBottom: '4px', display: 'block' }}>
                  Commodity & Variety
                </label>
                <select value={newCommodity} onChange={(e) => setNewCommodity(e.target.value)}>
                  <option value="Nasik Red Onion">Nasik Red Onion (Grade A Garwa)</option>
                  <option value="Soybean JS-335">Soybean JS-335 (Certified Oilseed)</option>
                  <option value="Lokwan Desi Wheat">Lokwan Desi Wheat (Sharbati)</option>
                  <option value="Tomato Hybrid Abhinav">Tomato Hybrid Abhinav</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a', marginBottom: '4px', display: 'block' }}>
                    Harvest Volume (Metric Tonnes)
                  </label>
                  <input 
                    type="number" 
                    value={newVolume} 
                    onChange={(e) => setNewVolume(Number(e.target.value))} 
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a', marginBottom: '4px', display: 'block' }}>
                    Base Asking Rate (₹ / Quintal)
                  </label>
                  <input 
                    type="number" 
                    value={newRate} 
                    onChange={(e) => setNewRate(Number(e.target.value))} 
                  />
                </div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0', fontSize: '0.76rem', color: '#64748b' }}>
                ℹ️ Once submitted, your harvest will be tagged with a QR-code and published for institutional bidding across the AgroConnect buyer network.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button className="btn-gov-secondary" onClick={() => setShowAddHarvestModal(false)}>
                  Cancel
                </button>
                <button 
                  className="btn-gov-primary"
                  onClick={() => {
                    setShowAddHarvestModal(false);
                    alert(`Harvest lot published! ${newVolume} MT of ${newCommodity} now live for institutional procurement.`);
                  }}
                >
                  Publish Harvest Lot
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
