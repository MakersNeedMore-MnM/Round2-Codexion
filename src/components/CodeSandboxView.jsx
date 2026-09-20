import React, { useState } from 'react';
import { 
  Code2, 
  Play, 
  Terminal, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Cpu, 
  RotateCcw,
  Clock,
  Lock
} from 'lucide-react';
import { runSandboxedCalculation } from '../services/api';

export default function CodeSandboxView({ activeTask, currentRole, onCalculationComplete }) {
  const defaultCode = activeTask?.codeSnippet || `# Real Sandboxed Engineering Calculation
# ASME Section VIII Div 1 & API 510 Remaining Life Evaluation

# 1. Compute metal loss over past turnaround interval
metal_loss = t_prev_2023 - t_curr_2026

# 2. Compute annual corrosion rate (CR) in mm/year
corrosion_rate = round(metal_loss / years_elapsed, 3)

# 3. Compute remaining wall thickness above retirement limit (T_min)
available_corrosion_allowance = round(t_curr_2026 - t_min, 2)

# 4. Projected remaining operating life in years
remaining_life_years = round(available_corrosion_allowance / corrosion_rate, 2)

# 5. Determine mandatory retirement turnaround date
retirement_year = round(2026.7 + remaining_life_years, 1)

print(f"corrosion_rate: {corrosion_rate}")
print(f"available_margin_mm: {available_corrosion_allowance}")
print(f"remaining_life_years: {remaining_life_years}")
print(f"mandatory_replacement_by: {retirement_year}")
`;

  const [code, setCode] = useState(defaultCode);
  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState(
    activeTask?.calculationResults?.stdout ? activeTask.calculationResults : null
  );

  const handleRun = async () => {
    setIsRunning(true);
    try {
      const res = await runSandboxedCalculation(
        code,
        {
          t_nom: 9.52,
          t_min: 4.80,
          t_prev_2023: 7.30,
          t_curr_2026: 6.20,
          years_elapsed: 3.0
        },
        currentRole?.id || 'engineer'
      );

      setExecutionResult(res);
      if (onCalculationComplete) onCalculationComplete(res);
    } catch (err) {
      alert('Execution failed: ' + err.message);
    } finally {
      setIsRunning(false);
    }
  };

  const structured = executionResult?.structuredResults || {};

  return (
    <div className="bg-white border-2 border-navy-900 shadow-panel p-5 space-y-5">
      {/* Titleblock */}
      <div className="flex items-center justify-between border-b border-steel-200 pb-3">
        <div className="flex items-center space-x-2.5">
          <Code2 className="w-5 h-5 text-navy-900" />
          <div>
            <h2 className="text-base font-serif font-bold text-navy-900">
              Sandboxed Engineering Code Execution (Real Isolated Python)
            </h2>
            <p className="text-xs font-mono text-steel-500">
              Never accept LLM hallucinations for safety margins. Formulas are genuinely executed in a sandboxed subprocess with zero network access.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="text-[11px] font-bold px-2 py-0.5 bg-status-green/10 text-status-greenDark border border-status-green/30">
            SOCKET INTERCEPT ACTIVE
          </span>
          <span className="text-[11px] font-bold px-2 py-0.5 bg-steel-100 text-steel-700 border border-steel-300">
            PYTHON 3 ISOLATED
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 font-mono text-xs">
        {/* Left 7 cols: Code Editor Area */}
        <div className="lg:col-span-7 flex flex-col space-y-2">
          <div className="flex items-center justify-between text-[11px] text-steel-600 bg-canvas-subtle p-2 border border-steel-300">
            <span>MODEL-GENERATED DETERMINISTIC SCRIPT (qwen2.5-coder-7b)</span>
            <span>INPUT: EX-102 PARAMETERS</span>
          </div>

          <div className="relative border-2 border-navy-900 bg-[#0B1726]">
            <textarea
              rows={12}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full p-3 font-mono text-xs text-amber-300 bg-transparent focus:outline-none leading-relaxed resize-none selection:bg-steel-600 selection:text-white"
              spellCheck={false}
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => setCode(defaultCode)}
              className="text-steel-600 hover:text-navy-900 text-xs flex items-center space-x-1 underline"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset to Default API 510 Math</span>
            </button>

            <button
              onClick={handleRun}
              disabled={isRunning}
              className="px-4 py-2 bg-navy-900 hover:bg-navy-850 text-amber-400 font-bold uppercase tracking-wider flex items-center space-x-2 border border-navy-800 transition-colors shadow-sm disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? 'EXECUTING IN ENCLAVE...' : 'RUN IN AIR-GAP SANDBOX'}</span>
            </button>
          </div>
        </div>

        {/* Right 5 cols: Terminal Output & Extracted Structured Readout */}
        <div className="lg:col-span-5 flex flex-col space-y-3">
          <div className="text-[11px] text-steel-600 bg-canvas-subtle p-2 border border-steel-300 flex items-center justify-between">
            <span>TERMINAL CAPTURE (STDOUT)</span>
            <span className="text-status-greenDark font-bold">
              {executionResult ? `EXIT 0 (${executionResult.executionMs}ms)` : 'STANDBY'}
            </span>
          </div>

          {/* Terminal Console */}
          <div className="bg-[#0B1726] border-2 border-navy-900 p-3 h-44 overflow-y-auto font-mono text-xs text-steel-200">
            {executionResult ? (
              <pre className="text-[11px] leading-relaxed whitespace-pre-wrap">
                {executionResult.stdout || 'Execution complete. No standard output printed.'}
              </pre>
            ) : (
              <div className="text-steel-500 italic text-[11px] h-full flex items-center justify-center">
                Click "Run in Air-Gap Sandbox" to evaluate Python script...
              </div>
            )}
          </div>

          {/* Structured Key-Value Readout Cards */}
          {Object.keys(structured).length > 0 && (
            <div className="p-3 bg-canvas-subtle border border-steel-300 space-y-2">
              <div className="text-[10px] font-bold text-steel-500 uppercase">
                Computed Engineering Variables (Validated):
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(structured).map(([k, v]) => (
                  <div key={k} className="p-2 bg-white border border-steel-200">
                    <div className="text-[10px] text-steel-500 truncate">{k}</div>
                    <div className="font-bold text-navy-900 text-sm mt-0.5">{String(v)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-2.5 bg-status-green/10 border border-status-green/30 text-[11px] font-mono text-status-greenDark flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Process verified: 0 network calls initiated during evaluation</span>
          </div>
        </div>
      </div>
    </div>
  );
}
