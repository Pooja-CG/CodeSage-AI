import React, { useState } from 'react';
import Header from './components/Header';
import SearchInterface from './components/SearchInterface';
import AgentStatus from './components/AgentStatus';
import ResultsDisplay from './components/ResultsDisplay';
import QueryIntentPanel from './components/QueryIntentPanel';

// Real service infrastructure layers
import { parseQueryIntent, analyzeCodeFile } from './utils/geminiService';
import { parseGitHubUrl, fetchRepoTree, fetchFileContent } from './utils/githubService';

const REAL_STEPS = [
  "Analyzing natural language query and extracting developer intent...",
  "Connecting to GitHub and downloading codebase tree structure...",
  "Scanning files for semantic matches matching intent...",
  "Running deep file analysis using Gemini Agent engine...",
  "Synthesizing dynamic context and compiling code investigation report..."
];

function App() {
  const [isSearching, setIsSearching] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [statusSteps, setStatusSteps] = useState([]);
  const [results, setResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [parsedIntent, setParsedIntent] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = async (repoUrl, query) => {
    if (!repoUrl || !query) return;

    // Reset layout state for a clean pipeline run
    setIsSearching(true);
    setErrorMsg('');
    setParsedIntent(null);
    setResults([]);
    setSearchQuery(query);
    setStatusSteps(REAL_STEPS);
    
    try {
      // --- STEP 1: PARSE INTENT ---
      setCurrentStep(0);
      const intentResult = await parseQueryIntent(query);

      // Safely map the service layer payload into your custom UI component props
      const UI_Intent = {
        intent: intentResult?.intent || `Investigating: ${query}`,
        keywords: intentResult?.keywords || [],
        possible_filenames: intentResult?.probableFiles || [],
        code_concepts: intentResult?.concepts || [],
        search_queries: intentResult?.searchQueries || [query]
      };
      setParsedIntent(UI_Intent);

      // --- STEP 2: PARSE REPO & FETCH FILE TREE ---
      setCurrentStep(1);
      const repoDetails = parseGitHubUrl(repoUrl);
      if (!repoDetails) {
        throw new Error("Invalid GitHub repository URL format.");
      }
      const { owner, repo } = repoDetails;
      const fileTree = await fetchRepoTree(owner, repo);

      // --- STEP 3: SCANNING THE FILES FOR MATCHES ---
      setCurrentStep(2);
      
      // Defensively fallback to empty arrays if specific fields are missing
      const languages = intentResult?.languages || [];
      const probableFiles = intentResult?.probableFiles || [];
      const extensionTargets = languages.map(ext => `.${ext.replace('.', '')}`);
      
      const prioritizedFiles = fileTree.filter(file => {
        const filePathLower = file.path.toLowerCase();
        
        const matchesExtension = extensionTargets.length === 0 || 
          extensionTargets.some(ext => file.path.endsWith(ext));
          
        const matchesKeyword = probableFiles.some(keyword => 
          filePathLower.includes(keyword.toLowerCase().replace(/^\*+|\*+$/g, ''))
        ) || UI_Intent.keywords.some(keyword => 
          filePathLower.includes(keyword.toLowerCase())
        );
        
        return matchesExtension || matchesKeyword;
      }).slice(0, 6); // Limit evaluations to save token limits and optimize search speed

      // Fallback directly to inspecting top root files if keyword filters return empty
      const executionQueue = prioritizedFiles.length > 0 ? prioritizedFiles : fileTree.slice(0, 4);

      // --- STEP 4 & 5: RUN DEEP FILE ANALYSIS AND REASONING ---
      setCurrentStep(3);
      const investigatedResults = [];

      for (const file of executionQueue) {
        try {
          const rawContent = await fetchFileContent(owner, repo, file.path);
          
          // Let Gemini inspect the code contents against your workflow target
          const analysis = await analyzeCodeFile(file.path, rawContent, query);
          
          if (analysis && analysis.isRelevant) {
            const lines = rawContent.split('\n');
            investigatedResults.push({
              path: file.path,
              url: `https://github.com/${owner}/${repo}/blob/main/${file.path}`,
              explanation: analysis.reasoning,
              relevanceScore: analysis.relevanceScore || 70, 
              snippet: lines.slice(0, 40).join('\n'), // Grab safety view snippet frame
              lineStart: 1,
              lineEnd: Math.min(40, lines.length)
            });
          }
        } catch (fileErr) {
          console.warn(`Skipping analysis for file node context: ${file.path}`, fileErr);
        }
      }

      // Sort matches dynamically by highest relevance score
      investigatedResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

      setCurrentStep(4);
      // Give UI loading states a quick moment to settle cleanly on complete
      setTimeout(() => {
        setResults(investigatedResults);
        setIsSearching(false);
        setStatusSteps([]);
      }, 600);

    } catch (err) {
      console.error("Investigation processing error:", err);
      setErrorMsg(err.message || "An unexpected error occurred during the codebase compilation.");
      setIsSearching(false);
      setStatusSteps([]);
    }
  };

  return (
    <>
      <Header />
      <main className="app-container">
        <SearchInterface onSearch={handleSearch} isSearching={isSearching} />

        {errorMsg && (
          <div className="error-banner" style={{ color: '#f85149', margin: '20px 0', textAlign: 'center' }}>
            <strong>Investigation Error:</strong> {errorMsg}
          </div>
        )}

        {isSearching && statusSteps.length > 0 && (
          <AgentStatus statusSteps={statusSteps} currentStep={currentStep} />
        )}

        {parsedIntent && <QueryIntentPanel intent={parsedIntent} />}

        <ResultsDisplay results={results} query={searchQuery} />
      </main>
    </>
  );
}

export default App;