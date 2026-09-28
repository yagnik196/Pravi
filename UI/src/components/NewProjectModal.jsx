import React, { useState } from 'react';
import { PlusCircle, X } from 'lucide-react';

export default function NewProjectModal({
  district = 'Ahmedabad',
  region = 'Ahmedabad Region',
  onClose,
  onCreateProject
}) {
  const [formData, setFormData] = useState({
    id: `RNB-2026-${Math.floor(100 + Math.random() * 900)}`,
    name: '',
    category: 'Road',
    work_type: 'Development',
    location: '',
    responsible_org: `${district} R&B Division`,
    responsible_employee: 'Er. R. K. Patel (Executive Engineer)',
    contractor: '',
    estimated_cost_cr: 45.0,
    start_date: new Date().toISOString().split('T')[0],
    expected_completion: '2027-06-30',
    description: '',
    priority: 'High',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'estimated_cost_cr' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.contractor) {
      alert('Please fill in required fields: Name and Contractor');
      return;
    }

    setSubmitting(true);
    try {
      await onCreateProject({
        ...formData,
        state: 'Gujarat',
        region,
        district,
      });
      onClose();
    } catch (err) {
      alert('Error creating project: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
              <PlusCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Register New Infrastructure Project
            </h3>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500 mt-2">
          Owning District: <strong className="text-blue-700">{district}</strong> ({region})
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-700 font-semibold block mb-1">Project ID</label>
              <input
                type="text"
                name="id"
                value={formData.id}
                onChange={handleChange}
                required
                className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono text-slate-900"
              />
            </div>
            <div>
              <label className="text-slate-700 font-semibold block mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900"
              >
                <option value="Road">Road</option>
                <option value="Bridge">Bridge</option>
                <option value="Building">Building</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-slate-700 font-semibold block mb-1">Project Name *</label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Sanand Industrial Ring Road Extension"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-700 font-semibold block mb-1">Work Type</label>
              <select
                name="work_type"
                value={formData.work_type}
                onChange={handleChange}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900"
              >
                <option value="Development">Development</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
            <div>
              <label className="text-slate-700 font-semibold block mb-1">Estimated Cost (₹ Cr) *</label>
              <input
                type="number"
                step="0.1"
                name="estimated_cost_cr"
                value={formData.estimated_cost_cr}
                onChange={handleChange}
                required
                className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-700 font-semibold block mb-1">Contractor / Agency *</label>
            <input
              type="text"
              name="contractor"
              placeholder="e.g. Larsen & Toubro / Patel Infrastructure"
              value={formData.contractor}
              onChange={handleChange}
              required
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900"
            />
          </div>

          <div>
            <label className="text-slate-700 font-semibold block mb-1">Location Details</label>
            <input
              type="text"
              name="location"
              placeholder="e.g. Sanand GIDC Junction to Viramgam Highway"
              value={formData.location}
              onChange={handleChange}
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-700 font-semibold block mb-1">Start Date</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="text-slate-700 font-semibold block mb-1">Target Completion</label>
              <input
                type="date"
                name="expected_completion"
                value={formData.expected_completion}
                onChange={handleChange}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-700 font-semibold block mb-1">Description / Project Scope</label>
            <textarea
              name="description"
              rows={2}
              value={formData.description}
              onChange={handleChange}
              placeholder="Engineering scope, lane specifications, structures..."
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{submitting ? 'Creating...' : 'Register Project'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
