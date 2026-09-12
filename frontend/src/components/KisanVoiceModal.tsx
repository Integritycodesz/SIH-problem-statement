import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, Volume2, VolumeX, 
  Sparkles, ArrowRight, ShieldCheck, CheckCircle2, 
  Truck, Building2, X 
} from 'lucide-react';
import { 
  processKisanVoiceQuery, 
  PRESET_VOICE_QUERIES, 
  type KisanVoiceAdviceResult 
} from '../utils/kisanVoiceAdvisor';

interface KisanVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: 'EN' | 'MR';
  onNavigateTab?: (tab: string, prefill?: any) => void;
}

export const KisanVoiceModal: React.FC<KisanVoiceModalProps> = ({
  isOpen,
  onClose,
  lang = 'EN',
  onNavigateTab
}) => {
  const [selectedLang, setSelectedLang] = useState<'MR' | 'HI' | 'EN'>(lang === 'MR' ? 'MR' : 'MR');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<KisanVoiceAdviceResult | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);

  // Sync initial language
  useEffect(() => {
    if (lang === 'MR') setSelectedLang('MR');
  }, [lang]);

  // Handle Stop Speech when modal closes
  useEffect(() => {
    if (!isOpen) {
      stopSpeech();
      stopListening();
    }
  }, [isOpen]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
      stopListening();
    };
  }, []);

  const stopSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const playSpeech = (text: string, voiceLang: 'MR' | 'HI' | 'EN') => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    const langCode = voiceLang === 'MR' ? 'mr-IN' : voiceLang === 'HI' ? 'hi-IN' : 'en-IN';
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    utterance.rate = 0.92;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const match = voices.find(v => 
      v.lang.toLowerCase().includes(langCode.toLowerCase()) || 
      (voiceLang !== 'EN' && v.lang.toLowerCase().includes('in'))
    );
    if (match) {
      utterance.voice = match;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleRunQuery = async (queryToRun: string, overrideLang?: 'MR' | 'HI' | 'EN') => {
    if (!queryToRun.trim()) return;
    const activeLang = overrideLang || selectedLang;
    setIsLoading(true);
    setSpeechError(null);
    setInputText(queryToRun);

    try {
      const output = await processKisanVoiceQuery(queryToRun, activeLang);
      setResult(output);
      playSpeech(output.spokenText, activeLang);
    } catch (err: any) {
      setSpeechError(err?.message || 'Error processing query');
    } finally {
      setIsLoading(false);
    }
  };

  // Start Browser Web Speech Recognition
  const startListening = () => {
    setSpeechError(null);
    stopSpeech();

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError(
        selectedLang === 'MR'
          ? 'आपल्या ब्राउझरमध्ये थेट मायक्रोफोन सपोर्ट उपलब्ध नाही. कृपया खालील तयार प्रश्नांवर क्लिक करा.'
          : 'Live microphone input is not supported by this browser. Please tap any preset query below.'
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = selectedLang === 'MR' ? 'mr-IN' : selectedLang === 'HI' ? 'hi-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          setInputText(transcript);
          handleRunQuery(transcript, selectedLang);
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setSpeechError(
            selectedLang === 'MR'
              ? 'मायक्रोफोन परवानगी नाकारली गेली. कृपया खालील तयार प्रश्नांवर क्लिक करून चाचणी करा.'
              : 'Microphone permission blocked. Please use the preset queries below for testing.'
          );
        } else if (event.error !== 'no-speech') {
          setSpeechError(`Microphone notice: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err: any) {
      setIsListening(false);
      setSpeechError('Microphone could not be started. Try preset queries.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        maxWidth: '680px',
        width: '100%',
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #cbd5e1',
        overflow: 'hidden',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        
        {/* Modal Header */}
        <div style={{
          backgroundColor: '#064e3b',
          color: '#ffffff',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 12px rgba(52, 211, 153, 0.5)'
            }}>
              <Mic size={20} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.05rem', fontWeight: 800 }}>
                  {selectedLang === 'MR' ? 'किसान व्हॉइस एआय सहाय्यक' : selectedLang === 'HI' ? 'किसान वॉयस एआई सहायक' : 'Kisan Voice & Price AI'}
                </span>
                <span style={{
                  backgroundColor: '#34d399',
                  color: '#064e3b',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: '12px',
                  letterSpacing: '0.04em'
                }}>
                  SIH AI ENGINE
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#a7f3d0' }}>
                {selectedLang === 'MR' 
                  ? 'मराठी व हिंदीमध्ये बोला किंवा खालील नमुना प्रश्नांवर क्लिक करा' 
                  : 'Speak naturally in Marathi, Hindi, or English for instant net-realization advice'}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              stopSpeech();
              stopListening();
              onClose();
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#a7f3d0',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Language Selector Strip */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>
              {selectedLang === 'MR' ? 'संभाषण भाषा निवडा:' : selectedLang === 'HI' ? 'भाषा चुनें:' : 'Select Speech Language:'}
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[
                { key: 'MR', label: 'मराठी (Marathi)' },
                { key: 'HI', label: 'हिंदी (Hindi)' },
                { key: 'EN', label: 'English' }
              ].map(item => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setSelectedLang(item.key as any);
                    stopSpeech();
                  }}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    border: '1px solid',
                    borderColor: selectedLang === item.key ? '#059669' : '#cbd5e1',
                    backgroundColor: selectedLang === item.key ? '#ecfdf5' : '#ffffff',
                    color: selectedLang === item.key ? '#065f46' : '#64748b',
                    cursor: 'pointer'
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Central Microphone Visualizer Pod */}
          <div style={{
            backgroundColor: isListening ? '#fef2f2' : isSpeaking ? '#ecfdf5' : '#f8fafc',
            border: `2px dashed ${isListening ? '#ef4444' : isSpeaking ? '#10b981' : '#cbd5e1'}`,
            borderRadius: '16px',
            padding: '24px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            position: 'relative',
            transition: 'all 0.3s ease'
          }}>
            
            {/* Pulsing Mic Button */}
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                backgroundColor: isListening ? '#dc2626' : '#059669',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isListening 
                  ? '0 0 0 10px rgba(239, 68, 68, 0.25), 0 0 25px rgba(239, 68, 68, 0.5)'
                  : isSpeaking
                  ? '0 0 0 8px rgba(16, 185, 129, 0.25), 0 0 20px rgba(16, 185, 129, 0.4)'
                  : '0 4px 14px rgba(5, 150, 105, 0.35)',
                transition: 'all 0.2s ease',
                transform: isListening ? 'scale(1.06)' : 'scale(1)'
              }}
              title={isListening ? "Click to stop listening" : "Click to speak"}
            >
              {isListening ? <MicOff size={28} /> : <Mic size={28} />}
            </button>

            <div style={{ marginTop: '14px', fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>
              {isListening 
                ? (selectedLang === 'MR' ? '🎙️ ऐकत आहे... कृपया बोला...' : selectedLang === 'HI' ? '🎙️ सुन रहा हूँ... बोलिए...' : '🎙️ Listening... Speak now...')
                : isSpeaking
                ? (selectedLang === 'MR' ? '🔊 शेतकरी सल्ला सांगत आहे...' : selectedLang === 'HI' ? '🔊 सलाह सुना रहा हूँ...' : '🔊 Playing spoken agricultural advice...')
                : (selectedLang === 'MR' ? 'बोलण्यासाठी मायक्रोफोनवर टॅप करा' : selectedLang === 'HI' ? 'बोलने के लिए माइक दबाएं' : 'Tap microphone to speak')}
            </div>

            <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px', maxWidth: '420px' }}>
              {selectedLang === 'MR'
                ? 'उदा. "माझ्या १० क्विंटल सोयाबीनला आज नागपूर बाजारात काय भाव मिळेल?"'
                : selectedLang === 'HI'
                ? 'उदा. "मेरे 20 क्विंटल सोयाबीन का लातूर और नागपुर मंडी में क्या भाव है?"'
                : 'e.g. "What price will 10 quintals of soybean fetch at Nagpur APMC?"'}
            </div>

            {/* Speech Status Pill or Stop Voice Button */}
            {isSpeaking && (
              <button
                type="button"
                onClick={stopSpeech}
                style={{
                  marginTop: '10px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #10b981',
                  borderRadius: '20px',
                  padding: '4px 12px',
                  fontSize: '0.72rem',
                  color: '#047857',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <VolumeX size={14} />
                <span>{selectedLang === 'MR' ? 'आवाज थांबवा' : 'Mute Voice'}</span>
              </button>
            )}

            {speechError && (
              <div style={{
                marginTop: '10px',
                fontSize: '0.72rem',
                color: '#b91c1c',
                backgroundColor: '#fee2e2',
                padding: '4px 10px',
                borderRadius: '6px'
              }}>
                {speechError}
              </div>
            )}
          </div>

          {/* Quick Preset Queries Strip for Instant Hackathon Judging */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Sparkles size={14} color="#059669" />
                <span>{selectedLang === 'MR' ? 'झटपट चाचणी प्रश्न (१-क्लिक डेमो):' : 'Quick Hackathon Demo Queries (1-Click):'}</span>
              </span>
              <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                {selectedLang === 'MR' ? 'आवाज सुरू नसेल तरी चालते' : 'Instant response'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {PRESET_VOICE_QUERIES.filter(q => q.lang === selectedLang || selectedLang === 'EN').map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleRunQuery(preset.label, preset.lang)}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '0.74rem',
                    color: '#1e293b',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#34d399';
                    e.currentTarget.style.backgroundColor = '#f0fdf4';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.backgroundColor = '#ffffff';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      backgroundColor: '#ecfdf5',
                      color: '#065f46',
                      padding: '1px 5px',
                      borderRadius: '4px'
                    }}>
                      {preset.badge}
                    </span>
                    <ArrowRight size={12} color="#059669" />
                  </div>
                  <span style={{ fontWeight: 600, lineHeight: 1.3 }}>{preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* AI Result Card */}
          {result && (
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid #a7f3d0',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
              borderLeft: '5px solid #059669'
            }}>
              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, backgroundColor: '#0f172a', color: '#ffffff', padding: '2px 6px', borderRadius: '4px' }}>
                      {result.entities.commodity}
                    </span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, backgroundColor: '#0284c7', color: '#ffffff', padding: '2px 6px', borderRadius: '4px' }}>
                      {result.entities.mandi} APMC
                    </span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, backgroundColor: '#10b981', color: '#ffffff', padding: '2px 6px', borderRadius: '4px' }}>
                      {result.entities.quantityQuintals} Qtl
                    </span>
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
                    {result.headline}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => playSpeech(result.spokenText, selectedLang)}
                  style={{
                    backgroundColor: isSpeaking ? '#059669' : '#eff6ff',
                    color: isSpeaking ? '#ffffff' : '#1d4ed8',
                    border: '1px solid #bfdbfe',
                    borderRadius: '20px',
                    padding: '5px 12px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  title="Replay Audio in Marathi/Hindi"
                >
                  <Volume2 size={14} />
                  <span>{isSpeaking ? 'Speaking...' : 'Listen Again (ऐका)'}</span>
                </button>
              </div>

              {/* Realization Metrics Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '8px',
                backgroundColor: '#f8fafc',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <div>
                  <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                    {selectedLang === 'MR' ? 'बाजारभाव (Spot)' : 'APMC Spot Rate'}
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                    ₹{result.spotPricePerQuintal.toLocaleString()}
                    <span style={{ fontSize: '0.7rem', fontWeight: 500, color: '#64748b' }}>/qtl</span>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                    {selectedLang === 'MR' ? 'CACP हमीभाव (MSP)' : 'CACP MSP Floor'}
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: result.mspDelta >= 0 ? '#059669' : '#dc2626' }}>
                    {result.mspFloorPerQuintal ? `₹${result.mspFloorPerQuintal.toLocaleString()}` : 'N/A'}
                    {result.mspFloorPerQuintal && (
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, marginLeft: '4px' }}>
                        ({result.mspDelta >= 0 ? `+₹${result.mspDelta}` : `-₹${Math.abs(result.mspDelta)}`})
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                    {selectedLang === 'MR' ? 'एकूण मूल्य (Gross)' : 'Gross Produce Value'}
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                    ₹{result.totalGrossValue.toLocaleString()}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.65rem', color: '#065f46', fontWeight: 700, textTransform: 'uppercase' }}>
                    {selectedLang === 'MR' ? 'निव्वळ नफा (Net In-Hand)' : 'Net Realization'}
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669' }}>
                    ₹{result.netInHandRealization.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.62rem', color: '#64748b' }}>
                    -₹{result.totalFreightCost} freight
                  </div>
                </div>
              </div>

              {/* Detailed Agricultural Advice Box */}
              <div style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '0.78rem',
                color: '#166534',
                lineHeight: 1.45
              }}>
                <strong>💡 {selectedLang === 'MR' ? 'एआय सल्ला:' : 'AI Mandi Advisory:'}</strong> {result.detailedAnalysis}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => {
                    stopSpeech();
                    onClose();
                    if (onNavigateTab) {
                      onNavigateTab('farmer', {
                        commodity: result.entities.commodity,
                        variety: `${result.entities.commodity} FAQ`,
                        price: result.spotPricePerQuintal,
                        mandi: `${result.entities.mandi} APMC`
                      });
                    }
                  }}
                  className="btn-gov-primary"
                  style={{ fontSize: '0.76rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  <CheckCircle2 size={14} />
                  <span>{selectedLang === 'MR' ? `१० क्विंटल शेतमाल नोंदवा` : 'List 10 Qtl Produce Lot'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    stopSpeech();
                    onClose();
                    if (onNavigateTab) onNavigateTab('demands');
                  }}
                  className="btn-gov-secondary"
                  style={{ fontSize: '0.76rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  <Building2 size={14} color="#059669" />
                  <span>{selectedLang === 'MR' ? 'खरेदीदार मागणी (Demands)' : 'View Buyer Demands'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    stopSpeech();
                    onClose();
                    if (onNavigateTab) onNavigateTab('intelligence');
                  }}
                  className="btn-gov-secondary"
                  style={{ fontSize: '0.76rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  <Truck size={14} color="#2563eb" />
                  <span>{selectedLang === 'MR' ? 'बाजारभाव व वाहतूक' : 'Check Geo-Arbitrage'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Fallback Text Input */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleRunQuery(inputText, selectedLang);
            }} 
            style={{ display: 'flex', gap: '8px', marginTop: '4px' }}
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={selectedLang === 'MR' ? 'किंवा येथे मराठीत प्रश्न टाईप करा...' : selectedLang === 'HI' ? 'यहाँ हिंदी में प्रश्न लिखें...' : 'Or type your question here...'}
              style={{
                flex: 1,
                padding: '8px 12px',
                fontSize: '0.8rem',
                border: '1px solid #cbd5e1',
                borderRadius: '8px'
              }}
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="btn-gov-primary"
              style={{ fontSize: '0.78rem', padding: '8px 14px' }}
            >
              {isLoading ? '...' : (selectedLang === 'MR' ? 'सल्ला मिळवा' : 'Ask AI')}
            </button>
          </form>

        </div>

        {/* Modal Footer */}
        <div style={{
          backgroundColor: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          padding: '10px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.7rem',
          color: '#64748b'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} color="#059669" />
            <span>Synchronized with Agmarknet APMC Daily Feeds & CACP 2024-25 MSP Floor</span>
          </div>
          <div>Web Speech Audio synthesis & SpeechRecognition engine</div>
        </div>

      </div>
    </div>
  );
};
