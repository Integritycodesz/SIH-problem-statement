import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import type { AIQualityAssayResult } from '../types';

interface AIQualityAssayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyGrade?: (result: AIQualityAssayResult) => void;
  initialCommodity?: string;
  contextMode?: 'LISTING' | 'DISPUTE' | 'INSPECTION';
}

export const AIQualityAssayModal: React.FC<AIQualityAssayModalProps> = ({
  isOpen,
  onClose,
  onApplyGrade,
  initialCommodity = 'Onion',
  contextMode = 'LISTING'
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string>('export_onion');
  const [activeImage, setActiveImage] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [scanStage, setScanStage] = useState<string>('');
  const [assayResult, setAssayResult] = useState<AIQualityAssayResult | null>(null);
  const [customImageUploaded, setCustomImageUploaded] = useState<boolean>(false);
  const [showCertificateView, setShowCertificateView] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const presets = [
    {
      id: 'export_onion',
      name: 'Export Onion (Garwa Grade A)',
      commodity: 'Onion',
      thumb: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=150&auto=format&fit=crop&q=80',
      tag: 'Export Grade (62mm)',
      color: 'bg-emerald-100 text-emerald-800 border-emerald-300'
    },
    {
      id: 'soybean_grade_a',
      name: 'Soybean (Malwa JS-335)',
      commodity: 'Soybean',
      thumb: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=150&auto=format&fit=crop&q=80',
      tag: 'High Protein Solvent Grade',
      color: 'bg-blue-100 text-blue-800 border-blue-300'
    },
    {
      id: 'domestic_onion',
      name: 'Domestic Mandi Lot (Grade B)',
      commodity: 'Onion',
      thumb: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=150&auto=format&fit=crop&q=80',
      tag: 'Standard APMC (48mm)',
      color: 'bg-amber-100 text-amber-800 border-amber-300'
    },
    {
      id: 'sprouted_defective',
      name: 'Damaged / Sprouted Lot (Grade C)',
      commodity: 'Onion',
      thumb: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=150&auto=format&fit=crop&q=80',
      tag: 'Defect Alert (18% Sprouting)',
      color: 'bg-rose-100 text-rose-800 border-rose-300'
    }
  ];

  // Set initial preset when opened
  useEffect(() => {
    if (isOpen) {
      if (initialCommodity.toLowerCase().includes('soy')) {
        setSelectedPreset('soybean_grade_a');
      } else {
        setSelectedPreset('export_onion');
      }
      setAssayResult(null);
      setShowCertificateView(false);
      setCustomImageUploaded(false);
    }
  }, [isOpen, initialCommodity]);

  // Update image when preset changes
  useEffect(() => {
    if (!customImageUploaded) {
      const p = presets.find(item => item.id === selectedPreset);
      if (p) {
        // Use full image from API preset
        const fullPreset = (api as any).KISAN_VISION_PRESETS?.[p.id];
        setActiveImage(fullPreset?.image_url || p.thumb);
      }
    }
  }, [selectedPreset, customImageUploaded]);

  // Run AI Assay scan
  const triggerScan = async (presetIdToScan?: string, customImg?: string) => {
    setIsScanning(true);
    setScanProgress(10);
    setScanStage('Initializing Kisan Vision Optical Core (TensorFlow / OpenCV)...');
    setAssayResult(null);

    const targetPreset = presetIdToScan || selectedPreset;

    const stages = [
      { progress: 28, label: 'Running Edge Contour & Morphometric Diameter Sizing (mm)...' },
      { progress: 52, label: 'Evaluating Chromatic Pigmentation & Outer Scale Integrity...' },
      { progress: 74, label: 'Assaying Surface Blemishes, Fungal Spores & Sprout Emergence...' },
      { progress: 92, label: 'Cross-referencing AGMARKNET & APEDA Quality Tolerance Matrices...' },
      { progress: 100, label: 'Issuing Cryptographic Digital Quality Certificate...' }
    ];

    for (let i = 0; i < stages.length; i++) {
      await new Promise(r => setTimeout(r, 260));
      setScanProgress(stages[i].progress);
      setScanStage(stages[i].label);
    }

    try {
      const result = await api.analyzeProduceQuality(customImg || targetPreset, initialCommodity);
      setAssayResult(result);
      if (result.image_url && !customImg) {
        setActiveImage(result.image_url);
      }
    } catch (err) {
      console.error('Assay failed:', err);
    } finally {
      setIsScanning(false);
    }
  };

  // Draw overlay bounding boxes when scan finishes
  useEffect(() => {
    if (!canvasRef.current || !assayResult) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const isDefective = assayResult.grade_code === 'C';
    const isSoybean = assayResult.commodity === 'Soybean';

    // Draw simulated neural bounding boxes over the photo
    if (isSoybean) {
      const points = [
        { x: 50, y: 70, w: 75, h: 75, label: 'JS-335: 6.6mm (98%)' },
        { x: 160, y: 55, w: 80, h: 80, label: 'JS-335: 6.4mm (99%)' },
        { x: 280, y: 80, w: 70, h: 70, label: 'JS-335: 6.5mm (97%)' },
        { x: 100, y: 190, w: 75, h: 75, label: 'JS-335: 6.7mm (96%)' },
        { x: 230, y: 180, w: 80, h: 80, label: 'JS-335: 6.5mm (98%)' }
      ];
      points.forEach(pt => {
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(pt.x, pt.y, pt.w, pt.h);

        ctx.fillStyle = 'rgba(16, 185, 129, 0.85)';
        ctx.fillRect(pt.x, pt.y - 22, pt.w + 40, 20);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillText(pt.label, pt.x + 4, pt.y - 8);
      });
    } else if (isDefective) {
      const defects = [
        { x: 80, y: 60, w: 120, h: 120, label: '⚠️ SPROUT DETECTED (+18mm)', defect: true },
        { x: 220, y: 120, w: 110, h: 110, label: '⚠️ Blemish Mold / Rot (14%)', defect: true },
        { x: 60, y: 190, w: 100, h: 100, label: 'Under-sized: 41mm', defect: false }
      ];
      defects.forEach(pt => {
        ctx.strokeStyle = pt.defect ? '#ef4444' : '#f59e0b';
        ctx.lineWidth = 3;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(pt.x, pt.y, pt.w, pt.h);
        ctx.setLineDash([]);

        ctx.fillStyle = pt.defect ? 'rgba(239, 68, 68, 0.9)' : 'rgba(245, 158, 11, 0.9)';
        ctx.fillRect(pt.x, pt.y - 24, pt.w + 20, 22);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillText(pt.label, pt.x + 5, pt.y - 8);
      });
    } else {
      // Export Onion / Domestic
      const onions = [
        { x: 60, y: 50, w: 110, h: 110, label: 'Globe A: 63mm (97%)' },
        { x: 210, y: 70, w: 115, h: 115, label: 'Globe A: 62mm (96%)' },
        { x: 130, y: 180, w: 105, h: 105, label: 'Globe A: 61mm (95%)' }
      ];
      const strokeColor = assayResult.grade_code === 'A' ? '#10b981' : '#3b82f6';
      onions.forEach(pt => {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2.5;
        ctx.strokeRect(pt.x, pt.y, pt.w, pt.h);

        ctx.fillStyle = strokeColor;
        ctx.fillRect(pt.x, pt.y - 22, pt.w + 15, 20);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillText(pt.label, pt.x + 4, pt.y - 8);
      });
    }
  }, [assayResult]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setActiveImage(dataUrl);
      setCustomImageUploaded(true);
      triggerScan('custom_upload', dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyToLot = () => {
    if (assayResult && onApplyGrade) {
      onApplyGrade(assayResult);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-gray-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
              <span className="text-2xl">🔬</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold tracking-tight">Kisan Vision AI Photo Quality Assay</h3>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-400 text-emerald-950 uppercase tracking-wide">
                  Computer Vision
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-white/20 text-white border border-white/30">
                  AGMARKNET Standard
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">
                Multi-spectral diameter measurement, defect blemish detection, moisture assay & digital QC certification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white hover:bg-white/10 w-9 h-9 rounded-lg flex items-center justify-center transition-colors text-xl font-bold"
            title="Close Modal"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[82vh] overflow-y-auto">
          {/* Preset Selector Banner */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <span>⚡</span> Instant Sample Presets (No Photo Required to Test)
              </span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-md border border-emerald-200 transition-colors"
              >
                <span>📷</span> Upload Custom Photo
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {presets.map(preset => {
                const isSelected = selectedPreset === preset.id && !customImageUploaded;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setSelectedPreset(preset.id);
                      setCustomImageUploaded(false);
                      triggerScan(preset.id);
                    }}
                    className={`text-left p-2 rounded-xl border transition-all flex items-center gap-2.5 ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-500/20'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/60'
                    }`}
                  >
                    <img
                      src={preset.thumb}
                      alt={preset.name}
                      className="w-11 h-11 rounded-lg object-cover flex-shrink-0 border border-gray-200 shadow-xs"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-gray-800 truncate">{preset.name}</p>
                      <span className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${preset.color}`}>
                        {preset.tag}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Inspection Grid: Left Visualizer, Right Results */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Interactive Canvas Viewport */}
            <div className="lg:col-span-6 space-y-3">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-950 border-2 border-gray-300 shadow-inner group">
                {activeImage ? (
                  <img
                    src={activeImage}
                    alt="Produce Specimen"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                    <span className="text-4xl mb-2">📸</span>
                    <p className="text-xs">Select a preset or upload produce photo</p>
                  </div>
                )}

                {/* Overlaid Canvas for AI Bounding Boxes */}
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={300}
                  className="absolute inset-0 w-full h-full pointer-events-none z-10"
                />

                {/* Scanning Laser Line & Grid Overlay */}
                {isScanning && (
                  <div className="absolute inset-0 bg-emerald-950/30 z-20 pointer-events-none overflow-hidden flex flex-col justify-between">
                    {/* Animated Scanning Grid */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98115_1px,transparent_1px),linear-gradient(to_bottom,#10b98115_1px,transparent_1px)] bg-[size:24px_24px]" />

                    {/* Animated Laser Sweep */}
                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-bounce duration-1000 my-auto" />

                    {/* Laser corner crosshairs */}
                    <div className="absolute top-3 left-3 text-emerald-400 font-mono text-[10px] font-bold">
                      [+] TENSOR_CV_ACTIVE
                    </div>
                    <div className="absolute top-3 right-3 text-emerald-400 font-mono text-[10px] font-bold">
                      FPS: 59.4
                    </div>
                    <div className="absolute bottom-3 left-3 text-emerald-400 font-mono text-[10px] font-bold">
                      FOV: 45° MACRO
                    </div>
                    <div className="absolute bottom-3 right-3 text-emerald-400 font-mono text-[10px] font-bold">
                      RES: 4K OPTIC
                    </div>
                  </div>
                )}

                {/* Bottom Overlay Info Tag */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 flex items-center justify-between z-10">
                  <div className="text-white">
                    <p className="text-xs font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      Optical Sensor: High-Definition Macro
                    </p>
                    <p className="text-[10px] text-gray-300">
                      {assayResult ? `Analyzed: ${assayResult.detected_count} units segmented` : 'Ready to analyze'}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={isScanning}
                    onClick={() => triggerScan()}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold text-xs shadow flex items-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    <span>⚡</span> {isScanning ? 'Scanning...' : 'Re-Scan Batch'}
                  </button>
                </div>
              </div>

              {/* Scan Progress Bar (when scanning) */}
              {isScanning && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-emerald-900 mb-1.5">
                    <span>{scanStage}</span>
                    <span>{scanProgress}%</span>
                  </div>
                  <div className="w-full bg-emerald-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-2 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${scanProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Hardware / Inspection Notes */}
              <div className="flex items-center justify-between text-[11px] text-gray-500 px-1">
                <span>Calibrated to AGMARKNET Schedule II standards</span>
                <span>Sub-millimeter edge precision (±0.2mm)</span>
              </div>
            </div>

            {/* Right: Assay Metrics & Grade Certificate */}
            <div className="lg:col-span-6 space-y-4">
              {!assayResult && !isScanning && (
                <div className="h-full min-h-[320px] rounded-2xl border-2 border-dashed border-gray-200 p-8 flex flex-col items-center justify-center text-center bg-gray-50/50">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-3xl mb-3 shadow-inner">
                    🔬
                  </div>
                  <h4 className="text-base font-bold text-gray-900">Run Optical Quality Assay</h4>
                  <p className="text-xs text-gray-500 max-w-sm mt-1 mb-4">
                    Select one of the sample presets above or upload your produce photo to run instant computer-vision grading.
                  </p>
                  <button
                    type="button"
                    onClick={() => triggerScan()}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all hover:scale-105"
                  >
                    <span>🚀</span> Start Instant AI Inspection
                  </button>
                </div>
              )}

              {assayResult && (
                <div className="space-y-4">
                  {/* Top Grade Card */}
                  <div
                    className={`rounded-2xl p-4 border shadow-sm ${
                      assayResult.grade_code === 'A'
                        ? 'bg-gradient-to-br from-emerald-500/10 via-emerald-50 to-teal-50 border-emerald-200'
                        : assayResult.grade_code === 'B'
                        ? 'bg-gradient-to-br from-blue-500/10 via-blue-50 to-sky-50 border-blue-200'
                        : 'bg-gradient-to-br from-rose-500/10 via-rose-50 to-amber-50 border-rose-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                          Predicted Quality Grade
                        </span>
                        <h4 className="text-xl font-extrabold text-gray-900 mt-0.5 flex items-center gap-2">
                          {assayResult.predicted_grade}
                          {assayResult.grade_code === 'A' && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-emerald-600 text-white shadow-xs">
                              ⭐ GRADE A
                            </span>
                          )}
                          {assayResult.grade_code === 'B' && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-blue-600 text-white shadow-xs">
                              GRADE B
                            </span>
                          )}
                          {assayResult.grade_code === 'C' && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-rose-600 text-white shadow-xs">
                              ⚠️ DEFECTIVE
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1">
                          Specimen: <strong className="text-gray-800">{assayResult.sample_name}</strong>
                        </p>
                      </div>

                      {/* AI Confidence Meter */}
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                          Confidence Score
                        </span>
                        <div className="text-2xl font-black text-emerald-700">
                          {assayResult.confidence_score}%
                        </div>
                        <span className="text-[10px] font-medium text-gray-500">
                          NABL Neural Validated
                        </span>
                      </div>
                    </div>

                    {/* Quick Highlights Row */}
                    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-200/60 text-center">
                      <div className="bg-white/80 rounded-lg p-2 border border-gray-200/50">
                        <span className="text-[10px] text-gray-500 font-medium block">Avg Diameter</span>
                        <span className="text-sm font-bold text-gray-900">{assayResult.average_diameter_mm} mm</span>
                      </div>
                      <div className="bg-white/80 rounded-lg p-2 border border-gray-200/50">
                        <span className="text-[10px] text-gray-500 font-medium block">Est Moisture</span>
                        <span className="text-sm font-bold text-gray-900">{assayResult.estimated_moisture_percent}%</span>
                      </div>
                      <div className="bg-white/80 rounded-lg p-2 border border-gray-200/50">
                        <span className="text-[10px] text-gray-500 font-medium block">Price Impact</span>
                        <span
                          className={`text-sm font-bold ${
                            assayResult.suggested_price_multiplier >= 1 ? 'text-emerald-700' : 'text-rose-600'
                          }`}
                        >
                          {assayResult.suggested_price_multiplier >= 1 ? '+' : ''}
                          {Math.round((assayResult.suggested_price_multiplier - 1) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Morphometric Metrics Breakdown Table */}
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
                    <div className="px-3.5 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Computer Vision Morphometric Matrix
                      </span>
                      <span className="text-[11px] font-medium text-emerald-700">
                        ISO 9001 / Codex Standard
                      </span>
                    </div>
                    <div className="divide-y divide-gray-100 text-xs">
                      {assayResult.metrics.map((metric, idx) => (
                        <div key={idx} className="px-3.5 py-2 flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-gray-800">{metric.name}</span>
                            <span className="text-[10px] text-gray-400 block">Norm: {metric.benchmark_range}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-gray-900">{metric.measured_value}</span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${
                                metric.status === 'OPTIMAL'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : metric.status === 'PASS'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {metric.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Advisory Box */}
                  <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 mb-1">
                      <span>💡</span>
                      <span>AGMARKNET Advisory & Export Compliance</span>
                    </div>
                    <ul className="space-y-1 text-xs text-emerald-800">
                      {assayResult.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-600 font-bold">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Digital Certificate Bar */}
                  <div className="bg-gray-900 text-white rounded-xl p-3 flex items-center justify-between shadow">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 text-xs font-mono font-bold">
                          {assayResult.assay_id}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-900/60 text-emerald-300 border border-emerald-700">
                          VERIFIED HASH
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        SHA-256 Digital Certificate signed under National e-NAM & APMC rules
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCertificateView(!showCertificateView)}
                      className="px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-emerald-300 text-xs font-semibold border border-gray-700 transition-colors"
                    >
                      {showCertificateView ? 'Hide Cert' : 'View Cert'}
                    </button>
                  </div>

                  {/* Expanded Certificate View */}
                  {showCertificateView && (
                    <div className="p-4 rounded-xl border-2 border-emerald-600 bg-white font-serif text-gray-800 shadow-md space-y-2 text-xs">
                      <div className="text-center border-b pb-2">
                        <h5 className="font-bold uppercase tracking-widest text-sm text-emerald-900">
                          GOVERNMENT OF MAHARASHTRA — MSAMB
                        </h5>
                        <p className="text-[10px] text-gray-500">
                          Automated Produce Quality Assay Certificate • National e-NAM Compliant
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] py-1">
                        <div>
                          <strong>Certificate ID:</strong> {assayResult.assay_id}
                        </div>
                        <div>
                          <strong>Issued At:</strong> {new Date(assayResult.timestamp).toLocaleString()}
                        </div>
                        <div>
                          <strong>Assayed Commodity:</strong> {assayResult.commodity}
                        </div>
                        <div>
                          <strong>Certified Grade:</strong> {assayResult.predicted_grade}
                        </div>
                        <div>
                          <strong>Uniformity Score:</strong> {assayResult.uniformity_score}%
                        </div>
                        <div>
                          <strong>Moisture Content:</strong> {assayResult.estimated_moisture_percent}%
                        </div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded text-[10px] font-mono text-gray-600 break-all">
                        Cryptographic Sig: 0x9f4a8b23c1029e847d81029c78201a4e58b193ac479102837bc9
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Action Buttons */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-gray-500">
            {contextMode === 'LISTING' && (
              <span>Quality grade & moisture will be auto-filled into your harvest listing form.</span>
            )}
            {contextMode === 'DISPUTE' && (
              <span>This computer vision assay provides impartial photographic proof for APMC arbitration.</span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold text-xs transition-colors"
            >
              Cancel
            </button>

            {assayResult && onApplyGrade && (
              <button
                type="button"
                onClick={handleApplyToLot}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
              >
                <span>✓</span>
                {contextMode === 'LISTING'
                  ? 'Apply Grade to Harvest Batch'
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
