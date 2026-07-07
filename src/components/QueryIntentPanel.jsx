import React, { useState } from 'react';
import { Brain, Tag, FileCode2, Layers, Search, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import './QueryIntentPanel.css';

const Section = ({ icon: Icon, title, color, children }) => (
  <div className="qi-section">
    <div className="qi-section-header" style={{ '--section-color': color }}>
      <Icon size={16} />
      <span>{title}</span>
    </div>
    <div className="qi-section-body">{children}</div>
  </div>
);

const Pill = ({ label, color }) => (
  <span className="qi-pill" style={{ '--pill-color': color }}>
    {label}
  </span>
);

export default function QueryIntentPanel({ intent }) {
  const [expanded, setExpanded] = useState(true);
  const [copied, setCopied] = useState(false);

  if (!intent) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(intent, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="qi-panel glass-panel animate-fade-in">
      {/* Header */}
      <div className="qi-header">
        <div className="qi-title">
          <Brain size={20} className="qi-brain-icon" />
          <span>Parsed Search Intent</span>
          <span className="qi-badge">AI</span>
        </div>
        <div className="qi-header-actions">
          <button className="qi-icon-btn" onClick={handleCopy} title="Copy as JSON">
            {copied ? <Check size={16} className="qi-copied" /> : <Copy size={16} />}
          </button>
          <button className="qi-icon-btn" onClick={() => setExpanded((v) => !v)}>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="qi-body">
          {/* Intent */}
          <div className="qi-intent-banner">
            <span className="qi-intent-label">INTENT</span>
            <p className="qi-intent-text">{intent.intent}</p>
          </div>

          <div className="qi-grid">
            {/* Keywords */}
            <Section icon={Tag} title="Keywords" color="#3b82f6">
              <div className="qi-pills">
                {intent.keywords.map((k, i) => (
                  <Pill key={i} label={k} color="#3b82f6" />
                ))}
              </div>
            </Section>

            {/* Possible Filenames */}
            <Section icon={FileCode2} title="Possible Filenames" color="#10b981">
              <div className="qi-files">
                {intent.possible_filenames.map((f, i) => (
                  <div key={i} className="qi-file-row">
                    <span className="qi-file-dot" style={{ background: '#10b981' }} />
                    <code>{f}</code>
                  </div>
                ))}
              </div>
            </Section>

            {/* Code Concepts */}
            <Section icon={Layers} title="Code Concepts" color="#8b5cf6">
              <div className="qi-pills">
                {intent.code_concepts.map((c, i) => (
                  <Pill key={i} label={c} color="#8b5cf6" />
                ))}
              </div>
            </Section>

            {/* Search Queries */}
            <Section icon={Search} title="Search Queries" color="#f59e0b">
              <ol className="qi-search-queries">
                {intent.search_queries.map((q, i) => (
                  <li key={i} className="qi-query-item">
                    <span className="qi-query-num">{i + 1}</span>
                    <span className="qi-query-text">"{q}"</span>
                  </li>
                ))}
              </ol>
            </Section>
          </div>
        </div>
      )}
    </div>
  );
}
