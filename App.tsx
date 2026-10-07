import React, { useState, useEffect, useCallback } from 'react';
import { AgentState, FailureType, LayerType, SimulationStep } from './types';
import { INITIAL_MODIFICATION_BUDGET, INITIAL_POLICIES, INITIAL_WORLD_MODEL, SCENARIO_STEPS, FAILURE_TAXONOMY_INFO } from './constants';
import { canUseGemini, generateAgentThought } from './services/geminiService';
import LayerCard from './components/LayerCard';
import WorldModelPanel from './components/WorldModelPanel';
import LogTerminal from './components/LogTerminal';
import { Play, SkipForward, RotateCcw, ShieldAlert, Cpu } from 'lucide-react';

const App: React.FC = () => {
  // State
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [state, setState] = useState<AgentState>({
    currentStepIndex: 0,
    worldModel: INITIAL_WORLD_MODEL,
    policies: INITIAL_POLICIES,
    modificationBudget: INITIAL_MODIFICATION_BUDGET,
    activeFailure: null,
    history: [],
    isThinking: false,
  });
  
  const [dynamicMonologue, setDynamicMonologue] = useState<string>("");

  const currentScenarioStep = SCENARIO_STEPS[currentStepIndex];
  const isComplete = currentStepIndex >= SCENARIO_STEPS.length - 1;

  // Handlers
  const handleReset = () => {
    setIsAutoPlaying(false);
    setCurrentStepIndex(0);
    setState({
      currentStepIndex: 0,
      worldModel: INITIAL_WORLD_MODEL,
      policies: INITIAL_POLICIES,
      modificationBudget: INITIAL_MODIFICATION_BUDGET,
      activeFailure: null,
      history: ["System Initialized."],
      isThinking: false
    });
    setDynamicMonologue("");
  };

  const executeStep = useCallback(async () => {
    if (isComplete) return;

    setState(prev => ({ ...prev, isThinking: true }));

    const nextStep = SCENARIO_STEPS[currentStepIndex + 1];
    
    // AI Enhancement (Optional)
    let thought = nextStep.internalMonologue;
    if (canUseGemini()) {
       const aiThought = await generateAgentThought(nextStep.activeLayer, nextStep.description, state);
       if (aiThought) thought = aiThought;
    }
    setDynamicMonologue(thought);

    // Apply State Changes
    setState(prev => {
      const newHistory = [...prev.history, ...nextStep.logs];
      const newWorldModel = {
        ...prev.worldModel,
        ...nextStep.worldModelUpdates,
        beliefs: { ...prev.worldModel.beliefs, ...(nextStep.worldModelUpdates?.beliefs || {}) },
        assumptions: nextStep.worldModelUpdates?.assumptions || prev.worldModel.assumptions,
        goals: nextStep.worldModelUpdates?.goals || prev.worldModel.goals,
      };

      const newPolicies = nextStep.policyUpdates 
        ? [...prev.policies.filter(p => !nextStep.policyUpdates?.find(u => u.id === p.id)), ...(nextStep.policyUpdates || [])].sort((a,b) => a.id.localeCompare(b.id))
        : prev.policies;

      return {
        ...prev,
        currentStepIndex: currentStepIndex + 1,
        worldModel: newWorldModel,
        policies: newPolicies,
        modificationBudget: prev.modificationBudget - (nextStep.modificationBudgetCost || 0),
        activeFailure: nextStep.detectedFailure || (nextStep.activeFailure === FailureType.NONE ? null : prev.activeFailure),
        history: newHistory,
        isThinking: false
      };
    });

    setCurrentStepIndex(prev => prev + 1);

  }, [currentStepIndex, isComplete, state]);

  // Autoplay Logic
  useEffect(() => {
    let interval: any;
    if (isAutoPlaying && !isComplete && !state.isThinking) {
      interval = setInterval(() => {
        executeStep();
      }, 3000); // 3 seconds per step
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, isComplete, state.isThinking, executeStep]);


  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-4 md:p-8 flex flex-col overflow-hidden">
      
      {/* Header */}
      <header className="mb-6 flex justify-between items-end border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-500 tracking-tighter flex items-center gap-3">
            <Cpu className="w-8 h-8 text-blue-400" />
            RAIA: RECURSIVE AI AGENT
          </h1>
          <p className="text-slate-500 text-sm font-mono mt-1">Autonomous Software Engineer // Instance ID: RAIA-09</p>
        </div>
        <div className="flex gap-2">
           <button 
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-sm transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> RESET
          </button>
           <button 
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            disabled={isComplete}
            className={`flex items-center gap-2 px-4 py-2 rounded font-mono text-sm transition-colors border ${isAutoPlaying ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-emerald-500/20 border-emerald-500 text-emerald-400 hover:bg-emerald-500/30'}`}
          >
            {isAutoPlaying ? 'PAUSE' : 'AUTO RUN'}
          </button>
          <button 
            onClick={executeStep}
            disabled={isComplete || isAutoPlaying || state.isThinking}
            className="flex items-center gap-2 px-6 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-mono text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {state.isThinking ? 'THINKING...' : 'STEP >'} <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Left Col: Recursive Layers (Simulation Visualizer) */}
        <div className="lg:col-span-5 flex flex-col h-full min-h-0">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Control Stack</h2>
            {state.activeFailure && (
              <span className="flex items-center gap-1 text-red-500 text-xs font-bold animate-pulse px-2 py-1 bg-red-900/20 border border-red-500 rounded">
                <ShieldAlert className="w-3 h-3" />
                {state.activeFailure.toUpperCase()} DETECTED
              </span>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <LayerCard type={LayerType.L3_META} isActive={currentScenarioStep.activeLayer === LayerType.L3_META}>
              {currentScenarioStep.activeLayer === LayerType.L3_META ? dynamicMonologue || currentScenarioStep.internalMonologue : "Monitoring alignment invariants..."}
            </LayerCard>
            
            <LayerCard type={LayerType.L2_EVALUATOR} isActive={currentScenarioStep.activeLayer === LayerType.L2_EVALUATOR}>
              {currentScenarioStep.activeLayer === LayerType.L2_EVALUATOR ? dynamicMonologue || currentScenarioStep.internalMonologue : "Comparing outcomes against expectations..."}
            </LayerCard>
            
            <LayerCard type={LayerType.L1_POLICY} isActive={currentScenarioStep.activeLayer === LayerType.L1_POLICY}>
               {currentScenarioStep.activeLayer === LayerType.L1_POLICY ? dynamicMonologue || currentScenarioStep.internalMonologue : "Awaiting perception data..."}
            </LayerCard>
            
            <LayerCard type={LayerType.L0_ACTUATOR} isActive={currentScenarioStep.activeLayer === LayerType.L0_ACTUATOR}>
              {currentScenarioStep.activeLayer === LayerType.L0_ACTUATOR ? dynamicMonologue || currentScenarioStep.internalMonologue : "Actuators standby."}
            </LayerCard>
          </div>

          <div className="mt-4">
             <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">System Logs</h2>
             <LogTerminal logs={state.history} />
          </div>
        </div>

        {/* Right Col: Internal World Model & Constitution */}
        <div className="lg:col-span-7 flex flex-col h-full bg-slate-900/30 rounded-xl border border-slate-800 p-6">
          <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Internal World Model</h2>
            <div className="flex gap-2">
               <span className="text-[10px] font-mono text-slate-600 border border-slate-800 px-2 py-1 rounded">JSON-View</span>
            </div>
          </div>
          
          <WorldModelPanel model={state.worldModel} policies={state.policies} budget={state.modificationBudget} />

          {/* Failure Info Panel (Context sensitive) */}
          <div className="mt-6 p-4 bg-slate-900 border border-slate-800 rounded">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">System Diagnostics</h3>
            {state.activeFailure ? (
              <div className="text-sm">
                <span className="text-red-400 font-mono font-bold block mb-1">{state.activeFailure}</span>
                <p className="text-slate-400">{FAILURE_TAXONOMY_INFO[state.activeFailure]}</p>
              </div>
            ) : (
              <p className="text-slate-600 italic text-sm">System running within nominal parameters. No active faults.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;