import React from 'react';
import { Bell, AlertTriangle, Clock, ShieldCheck, FileText, CheckCircle2, X } from 'lucide-react';

export default function NotificationsDrawer({
  notifications,
  onClose,
  onMarkRead,
  onSelectEntity
}) {
  const getIcon = (type) => {
    switch (type) {
      case 'CRITICAL_ISSUE':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'OVERDUE_MAINTENANCE':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'VERIFICATION_REQUIRED':
        return <ShieldCheck className="w-4 h-4 text-purple-600" />;
      default:
        return <FileText className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[85vh] mt-12 mr-2">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Operational Alerts & Notifications
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="p-3 overflow-y-auto space-y-2 flex-1 divide-y divide-slate-100">
          {(!notifications || notifications.length === 0) ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No active notifications. All systems operational.
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-3 rounded-xl transition cursor-pointer text-xs space-y-1 ${
                  notif.is_read ? 'bg-white opacity-70' : 'bg-blue-50/40 hover:bg-blue-50 border border-blue-100'
                }`}
                onClick={() => {
                  if (!notif.is_read) onMarkRead(notif.id);
                  if (onSelectEntity) onSelectEntity(notif.entity_type, notif.entity_id);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    {getIcon(notif.type)}
                    <span>{notif.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(notif.created_at).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short'
                    })}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed pl-5">
                  {notif.message}
                </p>
                <div className="pl-5 pt-1 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Scope: {notif.district || 'State-wide'}</span>
                  {!notif.is_read && (
                    <span className="text-blue-700 font-semibold">Unread</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
