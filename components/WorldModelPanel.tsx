import React from 'react';
import { WorldModel, PolicyRule } from '../types';
import { Database, Target, AlertTriangle, Lightbulb } from 'lucide-react';

interface WorldModelPanelProps {
  model: WorldModel;
  policies: PolicyRule[];
  budget: number;
}

const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
  <div className="flex items-center gap-2 mb-2 mt-4 first:mt-0 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-1">
    <Icon className="w-3 h-3" />
    {title}
  </div>
);

const JsonItem: React.FC<{ label: string, value: any }> = ({ label, value }) => (
  <div className="flex justify-between items-start text-xs font-mono mb-1 hover:bg-slate-800/50 p-1 rounded">
    <span className="text-slate-400">{label}:</span>
    <span className={`text-right break-all ${typeof value === 'number' ? 'text-blue-400' : 'text-emerald-400'}`}>
      {String(value)}
    </span>
  </div>
);

const WorldModelPanel: React.FC<WorldModelPanelProps> = ({ model, policies, budget }) => {
  return (
    <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
      
      {/* Modification Budget */}
      <div className="mb-6 p-3 bg-slate-900 rounded border border-slate-700">
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>Self-Modification Budget</span>
          <span>{budget} / 100</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2">
          <div 
            className="bg-violet-500 h-2 rounded-full transition-all duration-700" 
            style={{ width: `${Math.max(0, budget)}%` }}
          />
        </div>
      </div>

      <SectionHeader icon={Database} title="Current Beliefs" />
      <div className="bg-slate-900/50 p-2 rounded mb-2">
        {Object.entries(model.beliefs).map(([k, v]) => (
          <JsonItem key={k} label={k} value={v} />
        ))}
      </div>

      <SectionHeader icon={Target} title="Active Policies" />
      <div className="space-y-2">
        {policies.map((p) => (
          <div key={p.id} className={`p-2 rounded text-xs border ${p.isModified ? 'border-violet-500/50 bg-violet-900/10' : 'border-slate-800 bg-slate-900/30'}`}>
            <div className="flex justify-between font-bold text-slate-300 mb-1">
              <span>{p.id}</span>
              {p.isModified && <span className="text-violet-400 text-[10px] uppercase">Modified</span>}
            </div>
            <div className="text-slate-500 mb-1">IF: <span className="text-slate-300">{p.trigger}</span></div>
            <div className="text-slate-500">THEN: <span className="text-slate-300">{p.action}</span></div>
          </div>
        ))}
      </div>

      <SectionHeader icon={AlertTriangle} title="Constraints" />
      <ul className="list-disc list-inside text-xs text-slate-400 font-mono">
        {model.constraints.map((c, i) => <li key={i} className="mb-1">{c}</li>)}
      </ul>

      <SectionHeader icon={Lightbulb} title="Assumptions" />
      <ul className="list-disc list-inside text-xs text-slate-400 font-mono">
        {model.assumptions.map((a, i) => <li key={i} className="mb-1">{a}</li>)}
      </ul>

    </div>
  );
};

export default WorldModelPanel;