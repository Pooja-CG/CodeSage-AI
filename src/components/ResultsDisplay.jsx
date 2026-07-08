import React from 'react';
import { FileCode2, ExternalLink, Sparkles } from 'lucide-react';
import CodeAnalysisPanel from './CodeAnalysisPanel';
import CodeSnippetViewer from './CodeSnippetViewer';
import './ResultsDisplay.css';

export default function ResultsDisplay({ results, query }) {
  if (!results || results.length === 0) return null;

  return (
    <div className="results-container animate-fade-in">
      <div className="results-header">
        <Sparkles className="results-icon" size={28} />
        <h2>Investigation Results</h2>
      </div>
      <p className="results-context">
        Found {results.length} relevant files for: <strong>"{query}"</strong>
      </p>

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
              <div className="explanation-meta-row">
                <h4>Why is this relevant?</h4>
                {/* Displaying the custom relevance score returned by the agent */}
                {result.relevanceScore && (
                  <span className="score-badge">
                    {result.relevanceScore}% Relevance
                  </span>
                )}
              </div>
              <p>{result.explanation}</p>
            </div>

            {/* Rich Token Highlight Container Layer */}
            <div className="code-snippet-container">
              <div className="snippet-header" style={{ marginBottom: '4px' }}>
                <span>Snippet Lines {result.lineStart}-{result.lineEnd}</span>
              </div>
              
              {/* Swapped out raw text dump for your beautiful custom Prism view anchor */}
              <CodeSnippetViewer filename={result.path} code={result.snippet} />
            </div>

            {/* AI Code Analysis — Lazy interactive drawer panel per card */}
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