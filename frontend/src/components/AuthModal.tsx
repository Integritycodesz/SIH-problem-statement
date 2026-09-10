import React, { useState } from 'react';
import { 
  X, ShieldCheck, UserCheck, Smartphone, CheckCircle, 
  ArrowRight, Lock, KeyRound, AlertCircle, Building2, UserPlus
} from 'lucide-react';
import { type User, api } from '../services/api';
import { type UserRole } from '../types';
import { type Language } from '../utils/i18n';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  allUsers: User[];
  pendingMessage?: string;
  lang?: Language;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  allUsers,
  pendingMessage,
  lang = 'EN'
}) => {
  const [authTab, setAuthTab] = useState<'persona' | 'otp' | 'register'>('persona');
  
  // OTP Form State
  const [phone, setPhone] = useState<string>('9822012345');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpValue, setOtpValue] = useState<string>('');
  const [otpError, setOtpError] = useState<string>('');

  // Register Form State
  const [regName, setRegName] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regRole, setRegRole] = useState<UserRole>('FARMER');
  const [regDistrict, setRegDistrict] = useState<string>('Nashik');
  const [regAadhaar, setRegAadhaar] = useState<string>('');
  const [isRegistering, setIsRegistering] = useState<boolean>(false);

  if (!isOpen) return null;

  // Handle Demo Persona Login
  const handlePersonaSelect = (user: User) => {
    onLoginSuccess(user);
  };

  // Handle Send OTP
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setOtpError(lang === 'MR' ? 'कृपया वैध १० अंकी मोबाईल क्रमांक टाका' : 'Please enter a valid 10-digit mobile number');
      return;
    }
    setOtpError('');
    setOtpSent(true);
    setOtpValue('123456'); // Auto-fill standard test OTP for convenience
  };

  // Handle Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpValue !== '123456' && otpValue.length < 4) {
      setOtpError(lang === 'MR' ? 'अवैध OTP. चाचणीसाठी १२३४५६ वापरा' : 'Invalid OTP. Use 123456 for testing.');
      return;
    }

    // Look for matching user by phone, or create default verified user
    const existing = allUsers.find(u => u.phone.includes(phone.slice(-6)));
    if (existing) {
      onLoginSuccess(existing);
    } else {
      const newUser: User = {
        id: Math.floor(200 + Math.random() * 800),
        name: `Kisan User (${phone.slice(-4)})`,
        phone: phone,
        role: 'FARMER',
        district: 'Nashik',
        state: 'Maharashtra',
        kyc_verified: true,
        rating: 4.8,
        created_at: new Date().toISOString()
      };
      onLoginSuccess(newUser);
    }
  };

  // Handle Register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regPhone.trim()) {
      alert(lang === 'MR' ? 'कृपया नाव आणि फोन भरा' : 'Please fill your name and phone number');
      return;
    }
    setIsRegistering(true);
    try {
      const newUser: User = {
        id: Math.floor(300 + Math.random() * 700),
        name: regName.trim(),
        phone: regPhone.trim(),
        email: `${regName.toLowerCase().replace(/\s+/g, '')}@agroconnect.in`,
        role: regRole,
        district: regDistrict,
        state: 'Maharashtra',
        kyc_verified: true,
        rating: 5.0,
        created_at: new Date().toISOString()
      };
      // Register in api store
      if (api.createUser) {
        await api.createUser(newUser);
      }
      onLoginSuccess(newUser);
    } catch (err) {
      console.error('Registration failed:', err);
    } finally {
      setIsRegistering(false);
    }
  };

  const defaultPersonas = [
    {
      role: 'FARMER',
      title: lang === 'MR' ? 'शेतकरी / FPO प्रतिनिधी' : 'Farmer / FPO Delegate',
      user: allUsers.find(u => u.role === 'FARMER') || {
        id: 1, name: 'Ramesh Patil', phone: '9822012345', role: 'FARMER', district: 'Nashik', state: 'Maharashtra', kyc_verified: true, rating: 4.9, created_at: ''
      },
      tag: 'Nashik Kisan Samruddhi FPC',
      badgeColor: '#059669',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'
    },
    {
      role: 'BUYER',
      title: lang === 'MR' ? 'संस्थात्मक खरेदीदार' : 'Corporate Institutional Buyer',
      user: allUsers.find(u => u.role === 'BUYER') || {
        id: 8, name: 'Sahyadri Agro Ltd (Pravin Joshi)', phone: '9821011111', role: 'BUYER', district: 'Nashik', state: 'Maharashtra', kyc_verified: true, rating: 4.9, created_at: ''
      },
      tag: 'Sahyadri Mega Processing Hub',
      badgeColor: '#0284c7',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80'
    },
    {
      role: 'OFFICIAL',
      title: lang === 'MR' ? 'APMC राज्य लवाद अधिकारी' : 'APMC Official Arbiter',
      user: allUsers.find(u => u.role === 'OFFICIAL') || {
        id: 12, name: 'Dr. V. K. Kadam (APMC Arbiter)', phone: '9820099999', role: 'OFFICIAL', district: 'Pune', state: 'Maharashtra', kyc_verified: true, rating: 5.0, created_at: ''
      },
      tag: 'Maharashtra State Agrimarketing Board (MSAMB)',
      badgeColor: '#7c3aed',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80'
    }
  ];

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div 
        className="modal-content" 
        style={{ 
          maxWidth: '520px', 
          width: '94%', 
          padding: 0, 
          overflow: 'hidden',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.25)'
        }}
      >
        {/* 1. Official Header Bar */}
        <div style={{ 
          backgroundColor: '#065f46', 
          color: '#ffffff', 
          padding: '20px 24px',
          position: 'relative'
        }}>
          <button 
            onClick={onClose}
            style={{ 
              position: 'absolute', 
              top: '16px', 
              right: '16px', 
              background: 'rgba(255,255,255,0.15)', 
              border: 'none', 
              color: '#ffffff',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            title="Close"
          >
            <X size={16} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{ 
              width: '36px', 
              height: '36px', 
              borderRadius: '8px', 
              backgroundColor: '#ffffff', 
              color: '#065f46',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              fontWeight: 800
            }}>
              🌾
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  {lang === 'MR' ? 'ॲग्रो-कनेक्ट सुरक्षित प्रवेश' : 'AgroConnect Secure Sign In'}
                </h3>
                <span style={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)', 
                  color: '#ffffff', 
                  fontSize: '0.62rem', 
                  fontWeight: 700, 
                  padding: '1px 6px', 
                  borderRadius: '4px' 
                }}>
                  MSAMB
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#a7f3d0' }}>
                {lang === 'MR' ? 'महाराष्ट्र शासन • थेट APMC डिजिटल व्यवहार व्यासपीठ' : 'Govt. of Maharashtra • Direct APMC Digital Settlement'}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Contextual Message Banner (If user clicked a protected action) */}
        {pendingMessage && (
          <div style={{ 
            backgroundColor: '#fef3c7', 
            borderBottom: '1px solid #fde68a', 
            padding: '10px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#92400e',
            fontSize: '0.78rem',
            fontWeight: 600
          }}>
            <AlertCircle size={16} color="#d97706" style={{ flexShrink: 0 }} />
            <span>{pendingMessage}</span>
          </div>
        )}

        {/* 3. Tab Selector */}
        <div style={{ 
          display: 'flex', 
          borderBottom: '1px solid #e2e8f0', 
          backgroundColor: '#f8fafc',
          padding: '4px 16px 0'
        }}>
          <button
            type="button"
            onClick={() => setAuthTab('persona')}
            style={{
              flex: 1,
              padding: '10px 6px',
              fontSize: '0.78rem',
              fontWeight: 700,
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: authTab === 'persona' ? '2.5px solid #059669' : '2.5px solid transparent',
              color: authTab === 'persona' ? '#065f46' : '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <UserCheck size={14} />
            <span>{lang === 'MR' ? '१-क्लिक डेमो प्रवेश' : '1-Click Demo Personas'}</span>
          </button>

          <button
            type="button"
            onClick={() => setAuthTab('otp')}
            style={{
              flex: 1,
              padding: '10px 6px',
              fontSize: '0.78rem',
              fontWeight: 700,
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: authTab === 'otp' ? '2.5px solid #059669' : '2.5px solid transparent',
              color: authTab === 'otp' ? '#065f46' : '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Smartphone size={14} />
            <span>{lang === 'MR' ? 'मोबाईल / आधार OTP' : 'Phone / Aadhaar OTP'}</span>
          </button>

          <button
            type="button"
            onClick={() => setAuthTab('register')}
            style={{
              flex: 1,
              padding: '10px 6px',
              fontSize: '0.78rem',
              fontWeight: 700,
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: authTab === 'register' ? '2.5px solid #059669' : '2.5px solid transparent',
              color: authTab === 'register' ? '#065f46' : '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <UserPlus size={14} />
            <span>{lang === 'MR' ? 'नवीन नोंदणी' : 'New Registration'}</span>
          </button>
        </div>

        {/* 4. Tab Body Content */}
        <div style={{ padding: '20px 24px', backgroundColor: '#ffffff' }}>
          {/* TAB 1: 1-Click Demo Personas */}
          {authTab === 'persona' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
                {lang === 'MR' 
                  ? 'हॅकाथॉन मूल्यांकनासाठी खालीलपैकी कोणत्याही एका भूमिकेत त्वरित प्रवेश करा:' 
                  : 'Select an authenticated role below to test all protected portal features instantly:'
                }
              </div>

              {defaultPersonas.map((p) => (
                <div
                  key={p.role}
                  onClick={() => handlePersonaSelect(p.user as User)}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    backgroundColor: '#ffffff'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = p.badgeColor;
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.backgroundColor = '#ffffff';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img 
                      src={p.avatar} 
                      alt={p.user.name} 
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} 
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>{p.user.name}</strong>
                        <span style={{ 
                          fontSize: '0.65rem', 
                          fontWeight: 700, 
                          color: p.badgeColor, 
                          backgroundColor: `${p.badgeColor}15`, 
                          padding: '1px 6px', 
                          borderRadius: '4px' 
                        }}>
                          {p.role}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {p.title} • {p.tag}
                      </div>
                    </div>
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px', 
                    color: p.badgeColor, 
                    fontWeight: 700, 
                    fontSize: '0.76rem' 
                  }}>
                    <span>Sign In</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: Phone / Aadhaar OTP Sign-In */}
          {authTab === 'otp' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {!otpSent ? (
                <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                      {lang === 'MR' ? 'नोंदणीकृत मोबाईल किंवा आधार क्रमांक' : 'Registered Mobile Number or Aadhaar'}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Smartphone size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '11px' }} />
                      <input 
                        type="text"
                        placeholder="e.g. 9822012345"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        style={{ width: '100%', paddingLeft: '36px', paddingRight: '12px', height: '40px', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>

                  {otpError && (
                    <div style={{ fontSize: '0.74rem', color: '#b91c1c' }}>
                      {otpError}
                    </div>
                  )}

                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {lang === 'MR' 
                      ? 'आपल्या मोबाईलवर ६ अंकी पडताळणी कोड (OTP) पाठवला जाईल.' 
                      : 'A 6-digit verification code will be dispatched to this mobile via Govt SMS gateway.'}
                  </div>

                  <button 
                    type="submit" 
                    className="btn-gov-primary"
                    style={{ width: '100%', justifyContent: 'center', height: '40px', fontSize: '0.85rem' }}
                  >
                    <span>{lang === 'MR' ? 'OTP पाठवा' : 'Send Verification OTP'}</span>
                    <ArrowRight size={15} />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ 
                    backgroundColor: '#ecfdf5', 
                    border: '1px solid #a7f3d0', 
                    padding: '8px 12px', 
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.74rem',
                    color: '#065f46',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <CheckCircle size={14} color="#059669" />
                    <span>OTP sent to +91 {phone}. Use test code: <strong>123456</strong></span>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                      {lang === 'MR' ? '६-अंकी पडताळणी OTP टाका' : 'Enter 6-Digit OTP'}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <KeyRound size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '11px' }} />
                      <input 
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        value={otpValue}
                        onChange={(e) => setOtpValue(e.target.value)}
                        style={{ width: '100%', paddingLeft: '36px', height: '40px', fontSize: '1rem', letterSpacing: '4px', fontWeight: 700 }}
                      />
                    </div>
                  </div>

                  {otpError && (
                    <div style={{ fontSize: '0.74rem', color: '#b91c1c' }}>
                      {otpError}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Didn't receive?</span>
                    <span 
                      style={{ color: '#059669', fontWeight: 700, cursor: 'pointer' }}
                      onClick={() => { setOtpValue('123456'); alert('Test OTP reloaded: 123456'); }}
                    >
                      Resend OTP (Auto-fill 123456)
                    </span>
                  </div>

                  <button 
                    type="submit" 
                    className="btn-gov-primary"
                    style={{ width: '100%', justifyContent: 'center', height: '40px', fontSize: '0.85rem' }}
                  >
                    <Lock size={15} />
                    <span>{lang === 'MR' ? 'पडताळणी करा आणि पुढे जा' : 'Verify & Sign In'}</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: New User Registration & KYC */}
          {authTab === 'register' && (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  {lang === 'MR' ? 'पूर्ण नाव' : 'Full Name'} *
                </label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Dnyaneshwar B. Gaikwad"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', fontSize: '0.82rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    {lang === 'MR' ? 'मोबाईल क्रमांक' : 'Mobile Number'} *
                  </label>
                  <input 
                    type="tel"
                    required
                    placeholder="98XXXXXXXX"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '0.82rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    {lang === 'MR' ? 'पोर्टल भूमिका' : 'Portal Role'} *
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '0.82rem' }}
                  >
                    <option value="FARMER">Farmer / FPO Producer</option>
                    <option value="BUYER">Corporate Buyer / Processor</option>
                    <option value="OFFICIAL">APMC Market Official</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    {lang === 'MR' ? 'जिल्हा' : 'District'} *
                  </label>
                  <select
                    value={regDistrict}
                    onChange={(e) => setRegDistrict(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '0.82rem' }}
                  >
                    <option value="Nashik">Nashik</option>
                    <option value="Pune">Pune</option>
                    <option value="Ahmednagar">Ahmednagar</option>
                    <option value="Solapur">Solapur</option>
                    <option value="Nagpur">Nagpur</option>
                    <option value="Mumbai">Mumbai Suburban</option>
                    <option value="Latur">Latur</option>
                    <option value="Kolhapur">Kolhapur</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Aadhaar / GST / License (Opt)
                  </label>
                  <input 
                    type="text"
                    placeholder="XXXX-XXXX-1234"
                    value={regAadhaar}
                    onChange={(e) => setRegAadhaar(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '0.82rem' }}
                  />
                </div>
              </div>

              <div style={{ 
                backgroundColor: '#f8fafc', 
                border: '1px solid #e2e8f0', 
                borderRadius: 'var(--radius-sm)', 
                padding: '8px 12px', 
                fontSize: '0.7rem', 
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <ShieldCheck size={14} color="#059669" />
                <span>Instant KYC verification enabled via AgriStack & DBT Maharashtra API.</span>
              </div>

              <button 
                type="submit" 
                disabled={isRegistering}
                className="btn-gov-primary"
                style={{ width: '100%', justifyContent: 'center', height: '38px', fontSize: '0.84rem', marginTop: '4px' }}
              >
                <UserCheck size={15} />
                <span>{isRegistering ? 'Registering...' : (lang === 'MR' ? 'नोंदणी करा आणि पुढे जा' : 'Register & Enter Portal')}</span>
              </button>
            </form>
          )}
        </div>

        {/* 5. Footer Trust Disclaimer */}
        <div style={{ 
          backgroundColor: '#f8fafc', 
          borderTop: '1px solid #f1f5f9', 
          padding: '12px 20px', 
          fontSize: '0.68rem', 
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Building2 size={13} color="#64748b" />
            <span>Govt. of Maharashtra AgriTech Secure Gateway</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#059669', fontWeight: 600 }}>
            <ShieldCheck size={13} />
            <span>256-Bit SSL Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
