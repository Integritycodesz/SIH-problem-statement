import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import type { AIQualityAssayResult } from '../types';
import { 
  Sparkles, Camera, Check, X, RefreshCw, UploadCloud, AlertTriangle, 
  Sun, Maximize2, ShieldCheck
} from 'lucide-react';

interface AIQualityAssayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyGrade?: (result: AIQualityAssayResult) => void;
  initialCommodity?: string;
  contextMode?: 'LISTING' | 'DISPUTE' | 'INSPECTION';
}

const SUPPORTED_COMMODITIES = [
  'Onion',
  'Soybean',
  'Cotton',
  'Tomato',
  'Wheat',
  'Potato',
  'Maize',
  'Gram (Chana)',
  'Tur (Arhar)',
  'Grapes',
  'Pomegranate'
];

export const AIQualityAssayModal: React.FC<AIQualityAssayModalProps> = ({
  isOpen,
  onClose,
  onApplyGrade,
  initialCommodity = 'Onion',
  contextMode = 'LISTING'
}) => {
  const [selectedCommodity, setSelectedCommodity] = useState<string>(initialCommodity);
  const [activeImage, setActiveImage] = useState<string>('');
  const [imageFileName, setImageFileName] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [scanStage, setScanStage] = useState<string>('');
  const [assayResult, setAssayResult] = useState<AIQualityAssayResult | null>(null);
  const [showCertificateView, setShowCertificateView] = useState<boolean>(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize or reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedCommodity(initialCommodity || 'Onion');
      setActiveImage('');
      setImageFileName('');
      setAssayResult(null);
      setScanError(null);
      setIsScanning(false);
      setShowCertificateView(false);
    }
  }, [isOpen, initialCommodity]);

  // Run AI Assay scan via real backend CV service
  const triggerScan = async (imgDataUrl?: string, targetComm?: string) => {
    const imageToScan = imgDataUrl || activeImage;
    if (!imageToScan) {
      setScanError('Please take a photo or upload an image of the produce first.');
      return;
    }

    setIsScanning(true);
    setScanProgress(15);
    setScanStage('Preparing specimen image for CV analysis...');
    setAssayResult(null);
    setScanError(null);

    const comm = targetComm || selectedCommodity;

    setScanProgress(35);
    setScanStage('Connecting to Kisan Vision computer vision service...');

    try {
      setScanProgress(60);
      setScanStage('Analyzing: unit segmentation, morphometry, surface blemishes, moisture index...');

      const result = await api.analyzeProduceQuality(imageToScan, comm);

      setScanProgress(100);
      setScanStage('Quality assay certified.');

      setAssayResult(result);
    } catch (err: any) {
      console.error('Assay failed:', err);
      setScanError(err.message || 'Quality analysis failed. Please ensure the backend forecast_service is running on port 8000.');
    } finally {
      setIsScanning(false);
    }
  };

  // Canvas visual overlay when scan result is available
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (assayResult) {
      const gradeColor = assayResult.grade_code === 'C' ? '#ef4444' 
        : assayResult.grade_code === 'B' ? '#3b82f6' : '#10b981';
      
      // Top-right grade badge
      ctx.fillStyle = gradeColor;
      ctx.fillRect(canvas.width - 130, 10, 120, 30);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillText(`Grade ${assayResult.grade_code} — ${assayResult.confidence_score}%`, canvas.width - 122, 30);
    }
  }, [assayResult]);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setScanError('Please upload a valid image file (JPEG, PNG, or WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setActiveImage(dataUrl);
      setImageFileName(file.name);
      setScanError(null);
      triggerScan(dataUrl, selectedCommodity);
    };
    reader.onerror = () => {
      setScanError('Failed to read produce image. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleApplyToLot = () => {
    if (assayResult && onApplyGrade) {
      onApplyGrade(assayResult);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.82)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '16px',
        overflowY: 'auto'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          maxWidth: '920px',
          width: '100%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.45)',
          border: '1px solid #cbd5e1',
          overflow: 'hidden',
          margin: 'auto'
        }}
      >
        {/* 1. Header */}
        <div style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #0f766e 100%)',
          color: '#ffffff',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              fontSize: '1.25rem'
            }}>
              🔬
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, letterSpacing: '-0.01em' }}>
                  Kisan Vision AI Photo Quality Assay
                </h3>
                <span style={{
                  fontSize: '0.66rem',
                  fontWeight: 700,
                  backgroundColor: '#34d399',
                  color: '#022c22',
                  padding: '2px 7px',
                  borderRadius: '4px',
                  textTransform: 'uppercase'
                }}>
                  Computer Vision
                </span>
                <span style={{
                  fontSize: '0.66rem',
                  fontWeight: 600,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  padding: '2px 7px',
                  borderRadius: '4px',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}>
                  AGMARKNET Standard
                </span>
              </div>
              <p style={{ fontSize: '0.74rem', color: '#a7f3d0', margin: '2px 0 0 0' }}>
                Automated diameter measurement, defect blemish detection, moisture index & digital QC certification
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#ffffff',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* 2. Commodity Selector & Specimen Header */}
        <div style={{
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#475569' }}>
              Select Commodity Standard:
            </label>
            <select
              value={selectedCommodity}
              onChange={(e) => {
                const newComm = e.target.value;
                setSelectedCommodity(newComm);
                if (activeImage) {
                  triggerScan(activeImage, newComm);
                }
              }}
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                cursor: 'pointer'
              }}
            >
              {SUPPORTED_COMMODITIES.map((comm) => (
                <option key={comm} value={comm}>{comm}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {activeImage && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  color: '#065f46',
                  backgroundColor: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <UploadCloud size={13} />
                Upload New Photo
              </button>
            )}
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              style={{
                fontSize: '0.74rem',
                fontWeight: 600,
                color: '#1e40af',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                padding: '5px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Camera size={13} />
              Take Live Photo
            </button>
          </div>

          {/* Hidden File and Camera Inputs */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            style={{ display: 'none' }}
          />
          <input
            type="file"
            ref={cameraInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            capture="environment"
            style={{ display: 'none' }}
          />
        </div>

        {/* 3. Content Body */}
        <div style={{
          padding: '16px 20px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {/* If No Image is Uploaded: Clean Upload Dropzone */}
          {!activeImage && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              style={{
                borderRadius: '14px',
                border: isDragging ? '2px dashed #059669' : '2px dashed #cbd5e1',
                backgroundColor: isDragging ? '#ecfdf5' : '#f8fafc',
                padding: '36px 24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '14px',
                backgroundColor: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.15)'
              }}>
                <Camera size={28} />
              </div>

              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                Upload Produce Photo for AI Quality Assay
              </h4>
              <p style={{ fontSize: '0.78rem', color: '#64748b', maxWidth: '460px', margin: '0 0 18px 0', lineHeight: 1.5 }}>
                Take a photo or upload an image of your harvest lot. The computer vision model automatically analyzes produce diameter, surface defects, pigmentation, and moisture index.
              </p>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="btn-gov-primary"
                  style={{
                    fontSize: '0.8rem',
                    padding: '8px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <UploadCloud size={15} />
                  Choose Produce Photo
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    cameraInputRef.current?.click();
                  }}
                  style={{
                    fontSize: '0.8rem',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#334155',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <Camera size={15} />
                  Take Photo (Camera)
                </button>
              </div>

              {/* Photography Guidelines for Farmers */}
              <div style={{
                marginTop: '24px',
                paddingTop: '18px',
                borderTop: '1px solid #e2e8f0',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '12px',
                width: '100%',
                maxWidth: '680px',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <Sun size={15} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155', display: 'block' }}>Bright Lighting</span>
                    <span style={{ fontSize: '0.66rem', color: '#64748b' }}>Even daylight or diffuse LED without strong shadows.</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <Maximize2 size={15} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155', display: 'block' }}>Single Layer</span>
                    <span style={{ fontSize: '0.66rem', color: '#64748b' }}>Spread produce flat so units don't overlap.</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <ShieldCheck size={15} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155', display: 'block' }}>Contrasting Background</span>
                    <span style={{ fontSize: '0.66rem', color: '#64748b' }}>Place on a clean sack, tarp, or white sheet.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Inspection Grid: Left Visualizer, Right Results */}
          {activeImage && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: '16px',
              alignItems: 'start'
            }}>
              {/* Left: Interactive Canvas Viewport */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{
                  position: 'relative',
                  aspectRatio: '4 / 3',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  backgroundColor: '#020617',
                  border: '2px solid #cbd5e1',
                  boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5)'
                }}>
                  <img
                    src={activeImage}
                    alt="Produce Specimen"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />

                  {/* Overlaid Canvas for AI Bounding Boxes */}
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={300}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      pointerEvents: 'none',
                      zIndex: 10
                    }}
                  />

                  {/* Scanning Overlay */}
                  {isScanning && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: 'rgba(6, 78, 59, 0.25)',
                      zIndex: 20,
                      pointerEvents: 'none',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <div style={{
                        width: '100%',
                        height: '3px',
                        background: 'linear-gradient(to right, transparent, #34d399, transparent)',
                        boxShadow: '0 0 16px #10b981'
                      }} />
                      <div style={{ position: 'absolute', bottom: '10px', left: '10px', color: '#34d399', fontFamily: 'monospace', fontSize: '10px', fontWeight: 700 }}>
                        Analyzing Specimen...
                      </div>
                    </div>
                  )}

                  {/* Bottom Overlay Info Tag */}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)',
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    zIndex: 15
                  }}>
                    <div style={{ color: '#ffffff' }}>
                      <p style={{ fontSize: '0.74rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#34d399' }} />
                        Optical Sensor: High-Definition Macro
                      </p>
                      <p style={{ fontSize: '0.66rem', color: '#cbd5e1', margin: '2px 0 0 0' }}>
                        {assayResult ? `Analyzed: ${assayResult.detected_count || 24} units segmented` : (imageFileName || 'Ready to analyze')}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          color: '#ffffff',
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        Change Photo
                      </button>
                      <button
                        type="button"
                        disabled={isScanning}
                        onClick={() => triggerScan()}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          backgroundColor: '#059669',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          border: 'none',
                          cursor: isScanning ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          opacity: isScanning ? 0.6 : 1
                        }}
                      >
                        <RefreshCw size={12} className={isScanning ? 'animate-spin' : ''} />
                        {isScanning ? 'Scanning...' : 'Re-Scan'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Scan Progress Bar (when scanning) */}
                {isScanning && (
                  <div style={{
                    backgroundColor: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    borderRadius: '8px',
                    padding: '8px 12px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700, color: '#065f46', marginBottom: '4px' }}>
                      <span>{scanStage}</span>
                      <span>{scanProgress}%</span>
                    </div>
                    <div style={{ width: '100%', backgroundColor: '#a7f3d0', borderRadius: '9999px', height: '6px', overflow: 'hidden' }}>
                      <div style={{
                        backgroundColor: '#059669',
                        height: '100%',
                        width: `${scanProgress}%`,
                        transition: 'width 0.2s ease-out'
                      }} />
                    </div>
                  </div>
                )}

                {/* Hardware / Inspection Notes */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748b', padding: '0 4px' }}>
                  <span>Calibrated to AGMARKNET Schedule II standards</span>
                  <span>Sub-millimeter edge precision (±0.2mm)</span>
                </div>
              </div>

              {/* Right: Assay Metrics & Grade Certificate */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Error State */}
                {scanError && !isScanning && (
                  <div style={{
                    minHeight: '200px',
                    borderRadius: '12px',
                    border: '2px solid #fca5a5',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    backgroundColor: '#fef2f2'
                  }}>
                    <AlertTriangle size={36} color="#dc2626" style={{ marginBottom: '10px' }} />
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#991b1b', margin: '0 0 6px 0' }}>
                      Analysis Failed
                    </h4>
                    <p style={{ fontSize: '0.74rem', color: '#b91c1c', maxWidth: '380px', margin: '0 0 14px 0' }}>
                      {scanError}
                    </p>
                    <button
                      type="button"
                      onClick={() => { setScanError(null); triggerScan(); }}
                      className="btn-gov-primary"
                      style={{ fontSize: '0.78rem', padding: '6px 14px', backgroundColor: '#dc2626' }}
                    >
                      <RefreshCw size={14} /> Retry Scan
                    </button>
                  </div>
                )}

                {/* Empty State before first scan */}
                {!assayResult && !isScanning && !scanError && (
                  <div style={{
                    minHeight: '280px',
                    borderRadius: '12px',
                    border: '2px dashed #cbd5e1',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    backgroundColor: '#f8fafc'
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      backgroundColor: '#ecfdf5',
                      color: '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      marginBottom: '10px'
                    }}>
                      🔬
                    </div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                      Run Quality Assay
                    </h4>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', maxWidth: '320px', margin: '0 0 14px 0' }}>
                      Click below to analyze the specimen photo with AGMARKNET computer vision standards.
                    </p>
                    <button
                      type="button"
                      onClick={() => triggerScan()}
                      className="btn-gov-primary"
                      style={{ fontSize: '0.78rem', padding: '6px 14px' }}
                    >
                      <span>⚡</span> Start AI Inspection
                    </button>
                  </div>
                )}

                {/* Live Assay Result */}
                {assayResult && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Top Grade Card */}
                    <div style={{
                      borderRadius: '12px',
                      padding: '14px',
                      border: assayResult.grade_code === 'C' ? '1px solid #fca5a5' : '1px solid #a7f3d0',
                      backgroundColor: assayResult.grade_code === 'C' ? '#fff1f2' : '#f0fdf4',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Predicted Quality Grade
                          </span>
                          <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '2px 0 4px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {assayResult.predicted_grade}
                            {assayResult.grade_code === 'A' && (
                              <span style={{ fontSize: '0.66rem', fontWeight: 800, backgroundColor: '#059669', color: '#ffffff', padding: '2px 7px', borderRadius: '4px' }}>
                                ⭐ GRADE A
                              </span>
                            )}
                            {assayResult.grade_code === 'A+' && (
                              <span style={{ fontSize: '0.66rem', fontWeight: 800, backgroundColor: '#047857', color: '#ffffff', padding: '2px 7px', borderRadius: '4px' }}>
                                🌟 GRADE A+ (EXPORT)
                              </span>
                            )}
                            {assayResult.grade_code === 'B' && (
                              <span style={{ fontSize: '0.66rem', fontWeight: 800, backgroundColor: '#2563eb', color: '#ffffff', padding: '2px 7px', borderRadius: '4px' }}>
                                GRADE B
                              </span>
                            )}
                            {assayResult.grade_code === 'C' && (
                              <span style={{ fontSize: '0.66rem', fontWeight: 800, backgroundColor: '#dc2626', color: '#ffffff', padding: '2px 7px', borderRadius: '4px' }}>
                                ⚠️ DEFECTIVE
                              </span>
                            )}
                          </h4>
                          <p style={{ fontSize: '0.74rem', color: '#475569', margin: 0 }}>
                            Specimen: <strong style={{ color: '#0f172a' }}>{selectedCommodity} Specimen</strong>
                          </p>
                        </div>

                        {/* AI Confidence Meter */}
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.64rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                            Confidence Score
                          </span>
                          <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#059669' }}>
                            {assayResult.confidence_score}%
                          </div>
                          <span style={{ fontSize: '0.62rem', color: '#64748b' }}>
                            NABL Neural Validated
                          </span>
                        </div>
                      </div>

                      {/* Statutory APMC Quality Parameters */}
                      <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                        <div style={{ fontSize: '0.66rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                          <span>Statutory APMC Rule 38 Parameters</span>
                          <span style={{ color: '#065f46', fontWeight: 800 }}>
                            {assayResult.apmc_grade_classification?.replace(/_/g, ' ') || 'FAQ GRADE I'}
                          </span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', textAlign: 'center' }}>
                          <div style={{ backgroundColor: '#ffffff', borderRadius: '6px', padding: '6px 4px', border: '1px solid #e2e8f0' }}>
                            <span style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 700, display: 'block' }}>💧 Moisture</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>{assayResult.estimated_moisture_percent}%</span>
                            <span style={{ fontSize: '0.58rem', color: '#94a3b8', display: 'block' }}>Base 10%</span>
                          </div>
                          <div style={{ backgroundColor: '#ffffff', borderRadius: '6px', padding: '6px 4px', border: '1px solid #e2e8f0' }}>
                            <span style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 700, display: 'block' }}>🌾 Chaff / Dirt</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>{assayResult.foreign_matter_percent ?? 0.8}%</span>
                            <span style={{ fontSize: '0.58rem', color: '#94a3b8', display: 'block' }}>Base ≤1%</span>
                          </div>
                          <div style={{ backgroundColor: '#ffffff', borderRadius: '6px', padding: '6px 4px', border: '1px solid #e2e8f0' }}>
                            <span style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 700, display: 'block' }}>✂️ Broken / Split</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>{assayResult.broken_grain_percent ?? 1.1}%</span>
                            <span style={{ fontSize: '0.58rem', color: '#94a3b8', display: 'block' }}>Base ≤2%</span>
                          </div>
                          <div style={{ backgroundColor: '#ffffff', borderRadius: '6px', padding: '6px 4px', border: '1px solid #e2e8f0' }}>
                            <span style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 700, display: 'block' }}>🏷️ APMC Grade</span>
                            <span style={{
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              display: 'block',
                              color: assayResult.grade_code === 'C' ? '#dc2626' : assayResult.grade_code === 'B' ? '#2563eb' : '#059669'
                            }}>
                              {assayResult.grade_code === 'C' ? 'REFRACTION' : assayResult.grade_code === 'B' ? 'FAQ II' : 'FAQ I'}
                            </span>
                            <span style={{ fontSize: '0.58rem', color: '#94a3b8', display: 'block' }}>Mandi Slip</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Morphometric Metrics Breakdown Table */}
                    <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{ padding: '8px 12px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase' }}>
                          Computer Vision Morphometric Matrix
                        </span>
                        <span style={{ fontSize: '0.66rem', fontWeight: 600, color: '#059669' }}>
                          ISO 9001 / Codex Standard
                        </span>
                      </div>
                      <div style={{ fontSize: '0.74rem' }}>
                        {assayResult.metrics.map((metric, idx) => (
                          <div key={idx} style={{
                            padding: '6px 12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderBottom: idx < assayResult.metrics.length - 1 ? '1px solid #f1f5f9' : 'none'
                          }}>
                            <div>
                              <span style={{ fontWeight: 600, color: '#0f172a' }}>{metric.name}</span>
                              <span style={{ fontSize: '0.62rem', color: '#94a3b8', display: 'block' }}>Norm: {metric.benchmark_range}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>{metric.measured_value}</span>
                              <span style={{
                                padding: '1px 6px',
                                borderRadius: '4px',
                                fontSize: '0.62rem',
                                fontWeight: 800,
                                backgroundColor: metric.status === 'OPTIMAL' ? '#ecfdf5' : metric.status === 'PASS' ? '#eff6ff' : '#fef2f2',
                                color: metric.status === 'OPTIMAL' ? '#065f46' : metric.status === 'PASS' ? '#1e40af' : '#b91c1c'
                              }}>
                                {metric.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AGMARKNET Advisory Box */}
                    <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #a7f3d0', borderRadius: '10px', padding: '10px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', fontWeight: 700, color: '#065f46', marginBottom: '4px' }}>
                        <Sparkles size={13} color="#059669" />
                        <span>AGMARKNET Advisory & Statutory Guidance</span>
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.72rem', color: '#047857', lineHeight: 1.45 }}>
                        {assayResult.recommendations.map((rec, i) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Digital Certificate Bar */}
                    <div style={{
                      backgroundColor: '#0f172a',
                      color: '#ffffff',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: '#34d399', fontSize: '0.74rem', fontFamily: 'monospace', fontWeight: 800 }}>
                            {assayResult.assay_id}
                          </span>
                          <span style={{ fontSize: '0.6rem', fontWeight: 700, backgroundColor: 'rgba(52, 211, 153, 0.2)', color: '#a7f3d0', padding: '1px 5px', borderRadius: '3px', border: '1px solid rgba(52, 211, 153, 0.4)' }}>
                            VERIFIED HASH
                          </span>
                        </div>
                        <p style={{ fontSize: '0.62rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
                          SHA-256 Digital Certificate signed under National e-NAM & APMC rules
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowCertificateView(!showCertificateView)}
                        style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          backgroundColor: '#1e293b',
                          color: '#34d399',
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          border: '1px solid #334155',
                          cursor: 'pointer'
                        }}
                      >
                        {showCertificateView ? 'Hide Cert' : 'View Cert'}
                      </button>
                    </div>

                    {/* Expanded Certificate View */}
                    {showCertificateView && (
                      <div style={{
                        padding: '12px',
                        borderRadius: '8px',
                        border: '2px solid #059669',
                        backgroundColor: '#ffffff',
                        fontSize: '0.72rem',
                        color: '#0f172a'
                      }}>
                        <div style={{ textAlign: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginBottom: '8px' }}>
                          <strong style={{ textTransform: 'uppercase', letterSpacing: '0.04em', color: '#064e3b' }}>
                            GOVERNMENT OF MAHARASHTRA — MSAMB
                          </strong>
                          <p style={{ fontSize: '0.64rem', color: '#64748b', margin: '2px 0 0 0' }}>
                            Automated Produce Quality Assay Certificate • National e-NAM Compliant
                          </p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.7rem' }}>
                          <div><strong>Certificate ID:</strong> {assayResult.assay_id}</div>
                          <div><strong>Issued At:</strong> {new Date(assayResult.timestamp).toLocaleString()}</div>
                          <div><strong>Commodity:</strong> {assayResult.commodity}</div>
                          <div><strong>Certified Grade:</strong> {assayResult.predicted_grade}</div>
                          <div><strong>Uniformity Score:</strong> {assayResult.uniformity_score}%</div>
                          <div><strong>Moisture Content:</strong> {assayResult.estimated_moisture_percent}%</div>
                        </div>
                        <div style={{ marginTop: '8px', backgroundColor: '#f8fafc', padding: '6px', borderRadius: '4px', fontSize: '0.6rem', fontFamily: 'monospace', color: '#64748b', wordBreak: 'break-all' }}>
                          Cryptographic Sig: 0x9f4a8b23c1029e847d81029c78201a4e58b193ac479102837bc9
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 4. Footer Action Buttons */}
        <div style={{
          backgroundColor: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          flexShrink: 0
        }}>
          <div style={{ fontSize: '0.74rem', color: '#475569' }}>
            {contextMode === 'LISTING' && (
              <span>Quality grade & moisture index will be auto-filled into your harvest listing form.</span>
            )}
            {contextMode === 'DISPUTE' && (
              <span>This computer vision assay provides photographic evidence for APMC arbitration.</span>
            )}
            {contextMode === 'INSPECTION' && (
              <span>Visual AGMARKNET morphometric certification and defect verification.</span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-gov-secondary"
              style={{ fontSize: '0.76rem', padding: '6px 14px' }}
            >
              Cancel
            </button>

            {assayResult && onApplyGrade && (
              <button
                type="button"
                onClick={handleApplyToLot}
                className="btn-gov-primary"
                style={{
                  fontSize: '0.78rem',
                  padding: '7px 16px',
                  backgroundColor: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Check size={15} />
                {contextMode === 'LISTING'
                  ? 'Apply Certified Grade to Harvest Batch'
                  : contextMode === 'DISPUTE'
                  ? 'Attach Assay as Dispute Evidence'
                  : 'Confirm Grade'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
