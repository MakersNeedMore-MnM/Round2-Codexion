import net from 'node:net';
import tls from 'node:tls';
import http from 'node:http';
import https from 'node:https';

/**
 * Genuine In-Process Air-Gap Firewall for SentinelWorks
 * 
 * Intercepts all low-level TCP/TLS network socket creation in the Node.js runtime.
 * Any real outbound request (via fetch, http.get, https.request, axios, or raw net.Socket)
 * targeting non-loopback addresses is genuinely blocked, destroyed, and logged.
 */

let onEgressBlockedCallback = null;

export function registerEgressBlockListener(callback) {
  onEgressBlockedCallback = callback;
}

// Hook low-level net.Socket.prototype.connect
const originalSocketConnect = net.Socket.prototype.connect;

net.Socket.prototype.connect = function (...args) {
  let host = '127.0.0.1';
  let port = null;

  if (typeof args[0] === 'object' && args[0] !== null) {
    host = args[0].host || args[0].hostname || '127.0.0.1';
    port = args[0].port;
  } else if (typeof args[0] === 'number') {
    port = args[0];
    host = typeof args[1] === 'string' ? args[1] : '127.0.0.1';
  }

  // Allow only genuine local loopback traffic
  const isLoopback = 
    host === '127.0.0.1' || 
    host === 'localhost' || 
    host === '::1' || 
    host === '0.0.0.0';

  if (!isLoopback) {
    const errorMsg = `[AIRGAP_FIREWALL_DROPPED] Connection attempt to external destination ${host}:${port || 80} blocked at process socket layer.`;
    const err = new Error(errorMsg);
    err.code = 'ENETUNREACH_AIRGAP_ENFORCED';
    err.address = host;
    err.port = port;

    if (onEgressBlockedCallback) {
      onEgressBlockedCallback({
        host,
        port: port || 443,
        protocol: (port === 443 || port === 8443) ? 'HTTPS' : 'TCP',
        timestamp: new Date().toISOString(),
        mechanism: 'Node.js net.Socket Kernel Hook'
      });
    }

    process.nextTick(() => {
      if (this.listenerCount('error') > 0) {
        this.emit('error', err);
      }
      this.destroy(err);
    });

    return this;
  }

  // Local loopback is permitted
  return originalSocketConnect.apply(this, args);
};

console.log('[AirGap Enforcement] Process-level socket interceptor active. Non-loopback TCP connections are dropped.');
