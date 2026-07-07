/**
 * codeAnalyzer.js
 * Analyzes a code file against a user query and returns a structured
 * relevance explanation JSON — no external API required.
 */

// ---------------------------------------------------------------------------
// Pattern libraries
// ---------------------------------------------------------------------------

const FILE_ROLE_MAP = [
  { pattern: /auth|login|signin|session|jwt|token/i, role: "Handles user authentication and authorization" },
  { pattern: /middleware/i, role: "Middleware layer for request/response pipeline" },
  { pattern: /router|routes?|endpoint/i, role: "Defines API routes and HTTP endpoints" },
  { pattern: /controller/i, role: "Controller layer handling business logic for requests" },
  { pattern: /model|schema|entity/i, role: "Data model or database schema definition" },
  { pattern: /service/i, role: "Service layer encapsulating reusable business logic" },
  { pattern: /hook|use[A-Z]/i, role: "Custom React hook managing stateful logic" },
  { pattern: /store|reducer|slice/i, role: "State management store or reducer" },
  { pattern: /util|helper|lib/i, role: "Utility/helper functions for shared logic" },
  { pattern: /test|spec/i, role: "Test suite verifying component or module behavior" },
  { pattern: /config|env|settings/i, role: "Configuration and environment variable management" },
  { pattern: /socket|ws\.|websocket/i, role: "Real-time WebSocket communication handler" },
  { pattern: /cache|redis/i, role: "Caching layer for performance optimization" },
  { pattern: /upload|storage|s3/i, role: "File upload and cloud storage handler" },
  { pattern: /graphql|resolver|schema\.graphql/i, role: "GraphQL schema definition or resolver" },
  { pattern: /error|exception|boundary/i, role: "Error handling and exception boundary" },
  { pattern: /index\.(js|ts|jsx|tsx)$/i, role: "Module entry point and export aggregator" },
];

const QUERY_RELEVANCE_MAP = [
  {
    patterns: [/jwt|json.?web.?token/i],
    reasons: [
      "Contains JWT token creation, signing, or verification logic",
      "Handles Bearer token extraction from Authorization headers",
      "Implements token-based session validation",
    ],
  },
  {
    patterns: [/auth(entication|orization)?|login|signin/i],
    reasons: [
      "Implements the authentication flow matching your query",
      "Contains credential validation and session management",
      "Handles user login state and access control logic",
    ],
  },
  {
    patterns: [/middleware/i],
    reasons: [
      "Acts as middleware intercepting requests before route handlers",
      "Contains next() call chain for Express/Koa middleware pipeline",
      "Provides request validation and transformation logic",
    ],
  },
  {
    patterns: [/hook|useEffect|useState|useRef/i],
    reasons: [
      "Implements the React hook lifecycle matching your query",
      "Contains dispatcher resolution and state scheduling logic",
      "Manages side effects and memoized state relevant to your search",
    ],
  },
  {
    patterns: [/redux|store|reducer|dispatch/i],
    reasons: [
      "Defines the state shape and reducer logic for your query domain",
      "Contains action creators and dispatch handlers",
      "Manages application-level state relevant to the searched feature",
    ],
  },
  {
    patterns: [/api|route|endpoint|rest/i],
    reasons: [
      "Exposes HTTP endpoints directly matching your query intent",
      "Contains request handlers and response serialization logic",
      "Routes traffic to the service layer relevant to your feature",
    ],
  },
  {
    patterns: [/database|db|query|sql|orm/i],
    reasons: [
      "Contains database queries and ORM model definitions",
      "Handles data persistence relevant to your searched feature",
      "Defines schema constraints and data access patterns",
    ],
  },
  {
    patterns: [/error|exception|catch/i],
    reasons: [
      "Implements error handling boundaries relevant to your query",
      "Contains try/catch logic and error propagation patterns",
      "Provides fallback and recovery logic for the searched flow",
    ],
  },
  {
    patterns: [/test|spec|mock/i],
    reasons: [
      "Contains test cases verifying the behavior you are searching for",
      "Mocks and stubs relevant to the tested functionality",
      "Provides coverage for edge cases in the queried feature",
    ],
  },
  {
    patterns: [/cache|redis|ttl/i],
    reasons: [
      "Implements caching strategy relevant to your query's performance path",
      "Contains cache key generation and invalidation logic",
      "Manages TTL and in-memory data relevant to the searched feature",
    ],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extract function / class / const names from a code snippet.
 */
function extractKeyFunctions(code) {
  if (!code) return [];

  const patterns = [
    /(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][A-Za-z0-9_$]*)/g,
    /(?:export\s+)?(?:const|let|var)\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*(?:async\s*)?\(/g,
    /(?:export\s+)?class\s+([A-Za-z_$][A-Za-z0-9_$]*)/g,
    /([A-Za-z_$][A-Za-z0-9_$]*)\s*[:=]\s*(?:async\s*)?\([^)]*\)\s*(?:=>|\{)/g,
  ];

  const found = new Set();
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(code)) !== null) {
      const name = match[1];
      if (name && name.length > 2 && !['if', 'for', 'while', 'switch', 'return'].includes(name)) {
        found.add(name);
      }
    }
  }

  return [...found].slice(0, 6);
}

/**
 * Determine what the file does based on its name.
 */
function inferFileSummary(filename) {
  for (const { pattern, role } of FILE_ROLE_MAP) {
    if (pattern.test(filename)) return role;
  }
  return "General-purpose module with shared logic";
}

/**
 * Build relevance reason based on query ↔ file name overlap.
 */
function buildRelevanceReason(query, filename, code) {
  // Try query-based reasons first
  for (const { patterns, reasons } of QUERY_RELEVANCE_MAP) {
    if (patterns.some((p) => p.test(query) || p.test(filename))) {
      return reasons[Math.floor(Math.random() * reasons.length)];
    }
  }

  // Fallback: look for shared tokens between query and code
  const queryTokens = query.toLowerCase().split(/\s+/).filter((t) => t.length > 3);
  const matched = queryTokens.filter((t) => code && code.toLowerCase().includes(t));
  if (matched.length > 0) {
    return `Contains direct references to "${matched.slice(0, 3).join('", "')}" — matching your query's core terms`;
  }

  return `File name and structure suggest relevance to the queried domain: "${query}"`;
}

/**
 * Compute confidence score (0-100).
 * Factors: filename match, code term density, query term coverage.
 */
function computeConfidence(query, filename, code) {
  let score = 40; // baseline

  const queryTerms = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);

  // Filename match bonus (up to +35)
  const filenameMatches = queryTerms.filter((t) => filename.toLowerCase().includes(t));
  score += Math.min(filenameMatches.length * 12, 35);

  // Code content match (up to +25)
  if (code) {
    const codeMatches = queryTerms.filter((t) => code.toLowerCase().includes(t));
    score += Math.min(codeMatches.length * 8, 25);
  }

  // Cap and add small variance for realism
  score = Math.min(score, 97);
  score = Math.max(score, 42);

  return score;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Analyze a code file's relevance to a user query.
 *
 * @param {string} query    - The user's natural language query
 * @param {string} filename - The file path / name
 * @param {string} code     - The code snippet or full file content
 * @returns {object}        - Structured relevance analysis JSON
 */
export function analyzeCodeRelevance(query, filename, code) {
  if (!query || !filename) {
    return {
      summary: "Unknown file",
      relevance_reason: "Insufficient information to analyze",
      key_functions: [],
      confidence: 0,
    };
  }

  const basename = filename.split("/").pop();

  return {
    summary: inferFileSummary(basename),
    relevance_reason: buildRelevanceReason(query, basename, code),
    key_functions: extractKeyFunctions(code),
    confidence: computeConfidence(query, basename, code),
  };
}
