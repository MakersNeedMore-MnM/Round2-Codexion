import React, { useState } from 'react';
import { 
  Cpu, 
  GitFork, 
  ArrowUpRight, 
  CheckCircle2, 
  HardDrive, 
  Zap, 
  ShieldAlert, 
  Code2, 
  Eye, 
  Terminal,
  HelpCircle,
  Radio
} from 'lucide-react';

export default function ModelRouterView({ activeTask, routingData }) {
  const [showIntegrationCode, setShowIntegrationCode] = useState(false);

  const models = [
    {
      id: 'qwen2.5-3b-instruct',
      name: 'Qwen2.5-3B-Instruct',
      roleType: 'Text Reasoning & Semantic Extraction',
      tier: 'TIER 1 — FAST LOCAL',
      vram: '2.1 GB',
      vramPct: 22,
      quant: 'Q4_K_M',
      speed: '46.2 tok/s',
      context: '32,768 tokens',
      icon: Terminal,
      status: activeTask?.modelUsed?.includes('3B') ? 'DISPATCHED_ACTIVE' : 'STANDBY_LOCAL',
      escalationReason: 'Default baseline model: provides high-speed local comprehension with minimal VRAM overhead.'
    },
    {
      id: 'qwen2.5-coder-7b',
      name: 'Qwen2.5-Coder-7B-Instruct',
      roleType: 'Deterministic Code & Math Generation',
      tier: 'TIER 2 — ANALYTICAL CODER',
      vram: '4.8 GB',
      vramPct: 48,
      quant: 'Q4_K_M',
      speed: '34.8 tok/s',
      context: '32,768 tokens',
      icon: Code2,
      status: activeTask?.modelUsed?.includes('Coder') || activeTask?.activeStepIndex === 1 ? 'DISPATCHED_ACTIVE' : 'STANDBY_LOCAL',
      escalationReason: 'Escalated for calculation phases: generates pure Python code for sandboxed ASME/API math.'
    },
    {
      id: 'moondream2-1.8b',
      name: 'Moondream2 / Llama-3.2-Vision',
      roleType: 'P&ID Schematic & Drawing OCR',
      tier: 'TIER 1 — LOCAL VISION',
      vram: '1.8 GB',
      vramPct: 18,
      quant: 'INT8',
      speed: '52.0 tok/s',
      context: '8,192 tokens',
      icon: Eye,
      status: 'STANDBY_LOCAL',
      escalationReason: 'Dispatched when technical drawings, piping schematics, or gauge images are uploaded.'
    },
    {
      id: 'qwen2.5-14b-instruct',
      name: 'Qwen2.5-14B-Instruct',
      roleType: 'Multi-Document Legal & Regulatory Risk',
      tier: 'TIER 3 — ESCALATED REASONING',
      vram: '9.2 GB',
      vramPct: 82,
      quant: 'Q4_K_M',
      speed: '22.4 tok/s',
      context: '32,768 tokens',
      icon: Cpu,
      status: activeTask?.modelUsed?.includes('14B') ? 'DISPATCHED_ACTIVE' : 'STANDBY_LOCAL',
      escalationReason: 'Escalation triggered if cross-referencing >3 classified files or evaluating EPA liability claims.'
    }
  ];

  return (
    <div className="bg-white border-2 border-navy-900 shadow-panel p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-steel-200 pb-3 gap-2">
        <div className="flex items-center space-x-2.5">
          <GitFork className="w-5 h-5 text-navy-900" />
          <div>
            <h2 className="text-base font-serif font-bold text-navy-900">
              Local Model Router & Dynamic Dispatch Telemetry
            </h2>
            <p className="text-xs font-mono text-steel-500">
              Small-Model-First Architecture: Routes steps to the smallest capable local model to maximize throughput and minimize thermal load.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowIntegrationCode(!showIntegrationCode)}
          className="px-2.5 py-1 text-xs font-mono text-steel-700 hover:text-navy-900 border border-steel-300 hover:border-navy-900 bg-canvas-subtle transition-colors shrink-0"
        >
          {showIntegrationCode ? 'Hide API Architecture' : 'Inspect Local LLM Bridge'}
        </button>
      </div>

      {/* Rationale Banner */}
      <div className="p-3 bg-canvas-subtle border border-steel-300 flex items-start justify-between text-xs font-mono">
        <div className="flex items-start space-x-2.5">
          <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-navy-900">ACTIVE DISPATCH RATIONALE: </span>
            <span className="text-ink-800">
              {routingData?.decisionRationale || 'Small-model-first: Qwen2.5-3B active for parsing, routing calculation step to Qwen2.5-Coder.'}
            </span>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 bg-navy-900 text-amber-400 uppercase shrink-0">
          AIR-GAP GPU POOL
        </span>
      </div>

      {/* Model Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
        {models.map((m) => {
          const Icon = m.icon;
          const isActive = m.status === 'DISPATCHED_ACTIVE';

          return (
            <div
              key={m.id}
              className={`p-4 border-2 transition-all relative ${
                isActive
                  ? 'border-navy-900 bg-amber-50/30 shadow-md'
                  : 'border-steel-300 bg-white hover:border-steel-400'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 border ${
                    isActive ? 'bg-navy-900 text-amber-400 border-navy-800' : 'bg-steel-100 text-steel-700 border-steel-200'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-serif font-bold text-navy-900 text-sm">
                        {m.name}
                      </h4>
                    </div>
                    <div className="text-[11px] text-steel-600 font-semibold mt-0.5">
                      {m.roleType}
                    </div>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 border ${
                  isActive 
                    ? 'bg-amber-500 text-navy-950 border-amber-600 animate-pulse' 
                    : 'bg-steel-100 text-steel-600 border-steel-200'
                }`}>
                  {isActive ? '● IN USE' : 'READY'}
                </span>
              </div>

              {/* Hardware Telemetry Strip */}
              <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-steel-200 text-[11px]">
                <div>
                  <div className="text-[10px] text-steel-500">VRAM POOL</div>
                  <div className="font-bold text-navy-900">{m.vram}</div>
                </div>
                <div>
                  <div className="text-[10px] text-steel-500">FORMAT</div>
                  <div className="font-bold text-navy-900">{m.quant}</div>
                </div>
                <div>
                  <div className="text-[10px] text-steel-500">SPEED</div>
                  <div className="font-bold text-status-greenDark">{m.speed}</div>
                </div>
                <div>
                  <div className="text-[10px] text-steel-500">CONTEXT</div>
                  <div className="font-bold text-steel-700">{m.context}</div>
                </div>
              </div>

              <div className="text-[11px] text-steel-600 bg-canvas-subtle p-2 border border-steel-200 mt-2.5">
                <span className="text-steel-500 font-semibold uppercase text-[10px] block">Trigger Logic:</span>
                {m.escalationReason}
              </div>
            </div>
          );
        })}
      </div>

      {/* Production Integration Inspection Code Block */}
      {showIntegrationCode && (
        <div className="mt-4 p-4 bg-[#0B1726] border border-navy-800 text-white font-mono text-xs">
          <div className="flex items-center justify-between text-[11px] text-amber-400 border-b border-navy-800 pb-2 mb-3">
            <span>PRODUCTION AIR-GAP INTEGRATION HOOK (llama.cpp / Ollama)</span>
            <span>NO CODE CHANGES TO UI REQUIRED</span>
          </div>
          <pre className="text-steel-300 text-[11px] overflow-x-auto whitespace-pre leading-relaxed">
{`// server/modelRouter.js — Drop-in production driver for air-gapped on-premise inference:
export async function executeProductionInference(prompt, modelId) {
  // Binds strictly to 127.0.0.1:11434 (Ollama) or 127.0.0.1:8080 (llama.cpp server)
  const response = await fetch('http://127.0.0.1:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: modelId, // e.g. "qwen2.5:3b" or "qwen2.5-coder:7b"
      prompt: prompt,
      options: { temperature: 0.1, num_ctx: 32768 },
      stream: false
    })
  });
  const data = await response.json();
  return data.response;
}`}
          </pre>
          <div className="text-[11px] text-steel-400 mt-2 italic">
            In this prototype deployment, local inference is mocked behind this clean interface layer, providing instant responsive testing while preserving authentic domain reasoning.
          </div>
        </div>
      )}
    </div>
  );
}
