import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// Premium VS-Code dark style theme
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'; 

export const CodeSnippetViewer = ({ filename, code }) => {
  // Dynamically determine language based on file extension
  const getLanguage = (filename) => {
    if (!filename) return 'javascript';
    const ext = filename.split('.').pop().toLowerCase();
    switch (ext) {
      case 'js': case 'jsx': return 'jsx';
      case 'ts': case 'tsx': return 'typescript';
      case 'py': return 'python';
      case 'json': return 'json';
      case 'md': return 'markdown';
      case 'html': return 'html';
      case 'css': return 'css';
      default: return 'javascript';
    }
  };

  return (
    <div className="w-full rounded-xl overflow-hidden border border-[#30363d] bg-[#1d2433] font-mono text-sm shadow-inner mt-3">
      {/* Code Header Mini-Tab Bar */}
      <div className="bg-[#161b22] px-4 py-2 border-b border-[#30363d] flex items-center justify-between">
        <span className="text-[#8b949e] text-xs font-medium tracking-wide">{filename}</span>
        <span className="text-[#58a6ff] text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#58a6ff]/10 border border-[#58a6ff]/20">
          {getLanguage(filename)}
        </span>
      </div>

      {/* Highlighter Element */}
      <SyntaxHighlighter
        language={getLanguage(filename)}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: '16px',
          background: '#0d1117', // Match your dashboard container hue perfectly
          fontSize: '13px',
          lineHeight: '1.6',
        }}
        showLineNumbers={true}
        lineNumberStyle={{ color: '#484f58', minWidth: '2em', paddingRight: '1em', textAlign: 'right', userSelect: 'none' }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeSnippetViewer;