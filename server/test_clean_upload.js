import http from 'http';

const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
const fileContent = 'STANDARD OPERATING PROCEDURE - REFINERY BOILER B-101\nBoiler startup checklist.\nInspect water levels and fuel gas pressure. Verify burner ignition.\nOperating limit is 120 PSI.';

let body = '';
body += '--' + boundary + '\r\n';
body += 'Content-Disposition: form-data; name="role"\r\n\r\n';
body += 'engineer\r\n';
body += '--' + boundary + '\r\n';
body += 'Content-Disposition: form-data; name="file"; filename="clean_sop_test.txt"\r\n';
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
    const json = JSON.parse(data);
    console.log('requiresConsent:', json.requiresConsent);
    console.log('sensitiveFindings count:', json.sensitiveFindings?.length);
    console.log('status:', json.status);
  });
});

req.write(body);
req.end();
