import React, { useState } from 'react';
import Header from './components/Header';
import SearchInterface from './components/SearchInterface';
import AgentStatus from './components/AgentStatus';
import ResultsDisplay from './components/ResultsDisplay';
import QueryIntentPanel from './components/QueryIntentPanel';
import { parseQuery } from './utils/queryParser';

const MOCK_STEPS = [
  "Fetching repository metadata...",
  "Parsing Abstract Syntax Trees (AST)...",
  "Generating semantic embeddings...",
  "Matching natural language query to code...",
  "Extracting relevant snippets and synthesizing explanation...",
];

function buildMockResults(query, intent) {
  const filename = intent?.possible_filenames?.[0] ?? "index.js";
  const concept = intent?.code_concepts?.[0] ?? "core logic";
  const keyword = intent?.keywords?.[0] ?? "handler";

  return [
    {
      path: `src/core/${filename}`,
      url: `https://github.com/facebook/react/blob/main/src/core/${filename}`,
      explanation: `This file encapsulates the primary ${concept} logic. It directly matches your query "${query}" by exposing the main entry point for the ${keyword} subsystem, where the core processing pipeline is initialized and managed.`,
      lineStart: 42,
      lineEnd: 68,
      snippet: `// ${filename} — auto-located by CodeSage AI
// Concept: ${concept}

export function initialize${keyword.charAt(0).toUpperCase() + keyword.slice(1)}(config) {
  const ctx = createContext(config);
  ctx.on('ready', () => {
    process(ctx);
  });
  return ctx;
}

export function process(ctx) {
  validate(ctx.config);
  const result = execute(ctx);
  return result;
}`,
    },
    {
      path: `src/utils/${intent?.possible_filenames?.[1] ?? "helpers.js"}`,
      url: `https://github.com/facebook/react/blob/main/src/utils/helpers.js`,
      explanation: `This utility module provides supporting functions for the ${concept} flow. It handles edge cases, input validation, and error boundaries that complement the primary implementation found above.`,
      lineStart: 110,
      lineEnd: 134,
      snippet: `// Utility helpers for: ${query}

export function validate(input) {
  if (!input || typeof input !== 'object') {
    throw new TypeError('Invalid input: expected configuration object');
  }
  const required = ${JSON.stringify(intent?.keywords?.slice(0, 3) ?? [])};
  required.forEach(key => {
    if (!(key.toLowerCase() in input)) {
      throw new Error(\`Missing required field: \${key}\`);
    }
  });
  return true;
}`,
    },
  ];
}

function App() {
  const [isSearching, setIsSearching] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [statusSteps, setStatusSteps] = useState([]);
  const [results, setResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [parsedIntent, setParsedIntent] = useState(null);

  const handleSearch = (repoUrl, query) => {
    // Parse the query immediately for instant feedback
    const intent = parseQuery(query);
    setParsedIntent(null);   // hide old intent while searching
    setIsSearching(true);
    setStatusSteps(MOCK_STEPS);
    setCurrentStep(0);
    setResults([]);
    setSearchQuery(query);

    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      setCurrentStep(step);

      if (step >= MOCK_STEPS.length) {
        clearInterval(interval);
        setTimeout(() => {
          setIsSearching(false);
          setStatusSteps([]);
          setParsedIntent(intent);
          setResults(buildMockResults(query, intent));
        }, 800);
      }
    }, 1400);
  };

  return (
    <>
      <Header />
      <main className="app-container">
        <SearchInterface onSearch={handleSearch} isSearching={isSearching} />

        {statusSteps.length > 0 && (
          <AgentStatus statusSteps={statusSteps} currentStep={currentStep} />
        )}

        {parsedIntent && <QueryIntentPanel intent={parsedIntent} />}

        <ResultsDisplay results={results} query={searchQuery} />
      </main>
    </>
  );
}

export default App;
