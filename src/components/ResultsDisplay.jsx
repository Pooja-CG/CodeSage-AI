import React from 'react';
import { FileCode2, ExternalLink, Sparkles } from 'lucide-react';
import CodeAnalysisPanel from './CodeAnalysisPanel';
import './ResultsDisplay.css';

export default function ResultsDisplay({ results, query }) {
  if (!results || results.length === 0) return null;

  return (
    <div className="results-container animate-fade-in">
      <div className="results-header">
        <Sparkles className="results-icon" size={28} />
        <h2>Investigation Results</h2>
      </div>
      <p className="results-context">Found {results.length} relevant files for: <strong>"{query}"</strong></p>

      <div className="results-list">
        {results.map((result, index) => (
          <div key={index} className="result-card glass-panel">
            <div className="result-card-header">
              <div className="file-info">
                <FileCode2 size={20} className="file-icon" />
                <span className="file-path">{result.path}</span>
              </div>
              <a href={result.url} target="_blank" rel="noopener noreferrer" className="view-source-btn">
                View Source <ExternalLink size={16} />
              </a>
            </div>

            <div className="ai-explanation">
              <h4>Why is this relevant?</h4>
              <p>{result.explanation}</p>
            </div>

            <div className="code-snippet-container">
              <div className="snippet-header">
                <span>Snippet Lines {result.lineStart}-{result.lineEnd}</span>
              </div>
              <pre className="code-snippet">
                <code>{result.snippet}</code>
              </pre>
            </div>

            {/* AI Code Analysis — lazy, per-card */}
            <CodeAnalysisPanel
              query={query}
              filename={result.path}
              code={result.snippet}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
