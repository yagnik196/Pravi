import React from 'react';
import { Check, CircleDot } from 'lucide-react';

const STANDARD_STAGES = [
  'Proposal',
  'State Approval',
  'Tender Proposal',
  'Tender Approval',
  'Contract / SLA',
  'Development',
  'Maintenance'
];

export default function LifecycleTimeline({ stages = [], currentStage = 'Development' }) {
  const stagesMap = {};
  stages.forEach((s) => {
    stagesMap[s.stage] = s;
  });

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            Project Lifecycle Timeline
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Full contractual lifecycle progression (Gujarat R&B Standard)
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-700 font-semibold">
          Current Phase: {currentStage}
        </span>
      </div>

      <div className="relative pt-2 pb-1 overflow-x-auto">
        <div className="flex items-start min-w-[650px] justify-between relative">
          {/* Background Line */}
          <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 z-0" />

          {STANDARD_STAGES.map((stageName, idx) => {
            const stageData = stagesMap[stageName] || {};
            const isCompleted = stageData.status === 'completed';
            const isInProgress = stageData.status === 'in_progress' || stageName === currentStage;

            let circleColor;
            let iconNode;
            let labelColor;

            if (isCompleted) {
              circleColor = 'bg-emerald-600 text-white shadow-sm';
              iconNode = <Check className="w-4 h-4 stroke-[3]" />;
              labelColor = 'text-emerald-700 font-semibold';
            } else if (isInProgress) {
              circleColor = 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-sm';
              iconNode = <CircleDot className="w-4 h-4 stroke-[2.5]" />;
              labelColor = 'text-blue-700 font-bold';
            } else {
              circleColor = 'bg-slate-100 text-slate-400 border border-slate-300';
              iconNode = <span className="text-[11px] font-mono font-medium">{idx + 1}</span>;
              labelColor = 'text-slate-500 font-medium';
            }

            return (
              <div key={stageName} className="flex flex-col items-center relative z-10 flex-1 px-1 group">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${circleColor}`}
                  title={stageData.note || stageName}
                >
                  {iconNode}
                </div>

                <div className="mt-2 text-center">
                  <p className={`text-xs ${labelColor} leading-tight`}>
                    {stageName}
                  </p>
                  {stageData.completed_at ? (
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {stageData.completed_at}
                    </p>
                  ) : isInProgress ? (
                    <span className="text-[10px] text-blue-700 font-mono mt-0.5 inline-block bg-blue-50 px-1.5 rounded">
                      In Progress
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Upcoming
                    </span>
                  )}
                </div>

                {stageData.note && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 pointer-events-none z-30 bg-slate-900 text-white text-[11px] rounded-lg p-2 shadow-xl max-w-xs text-center">
                    {stageData.note}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
