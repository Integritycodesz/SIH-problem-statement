import React, { useState, useEffect } from 'react';
import { 
  Warehouse, Snowflake, MapPin, 
  CheckCircle2, Printer, Truck, Percent, 
  QrCode
} from 'lucide-react';
import { api, type User, type StorageFacility, type StorageBooking } from '../services/api';
import type { Language } from '../utils/i18n';

interface StorageBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  facility: StorageFacility | null;
  lang?: Language;
  currentUser: User | null;
  prefillCommodity?: string;
  prefillQuantity?: number;
  onBookingSuccess?: (booking: StorageBooking) => void;
}

export const StorageBookingModal: React.FC<StorageBookingModalProps> = ({
  isOpen,
  onClose,
  facility,
  lang = 'EN',
  currentUser,
  prefillCommodity,
  prefillQuantity,
  onBookingSuccess
}) => {
  const isMr = lang === 'MR';

  const [commodity, setCommodity] = useState<string>('Onion');
  const [quantity, setQuantity] = useState<number | ''>(100);
  const [durationDays, setDurationDays] = useState<number>(30);
  const [inwardDate, setInwardDate] = useState<string>('');
  const [farmerName, setFarmerName] = useState<string>('');
  const [farmerPhone, setFarmerPhone] = useState<string>('');
  const [needTransport, setNeedTransport] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [confirmedBooking, setConfirmedBooking] = useState<StorageBooking | null>(null);

  useEffect(() => {
    if (isOpen) {
      setConfirmedBooking(null);
      if (prefillCommodity) setCommodity(prefillCommodity);
      if (prefillQuantity) setQuantity(prefillQuantity);
      setFarmerName(currentUser?.name || 'Ramesh B. Patil');
      setFarmerPhone(currentUser?.phone || '+91 98220 12345');

      const tmrw = new Date();
      tmrw.setDate(tmrw.getDate() + 1);
      setInwardDate(tmrw.toISOString().split('T')[0]);
    }
  }, [isOpen, currentUser, prefillCommodity, prefillQuantity]);

  if (!isOpen || !facility) return null;

  const isColdStorage = facility.facility_type === 'COLD_STORAGE';
  const qty = Number(quantity) || 0;
  const days = Number(durationDays) || 30;
  const tariffPerQtlPerDay = facility.daily_rent_per_quintal || (isColdStorage ? 1.80 : 1.20);
  const dailyRent = Math.round(tariffPerQtlPerDay * qty);
  const totalRent = Math.round(dailyRent * days);
  const handlingFee = Math.round(qty * 15);
  const totalAmount = totalRent + handlingFee;
  const commoditySpotRate = api.getMSPFloorPrice(commodity)?.msp_price || 2450;
  const approxEnwrAdvance = Math.round(qty * commoditySpotRate * 0.70); // 70% of spot/MSP base value

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qty || qty <= 0) {
      alert(isMr ? 'कृपया वैध शेतमाल वजन (क्विंटल) प्रविष्ट करा.' : 'Please enter valid produce quantity in quintals.');
      return;
    }
    if (!farmerName.trim() || !farmerPhone.trim()) {
      alert(isMr ? 'कृपया आपले नाव आणि संपर्क क्रमांक भरा.' : 'Please enter your name and phone number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const booking = await api.bookStorageSpace({
        facility_id: facility.id,
        facility_name: facility.name,
        facility_type: facility.facility_type,
        farmer_id: currentUser?.id || 1,
        farmer_name: farmerName,
        farmer_phone: farmerPhone,
        commodity,
        quantity_quintals: qty,
        duration_days: days,
        inward_date: inwardDate,
        daily_tariff: tariffPerQtlPerDay,
        need_transport: needTransport
      });

      setConfirmedBooking(booking);
      if (onBookingSuccess) onBookingSuccess(booking);
    } catch (err: any) {
      console.error('Storage booking error:', err);
      alert(isMr ? 'गोदाम जागा आरक्षित करताना त्रुटी आली.' : 'Error booking storage space.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div 
        className="modal-content" 
        style={{ 
          maxWidth: '680px', 
          width: '95%', 
          maxHeight: '90vh', 
          overflowY: 'auto',
          padding: '24px',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.25)'
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '18px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ 
                backgroundColor: isColdStorage ? '#eff6ff' : '#ecfdf5', 
                color: isColdStorage ? '#1d4ed8' : '#065f46', 
                padding: '3px 10px', 
                borderRadius: 'var(--radius-full)', 
                fontSize: '0.74rem', 
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                {isColdStorage ? <Snowflake size={13} /> : <Warehouse size={13} />}
                {isColdStorage ? (isMr ? 'शीतगृह (Cold Storage)' : 'Cold Storage Facility') : (isMr ? 'WDRA गोदाम (Dry Godown)' : 'WDRA Accredited Godown')}
              </span>
              <span style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 700 }}>
                ● {isMr ? 'सक्रिय साठवणूक आरक्षण' : 'Live Space Booking'}
              </span>
            </div>
            <h3 style={{ fontSize: '1.28rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {confirmedBooking 
                ? (isMr ? 'गोदाम साठवणूक अधिकृत वाटप पावती' : 'Warehouse Storage Allotment Slip') 
                : (isMr ? `${facility.name} — जागा आरक्षण` : `Book Storage: ${facility.name}`)}
            </h3>
            <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={12} /> {facility.address} ({facility.district})
            </div>
          </div>

          <button 
            type="button" 
            onClick={onClose} 
            style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '1.3rem', cursor: 'pointer', padding: '4px 8px' }}
          >
            ✕
          </button>
        </div>

        {/* VIEW 1: SUCCESS RECEIPT */}
        {confirmedBooking ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ 
              backgroundColor: '#ecfdf5', 
              border: '1px solid #a7f3d0', 
              borderRadius: 'var(--radius-md)', 
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <CheckCircle2 size={36} color="#059669" />
              <div>
                <h4 style={{ margin: 0, color: '#065f46', fontSize: '1.05rem', fontWeight: 800 }}>
                  {isMr ? 'जागा आरक्षण यशस्वीरित्या निश्चित झाले!' : 'Storage Space Allotment Confirmed!'}
                </h4>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: '#047857' }}>
                  {isMr 
                    ? `आपला वाटप संदर्भ क्रमांक: ${confirmedBooking.id}. शेतमाल दाखल करताना गेटवर हा पास दाखवा.` 
                    : `Allotment Token #${confirmedBooking.id}. Present this digital pass at the warehouse inward checkpost.`}
                </p>
              </div>
            </div>

            {/* Official Digital Allotment Slip */}
            <div style={{ 
              border: '2px dashed #0284c7', 
              borderRadius: 'var(--radius-md)', 
              padding: '20px', 
              backgroundColor: '#f8fafc',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '14px' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 800, textTransform: 'uppercase' }}>
                    Maharashtra State Agricultural Marketing Board (MSAMB)
                  </div>
                  <strong style={{ fontSize: '1.1rem', color: '#0f172a', display: 'block' }}>
                    {confirmedBooking.facility_name}
                  </strong>
                  <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                    {facility.address}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block' }}>Booking Allotment ID</span>
                  <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>
                    {confirmedBooking.id}
                  </span>
                </div>
              </div>

              {/* Specs Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                <div style={{ backgroundColor: '#ffffff', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block' }}>Farmer / Depositor</span>
                  <strong style={{ fontSize: '0.84rem', color: '#0f172a' }}>{confirmedBooking.farmer_name}</strong>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{confirmedBooking.farmer_phone}</div>
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block' }}>Commodity</span>
                  <strong style={{ fontSize: '0.84rem', color: '#059669' }}>{confirmedBooking.commodity}</strong>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{confirmedBooking.quantity_quintals} Qtl ({(confirmedBooking.quantity_quintals / 10).toFixed(1)} MT)</div>
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block' }}>Duration</span>
                  <strong style={{ fontSize: '0.84rem', color: '#0f172a' }}>{confirmedBooking.duration_days} Days</strong>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Inward: {confirmedBooking.inward_date}</div>
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block' }}>Total Estimated Tariff</span>
                  <strong style={{ fontSize: '0.94rem', color: '#059669' }}>₹{confirmedBooking.total_amount.toLocaleString()}</strong>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>₹{confirmedBooking.daily_tariff}/Qtl/Day</div>
                </div>
              </div>

              {/* Climate & Incharge Note */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#eff6ff', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid #bfdbfe' }}>
                <div style={{ fontSize: '0.76rem', color: '#1e40af' }}>
                  {isColdStorage ? (
                    <span>❄️ Preserved under controlled climate: <strong>{facility.temperature_celsius ?? 3.5}°C</strong> & <strong>{facility.humidity_percent ?? 85}% RH</strong></span>
                  ) : (
                    <span>🌾 WDRA Scientific Aeration & Fumigated Storage: <strong>{facility.temperature_celsius ?? 22}°C</strong></span>
                  )}
                  <div style={{ fontSize: '0.72rem', color: '#3b82f6', marginTop: '2px' }}>
                    Warehouse Incharge: <strong>{facility.contact_person}</strong> ({facility.contact_phone})
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1d4ed8' }}>
                  <QrCode size={36} />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={handlePrint}
                className="btn-gov-secondary"
                style={{ padding: '8px 16px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Printer size={15} /> {isMr ? 'पावती प्रिंट करा' : 'Print Allotment Pass'}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="btn-gov-primary"
                style={{ padding: '8px 22px', fontSize: '0.82rem' }}
              >
                {isMr ? 'बंद करा' : 'Done'}
              </button>
            </div>
          </div>
        ) : (
          /* VIEW 2: BOOKING FORM */
          <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Facility Specs Banner */}
            <div style={{ 
              backgroundColor: '#f8fafc', 
              border: '1px solid #e2e8f0', 
              borderRadius: 'var(--radius-md)', 
              padding: '12px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <span style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                  Available Vacant Capacity
                </span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  {facility.available_capacity_mt.toLocaleString()} MT{' '}
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>
                    ({Math.round((facility.available_capacity_mt / facility.total_capacity_mt) * 100)}% vacant)
                  </span>
                </div>
                {facility.temperature_celsius !== undefined && (
                  <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '2px' }}>
                    {isColdStorage ? '❄️ Climate: ' : '🌡️ Ambient: '}
                    <strong>{facility.temperature_celsius}°C</strong>, <strong>{facility.humidity_percent}% RH</strong>
                  </div>
                )}
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                  Regulated Tariff
                </span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669' }}>
                  ₹{tariffPerQtlPerDay.toFixed(2)}{' '}
                  <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 500 }}>/ Qtl / Day</span>
                </div>
                <span style={{ fontSize: '0.68rem', color: '#0369a1', fontWeight: 600 }}>
                  ✓ MSAMB & WDRA Subsidized
                </span>
              </div>
            </div>

            {/* Inputs: Commodity & Quantity */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px', display: 'block' }}>
                  {isMr ? 'साठवणुकीचा शेतमाल (Commodity):' : 'Commodity to Preserve:'}
                </label>
                <select
                  value={commodity}
                  onChange={(e) => setCommodity(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', fontSize: '0.84rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
                  required
                >
                  <option value="Onion">Onion (कांदा - Garwa / Red)</option>
                  <option value="Tomato">Tomato (टोमॅटो - Hybrid)</option>
                  <option value="Potato">Potato (बटाटा - Cold Chain)</option>
                  <option value="Soybean">Soybean (सोयाबीन - Yellow JS-335)</option>
                  <option value="Cotton">Cotton (कापूस - Long Staple)</option>
                  <option value="Wheat">Wheat (गहू - Sharbati / Lokwan)</option>
                  <option value="Gram">Gram / Chana (हरभरा)</option>
                  <option value="Banana">Banana (केळी - Grand Naine)</option>
                  <option value="Orange">Orange / Santra (संत्रा)</option>
                  <option value="Grapes">Grapes (द्राक्षे - Export Grade)</option>
                  <option value="Pomegranate">Pomegranate (डाळिंब - Bhagwa)</option>
                  <option value="Garlic">Garlic (लसूण)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px', display: 'block' }}>
                  {isMr ? 'साठवणूक वजन (क्विंटल):' : 'Quantity to Inward (Quintals):'}
                </label>
                <input
                  type="number"
                  min={10}
                  step={10}
                  max={facility.available_capacity_mt * 10}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 100"
                  style={{ width: '100%', padding: '8px 10px', fontSize: '0.84rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
                  required
                />
                <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>
                  = {((Number(quantity) || 0) / 10).toFixed(1)} MT
                </div>
              </div>
            </div>

            {/* Inputs: Duration Preset Chips & Inward Date */}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px', display: 'block' }}>
                {isMr ? 'साठवणूक कालावधी (दिवस):' : 'Holding Duration (Days):'}
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                {[15, 30, 45, 60, 90, 180].map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDurationDays(d)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 'var(--radius-full)',
                      border: durationDays === d ? '2px solid #059669' : '1px solid #cbd5e1',
                      backgroundColor: durationDays === d ? '#ecfdf5' : '#ffffff',
                      color: durationDays === d ? '#065f46' : '#475569',
                      fontSize: '0.78rem',
                      fontWeight: durationDays === d ? 800 : 500,
                      cursor: 'pointer'
                    }}
                  >
                    {d} {isMr ? 'दिवस' : 'Days'}
                  </button>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px', display: 'block' }}>
                    {isMr ? 'दाखल होण्याची अंदाजे तारीख:' : 'Expected Inward Date:'}
                  </label>
                  <input
                    type="date"
                    value={inwardDate}
                    onChange={(e) => setInwardDate(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '0.84rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px', display: 'block' }}>
                    {isMr ? 'नोंदणीकृत मोबाइल क्रमांक:' : 'Farmer Contact Phone:'}
                  </label>
                  <input
                    type="tel"
                    value={farmerPhone}
                    onChange={(e) => setFarmerPhone(e.target.value)}
                    placeholder="+91 98220 XXXXX"
                    style={{ width: '100%', padding: '8px 10px', fontSize: '0.84rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Transit Assistance Checkbox */}
            <div style={{ backgroundColor: '#f0fdf4', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                id="needTransportCheck"
                checked={needTransport}
                onChange={(e) => setNeedTransport(e.target.checked)}
                style={{ cursor: 'pointer', width: '16px', height: '16px' }}
              />
              <label htmlFor="needTransportCheck" style={{ fontSize: '0.78rem', color: '#166534', cursor: 'pointer', fontWeight: 600 }}>
                <Truck size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                {isMr 
                  ? 'शेत बांधावरून शीतगृहापर्यंत वाहतूक व्यवस्था (APMC Aggregated Truckload) हवी आहे का?' 
                  : 'Require farmgate-to-storage aggregate truck dispatch (Logistics Engine)?'}
              </label>
            </div>

            {/* Live Financial Breakdown Card */}
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', padding: '14px' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginBottom: '8px' }}>
                {isMr ? 'अंदाजे साठवणूक खर्च व कर्ज पात्रता' : 'Estimated Storage Tariff & Financing Summary'}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#475569', marginBottom: '4px' }}>
                <span>Daily Rent ({qty} Qtl @ ₹{tariffPerQtlPerDay}/day):</span>
                <strong>₹{dailyRent.toLocaleString()}/day</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#475569', marginBottom: '4px' }}>
                <span>Total Storage Rent ({days} days):</span>
                <strong>₹{totalRent.toLocaleString()}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#475569', marginBottom: '6px' }}>
                <span>Inward Handling & Quality Assay (₹15/qtl):</span>
                <strong>₹{handlingFee.toLocaleString()}</strong>
              </div>

              <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '0.94rem', color: '#0f172a', fontWeight: 800 }}>
                <span>{isMr ? 'एकूण अंदाजे देय रक्कम:' : 'Total Estimated Outlay:'}</span>
                <span style={{ color: '#059669' }}>₹{totalAmount.toLocaleString()}</span>
              </div>

              {facility.enwr_pledge_eligible && (
                <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem', color: '#1d4ed8' }}>
                  <span><Percent size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> <strong>e-NWR 70% Loan Value:</strong></span>
                  <strong>Up to ₹{approxEnwrAdvance.toLocaleString()} instant cash advance</strong>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '6px' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn-gov-secondary"
                style={{ padding: '8px 16px', fontSize: '0.82rem' }}
              >
                {isMr ? 'रद्द करा' : 'Cancel'}
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-gov-primary"
                style={{ padding: '8px 24px', fontSize: '0.84rem', backgroundColor: '#059669', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
              >
                {isSubmitting ? (
                  <span>{isMr ? 'नोंदणी करत आहे...' : 'Confirming Reservation...'}</span>
                ) : (
                  <span>
                    {isColdStorage ? <Snowflake size={14} style={{ verticalAlign: 'middle' }} /> : <Warehouse size={14} style={{ verticalAlign: 'middle' }} />}{' '}
                    {isMr ? 'जागा आरक्षण निश्चित करा' : 'Confirm Space Reservation'}
                  </span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
