import React from 'react';

export default function StatusBadge({ status, className = '' }) {
  if (!status) return null;

  const normalized = String(status).toLowerCase().trim();

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';

  if (
    normalized.includes('completed') ||
    normalized.includes('resolved') ||
    normalized.includes('healthy') ||
    normalized.includes('sound') ||
    normalized.includes('compliant') ||
    normalized.includes('safe') ||
    normalized === 'good' ||
    normalized === 'excellent' ||
    normalized === 'awarded'
  ) {
    colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (
    normalized.includes('delayed') ||
    normalized.includes('warning') ||
    normalized.includes('pending') ||
    normalized.includes('review') ||
    normalized.includes('caution') ||
    normalized.includes('action initiated') ||
    normalized.includes('resolution submitted') ||
    normalized === 'satisfactory'
  ) {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (
    normalized.includes('critical') ||
    normalized.includes('issue') ||
    normalized.includes('rejected') ||
    normalized.includes('not completed') ||
    normalized.includes('hazard') ||
    normalized.includes('defect') ||
    normalized === 'poor' ||
    normalized === 'failed'
  ) {
    colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (
    normalized.includes('active') ||
    normalized.includes('development') ||
    normalized.includes('maintenance') ||
    normalized.includes('assigned') ||
    normalized.includes('open for bidding') ||
    normalized.includes('in_progress')
  ) {
    colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (
    normalized.includes('upcoming') ||
    normalized.includes('proposal') ||
    normalized.includes('not started')
  ) {
    colorClasses = 'bg-slate-100 text-slate-600 border-slate-200';
  }

  const displayLabel = status.replace(/_/g, ' ');

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border ${colorClasses} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {displayLabel}
    </span>
  );
}
