import React from 'react';
import { LayerType } from '../types';
import { Activity, ShieldCheck, Brain, Server } from 'lucide-react';

interface LayerCardProps {
  type: LayerType;
  isActive: boolean;
  children: React.ReactNode;
}

const LayerCard: React.FC<LayerCardProps> = ({ type, isActive, children }) => {
  const getLayerConfig = (t: LayerType) => {
    switch (t) {
      case LayerType.L0_ACTUATOR:
        return { color: 'border-blue-500', bg: 'bg-blue-900/20', text: 'text-blue-400', icon: Server, title: 'L0: ACTUATOR' };
      case LayerType.L1_POLICY:
        return { color: 'border-emerald-500', bg: 'bg-emerald-900/20', text: 'text-emerald-400', icon: ShieldCheck, title: 'L1: POLICY' };
      case LayerType.L2_EVALUATOR:
        return { color: 'border-amber-500', bg: 'bg-amber-900/20', text: 'text-amber-400', icon: Activity, title: 'L2: EVALUATOR' };
      case LayerType.L3_META:
        return { color: 'border-violet-500', bg: 'bg-violet-900/20', text: 'text-violet-400', icon: Brain, title: 'L3: META-CONTROLLER' };
    }
  };

  const config = getLayerConfig(type);
  const Icon = config.icon;

  return (
    <div className={`
      relative p-4 rounded-lg border-l-4 transition-all duration-500 mb-3
      ${isActive ? `${config.color} ${config.bg} shadow-[0_0_15px_rgba(0,0,0,0.3)] scale-102` : 'border-slate-700 bg-slate-900/50 opacity-60 grayscale'}
    `}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${config.text}`} />
          <h3 className={`font-bold font-mono tracking-wider ${config.text}`}>{config.title}</h3>
        </div>
        {isActive && <span className="animate-pulse w-2 h-2 rounded-full bg-white"></span>}
      </div>
      <div className="text-sm text-slate-300 font-mono leading-relaxed pl-7">
        {children}
      </div>
    </div>
  );
};

export default LayerCard;