// Centralized API client for PRAVI system
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

  // Projects
  getProjects: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchJson(`/projects${query ? `?${query}` : ''}`);
  },
  getProject: (id) => fetchJson(`/projects/${id}`),
  createProject: (data) => fetchJson('/projects', { method: 'POST', body: JSON.stringify(data) }),
  updateProject: (id, data) => fetchJson(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  addComment: (id, comment) => fetchJson(`/projects/${id}/comments`, { method: 'POST', body: JSON.stringify(comment) }),
  addChangeRequest: (id, cr) => fetchJson(`/projects/${id}/change-requests`, { method: 'POST', body: JSON.stringify(cr) }),
  respondChangeRequest: (projectId, crId, response) => fetchJson(`/projects/${projectId}/change-requests/${crId}/respond`, {
    method: 'POST',
    body: JSON.stringify(response)
  }),

  // Evaluations
  getEvaluations: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchJson(`/evaluations${query ? `?${query}` : ''}`);
  },
  getEvaluation: (id) => fetchJson(`/evaluations/${id}`),
  submitEvaluation: (id, data) => fetchJson(`/evaluations/${id}/submit`, { method: 'POST', body: JSON.stringify(data) }),

  // Issues & Operational Timeline
  getIssues: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchJson(`/issues${query ? `?${query}` : ''}`);
  },
  getIssue: (id) => fetchJson(`/issues/${id}`),
  advanceTimeline: (issueId, payload) => fetchJson(`/issues/${issueId}/timeline-advance`, {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  // Tenders
  getTenders: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchJson(`/tenders${query ? `?${query}` : ''}`);
  },
  getTender: (id) => fetchJson(`/tenders/${id}`),

  // Citizen Public Portal
  getCitizenProjects: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchJson(`/citizen/projects${query ? `?${query}` : ''}`);
  },
  getCitizenProjectDetail: (id) => fetchJson(`/citizen/projects/${id}`),
};
