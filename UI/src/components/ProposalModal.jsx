import React, { useState } from 'react';
import { Briefcase, DollarSign, FileText, CheckCircle2, X, AlertCircle } from 'lucide-react';

export default function ProposalModal({ tender, onClose, onSubmitProposal }) {
  const [companyName, setCompanyName] = useState('Gujarat Megastructure Builders LLP');
  const [contactEmail, setContactEmail] = useState('tenders@megastructure-guj.com');
  const [contactPhone, setContactPhone] = useState('+91 98250 11223');
  const [proposedAmountCr, setProposedAmountCr] = useState(
    tender?.estimated_value_cr ? (tender.estimated_value_cr * 0.98).toFixed(2) : 100.0
  );
  const [proposalSummary, setProposalSummary] = useState(
    'Turnkey rigid pavement technical proposal with automated slipform pavers, batching plant in vicinity, and 5-year defect liability warranty.'
  );
  const [submitting, setSubmitting] = useState(false);

  if (!tender) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmitProposal(tender.id, {
        tender_id: tender.id,
        company_name: companyName.trim(),
        contact_email: contactEmail.trim(),
        contact_phone: contactPhone.trim(),
        proposed_amount_cr: parseFloat(proposedAmountCr),
        proposal_summary: proposalSummary.trim(),
        documents: [
          { name: `Technical_Proposal_${companyName.replace(/\s+/g, '_')}.pdf`, size: '4.2 MB' },
          { name: 'Financial_Bill_of_Quantities.xlsx', size: '680 KB' }
        ]
      });
      alert('Your proposal has been submitted successfully to the Gujarat R&B Department!');
      onClose();
    } catch (err) {
      alert('Error submitting proposal: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Submit Contractor Bid / Proposal
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Tender: <strong className="text-slate-800">{tender.id}</strong> — {tender.tender_title?.slice(0, 40)}...
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Tender Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-indigo-50/50 border border-indigo-100">
            <div>
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">Est. Value</span>
              <span className="font-bold text-slate-900">₹{tender.estimated_value_cr} Cr</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">Contract Period</span>
              <span className="font-bold text-slate-900">{tender.contract_period_months} Months</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">Closing Date</span>
              <span className="font-mono font-bold text-slate-900">{tender.bid_closing_date}</span>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">
              Contractor / Company Legal Entity
            </label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">
                Official Bid Email
              </label>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">
                Authorized Phone
              </label>
              <input
                type="text"
                required
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">
              Proposed Price Bid (₹ Crores)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 font-bold text-slate-400">₹</span>
              <input
                type="number"
                step="0.01"
                required
                value={proposedAmountCr}
                onChange={(e) => setProposedAmountCr(e.target.value)}
                className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">
              Technical Methodology & Equipment Deployment Plan
            </label>
            <textarea
              rows="3"
              required
              value={proposalSummary}
              onChange={(e) => setProposalSummary(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
            />
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Simulated Attachments: Technical Proposal & Financial Schedule B</span>
            </div>
            <span className="font-semibold text-emerald-700">Validated</span>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-sm flex items-center gap-1.5"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>{submitting ? 'Submitting Bid...' : 'Submit Official Proposal'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
