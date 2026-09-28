// Centralized API client for PRAVI P1 system
// Configured dynamically from UI/.env via VITE_API_BASE_URL

const envBase = (import.meta.env.VITE_API_BASE_URL || '').trim();
const API_BASE = envBase
  ? (envBase.endsWith('/api') ? envBase : `${envBase.replace(/\/+$/, '')}/api`)
  : '/api';

async function fetchJson(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.detail || `Request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error(`API Error on [${options.method || 'GET'} ${url}]:`, err);
    throw err;
  }
}

export const api = {
  // Health & Seed
  getHealth: () => fetchJson('/health'),
  reseed: (force = true) => fetchJson(`/seed?force=${force}`, { method: 'POST' }),

  // Hierarchy & Stats
  getHierarchy: () => fetchJson('/hierarchy'),
  getStats: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchJson(`/stats${query ? `?${query}` : ''}`);
  },

  // Infrastructure & Projects (Single Source of Truth)
  getProjects: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchJson(`/projects${query ? `?${query}` : ''}`);
  },
  getProject: (id) => fetchJson(`/projects/${id}`),
  createProject: (data, role) => fetchJson('/projects', {
    method: 'POST',
    headers: role ? { 'X-Role': role } : {},
    body: JSON.stringify(data)
  }),
  updateProject: (id, data, role) => fetchJson(`/projects/${id}`, {
    method: 'PATCH',
    headers: role ? { 'X-Role': role } : {},
    body: JSON.stringify(data)
  }),
  addComment: (id, comment) => fetchJson(`/projects/${id}/comments`, {
    method: 'POST',
    body: JSON.stringify(comment)
  }),
  addChangeRequest: (id, cr) => fetchJson(`/projects/${id}/change-requests`, {
    method: 'POST',
    body: JSON.stringify(cr)
  }),
  respondChangeRequest: (projectId, crId, response) => fetchJson(`/projects/${projectId}/change-requests/${crId}/respond`, {
    method: 'POST',
    body: JSON.stringify(response)
  }),
  addMonitoringRule: (projectId, rule) => fetchJson(`/projects/${projectId}/monitoring-rules`, {
    method: 'POST',
    body: JSON.stringify(rule)
  }),

  // Evaluations & Rule Engine
  getEvaluations: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchJson(`/evaluations${query ? `?${query}` : ''}`);
  },
  getEvaluation: (id) => fetchJson(`/evaluations/${id}`),
  submitEvaluation: (id, data) => fetchJson(`/evaluations/${id}/submit`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Issues & Operational Timeline
  getIssues: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchJson(`/issues${query ? `?${query}` : ''}`);
  },
  getIssue: (id) => fetchJson(`/issues/${id}`),
  advanceTimeline: (issueId, payload, role) => fetchJson(`/issues/${issueId}/timeline-advance`, {
    method: 'POST',
    headers: role ? { 'X-Role': role } : {},
    body: JSON.stringify(payload)
  }),

  // Maintenance Workflows
  getMaintenance: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchJson(`/maintenance${query ? `?${query}` : ''}`);
  },
  getMaintenanceDetail: (id) => fetchJson(`/maintenance/${id}`),
  createMaintenance: (data, role) => fetchJson('/maintenance', {
    method: 'POST',
    headers: role ? { 'X-Role': role } : {},
    body: JSON.stringify(data)
  }),
  completeMaintenance: (id, role) => fetchJson(`/maintenance/${id}/complete`, {
    method: 'POST',
    headers: role ? { 'X-Role': role } : {}
  }),
  verifyMaintenance: (id, payload) => fetchJson(`/maintenance/${id}/verify`, {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  // Tenders & Proposals
  getTenders: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchJson(`/tenders${query ? `?${query}` : ''}`);
  },
  getTender: (id) => fetchJson(`/tenders/${id}`),
  submitProposal: (tenderId, data) => fetchJson(`/tenders/${tenderId}/proposals`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getProposals: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchJson(`/proposals${query ? `?${query}` : ''}`);
  },

  // Evidence & Media
  uploadEvidence: (data) => fetchJson('/evidence/upload', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // In-App Notifications
  getNotifications: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchJson(`/notifications${query ? `?${query}` : ''}`);
  },
  markNotificationRead: (id) => fetchJson(`/notifications/${id}/read`, { method: 'POST' }),

  // Audit Logs
  getAuditLogs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchJson(`/audit-logs${query ? `?${query}` : ''}`);
  },

  // Citizen Public Transparency Portal
  getCitizenProjects: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchJson(`/citizen/projects${query ? `?${query}` : ''}`);
  },
  getCitizenProjectDetail: (id) => fetchJson(`/citizen/projects/${id}`),
};
