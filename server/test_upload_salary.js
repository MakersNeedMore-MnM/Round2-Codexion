import http from 'http';

const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
const fileContent = `CONFIDENTIAL REFINERY STAFF REPORT
Employee salary: $92,000
Staff Lead: Lead Inspector R. Vance
License: PE-TX-99881
Incident fine of $25,000 assessed.`;

let body = '';
body += '--' + boundary + '\r\n';
body += 'Content-Disposition: form-data; name="role"\r\n\r\n';
body += 'engineer\r\n';
body += '--' + boundary + '\r\n';
body += 'Content-Disposition: form-data; name="file"; filename="salary_test.txt"\r\n';
body += 'Content-Type: text/plain\r\n\r\n';
body += fileContent + '\r\n';
body += '--' + boundary + '--\r\n';

const req = http.request({
  hostname: '127.0.0.1',
  port: 5000,
  path: '/api/documents/upload',
  method: 'POST',
  headers: {
    'Content-Type': 'multipart/form-data; boundary=' + boundary,
    'Content-Length': Buffer.byteLength(body)
  }
}, (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    console.log('HTTP Status:', res.statusCode);
    try {
      const json = JSON.parse(data);
      console.log('Document ID:', json.id);
      console.log('Filename:', json.filename);
      console.log('requiresConsent:', json.requiresConsent);
      console.log('sensitiveFindings count:', json.sensitiveFindings?.length);
      console.log('findings:', json.sensitiveFindings?.map(f => ({ id: f.id, cat: f.category, snip: f.snippet })));
    } catch (e) {
      console.log('Raw output:', data);
    }
  });
});

req.on('error', (e) => console.error('Req error:', e));
req.write(body);
req.end();
