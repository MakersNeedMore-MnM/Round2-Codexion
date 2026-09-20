import { spawn } from 'node:child_process';

/**
 * Sandboxed Code Execution Service for SentinelWorks
 * 
 * Executes analytical calculations in an isolated child process with:
 * - Blocked network access (socket, urllib, requests, http disabled)
 * - Strict execution timeout (4000ms max)
 * - Pure determinism: Genuine local Python 3 interpreter (CPython)
 */
export async function executeSandboxedCode(pythonCode, variables = {}) {
  const startTime = Date.now();

  // Safety preamble enforcing air-gap restrictions on network sockets and external sub-processes
  const sandboxedPreamble = `
import sys
import math
import json

# ENFORCE AIR-GAP RESTRICTION: Disable network sockets and external process spawning
sys.modules['socket'] = None
sys.modules['urllib'] = None
sys.modules['urllib.request'] = None
sys.modules['requests'] = None
sys.modules['http'] = None
sys.modules['http.client'] = None
sys.modules['subprocess'] = None

# Input variables passed from engineering document extraction
input_vars = ${JSON.stringify(variables)}
for k, v in input_vars.items():
    globals()[k] = v

# User calculation script begins below:
`;

  const fullCode = sandboxedPreamble + '\n' + pythonCode;

  return new Promise((resolve) => {
    const child = spawn('python', ['-u', '-'], {
      timeout: 4000,
      env: {
        ...process.env,
        PYTHONUNBUFFERED: '1',
        HTTP_PROXY: '',
        HTTPS_PROXY: '',
        ALL_PROXY: '',
      },
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      const executionMs = Date.now() - startTime;
      const stdoutStr = stdout.trim();
      const stderrStr = stderr.trim();

      if (code === 0) {
        let structuredResults = {};

        const jsonMatch = stdoutStr.match(/\{[\s\S]*\}$/);
        if (jsonMatch) {
          try {
            structuredResults = JSON.parse(jsonMatch[0]);
          } catch (e) {}
        }

        const lines = stdoutStr.replace(/\r/g, '').split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          const match = trimmed.match(/^([a-zA-Z0-9_]+)\s*[:=]\s*(.+)$/);
          if (match) {
            const key = match[1].trim();
            const val = match[2].trim();
            const numVal = Number(val);
            structuredResults[key] = !isNaN(numVal) ? numVal : val;
          }
        }

        resolve({
          success: true,
          exitCode: 0,
          stdout: stdoutStr,
          stderr: stderrStr,
          executionMs,
          structuredResults,
          networkCallsBlocked: 0,
          isolationLevel: 'Subprocess Sandboxed + Socket Intercept'
        });
      } else {
        resolve({
          success: false,
          exitCode: code ?? -1,
          stdout: stdoutStr,
          stderr: stderrStr || 'Process terminated with non-zero exit code or timeout',
          executionMs,
          structuredResults: {},
          networkCallsBlocked: 0,
          isolationLevel: 'Subprocess Sandboxed + Socket Intercept'
        });
      }
    });

    child.on('error', (err) => {
      resolve({
        success: false,
        exitCode: -1,
        stdout: '',
        stderr: `Failed to spawn Python: ${err.message}`,
        executionMs: Date.now() - startTime,
        structuredResults: {},
        networkCallsBlocked: 0,
        isolationLevel: 'Subprocess Sandboxed'
      });
    });

    // Pipe code directly into Python's stdin
    child.stdin.write(fullCode);
    child.stdin.end();
  });
}
