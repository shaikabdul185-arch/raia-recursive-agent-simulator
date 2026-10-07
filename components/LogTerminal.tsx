import React, { useEffect, useRef } from 'react';

interface LogTerminalProps {
  logs: string[];
}

const LogTerminal: React.FC<LogTerminalProps> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="bg-black border border-slate-800 rounded-lg p-4 font-mono text-sm h-64 overflow-y-auto shadow-inner">
      <div className="text-slate-500 mb-2 border-b border-slate-800 pb-1 flex justify-between">
        <span>sys.log</span>
        <span className="animate-pulse">● LIVE</span>
      </div>
      <div className="space-y-1">
        {logs.map((log, index) => (
          <div key={index} className="break-words">
            <span className="text-slate-600 mr-2">[{new Date().toLocaleTimeString()}]</span>
            {log.startsWith('[L3]') ? (
              <span className="text-violet-400">{log}</span>
            ) : log.startsWith('[L2]') ? (
              <span className="text-amber-400">{log}</span>
            ) : log.startsWith('[L1]') ? (
              <span className="text-emerald-400">{log}</span>
            ) : log.startsWith('FAILURE') || log.includes('ALERT') ? (
              <span className="text-red-500 font-bold">{log}</span>
            ) : (
              <span className="text-blue-300">{log}</span>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default LogTerminal;