import React, { useState } from 'react';
import { 
  Play, 
  CheckCircle2, 
  Clock, 
  Terminal, 
  Layers, 
  ArrowRight, 
  ChevronRight, 
  Cpu, 
  Lock, 
  AlertCircle,
  FileCheck,
  FastForward,
  RotateCcw,
  Check
} from 'lucide-react';

export default function TaskPlanner({ 
  currentTask, 
  onPlanTask, 
  onExecuteStep, 
  onRunAllSteps,
  isExecuting,
  currentRole,
  templates = []
}) {
  const [goalInput, setGoalInput] = useState(
    'Analyze the ultrasonic thickness inspection report for Heat Exchanger EX-102. Calculate the annual corrosion rate from 2023 to 2026, compute remaining service life until T_min (4.80 mm), and draft a formal Mechanical Integrity Approval Note with citations.'
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState('task-corrosion-ex102');

  const handleTemplateSelect = (template) => {
    setSelectedTemplateId(template.id);
    setGoalInput(template.goal);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!goalInput.trim()) return;
    onPlanTask(goalInput);
  };

  const steps = currentTask?.planSteps || [];
  const activeStepIdx = currentTask?.activeStepIndex ?? 0;

  return (
    <div className="bg-white border-2 border-navy-900 console-panel p-5 space-y-5">
      {/* Title block */}
      <div className="flex items-center justify-between border-b border-steel-200 pb-3">
        <div className="flex items-center space-x-2.5">
          <Terminal className="w-5 h-5 text-navy-900" />
          <div>
            <h2 className="text-base font-serif font-bold text-navy-900">
              Task Request & Precision Step Planner
            </h2>
            <p className="text-xs font-mono text-steel-500">
              Input operational requirements. The system visibly decomposes high-stakes goals into audit-verifiable steps.
            </p>
          </div>
        </div>

        <div className="text-right font-mono text-xs">
          <span className="text-steel-500">STATION OPERATOR:</span>{' '}
          <strong className="text-navy-900">{currentRole?.name} ({currentRole?.clearanceBadge})</strong>
        </div>
      </div>

      {/* Industrial Quick-Start Template Selector */}
      <div>
        <div className="text-[11px] font-mono font-bold text-steel-700 uppercase tracking-wider mb-2">
          Select Regulated Operational Scenario:
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs font-mono">
          {templates.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => handleTemplateSelect(tpl)}
              className={`p-2.5 text-left border transition-all ${
                selectedTemplateId === tpl.id
                  ? 'border-2 border-navy-900 bg-canvas-subtle font-bold text-navy-900 shadow-sm'
                  : 'border-steel-300 bg-white hover:border-steel-500 text-steel-700'
              }`}
            >
              <div className="text-[10px] text-amber-600 font-bold uppercase">{tpl.category}</div>
              <div className="text-xs font-serif mt-0.5 line-clamp-2">{tpl.title}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Goal Input Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block text-xs font-mono font-bold text-navy-900 uppercase">
          Plain-Language Engineering Objective:
        </label>
        <div className="relative">
          <textarea
            rows={3}
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
            placeholder="State engineering goal (e.g. calculate wall loss, audit relief valve, summarize incident)..."
            className="w-full p-3 font-mono text-xs bg-canvas-subtle border-2 border-steel-300 focus:border-navy-900 focus:bg-white focus:outline-none transition-colors"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-steel-500">
            Rule SEC-09: All decomposer logic runs in local memory without cloud routing.
          </span>
          <button
            type="submit"
            className="px-5 py-2 bg-navy-900 text-amber-400 hover:bg-navy-850 font-mono text-xs font-bold uppercase tracking-wider flex items-center space-x-2 border border-navy-800 shadow-sm transition-all"
          >
            <span>Decompose Request into Task Plan</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </form>

      {/* VISIBLE STEP-BY-STEP EXECUTION PLAN */}
      {steps.length > 0 && (
        <div className="border-t-2 border-navy-900 pt-5 mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-navy-900" />
              <h3 className="font-serif font-bold text-navy-900 text-sm">
                Visible Execution Plan ({steps.filter(s => s.status === 'COMPLETED').length}/{steps.length} Steps Complete)
              </h3>
            </div>

            {/* Execution Controls */}
            <div className="flex items-center space-x-2 font-mono text-xs">
              <button
                onClick={() => onExecuteStep(currentTask.id, steps[activeStepIdx]?.stepNumber)}
                disabled={isExecuting || steps[activeStepIdx]?.status === 'COMPLETED' || steps[activeStepIdx]?.stepType === 'APPROVAL_GATE'}
                className="px-3 py-1.5 bg-steel-600 text-white hover:bg-steel-700 disabled:opacity-40 font-bold flex items-center space-x-1.5 transition-colors"
              >
                <Play className="w-3.5 h-3.5 text-amber-400" />
                <span>Execute Step {steps[activeStepIdx]?.stepNumber || 1}</span>
              </button>

              <button
                onClick={() => onRunAllSteps(currentTask.id)}
                disabled={isExecuting || steps.every(s => s.status === 'COMPLETED')}
                className="px-3 py-1.5 bg-navy-900 text-amber-400 hover:bg-navy-850 disabled:opacity-40 font-bold flex items-center space-x-1.5 border border-navy-800 transition-colors"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>Run Up to Approval Gate</span>
              </button>
            </div>
          </div>

          {/* Steps Flow Timeline */}
          <div className="space-y-3 font-mono text-xs">
            {steps.map((step, idx) => {
              const isCompleted = step.status === 'COMPLETED';
              const isInProgress = step.status === 'IN_PROGRESS';
              const isCurrent = idx === activeStepIdx;
              const isApproval = step.stepType === 'APPROVAL_GATE';

              return (
                <div
                  key={step.stepNumber}
                  className={`p-3.5 border-2 transition-all ${
                    isCompleted
                      ? 'border-steel-300 bg-canvas-subtle'
                      : isInProgress
                      ? 'border-amber-500 bg-amber-50/50 shadow-sm'
                      : isCurrent
                      ? 'border-navy-900 bg-white shadow-panel ring-1 ring-amber-500'
                      : isApproval
                      ? 'border-dashed border-amber-500 bg-amber-50/20'
                      : 'border-steel-200 bg-white opacity-85'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`w-6 h-6 flex items-center justify-center font-bold text-xs shrink-0 ${
                        isCompleted 
                          ? 'bg-status-green text-white' 
                          : isInProgress 
                          ? 'bg-amber-500 text-navy-950 animate-pulse' 
                          : isCurrent 
                          ? 'bg-navy-900 text-amber-400' 
                          : 'bg-steel-200 text-steel-600'
                      }`}>
                        {isCompleted ? <Check className="w-3.5 h-3.5 text-white" /> : step.stepNumber}
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-navy-900 text-sm font-serif">
                            {step.title}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-steel-100 text-steel-700 border border-steel-300 uppercase">
                            {step.stepType}
                          </span>
                        </div>
                        <p className="text-xs text-ink-700 font-sans mt-0.5">
                          {step.description}
                        </p>
                        <div className="text-[11px] text-steel-500 mt-1 flex items-center space-x-2">
                          <span>ASSIGNED MODEL:</span>
                          <strong className="text-navy-900">{step.assignedModel}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className={`text-[10px] font-bold px-2 py-0.5 border ${
                        isCompleted ? 'bg-status-green/20 text-status-greenDark border-status-green/40' :
                        isInProgress ? 'bg-amber-500 text-navy-950 border-amber-600 animate-pulse' :
                        isApproval ? 'bg-amber-100 text-amber-800 border-amber-300' :
                        'bg-steel-100 text-steel-600 border-steel-200'
                      }`}>
                        {isCompleted ? 'VERIFIED' : isInProgress ? 'RUNNING' : isApproval ? 'AWAITING GATE' : 'QUEUED'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
