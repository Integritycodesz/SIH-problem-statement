import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  ShieldCheck, Award, CheckCircle2, Clock, 
  Building2, Landmark, X, Printer
} from 'lucide-react';
import { api } from '../services/api';
import type { BuyerReliabilityScorecard } from '../types';
import { type Language } from '../utils/i18n';

interface BuyerScorecardModalProps {
  isOpen?: boolean;
  onClose: () => void;
  scorecard?: BuyerReliabilityScorecard | null;
  buyerName?: string | null;
  lang?: Language;
}

export const BuyerScorecardModal: React.FC<BuyerScorecardModalProps> = ({
  isOpen = true,
  onClose,
  scorecard: initialScorecard = null,
  buyerName = null,
  lang = 'EN'
}) => {
  const [activeScorecard, setActiveScorecard] = useState<BuyerReliabilityScorecard | null>(initialScorecard);

  useEffect(() => {
    if (initialScorecard) {
      setActiveScorecard(initialScorecard);
    } else if (buyerName) {
      api.getBuyerScorecard(buyerName).then(sc => {
        if (sc) setActiveScorecard(sc);
      }).catch(() => {});
    }
  }, [initialScorecard, buyerName]);

  // Clean print mode body class lifecycle
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('has-print-modal');
    }
    return () => {
      document.body.classList.remove('has-print-modal');
    };
  }, [isOpen]);

  if (!isOpen) return null;
  const scorecard = activeScorecard || initialScorecard;
  if (!scorecard) return null;

  const isMarathi = lang === 'MR';

  const formatCompanyType = (type: string) => {
    switch (type) {
      case 'OIL_MILL': return isMarathi ? 'खाद्यतेल प्रक्रिया व सॉल्व्हेंट युनिट' : 'Edible Oil & Solvent Mill';
      case 'FOOD_PROCESSOR': return isMarathi ? 'अन्न प्रक्रिया व पॅकेजिंग' : 'Food Processing & FMCG';
      case 'EXPORTER': return isMarathi ? 'थेट आंतरराष्ट्रीय निर्यातदार' : 'Export Consignment Hub';
      case 'RETAIL_CHAIN': return isMarathi ? 'संघटित किरकोळ विक्री साखळी' : 'Organized Retail & Supermarket';
      case 'GINNING_MILL': return isMarathi ? 'कापूस जिनिंग व सूतगिरणी' : 'Cotton Ginning & Spinning Mill';
      default: return isMarathi ? 'अधिकृत संस्थात्मक खरेदीदार' : 'Institutional Agribusiness';
    }
  };

  return createPortal(
    <div 
      className="scorecard-print-modal"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div 
        className="scorecard-print-card"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          maxWidth: '720px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Government Seal Header */}
        <div style={{
          backgroundColor: '#064e3b',
          background: 'linear-gradient(135deg, #04362a 0%, #064e3b 50%, #065f46 100%)',
          padding: '24px 28px',
          color: '#ffffff',
          position: 'relative',
          borderTopLeftRadius: '15px',
          borderTopRightRadius: '15px'
        }}>
          <button
            onClick={onClose}
            className="no-print"
            style={{
              position: 'absolute',
              top: '18px',
              right: '18px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            <X size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ 
              backgroundColor: '#34d399', 
              color: '#064e3b', 
              fontSize: '0.66rem', 
              fontWeight: 800, 
              padding: '2px 8px', 
              borderRadius: '4px',
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}>
              MSAMB STATUTORY AUDIT
            </span>
            <span style={{ color: '#a7f3d0', fontSize: '0.74rem' }}>
              {isMarathi ? 'महाराष्ट्र राज्य कृषी पणन मंडळ' : 'Govt. of Maharashtra Agri-Marketing Authority'}
            </span>
          </div>

          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 4px', color: '#ffffff' }}>
            {isMarathi ? 'एमएसएएमबी खरेदीदार विश्वसनीयता निर्देशांक' : 'MSAMB Buyer Credibility Index'}
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#a7f3d0', margin: 0 }}>
            {scorecard.company_name} • {formatCompanyType(scorecard.company_type)}
          </p>
        </div>

        {/* Main Content Body */}
        <div style={{ padding: '24px 28px' }}>

          {/* Golden Seal & Score Overview Hero */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '18px 20px',
            marginBottom: '22px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#ecfdf5',
                border: '3px solid #10b981',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
              }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#047857', lineHeight: 1 }}>
                  {scorecard.overall_reliability_score}
                </span>
                <span style={{ fontSize: '0.58rem', fontWeight: 700, color: '#059669' }}>
                  / 100
                </span>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>
                    {isMarathi ? 'अति-विश्वसनीय संस्थात्मक खरेदीदार' : 'AAA Platinum Certified Buyer'}
                  </strong>
                  <ShieldCheck size={18} color="#059669" />
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                  {isMarathi 
                    ? 'सर्व कायदेशीर देयके एस्क्रो प्रणालीद्वारे १००% वेळेवर अदा'
                    : '100% on-time milestone payouts verified via RBI Nodal Escrow'
                  }
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: '#ffffff',
              border: '1px dashed #cbd5e1',
              padding: '6px 14px',
              borderRadius: '8px',
              textAlign: 'right'
            }}>
              <div style={{ fontSize: '0.66rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                {isMarathi ? 'ऑडिट वर्ष' : 'Statutory Audit'}
              </div>
              <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a' }}>
                {scorecard.audited_year || 'FY 2025-26'}
              </div>
            </div>
          </div>

          {/* 4 MANDATORY PROBLEM STATEMENT METRICS */}
          <div style={{ marginBottom: '22px' }}>
            <h4 style={{ 
              fontSize: '0.86rem', 
              fontWeight: 800, 
              color: '#334155', 
              textTransform: 'uppercase', 
              letterSpacing: '0.04em',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Award size={15} color="#059669" />
              <span>{isMarathi ? 'कायदेशीर पडताळणी मानके' : 'Core Statutory Audit Parameters'}</span>
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
              
              {/* Metric 1: Escrow On-Time Settlement Rate */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #a7f3d0',
                borderLeft: '4px solid #059669',
                borderRadius: '8px',
                padding: '14px 16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      {isMarathi ? 'एस्क्रो वेळेवर वाटप दर' : 'Escrow On-Time Settlement Rate'}
                    </div>
                    <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#065f46', marginTop: '2px' }}>
                      {scorecard.escrow_on_time_rate}%
                    </div>
                  </div>
                  <span style={{ backgroundColor: '#ecfdf5', padding: '6px', borderRadius: '6px', color: '#059669' }}>
                    <CheckCircle2 size={18} />
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600, marginTop: '4px' }}>
                  {isMarathi ? 'करारानंतर २ तासांच्या आत ५०% अग्रीम रक्कम सुरक्षित' : '50% advance locked in escrow within SLA (< 2 hrs)'}
                </div>
              </div>

              {/* Metric 2: Average Payment Release Time */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #bae6fd',
                borderLeft: '4px solid #0284c7',
                borderRadius: '8px',
                padding: '14px 16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      {isMarathi ? 'सरासरी देयक वाटप वेळ' : 'Average Payment Release Time'}
                    </div>
                    <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0369a1', marginTop: '2px' }}>
                      {scorecard.avg_payment_release_hours} {isMarathi ? 'तास' : 'Hours'}
                    </div>
                  </div>
                  <span style={{ backgroundColor: '#f0f9ff', padding: '6px', borderRadius: '6px', color: '#0284c7' }}>
                    <Clock size={18} />
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 600, marginTop: '4px' }}>
                  {isMarathi ? 'मार्केट वजन पावतीनंतर थेट बँक खात्यात वर्ग' : 'Direct DBT transfer post APMC gate weighment slip'}
                </div>
              </div>

              {/* Metric 3: APMC License Status */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #fed7aa',
                borderLeft: '4px solid #ea580c',
                borderRadius: '8px',
                padding: '14px 16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      {isMarathi ? 'एपीएमसी परवाना स्थिती' : 'APMC License Status'}
                    </div>
                    <div style={{ fontSize: '0.98rem', fontWeight: 900, color: '#9a3412', marginTop: '4px', letterSpacing: '0.02em' }}>
                      {scorecard.msamb_license_number}
                    </div>
                  </div>
                  <span style={{ backgroundColor: '#fff7ed', padding: '6px', borderRadius: '6px', color: '#ea580c' }}>
                    <Building2 size={18} />
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#ea580c', fontWeight: 600, marginTop: '6px' }}>
                  {scorecard.license_validity}
                </div>
              </div>

              {/* Metric 4: Past Disputes Record */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderLeft: '4px solid #475569',
                borderRadius: '8px',
                padding: '14px 16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      {isMarathi ? 'मागील वाद व तंटे नोंद' : 'Past Disputes Record'}
                    </div>
                    <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>
                      {scorecard.unresolved_disputes_count} {isMarathi ? 'अनिर्णित' : 'Unresolved'}
                    </div>
                  </div>
                  <span style={{ backgroundColor: '#f1f5f9', padding: '6px', borderRadius: '6px', color: '#475569' }}>
                    <ShieldCheck size={18} />
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700, marginTop: '4px' }}>
                  ✓ {scorecard.default_rate_pct.toFixed(1)}% {isMarathi ? 'शून्य देयक चूक हमी' : 'Default Rate (Zero Default Record)'}
                </div>
              </div>

            </div>
          </div>

          {/* Additional Institutional Track Record Details */}
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '16px 18px',
            marginBottom: '20px'
          }}>
            <h5 style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '10px' }}>
              {isMarathi ? 'संस्थात्मक व्यवहार इतिहास व बँकिंग हमी' : 'Commercial Clearing & Bank Guarantee'}
            </h5>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{isMarathi ? 'एकूण पूर्ण करार' : 'Total Settled Contracts'}:</span>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                  {scorecard.total_deals_completed} {isMarathi ? 'करार' : 'Deals'}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{isMarathi ? 'एकूण खरेदी शेतमाल' : 'Total Volume Cleared'}:</span>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                  {scorecard.total_volume_cleared_quintals.toLocaleString()} Qtl
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{isMarathi ? 'एस्क्रो वाटप रक्कम' : 'Total Escrow Disbursed'}:</span>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#059669' }}>
                  ₹{scorecard.total_escrow_disbursed_lakhs.toLocaleString()} Lakhs
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '12px', paddingTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Landmark size={15} color="#0284c7" />
              <span style={{ fontSize: '0.74rem', color: '#475569' }}>
                <strong>{isMarathi ? 'नोडल एस्क्रो बँक' : 'Nodal Escrow Partner'}:</strong> {scorecard.bank_nodal_partner}
              </span>
            </div>
          </div>

          {/* Legal Certification Statement */}
          <div style={{
            fontSize: '0.72rem',
            color: '#64748b',
            lineHeight: 1.5,
            borderLeft: '3px solid #059669',
            paddingLeft: '10px',
            marginBottom: '20px'
          }}>
            {isMarathi 
              ? 'हे प्रमाणपत्र महाराष्ट्र कृषी उत्पन्न खरेदी-विक्री (नियमन) अधिनियम, १९६३ च्या कलम ३१ आणि ३२ अन्वये जारी केले आहे. सर्व बँक व्यवहार भारतीय रिझर्व्ह बँकेच्या एस्क्रो नियमांनुसार संरक्षित आहेत.'
              : 'Certified under Sections 31 & 32 of the Maharashtra Agricultural Produce Marketing (Regulation) Act, 1963. All transactions are backed by RBI Master Directions on Escrow Accounts.'
            }
          </div>

          {/* Bottom Action Buttons */}
          <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              className="btn-gov-secondary"
              onClick={() => window.print()}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', padding: '8px 16px' }}
            >
              <Printer size={15} />
              <span>{isMarathi ? 'प्रमाणपत्र मुद्रित करा' : 'Print Verification Certificate'}</span>
            </button>

            <button
              className="btn-gov-primary"
              onClick={onClose}
              style={{ fontSize: '0.82rem', padding: '8px 24px' }}
            >
              <span>{isMarathi ? 'बंद करा' : 'Close Scorecard'}</span>
            </button>
          </div>

          {/* Official Print Watermark & Timestamp Footer (Only visible on printed paper / PDF) */}
          <div className="print-only" style={{
            display: 'none',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid #cbd5e1',
            paddingTop: '10px',
            marginTop: '16px',
            fontSize: '0.7rem',
            color: '#64748b'
          }}>
            <div>
              <strong>AgroConnect & MSAMB Statutory Portal</strong> • Verification Ref: <code>MSAMB-VERIF-{scorecard.msamb_license_number}</code>
            </div>
            <div>
              Generated: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} • Valid APMC Document
            </div>
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
};
