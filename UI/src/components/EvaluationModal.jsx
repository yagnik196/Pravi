import React, { useState } from 'react';
import {
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  X,
  ShieldCheck,
  Camera,
  FileText,
  Sliders,
  Sparkles
} from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function EvaluationModal({
  evaluation,
  onClose,
  onSubmitEvaluation
}) {
  const [step, setStep] = useState('form'); // 'form' | 'review' | 'success'
  const [submitting, setSubmitting] = useState(false);
  const [resultData, setResultData] = useState(null);

  // Metrics state
  const [qualityScore, setQualityScore] = useState(
    evaluation?.quality_score ?? evaluation?.metrics?.['Road Quality'] ?? 48
  );
  const [metrics, setMetrics] = useState({
    'Road Quality': evaluation?.metrics?.['Road Quality'] ?? 48,
    'Physical Progress': evaluation?.metrics?.['Physical Progress'] ?? 62,
    'Quality': evaluation?.metrics?.['Quality'] ?? 'Poor',
    'Safety': evaluation?.metrics?.['Safety'] ?? 'Compliant',
    'Milestone Completion': evaluation?.metrics?.['Milestone Completion'] ?? 'Not Completed',
    'Pothole Density': evaluation?.metrics?.['Pothole Density'] ?? 18,
    'Surface Damage Index': evaluation?.metrics?.['Surface Damage Index'] ?? 65,
    ...(evaluation?.metrics || {})
  });

  const [observations, setObservations] = useState(
    evaluation?.observations ||
      'Field inspection conducted on site. Severe honeycomb voiding and rebar tying lag observed on Pier 15 soffit. Pavement riding quality severely deteriorated with multiple potholes.'
  );

  const [recommendation, setRecommendation] = useState(
    evaluation?.recommendation ||
      'Issue immediate stop-work notice on deck slab casting. Require contractor to perform pressure grouting and submit third-party core test certificates.'
  );

  // Evidence files state
  const [evidenceFiles, setEvidenceFiles] = useState(
    evaluation?.evidence_files || [
      {
        file_name: 'pier15_deck_void_defect.jpg',
        file_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=600&auto=format&fit=crop',
        file_type: 'image/jpeg',
        caption: 'Honeycombing defect at Pier 15 beam junction'
      }
    ]
  );

  if (!evaluation) return null;

  const handleMetricChange = (key, val) => {
    setMetrics((prev) => ({ ...prev, [key]: val }));
    if (key === 'Road Quality') {
      setQualityScore(Number(val));
    }
  };

  const handleQualitySlider = (val) => {
    const num = Number(val);
    setQualityScore(num);
    setMetrics((prev) => ({ ...prev, 'Road Quality': num }));
  };

  const handleAddEvidencePhoto = () => {
    const sampleUrls = [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600&auto=format&fit=crop'
    ];
    const randomUrl = sampleUrls[Math.floor(Math.random() * sampleUrls.length)];
    const newDoc = {
      file_name: `inspection_evidence_${Date.now() % 10000}.jpg`,
      file_url: randomUrl,
      file_type: 'image/jpeg',
      caption: `Field audit photo timestamped ${new Date().toLocaleTimeString('en-IN')}`
    };
    setEvidenceFiles((prev) => [...prev, newDoc]);
  };

  const handleProceedToReview = (e) => {
    e.preventDefault();
    setStep('review');
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await onSubmitEvaluation(evaluation.id, {
        evaluator_name: evaluation.evaluator_name || 'Er. Pravin Varma (SQM)',
        overall_quality_score: qualityScore,
        metrics,
        observations: observations.trim(),
        recommendation: recommendation.trim(),
        evidence_files: evidenceFiles
      });
      setResultData(res);
      setStep('success');
    } catch (err) {
      alert('Failed to submit evaluation: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Check which rules would trigger in real time
  const rulesWillTrigger = [];
  if (metrics['Road Quality'] < 60) {
    rulesWillTrigger.push('Rule #RULE-RQ-60: Road Quality < 60 (Critical)');
  }
  if (metrics['Milestone Completion'] === 'Not Completed') {
    rulesWillTrigger.push('Rule #rule-1: Milestone Completion = Not Completed (Critical)');
  }
  if (metrics['Quality'] === 'Poor') {
    rulesWillTrigger.push('Rule #rule-2: Construction Quality = Poor (Critical)');
  }
  if (metrics['Pothole Density'] > 15) {
    rulesWillTrigger.push('Rule #RULE-PD-15: Pothole Density > 15/km (Warning)');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {step === 'review' ? 'Review & Submit Field Audit' : step === 'success' ? 'Audit Submitted Successfully' : 'Field Inspection & Multi-Metric Audit'}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {evaluation.id} • {evaluation.project_name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* STEP 1: FORM */}
          {step === 'form' && (
            <form onSubmit={handleProceedToReview} className="space-y-4">
              {/* Target Milestone & Auditor info */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-slate-500 uppercase text-[10px] block font-semibold">Milestone / Asset:</span>
                  <span className="font-bold text-slate-900">{evaluation.milestone_name || evaluation.project_name}</span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase text-[10px] block font-semibold">Auditor:</span>
                  <span className="font-bold text-slate-900">{evaluation.evaluator_name || 'State Quality Monitor'}</span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase text-[10px] block font-semibold">District:</span>
                  <span className="font-bold text-slate-900">{evaluation.district}</span>
                </div>
              </div>

              {/* Overall Quality Score Slider */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Sliders className="w-4 h-4 text-blue-600" />
                    <span>Overall Infrastructure Quality Score</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${
                    qualityScore < 60 ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                    qualityScore < 80 ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                    'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}>
                    {qualityScore} / 100 {qualityScore < 60 ? '(Critical)' : qualityScore < 80 ? '(Warning)' : '(Healthy)'}
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={qualityScore}
                  onChange={(e) => handleQualitySlider(e.target.value)}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0 (Severe Distress)</span>
                  <span>60 (Threshold Limit)</span>
                  <span>100 (Optimal Condition)</span>
                </div>
              </div>

              {/* Multi-Metrics Grid */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  Configured Ground-Truth Monitoring Parameters
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Metric: Milestone Completion */}
                  <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
                    <label className="font-bold text-slate-700 block">Milestone Completion SLA</label>
                    <select
                      value={metrics['Milestone Completion'] || 'Not Completed'}
                      onChange={(e) => handleMetricChange('Milestone Completion', e.target.value)}
                      className="w-full p-1.5 border border-slate-300 rounded text-slate-800 bg-white"
                    >
                      <option value="Completed">Completed</option>
                      <option value="On Schedule">On Schedule</option>
                      <option value="Not Completed">Not Completed (Delay)</option>
                    </select>
                  </div>

                  {/* Metric: Quality Grade */}
                  <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
                    <label className="font-bold text-slate-700 block">Material & Concrete Quality</label>
                    <select
                      value={metrics['Quality'] || 'Poor'}
                      onChange={(e) => handleMetricChange('Quality', e.target.value)}
                      className="w-full p-1.5 border border-slate-300 rounded text-slate-800 bg-white"
                    >
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Satisfactory">Satisfactory</option>
                      <option value="Poor">Poor (Defect Detected)</option>
                    </select>
                  </div>

                  {/* Metric: Safety */}
                  <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
                    <label className="font-bold text-slate-700 block">Site Safety Compliance</label>
                    <select
                      value={metrics['Safety'] || 'Compliant'}
                      onChange={(e) => handleMetricChange('Safety', e.target.value)}
                      className="w-full p-1.5 border border-slate-300 rounded text-slate-800 bg-white"
                    >
                      <option value="Compliant">Compliant</option>
                      <option value="Minor Hazard">Minor Hazard</option>
                      <option value="Critical Hazard">Critical Hazard</option>
                    </select>
                  </div>

                  {/* Metric: Pothole Density */}
                  <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
                    <label className="font-bold text-slate-700 block">Pothole Density (count/km)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={metrics['Pothole Density'] || 18}
                      onChange={(e) => handleMetricChange('Pothole Density', Number(e.target.value))}
                      className="w-full p-1.5 border border-slate-300 rounded text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Live Rule Trigger Warning */}
              {rulesWillTrigger.length > 0 && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Rule Engine Pre-Validation: Exceptions Will Be Generated</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-700">
                    {rulesWillTrigger.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                  <p className="text-[10px] text-slate-500 pt-0.5">
                    Submitting will automatically create tracked issues with Operational Timelines and notify the District Executive Engineer.
                  </p>
                </div>
              )}

              {/* Textual Observations */}
              <div>
                <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">
                  Field Observations (Ground-Truth Findings)
                </label>
                <textarea
                  rows="3"
                  required
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Recommendations */}
              <div>
                <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">
                  Actionable Engineering Recommendation
                </label>
                <textarea
                  rows="2"
                  value={recommendation}
                  onChange={(e) => setRecommendation(e.target.value)}
                  placeholder="Recommended rectification actions or corrective engineering notice..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Evidence Upload Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                    Site Evidence & Media Attachments ({evidenceFiles.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddEvidencePhoto}
                    className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center gap-1 transition"
                  >
                    <Camera className="w-3.5 h-3.5 text-blue-600" />
                    <span>Attach Photo</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {evidenceFiles.map((ev, i) => (
                    <div key={i} className="relative rounded-lg border border-slate-200 overflow-hidden bg-slate-50 group">
                      <img
                        src={ev.file_url}
                        alt={ev.caption || ev.file_name}
                        className="w-full h-20 object-cover"
                      />
                      <div className="p-1.5 text-[10px] text-slate-600 truncate">
                        {ev.caption || ev.file_name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  Immutable Record: Cannot be modified after submission
                </span>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-sm flex items-center gap-1.5"
                >
                  <span>Proceed to Review</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: REVIEW */}
          {step === 'review' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                <h4 className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  P1 Immutability Commitment
                </h4>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Upon final confirmation, this evaluation record will be cryptographically locked and marked immutable in the PRAVI registry. Automated monitoring rules will execute immediately against ground-truth parameters.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-800">Overall Quality Score:</span>
                  <span className="font-mono font-bold text-base text-blue-700">{qualityScore} / 100</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {Object.entries(metrics).map(([k, v]) => (
                    <div key={k} className="p-2 bg-white rounded border border-slate-200">
                      <span className="text-slate-500 block">{k}</span>
                      <span className="font-bold text-slate-900">{String(v)}</span>
                    </div>
                  ))}
                </div>

                <div>
                  <span className="font-bold text-slate-800 block mb-0.5">Observations:</span>
                  <p className="text-slate-700 bg-white p-2.5 rounded border border-slate-200">{observations}</p>
                </div>

                {recommendation && (
                  <div>
                    <span className="font-bold text-slate-800 block mb-0.5">Recommendation:</span>
                    <p className="text-slate-700 bg-white p-2.5 rounded border border-slate-200">{recommendation}</p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Edit Observations</span>
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSubmit}
                  className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{submitting ? 'Submitting & Executing Rules...' : 'Confirm & Lock Evaluation'}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS */}
          {step === 'success' && (
            <div className="space-y-4 text-center py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Evaluation Submitted & Automated Rules Executed!
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  The evaluation has been committed as an immutable record.
                </p>
              </div>

              {resultData?.issues_created?.length > 0 && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-left text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-rose-800">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Automated Issue Created via Rule Engine</span>
                  </div>
                  {resultData.issues_created.map((iss) => (
                    <div key={iss.id} className="p-2.5 bg-white rounded-lg border border-rose-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-rose-700">{iss.id}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                          {iss.severity}
                        </span>
                      </div>
                      <p className="font-bold text-slate-900">{iss.title}</p>
                      <p className="text-[11px] text-slate-600">{iss.detection_reason}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-4 flex justify-center">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-sm"
                >
                  Done & Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
