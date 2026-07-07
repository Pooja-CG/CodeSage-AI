import React, { useState } from 'react';
import { Search, GitBranch } from 'lucide-react';
import './SearchInterface.css';

export default function SearchInterface({ onSearch, isSearching }) {
  const [repoUrl, setRepoUrl] = useState('https://github.com/facebook/react');
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (repoUrl && query) {
      onSearch(repoUrl, query);
    }
  };

  return (
    <section className="search-section animate-fade-in">
      <div className="search-header">
        <h2>Intelligent Code Investigator</h2>
        <p>Find relevant code files using natural language. The AI agent understands your intent.</p>
      </div>

      <form className="search-form glass-panel" onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Target Repository</label>
          <div className="input-wrapper">
            <GitBranch className="input-icon" size={20} />
            <input 
              type="text" 
              className="input-field with-icon" 
              placeholder="e.g., https://github.com/facebook/react"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="input-group">
          <label>Investigation Query</label>
          <div className="input-wrapper">
            <Search className="input-icon" size={20} />
            <input 
              type="text" 
              className="input-field with-icon" 
              placeholder="e.g., Where is the code for the useEffect hook implementation?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              required
            />
          </div>
        </div>

        <button type="submit" className="btn-primary search-btn" disabled={isSearching}>
          {isSearching ? (
            <>Investigating...</>
          ) : (
            <>
              <Search size={20} />
              Investigate Codebase
            </>
          )}
        </button>
      </form>
    </section>
  );
}
