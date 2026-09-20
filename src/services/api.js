/**
 * Client API Client for SentinelWorks Air-Gap Enclave
 * All calls are routed locally through 127.0.0.1 loopback
 */

const API_BASE = '/api';

export async function fetchRoles() {
  const res = await fetch(`${API_BASE}/roles`);
  if (!res.ok) throw new Error('Failed to fetch user clearance roles');
  return res.json();
}

export async function fetchDocuments(role) {
  const url = role ? `${API_BASE}/documents?role=${encodeURIComponent(role)}` : `${API_BASE}/documents`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch document repository');
  return res.json();
}

export async function fetchDocumentById(id, role) {
  const url = role ? `${API_BASE}/documents/${id}?role=${encodeURIComponent(role)}` : `${API_BASE}/documents/${id}`;
  const res = await fetch(url);
  if (res.status === 403) {
    const errorData = await res.json();
    return { restricted: true, ...errorData };
  }
  if (!res.ok) throw new Error('Failed to fetch document details');
  return res.json();
}

export async function uploadDocument(formData) {
  const res = await fetch(`${API_BASE}/documents/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Document ingestion failed');
  }
  return res.json();
}

export async function submitSensitiveConsent(documentId, decisions, role) {
  const res = await fetch(`${API_BASE}/documents/${encodeURIComponent(documentId)}/sensitive-consent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ decisions, role }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to submit sensitive consent decisions');
  }
  return res.json();
}

export async function fetchSensitiveFindings(documentId) {
  const res = await fetch(`${API_BASE}/documents/${encodeURIComponent(documentId)}/sensitive-findings`);
  if (!res.ok) throw new Error('Failed to scan document for sensitive findings');
  return res.json();
}

export async function searchKnowledgeBase(query, role) {
  const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}&role=${encodeURIComponent(role)}`);
  if (!res.ok) throw new Error('Knowledge base search failed');
  return res.json();
}

export async function fetchTaskTemplates() {
  const res = await fetch(`${API_BASE}/tasks/templates`);
  if (!res.ok) throw new Error('Failed to load task templates');
  return res.json();
}

export async function planTask(goal, role, documentId) {
  const res = await fetch(`${API_BASE}/tasks/plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ goal, role, documentId }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const err = new Error(data.message || data.error || 'Task decomposition failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return res.json();
}

export async function executeTaskStep(taskId, stepNumber, role) {
  const res = await fetch(`${API_BASE}/tasks/execute-step`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ taskId, stepNumber, role }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const err = new Error(data.message || data.error || 'Step execution failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return res.json();
}

export async function runSandboxedCalculation(code, variables, role) {
  const res = await fetch(`${API_BASE}/tasks/run-calculation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, variables, role }),
  });
  if (!res.ok) throw new Error('Sandboxed execution failed');
  return res.json();
}

export async function approveTask({ taskId, role, approverName, digitalSignature, modifications }) {
  const res = await fetch(`${API_BASE}/tasks/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ taskId, role, approverName, digitalSignature, modifications }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const err = new Error(data.message || data.error || 'Approval gate sign-off failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return res.json();
}

export async function rejectTask({ taskId, role, approverName, reason }) {
  const res = await fetch(`${API_BASE}/tasks/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ taskId, role, approverName, reason }),
  });
  if (!res.ok) throw new Error('Rejection submission failed');
  return res.json();
}

export function getDeliverableExportUrl(taskId, format = 'txt') {
  return `${API_BASE}/tasks/export/${taskId}?format=${format}`;
}

export async function fetchSovereigntyMetrics() {
  const res = await fetch(`${API_BASE}/sovereignty`);
  if (!res.ok) throw new Error('Failed to retrieve sovereignty telemetry');
  return res.json();
}

export async function checkUploadSovereignty() {
  const res = await fetch(`${API_BASE}/sovereignty/check`);
  if (!res.ok) throw new Error('Failed to retrieve live sovereignty verification');
  return res.json();
}

export async function testSovereigntyProbe(clientType = 'fetch', url = 'https://www.wikipedia.org') {
  const res = await fetch(`${API_BASE}/sovereignty/test-probe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientType, url })
  });
  return res.json();
}

export async function fetchSovereigntyLiveMetrics() {
  const res = await fetch(`${API_BASE}/sovereignty/live-metrics`);
  if (!res.ok) throw new Error('Failed to retrieve live sovereignty metrics');
  return res.json();
}

export async function runSovereigntySecurityTest(url, clientType = 'fetch') {
  const res = await fetch(`${API_BASE}/sovereignty/run-test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, clientType })
  });
  return res.json();
}

export async function fetchAuditLogs(role, action, search) {
  let url = `${API_BASE}/audit-logs?`;
  if (role) url += `role=${encodeURIComponent(role)}&`;
  if (action) url += `action=${encodeURIComponent(action)}&`;
  if (search) url += `search=${encodeURIComponent(search)}&`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch compliance audit ledger');
  return res.json();
}

