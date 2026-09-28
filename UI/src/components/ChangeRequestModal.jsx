import React, { useState } from 'react';
import { MessageSquarePlus, X, Send } from 'lucide-react';

export default function ChangeRequestModal({
  projectId,
  projectName,
  onClose,
  onSubmitChangeRequest
}) {
  const [message, setMessage] = useState(
    'Please review expected completion date and mobilize additional hydraulic crane based on latest field evaluation delay.'
  );
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSubmitting(true);
    try {
      await onSubmitChangeRequest(projectId, {
        requested_by: 'State Authority (Chief Engineer, R&B Gandhinagar)',
        message: message.trim()
      });
      onClose();
    } catch (err) {
      alert('Error submitting change request: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 rounded-xl p-5 max-w-lg w-full shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
              <MessageSquarePlus className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              State Oversight Change Request
            </h3>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-600 mt-2">
          Project: <strong className="text-slate-900">{projectName}</strong> ({projectId})
        </p>

        <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-2.5 text-xs text-blue-800 mt-3">
          🏛️ <strong>State Authority Principle:</strong> State exercises supervisory oversight by issuing formal change directives to the responsible District Circle instead of overwriting district project data directly.
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Directive / Change Requisition:
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              required
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              placeholder="Specify required corrections, milestone SLA adjustments, or resource deployments..."
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Sending...' : 'Issue Formal Request'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
