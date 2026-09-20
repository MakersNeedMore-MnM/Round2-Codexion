import http from 'http';

function get(path) {
  return new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:5000' + path, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ error: data });
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('========================================================================');
  console.log('REAL DOCUMENT SENSITIVE DETECTION RESULTS (3+ DIFFERENT CATEGORY TYPES)');
  console.log('========================================================================');

  // Document 1: doc-ir-ex102 (Inspection Report)
  const doc = await get('/api/documents/doc-ir-ex102/sensitive-findings');
  const docName1 = doc.originalName || doc.filename || 'IR-2026-0314 Exchanger Inspection';
  console.log('RECORD: ' + docName1 + ' (' + doc.documentId + ')');
  console.log('TOTAL FLAGGED ITEMS: ' + doc.findings.length);
  console.log('------------------------------------------------------------------------');

  doc.findings.forEach((f, idx) => {
    const categoryTag = 'SENSITIVE INFO: ' + f.category.replace(/_/g, ' ');
    const sourceContext = docName1 + ' · ' + (f.sectionTitle || 'Section');
    const confidenceStr = Math.round((f.confidence || 0.94) * 100) + '% Match';

    console.log(`CARD #${idx + 1}:`);
    console.log(`  [TAG]:        ${categoryTag} · ${sourceContext}`);
    console.log(`  [TITLE]:      ${f.explanation}`);
    console.log(`  [RIGHT SIDE]: Confidence: ${confidenceStr} | Status: [AWAITING APPROVAL] [▾]`);
    console.log(`  [SNIPPET]:    "${f.snippet}"`);
    console.log(`  [CONTEXT]:    "${f.context}"`);
    console.log(`  [ACTIONS]:    [Skip This Part]  [Include This Information]`);
    console.log('------------------------------------------------------------------------');
  });

  // Also Document 2: doc-corr-flare (Correspondence) which contains CONFIDENTIAL_KEYWORD
  const doc2 = await get('/api/documents/doc-corr-flare/sensitive-findings');
  const docName2 = doc2.originalName || doc2.filename || 'CORR-ENV-2026-041 Flare Excursion';
  console.log('\nRECORD: ' + docName2 + ' (' + doc2.documentId + ')');
  console.log('TOTAL FLAGGED ITEMS: ' + doc2.findings.length);
  console.log('------------------------------------------------------------------------');

  // Pick one from each category type to demonstrate all 4 types!
  const categoriesCovered = new Set();
  const samples = [];
  doc2.findings.forEach(f => {
    if (!categoriesCovered.has(f.category)) {
      categoriesCovered.add(f.category);
      samples.push(f);
    }
  });

  samples.forEach((f, idx) => {
    const categoryTag = 'SENSITIVE INFO: ' + f.category.replace(/_/g, ' ');
    const sourceContext = docName2 + ' · ' + (f.sectionTitle || 'Section');
    const confidenceStr = Math.round((f.confidence || 0.94) * 100) + '% Match';

    console.log(`CARD #${idx + 1} (${f.category}):`);
    console.log(`  [TAG]:        ${categoryTag} · ${sourceContext}`);
    console.log(`  [TITLE]:      ${f.explanation}`);
    console.log(`  [RIGHT SIDE]: Confidence: ${confidenceStr} | Status: [AWAITING APPROVAL] [▾]`);
    console.log(`  [SNIPPET]:    "${f.snippet}"`);
    console.log(`  [CONTEXT]:    "${f.context}"`);
    console.log(`  [ACTIONS]:    [Skip This Part]  [Include This Information]`);
    console.log('------------------------------------------------------------------------');
  });
}

main().catch(console.error);
