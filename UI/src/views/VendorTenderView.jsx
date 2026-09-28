import React, { useState } from 'react';
import {
  Briefcase,
  Download,
  ExternalLink
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export default function VendorTenderView({ tenders = [], onSelectProject }) {
  const [downloadNotice, setDownloadNotice] = useState(null);

  const activeTenders = tenders.filter((t) => t.status === 'Open for Bidding' || t.status === 'Under Technical Evaluation');
  const awardedTenders = tenders.filter((t) => t.status === 'Awarded');

  const handleDownloadSim = (docName) => {
    setDownloadNotice(`Simulating download of ${docName} from Gujarat e-Procurement Portal`);
    setTimeout(() => setDownloadNotice(null), 3500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Briefcase className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-700">
                Gujarat R&B Tender & Procurement Portal
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Contractor & Vendor Tender Opportunities
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
              Public e-tenders, Notice Inviting Tenders (NIT), Class-AA pre-qualification criteria, and contract SLA specifications.
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-center">
              <span className="text-slate-500 text-[10px] uppercase block font-semibold">Open Bids</span>
              <span className="text-lg font-bold text-blue-700">{activeTenders.length}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-center">
              <span className="text-slate-500 text-[10px] uppercase block font-semibold">Awarded Contracts</span>
              <span className="text-lg font-bold text-emerald-700">{awardedTenders.length}</span>
            </div>
          </div>
        </div>
      </div>

      {downloadNotice && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2 rounded-xl text-xs flex items-center justify-between shadow-sm">
          <span>{downloadNotice}</span>
          <span className="text-[10px] font-mono font-bold text-blue-600">Success</span>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {tenders.map((tender) => {
          const isOpen = tender.status === 'Open for Bidding';
          return (
            <div
              key={tender.id}
              className={`rounded-2xl p-5 border flex flex-col justify-between transition-all ${
                isOpen
                  ? 'bg-white border-blue-300 shadow-md'
                  : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-indigo-700 border border-slate-200">
                    {tender.id}
                  </span>
                  <StatusBadge status={tender.status} />
                </div>

                <h3 className="text-base font-bold text-slate-900">
                  {tender.tender_title}
                </h3>

                <p className="text-xs text-slate-500 mt-1">
                  Project: <strong className="text-slate-700">{tender.project_name}</strong>
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
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
                    <span className="text-slate-700 font-medium">{tender.contract_period_months} Months</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-semibold block">Bid Closing Date</span>
                    <span className="font-mono text-amber-700 font-bold">{tender.bid_closing_date}</span>
                  </div>
                </div>

                {tender.awarded_vendor && (
                  <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                    <span className="text-slate-500 text-[11px] block">Awarded Contractor:</span>
                    <span className="text-slate-900 font-bold">{tender.awarded_vendor}</span>
                    {tender.awarded_value_cr && (
                      <span className="text-emerald-700 font-mono text-[11px] block mt-0.5 font-semibold">
                        Sanctioned Bid Value: ₹{tender.awarded_value_cr} Cr
                      </span>
                    )}
                  </div>
                )}

                {tender.eligibility_criteria && (
                  <div className="mt-3 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-800 block mb-0.5">Prequalification Criteria:</span>
                    <p className="line-clamp-2">{tender.eligibility_criteria}</p>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => onSelectProject(tender.project_id)}
                  className="text-xs text-blue-700 hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>View Project SLA</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-2">
                  {tender.documents?.map((doc, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleDownloadSim(doc.name)}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium flex items-center gap-1 transition"
                      title={doc.category}
                    >
                      <Download className="w-3 h-3 text-slate-500" />
                      <span>{doc.name.split('.')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
