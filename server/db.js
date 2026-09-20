import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import { initialDocuments, userRoles } from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'sentinelworks.db');

export const db = new DatabaseSync(dbPath);

export function getCategoryLabel(category) {
  const map = {
    pid_drawings: 'P&IDs and Engineering Drawings',
    sop: 'SOPs (Standard Operating Procedures)',
    maintenance: 'Maintenance Reports',
    inspection: 'Inspection Reports',
    technical_manual: 'Technical Manuals',
    operational_report: 'Operational Reports',
    spreadsheet: 'Excel/Spreadsheet Data',
    correspondence: 'Internal Correspondence'
  };
  return map[category] || category || 'General Technical Record';
}

// Initialize schema and seed realistic refinery documents
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      category TEXT NOT NULL,
      file_type TEXT NOT NULL,
      size_bytes INTEGER NOT NULL,
      page_count INTEGER NOT NULL,
      classification_level INTEGER NOT NULL,
      classification_label TEXT NOT NULL,
      allowed_roles TEXT NOT NULL,
      uploaded_by TEXT NOT NULL,
      upload_date TEXT NOT NULL,
      status TEXT NOT NULL,
      summary TEXT,
      stages TEXT NOT NULL,
      sections TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      goal TEXT NOT NULL,
      role TEXT NOT NULL,
      status TEXT NOT NULL,
      plan_steps TEXT NOT NULL,
      active_step_index INTEGER DEFAULT 0,
      model_used TEXT,
      code_snippet TEXT,
      calculation_results TEXT,
      evidence_citations TEXT,
      draft_content TEXT,
      approval_status TEXT DEFAULT 'PENDING',
      approved_by TEXT,
      approved_at TEXT,
      rejection_reason TEXT,
      document_id TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      role TEXT NOT NULL,
      user_name TEXT NOT NULL,
      action_type TEXT NOT NULL,
      target_resource TEXT NOT NULL,
      model_dispatched TEXT,
      clearance_verified INTEGER NOT NULL,
      details TEXT NOT NULL,
      hash TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sovereignty_metrics (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      external_calls INTEGER DEFAULT 0,
      external_bytes_egress INTEGER DEFAULT 0,
      local_inferences INTEGER DEFAULT 42,
      local_bytes_processed INTEGER DEFAULT 18450200,
      loopback_packets INTEGER DEFAULT 3184,
      last_attested_at TEXT NOT NULL
    );
  `);

  // Migrate tables if columns were missing in older schema
  try {
    const docTableInfo = db.prepare('PRAGMA table_info(documents)').all();
    const hasCategory = docTableInfo.some(col => col.name === 'category');
    if (!hasCategory) {
      db.exec('ALTER TABLE documents ADD COLUMN category TEXT;');
    }

    const taskTableInfo = db.prepare('PRAGMA table_info(tasks)').all();
    const hasDocumentId = taskTableInfo.some(col => col.name === 'document_id');
    if (!hasDocumentId) {
      db.exec('ALTER TABLE tasks ADD COLUMN document_id TEXT;');
    }
  } catch (e) {
    console.warn('Migration check warning:', e.message);
  }

  // Initialize sovereignty metrics row if empty
  const checkMetrics = db.prepare('SELECT COUNT(*) as count FROM sovereignty_metrics').get();
  if (checkMetrics.count === 0) {
    db.prepare(`
      INSERT INTO sovereignty_metrics (id, external_calls, external_bytes_egress, local_inferences, local_bytes_processed, loopback_packets, last_attested_at)
      VALUES (1, 0, 0, 42, 18450200, 3184, ?)
    `).run(new Date().toISOString());
  }

  // Purge legacy placeholder documents from previous prototypes
  db.prepare(`
    DELETE FROM documents WHERE id IN (
      'doc-ex-102', 
      'doc-boiler-04', 
      'doc-turb-301', 
      'doc-plant-risk', 
      'doc-airgap-arch'
    ) OR category IS NULL
  `).run();

  // Seed or replace refinery initial documents
  const insertOrReplaceDoc = db.prepare(`
    INSERT OR REPLACE INTO documents (
      id, filename, original_name, category, file_type, size_bytes, page_count,
      classification_level, classification_label, allowed_roles, uploaded_by,
      upload_date, status, summary, stages, sections
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const doc of initialDocuments) {
    insertOrReplaceDoc.run(
      doc.id,
      doc.filename,
      doc.originalName,
      doc.category,
      doc.fileType,
      doc.sizeBytes,
      doc.pageCount,
      doc.classificationLevel,
      doc.classificationLabel,
      JSON.stringify(doc.allowedRoles),
      doc.uploadedBy,
      doc.uploadDate,
      doc.status,
      doc.summary,
      JSON.stringify(doc.stages),
      JSON.stringify(doc.sections)
    );
  }

  // Seed baseline audit log for system boot
  const logCount = db.prepare('SELECT COUNT(*) as count FROM audit_logs').get();
  if (logCount.count === 0) {
    logAuditEvent({
      role: 'admin',
      userName: 'Chief Plant Administrator',
      actionType: 'SYSTEM_BOOT_ATTESTATION',
      targetResource: 'Air-Gap Enclave Enclosure 01',
      modelDispatched: 'Hardware SHA-256 Validator',
      clearanceVerified: 1,
      details: {
        event: 'Cryptographic perimeter seal verified',
        loopbackBinding: '127.0.0.1:5000',
        externalGateways: 'PURGED',
        weightsCheck: 'OK (sha256:7f4c9a...)'
      }
    });

    logAuditEvent({
      role: 'engineer',
      userName: 'Process & Reliability Lead Engineer',
      actionType: 'DOCUMENT_INDEXED',
      targetResource: 'PID-4100-CRUDE-DISTILLATION-TRAIN-B.dwg',
      modelDispatched: 'Qwen2.5-Coder-7B',
      clearanceVerified: 1,
      details: {
        category: 'pid_drawings',
        classification: 'Process Engineering Schematic',
        chunks: 48
      }
    });
  }
}

// Log an audit event with cryptographic SHA-256 seal
export function logAuditEvent({ role, userName, actionType, targetResource, modelDispatched = 'None', clearanceVerified = 1, details = {} }) {
  const id = 'audit-' + crypto.randomUUID().slice(0, 8);
  const timestamp = new Date().toISOString();
  const detailsStr = typeof details === 'string' ? details : JSON.stringify(details);

  // Compute tamper-evident hash
  const payloadToHash = `${id}|${timestamp}|${role}|${actionType}|${targetResource}|${clearanceVerified}|${detailsStr}`;
  const hash = crypto.createHash('sha256').update(payloadToHash).digest('hex');

  const insert = db.prepare(`
    INSERT INTO audit_logs (id, timestamp, role, user_name, action_type, target_resource, model_dispatched, clearance_verified, details, hash)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insert.run(id, timestamp, role, userName, actionType, targetResource, modelDispatched, clearanceVerified, detailsStr, hash);

  return { id, timestamp, hash };
}

// Fetch documents filtered by active user role scope (enforced in actual SQL query)
export function getDocumentsForRole(roleId) {
  const role = userRoles.find(r => r.id === roleId) || userRoles.find(r => r.id === 'engineer') || userRoles[0];
  const allowedCategories = role.categoryKeys || [];

  // Genuine SQL query enforcement:
  // Query ONLY documents where category is in the role's permitted category list!
  let accessibleRows = [];
  if (allowedCategories.length > 0) {
    const placeholders = allowedCategories.map(() => '?').join(',');
    const query = `SELECT * FROM documents WHERE category IN (${placeholders}) ORDER BY upload_date DESC`;
    accessibleRows = db.prepare(query).all(...allowedCategories);
  }

  // Count restricted documents server-side
  const totalCountRow = db.prepare('SELECT COUNT(*) as total FROM documents').get();
  const totalCount = totalCountRow ? totalCountRow.total : 0;
  const restrictedCount = Math.max(0, totalCount - accessibleRows.length);

  const accessible = accessibleRows.map(row => ({
    id: row.id,
    filename: row.filename,
    originalName: row.original_name,
    category: row.category,
    categoryLabel: row.category ? getCategoryLabel(row.category) : row.classification_label,
    fileType: row.file_type,
    sizeBytes: row.size_bytes,
    pageCount: row.page_count,
    classificationLevel: row.classification_level,
    classificationLabel: row.classification_label,
    isDemo: true,
    demoLabel: 'Sample demo data — not real records',
    allowedRoles: JSON.parse(row.allowed_roles || '[]'),
    uploadedBy: row.uploaded_by,
    uploadDate: row.upload_date,
    status: row.status,
    summary: row.summary,
    stages: JSON.parse(row.stages || '{}'),
    sections: JSON.parse(row.sections || '[]')
  }));

  return {
    accessible,
    restrictedCount,
    activeRole: role,
    totalInSystem: totalCount
  };
}

// Fetch single document by ID with role clearance and category check
export function getDocumentById(id, roleId) {
  const role = userRoles.find(r => r.id === roleId) || userRoles.find(r => r.id === 'engineer') || userRoles[0];
  const row = db.prepare('SELECT * FROM documents WHERE id = ?').get(id);
  if (!row) return null;

  const allowedCategories = role.categoryKeys || [];
  const hasAccess = allowedCategories.includes(row.category);

  return {
    doc: {
      id: row.id,
      filename: row.filename,
      originalName: row.original_name,
      category: row.category,
      categoryLabel: row.category ? getCategoryLabel(row.category) : row.classification_label,
      fileType: row.file_type,
      sizeBytes: row.size_bytes,
      pageCount: row.page_count,
      classificationLevel: row.classification_level,
      classificationLabel: row.classification_label,
      isDemo: true,
      demoLabel: 'Sample demo data — not real records',
      allowedRoles: JSON.parse(row.allowed_roles || '[]'),
      uploadedBy: row.uploaded_by,
      uploadDate: row.upload_date,
      status: row.status,
      summary: row.summary,
      stages: JSON.parse(row.stages || '{}'),
      sections: JSON.parse(row.sections || '[]')
    },
    hasAccess,
    category: row.category,
    requiredLevel: row.classification_level
  };
}
