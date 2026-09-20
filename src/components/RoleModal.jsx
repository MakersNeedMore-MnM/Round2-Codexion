import React, { useState } from 'react';
import { 
  Lock, 
  Check, 
  ChevronRight, 
  HardHat, 
  Wrench, 
  Briefcase, 
  ShieldCheck,
  X
} from 'lucide-react';

export default function RoleModal({ isOpen, onClose, roles = [], currentRole, onSelectRole }) {
  if (!isOpen) return null;

  const [selectedRoleId, setSelectedRoleId] = useState(currentRole?.id || 'engineer');

  const getRoleIcon = (roleId) => {
    switch (roleId) {
      case 'admin': return ShieldCheck;
      case 'engineer': return Wrench;
      case 'reviewer': return Briefcase;
      case 'viewer': return HardHat;
      default: return Wrench;
    }
  };

  const handleConfirm = () => {
    const role = roles.find(r => r.id === selectedRoleId);
    if (role && onSelectRole) {
      onSelectRole(role);
    }
    onClose();
  };

  const activeSelected = roles.find(r => r.id === selectedRoleId) || roles[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/80 p-4">
      <div className="w-full max-w-4xl bg-canvas border-2 border-navy-900 shadow-2xl flex flex-col max-h-[90vh] console-panel">
        {/* Header */}
        <div className="px-6 py-4 bg-navy-900 text-white flex items-center justify-between border-b-2 border-amber-500">
          <div>
            <h2 className="text-lg font-serif font-bold text-white tracking-tight">
              Switch User Role
            </h2>
            <p className="text-xs text-steel-300 font-sans mt-0.5">
              Select a role to adjust which documents and calculations you can access.
            </p>
          </div>
          <button onClick={onClose} className="text-steel-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 bg-canvas">
          {/* Left: Role Selection Cards */}
          <div className="md:col-span-7 space-y-3">
            <div className="text-xs font-mono font-semibold text-steel-700 uppercase tracking-wider mb-2">
              Select Role
            </div>
            
            {roles.map((role) => {
              const Icon = getRoleIcon(role.id);
              const isSelected = selectedRoleId === role.id;
              return (
                <div
                  key={role.id}
                  onClick={() => setSelectedRoleId(role.id)}
                  className={`cursor-pointer p-4 border transition-all text-left relative ${
                    isSelected
                      ? 'border-2 border-navy-900 bg-white shadow-md'
                      : 'border-steel-300 bg-canvas-subtle hover:border-steel-500 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3.5">
                      <div className={`p-2 border ${
                        isSelected 
                          ? 'bg-navy-900 text-amber-400 border-navy-800' 
                          : 'bg-steel-100 text-steel-700 border-steel-200'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-serif font-bold text-navy-900 text-base">
                            {role.name}
                          </h3>
                          <span className="text-[11px] font-mono text-steel-600 bg-steel-100 px-2 py-0.5 border border-steel-200">
                            {role.clearanceBadge}
                          </span>
                        </div>
                        <div className="text-xs text-steel-600 mt-0.5">
                          {role.title}
                        </div>
                        <p className="text-xs text-ink-700 mt-2 line-clamp-2">
                          {role.description}
                        </p>
                      </div>
                    </div>

                    <div className="mt-1">
                      {isSelected ? (
                        <div className="w-5 h-5 bg-navy-900 text-amber-400 flex items-center justify-center font-mono text-xs font-bold border border-navy-800">
                          <Check className="w-3.5 h-3.5 text-amber-400" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 border-2 border-steel-300" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Role Access Scope */}
          <div className="md:col-span-5 flex flex-col justify-between border border-steel-300 bg-white p-5 shadow-sm">
            <div>
              <div className="flex items-center space-x-2 text-xs font-mono font-bold text-navy-900 uppercase border-b border-steel-200 pb-2 mb-3">
                <Lock className="w-4 h-4 text-steel-600" />
                <span>Access Permissions</span>
              </div>

              <div className="space-y-4 text-xs font-mono">
                <div>
                  <div className="text-steel-500 text-[11px] mb-1">SELECTED ROLE:</div>
                  <div className="font-serif font-bold text-navy-900 text-sm">
                    {activeSelected.name}
                  </div>
                  <div className="text-steel-600 text-[11px]">
                    {activeSelected.title}
                  </div>
                </div>

                <div className="border-t border-dashed border-steel-200 pt-3">
                  <div className="text-steel-500 text-[11px] mb-1.5 font-bold">
                    ACCESSIBLE DATA:
                  </div>
                  <ul className="space-y-1 text-ink-800 pl-4 list-disc text-[11px]">
                    {activeSelected.accessibleCategories.map((cat, idx) => (
                      <li key={idx}>{cat}</li>
                    ))}
                  </ul>
                </div>

                <div className="text-[11px] text-steel-500 bg-canvas-subtle p-2.5 border border-steel-200">
                  Document visibility is filtered locally based on your active role.
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-steel-200">
              <button
                onClick={handleConfirm}
                className="w-full py-2.5 px-4 bg-navy-900 text-amber-400 hover:bg-navy-850 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 border border-navy-800 shadow-sm transition-all"
              >
                <span>Switch to {activeSelected.name}</span>
                <ChevronRight className="w-4 h-4 text-amber-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-canvas-subtle border-t border-steel-300 flex items-center justify-end">
          <button
            onClick={onClose}
            className="text-steel-600 hover:text-navy-900 text-xs font-mono underline"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
