/**
 * Sensitive Information Detection & Pattern Scanner
 * 
 * Genuine pattern-based detection for confidential documents:
 * 1. Financial figures / salary / budget numbers
 * 2. Personal names / inspector / operator identities
 * 3. Identification codes / PE engineering license numbers
 * 4. Proximity to sensitivity keywords ("confidential", "classified", "incident", "liability", "penalty")
 */

// 1. Financial Regex: Matches currency symbols ($480,000, USD 1,200,000) or budget/penalty figures
const FINANCIAL_REGEX = /(?:\$|USD|EUR|GBP)\s*[\d,]+(?:\.\d{2})?\b|\b[\d,]+(?:\.\d{2})?\s*(?:dollars|USD|euros)\b|\b(?:budget|cost|fee|salary|fine|penalty|expense|remediation)\s*(?:of|is|was|:)?\s*(?:\$|USD|EUR)?\s*[\d,]+(?:\.\d{2})?\b/gi;

// 2. Personal Name with Title or Professional Role (e.g. Lead Inspector R. Vance, Engineer J. Miller)
const NAME_REGEX = /(?:(?:Lead|Senior|Chief|Principal)\s+)?(?:Inspector|Engineer|Operator|Director|Auditor|Technician|Dr\.|Mr\.|Ms\.|Mrs\.)\s+(?:[A-Z]\.\s+[A-Z][a-z]+|[A-Z][a-z]+(?:\s+[A-Z][a-z]+|\s+[A-Z]\.|\s+[A-Z]\.\s+[A-Z][a-z]+))/g;

// 3. ID, License and Registration Numbers
const ID_REGEX = /\b(?:PE-[A-Z0-9-]+|ID-\d{4,}|ACCT-[\w\d-]+|[A-Z]{2,3}-\d{4,8}|SSN:\s*\d{3}-\d{2}-\d{4}|Badge\s*#?\s*\d{4,})\b/gi;

// 4. Sensitivity Keywords
const SENSITIVITY_KEYWORDS = [
  'confidential',
  'classified',
  'personal',
  'salary',
  'incident',
  'penalty',
  'liability',
  'remediation',
  'proprietary',
  'disciplinary'
];

/**
 * Scan a text string and extract sensitive snippets with context windows
 */
export function scanText(text = '', sectionIndex = 0, sectionTitle = 'Section') {
  const findings = [];
  if (!text || typeof text !== 'string') return findings;

  const extractContext = (index, length) => {
    const start = Math.max(0, index - 45);
    const end = Math.min(text.length, index + length + 45);
    const prefix = start > 0 ? '...' : '';
    const suffix = end < text.length ? '...' : '';
    return prefix + text.slice(start, end).trim() + suffix;
  };

  // Check Financial Figures
  let match;
  FINANCIAL_REGEX.lastIndex = 0;
  while ((match = FINANCIAL_REGEX.exec(text)) !== null) {
    findings.push({
      category: 'FINANCIAL_FIGURE',
      categoryLabel: 'Financial Value / Cost',
      snippet: match[0],
      context: extractContext(match.index, match[0].length),
      explanation: `Financial figure detected (${match[0]})`,
      confidence: 0.96,
      sectionIndex,
      sectionTitle
    });
  }

  // Check Personal Names
  NAME_REGEX.lastIndex = 0;
  while ((match = NAME_REGEX.exec(text)) !== null) {
    findings.push({
      category: 'PERSONAL_NAME',
      categoryLabel: 'Personal Name / Identity',
      snippet: match[0],
      context: extractContext(match.index, match[0].length),
      explanation: `Individual identifier or title detected (${match[0]})`,
      confidence: 0.94,
      sectionIndex,
      sectionTitle
    });
  }

  // Check ID & License Numbers
  ID_REGEX.lastIndex = 0;
  while ((match = ID_REGEX.exec(text)) !== null) {
    findings.push({
      category: 'IDENTIFIER_CODE',
      categoryLabel: 'ID / License Code',
      snippet: match[0],
      context: extractContext(match.index, match[0].length),
      explanation: `Professional license or badge ID detected (${match[0]})`,
      confidence: 0.98,
      sectionIndex,
      sectionTitle
    });
  }

  // Check Sensitivity Keywords
  for (const kw of SENSITIVITY_KEYWORDS) {
    const kwRegex = new RegExp(`\\b${kw}\\b`, 'gi');
    let kwMatch;
    while ((kwMatch = kwRegex.exec(text)) !== null) {
      // Don't flag if already covered by an exact snippet
      const alreadyFlagged = findings.some(f => 
        Math.abs(text.indexOf(f.snippet) - kwMatch.index) < f.snippet.length
      );

      if (!alreadyFlagged) {
        const windowSnippet = text.slice(
          Math.max(0, kwMatch.index - 15), 
          Math.min(text.length, kwMatch.index + kw.length + 30)
        ).trim();

        findings.push({
          category: 'CONFIDENTIAL_KEYWORD',
          categoryLabel: 'Confidential / Sensitive Term',
          snippet: windowSnippet,
          context: extractContext(kwMatch.index, kw.length),
          explanation: `Context surrounding sensitivity keyword "${kw}"`,
          confidence: 0.91,
          sectionIndex,
          sectionTitle
        });
      }
    }
  }

  return findings;
}

/**
 * Scan all sections of a document for sensitive information
 */
export function scanDocumentSections(sections = []) {
  const allFindings = [];

  sections.forEach((sec, idx) => {
    const titleFindings = scanText(sec.title || '', idx, sec.title || `Section ${idx + 1}`);
    const contentFindings = scanText(sec.content || '', idx, sec.title || `Section ${idx + 1}`);
    allFindings.push(...titleFindings, ...contentFindings);
  });

  // Deduplicate by snippet text
  const seenSnippets = new Set();
  const deduplicated = [];

  allFindings.forEach((f, idx) => {
    const key = `${f.category}:${f.snippet.toLowerCase().trim()}`;
    if (!seenSnippets.has(key)) {
      seenSnippets.add(key);
      deduplicated.push({
        id: `sens-${idx + 1}`,
        ...f
      });
    }
  });

  return deduplicated;
}

/**
 * Redact specified snippets from document sections and summary
 */
export function redactDocumentContent(sections = [], summary = '', skippedSnippets = []) {
  if (!skippedSnippets || skippedSnippets.length === 0) {
    return { sections, summary, redactedCount: 0 };
  }

  let redactedCount = 0;

  const redactString = (str) => {
    let result = str;
    for (const snippet of skippedSnippets) {
      if (snippet && typeof snippet === 'string') {
        const escaped = snippet.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const reg = new RegExp(escaped, 'gi');
        if (reg.test(result)) {
          result = result.replace(reg, '[REDACTED BY USER CONSENT]');
          redactedCount++;
        }
      }
    }
    return result;
  };

  const updatedSections = sections.map(sec => ({
    ...sec,
    title: redactString(sec.title || ''),
    content: redactString(sec.content || '')
  }));

  const updatedSummary = redactString(summary || '');

  return {
    sections: updatedSections,
    summary: updatedSummary,
    redactedCount
  };
}
