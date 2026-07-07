import React, { useState, useEffect } from 'react';
import { Brain, Zap, ListChecks, Gauge, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { analyzeCodeRelevance } from '../utils/codeAnalyzer';
import './CodeAnalysisPanel.css';

function ConfidenceBar({ score }) {
  const color =
    score >= 80 ? '#10b981' :
    score >= 60 ? '#3b82f6' :
    score >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="cap-confidence">
      <div className="cap-conf-header">
        <Gauge size={14} />
        <span>Confidence</span>
        <span className="cap-conf-score" style={{ color }}>{score}</span>
        <span className="cap-conf-label">/100</span>
      </div>
      <div className="cap-conf-track">
        <div
          className="cap-conf-fill"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
    </div>
  );
}

export default function CodeAnalysisPanel({ query, filename, code }) {
  const [expanded, setExpanded] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Reset if inputs change
    setAnalysis(null);
  }, [query, filename, code]);

  const handleExpand = () => {
    if (!expanded && !analysis) {
      // Simulate a brief "thinking" delay for realism
      setLoading(true);
      setTimeout(() => {
        setAnalysis(analyzeCodeRelevance(query, filename, code));
        setLoading(false);
      }, 600);
    }
    setExpanded((v) => !v);
  };

  return (
    <div className="cap-wrapper">
      <button className="cap-toggle" onClick={handleExpand}>
        <Brain size={15} className="cap-toggle-icon" />
        <span>AI Code Analysis</span>
        {loading && <Loader2 size={14} className="cap-spinner" />}
        {!loading && (expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
      </button>

      {expanded && !loading && analysis && (
        <div className="cap-panel animate-fade-in">
          {/* Summary */}
          <div className="cap-row">
            <div className="cap-row-label">
              <Zap size={13} className="cap-row-icon" style={{ color: '#f59e0b' }} />
              Summary
            </div>
            <p className="cap-row-value">{analysis.summary}</p>
          </div>

          {/* Relevance Reason */}
          <div className="cap-row">
            <div className="cap-row-label">
              <Brain size={13} className="cap-row-icon" style={{ color: '#8b5cf6' }} />
              Relevance Reason
            </div>
            <p className="cap-row-value cap-relevance">{analysis.relevance_reason}</p>
          </div>

          {/* Key Functions */}
          {analysis.key_functions.length > 0 && (
            <div className="cap-row">
              <div className="cap-row-label">
                <ListChecks size={13} className="cap-row-icon" style={{ color: '#3b82f6' }} />
                Key Functions
              </div>
              <div className="cap-functions">
                {analysis.key_functions.map((fn, i) => (
                  <code key={i} className="cap-fn-chip">{fn}()</code>
                ))}
              </div>
            </div>
          )}

          {/* Confidence */}
          <ConfidenceBar score={analysis.confidence} />

          {/* Raw JSON toggle */}
          <details className="cap-raw">
            <summary>View raw JSON</summary>
            <pre className="cap-json">{JSON.stringify(analysis, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  );
}
