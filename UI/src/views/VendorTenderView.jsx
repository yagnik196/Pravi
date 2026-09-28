import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Download,
  ExternalLink,
  FileText,
  Clock,
  CheckCircle2,
  DollarSign,
  Send,
  Building
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import ProposalModal from '../components/ProposalModal';
import { api } from '../api';

export default function VendorTenderView({
  tenders = [],
  onSelectProject
}) {
  const [activeTab, setActiveTab] = useState('tenders'); // 'tenders' | 'proposals'
  const [selectedTenderForBid, setSelectedTenderForBid] = useState(null);
  const [downloadNotice, setDownloadNotice] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loadingProposals, setLoadingProposals] = useState(false);

  const loadProposals = async () => {
    try {
      setLoadingProposals(true);
      const res = await api.getProposals();
      setProposals(res.data || []);
    } catch (err) {
      console.error('Failed to load proposals:', err);
    } finally {
      setLoadingProposals(false);
    }
  };

  useEffect(() => {
    loadProposals();
  }, []);

  const handleDownloadSim = (docName) => {
    setDownloadNotice(`Simulating secure download of ${docName} from Gujarat e-Procurement Portal`);
    setTimeout(() => setDownloadNotice(null), 3500);
  };

  const handleSubmitProposal = async (tenderId, payload) => {
    await api.submitProposal(tenderId, payload);
    await loadProposals();
  };

  const openTenders = tenders.filter(
    (t) => t.status === 'OPEN' || t.status === 'Open for Bidding'
  );
  const otherTenders = tenders.filter(
    (t) => t.status !== 'OPEN' && t.status !== 'Open for Bidding'
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Briefcase className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-700">
                Gujarat R&B Tender & Procurement Portal (P1)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Contractor & Vendor Tender Lifecycle
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
              Notice Inviting Tenders (NIT), Class-AA pre-qualification criteria, digital proposal submissions, and real-time bid evaluation status.
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-center">
              <span className="text-slate-500 text-[10px] uppercase block font-semibold">Open Bids</span>
              <span className="text-lg font-bold text-blue-700">{openTenders.length}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-center">
              <span className="text-slate-500 text-[10px] uppercase block font-semibold">My Submitted Bids</span>
              <span className="text-lg font-bold text-indigo-700">{proposals.length}</span>
            </div>
          </div>
        </div>
      </div>

      {downloadNotice && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between shadow-sm animate-in fade-in">
          <span>{downloadNotice}</span>
          <span className="text-[10px] font-mono font-bold text-blue-600">Simulated Download</span>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200 flex gap-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('tenders')}
          className={`pb-2.5 border-b-2 transition ${
            activeTab === 'tenders'
              ? 'border-indigo-600 text-indigo-700 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          All Public Tenders ({tenders.length})
        </button>

        <button
          onClick={() => setActiveTab('proposals')}
          className={`pb-2.5 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'proposals'
              ? 'border-indigo-600 text-indigo-700 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Submitted Contractor Proposals</span>
          <span className="px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-800 font-mono text-[10px]">
            {proposals.length}
          </span>
        </button>
      </div>

      {/* TAB 1: TENDERS LIST */}
      {activeTab === 'tenders' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {tenders.map((tender) => {
            const isOpen = tender.status === 'OPEN' || tender.status === 'Open for Bidding';
            return (
              <div
                key={tender.id}
                className={`rounded-2xl p-5 border flex flex-col justify-between transition-all ${
                  isOpen
                    ? 'bg-white border-indigo-300 shadow-md ring-1 ring-indigo-100'
                    : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-indigo-700 border border-slate-200">
                      {tender.id}
                    </span>
                    <StatusBadge status={tender.status} />
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {tender.tender_title}
                  </h3>

                  <p className="text-xs text-slate-500">
                    Linked Asset: <strong className="text-slate-700">{tender.project_name}</strong> ({tender.district} District)
                  </p>

                  <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-semibold block">Estimated Value</span>
                      <span className="font-mono font-bold text-emerald-700 text-sm">₹{tender.estimated_value_cr} Cr</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-semibold block">Earnest Money (EMD)</span>
                      <span className="font-mono text-slate-800 font-semibold">₹{tender.earnest_money_deposit_cr} Cr</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-semibold block">Contract Period</span>
                      <span className="text-slate-800 font-semibold">{tender.contract_period_months} Months</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-semibold block">Submission Deadline</span>
                      <span className="font-mono text-rose-700 font-semibold">{tender.bid_closing_date}</span>
                    </div>
                  </div>

                  {tender.eligibility_criteria && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                      <span className="font-bold text-slate-800 block mb-0.5 text-[10px] uppercase">Eligibility Criteria:</span>
                      <p className="line-clamp-2 leading-relaxed">{tender.eligibility_criteria}</p>
                    </div>
                  )}

                  {/* Documents */}
                  {tender.documents && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Procurement Documents & BOQ
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {tender.documents.map((doc, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleDownloadSim(doc.name)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center gap-1.5 transition"
                          >
                            <Download className="w-3 h-3 text-slate-500" />
                            <span>{doc.name}</span>
                            <span className="text-slate-400 text-[10px]">({doc.size})</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => onSelectProject(tender.project_id)}
                    className="text-xs font-semibold text-slate-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <span>View Infrastructure Asset</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>

                  {isOpen ? (
                    <button
                      onClick={() => setSelectedTenderForBid(tender)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Proposal / Bid</span>
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-slate-400">
                      {tender.awarded_vendor ? `Awarded to ${tender.awarded_vendor}` : 'Bidding Closed'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: MY SUBMITTED PROPOSALS (P1.19) */}
      {activeTab === 'proposals' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Submitted Contractor Proposals ({proposals.length})
            </h3>
            <p className="text-xs text-slate-500">
              Transparent proposal evaluation tracking without confidential financial leaks
            </p>

            {loadingProposals ? (
              <div className="py-12 text-center text-xs text-slate-500">Loading submitted proposals...</div>
            ) : proposals.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">No proposals submitted yet.</div>
            ) : (
              <div className="space-y-3">
                {proposals.map((prop) => (
                  <div key={prop.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-indigo-700">{prop.id}</span>
                        <h4 className="font-bold text-slate-900">{prop.company_name}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-mono text-[11px]">Submitted: {prop.submission_date}</span>
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          {prop.status}
                        </span>
                      </div>
                    </div>

                    <p className="text-slate-700 leading-relaxed">{prop.proposal_summary}</p>

                    <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                      <span>Tender ID: <strong className="font-mono text-slate-800">{prop.tender_id}</strong></span>
                      <span>Proposed Bid Amount: <strong className="font-mono font-bold text-emerald-700 text-sm">₹{prop.proposed_amount_cr} Cr</strong></span>
                      <span>Contact: <strong className="text-slate-700">{prop.contact_email}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Proposal Submission Modal */}
      {selectedTenderForBid && (
        <ProposalModal
          tender={selectedTenderForBid}
          onClose={() => setSelectedTenderForBid(null)}
          onSubmitProposal={handleSubmitProposal}
        />
      )}
    </div>
  );
}
