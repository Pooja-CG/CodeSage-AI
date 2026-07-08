import React, { useEffect, useRef } from 'react';

export const AgentConsole = ({ logs = [], isInvestigating }) => {
  const terminalEndRef = useRef(null);

  // Auto-scrolls the terminal as new logs stream in
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  if (!isInvestigating && logs.length === 0) return null;

  return (
    <div className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl overflow-hidden my-6 font-mono text-sm shadow-2xl">
      {/* Terminal Header */}
      <div className="bg-[#161b22] px-4 py-3 border-b border-[#30363d] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
          <span className="text-[#8b949e] text-xs pl-2 font-medium">investigator-agent-core.sh</span>
        </div>
        {isInvestigating && (
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#58a6ff] animate-pulse" />
            <span className="text-[#58a6ff] text-xs font-semibold uppercase tracking-wider animate-pulse">Running</span>
          </div>
        )}
      </div>

      {/* Terminal Display Body */}
      <div className="p-4 max-h-60 overflow-y-auto space-y-2 select-text selection:bg-[#388bfd33]">
        {logs.map((log, index) => {
          let statusColor = "text-[#c9d1d9]";
          if (log.includes('✔') || log.includes('SUCCESS')) statusColor = "text-[#7ee787]";
          if (log.includes('⏳') || log.includes('RUNNING')) statusColor = "text-[#d29922]";
          if (log.includes('❌') || log.includes('ERROR')) statusColor = "text-[#f85149]";
          if (log.includes('🔍') || log.includes('ANALYZING')) statusColor = "text-[#58a6ff]";

          return (
            <div key={index} className={`leading-relaxed tracking-wide transition-all duration-200 ${statusColor}`}>
              <span className="text-[#8b949e] mr-2">$</span>
              {log}
            </div>
          );
        })}
        
        {/* Blinking Prompt Cursor */}
        {isInvestigating && (
          <div className="text-[#58a6ff] flex items-center animate-pulse">
            <span className="text-[#8b949e] mr-2">$</span>
            <span className="bg-[#58a6ff] w-2 h-4 inline-block ml-1" />
          </div>
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};