/**
 * queryParser.js
 * Converts a natural language developer query into a structured search intent JSON.
 * Pure client-side heuristic parser — no external API needed.
 */

// ---------------------------------------------------------------------------
// Knowledge bases
// ---------------------------------------------------------------------------

const CONCEPT_MAP = [
  {
    patterns: [/jwt|json.?web.?token|bearer token/i],
    concepts: ["authentication", "token validation", "authorization"],
    files: ["auth.js", "jwtMiddleware.js", "authController.js", "middleware/auth.js"],
    keywords: ["JWT", "token", "authorization", "bearer"],
  },
  {
    patterns: [/auth(entication|orization)?|login|signin|sign.?in|logout|session/i],
    concepts: ["authentication", "session management", "middleware"],
    files: ["auth.js", "authController.js", "login.js", "session.js", "middleware/auth.js"],
    keywords: ["authentication", "login", "session", "credentials"],
  },
  {
    patterns: [/api.?route|rest.?api|endpoint|http.?handler|router/i],
    concepts: ["REST API", "routing", "HTTP handler", "controller"],
    files: ["routes.js", "router.js", "api.js", "controllers/index.js", "handler.js"],
    keywords: ["route", "endpoint", "HTTP", "REST", "handler"],
  },
  {
    patterns: [/database|db|query|sql|orm|prisma|mongoose|sequelize/i],
    concepts: ["database", "ORM", "query builder", "data access layer"],
    files: ["db.js", "database.js", "models/index.js", "schema.js", "prisma/schema.prisma"],
    keywords: ["database", "query", "model", "schema", "connection"],
  },
  {
    patterns: [/middleware/i],
    concepts: ["middleware", "request pipeline", "interceptor"],
    files: ["middleware.js", "middlewares/index.js", "server.js"],
    keywords: ["middleware", "next()", "request", "response", "pipeline"],
  },
  {
    patterns: [/test(ing)?|spec|unit.?test|e2e|jest|mocha|vitest/i],
    concepts: ["unit testing", "integration testing", "test runner"],
    files: ["*.test.js", "*.spec.js", "__tests__/index.js", "jest.config.js", "vitest.config.js"],
    keywords: ["test", "describe", "it()", "expect", "mock"],
  },
  {
    patterns: [/config|configuration|env|environment.?variable|dotenv/i],
    concepts: ["configuration", "environment variables", "settings"],
    files: ["config.js", ".env", "config/index.js", "settings.js"],
    keywords: ["config", "env", "process.env", "dotenv", "settings"],
  },
  {
    patterns: [/hook|useEffect|useState|useRef|useContext|useMemo|useCallback/i],
    concepts: ["React hooks", "state management", "side effects", "lifecycle"],
    files: ["hooks.js", "useHook.js", "hooks/index.js", "ReactHooks.js"],
    keywords: ["hook", "useState", "useEffect", "dispatcher", "fiber"],
  },
  {
    patterns: [/redux|zustand|mobx|state.?management|store|reducer|action|dispatch/i],
    concepts: ["state management", "store", "reducer", "action creator"],
    files: ["store.js", "reducers/index.js", "actions.js", "slice.js"],
    keywords: ["store", "reducer", "dispatch", "action", "state"],
  },
  {
    patterns: [/websocket|socket\.?io|real.?time|sse|event.?stream/i],
    concepts: ["WebSocket", "real-time communication", "event stream"],
    files: ["socket.js", "ws.js", "websocket.js", "server.js"],
    keywords: ["WebSocket", "socket", "emit", "on()", "real-time"],
  },
  {
    patterns: [/cache|redis|memcached|ttl|invalidat/i],
    concepts: ["caching", "cache invalidation", "TTL", "in-memory store"],
    files: ["cache.js", "redis.js", "cache/index.js"],
    keywords: ["cache", "TTL", "Redis", "get", "set", "invalidate"],
  },
  {
    patterns: [/file.?upload|multer|stream|blob|s3|storage/i],
    concepts: ["file handling", "streaming", "blob storage", "cloud storage"],
    files: ["upload.js", "storage.js", "multer.config.js", "s3.js"],
    keywords: ["upload", "stream", "blob", "multipart", "S3", "storage"],
  },
  {
    patterns: [/error.?handl|exception|try.?catch|throw|catch|boundary/i],
    concepts: ["error handling", "exception boundary", "fallback"],
    files: ["errorHandler.js", "errors.js", "middleware/error.js"],
    keywords: ["error", "exception", "throw", "catch", "boundary", "handler"],
  },
  {
    patterns: [/graphql|resolver|schema|mutation|subscription|query/i],
    concepts: ["GraphQL", "resolver", "schema definition", "query language"],
    files: ["schema.graphql", "resolvers.js", "typeDefs.js", "schema.js"],
    keywords: ["GraphQL", "resolver", "schema", "mutation", "subscription"],
  },
  {
    patterns: [/render|component|jsx|tsx|props|dom|virtual.?dom/i],
    concepts: ["React rendering", "component lifecycle", "virtual DOM", "props"],
    files: ["*.jsx", "*.tsx", "render.js", "ReactDOM.js"],
    keywords: ["render", "component", "props", "JSX", "virtual DOM"],
  },
];

const STOP_WORDS = new Set([
  "the", "a", "an", "is", "in", "it", "of", "for", "on", "and", "or", "to",
  "that", "this", "how", "where", "what", "find", "show", "me", "i", "want",
  "need", "get", "look", "looking", "can", "do", "does", "with", "from",
  "which", "file", "files", "code", "source", "logic", "function", "functions",
  "implement", "implementation", "used", "uses", "works", "working",
]);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function tokenize(query) {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9\s._/-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
}

function matchedConcepts(query) {
  const matched = [];
  for (const entry of CONCEPT_MAP) {
    if (entry.patterns.some((p) => p.test(query))) {
      matched.push(entry);
    }
  }
  return matched;
}

function buildIntent(query, matches) {
  if (matches.length === 0) {
    return `Locate files related to: "${query}"`;
  }
  const primary = matches[0].concepts[0];
  const secondary = matches.length > 1 ? ` and ${matches[1].concepts[0]}` : "";
  return `Locate files handling ${primary}${secondary}`;
}

function buildKeywords(query, tokens, matches) {
  const fromMatches = matches.flatMap((m) => m.keywords);
  const combined = [...new Set([...fromMatches, ...tokens.map((t) => t)])];
  // Capitalize first letter of each
  return combined.slice(0, 8).map((k) => k.charAt(0).toUpperCase() + k.slice(1));
}

function buildFilenames(matches) {
  if (matches.length === 0) return ["index.js", "utils.js", "helpers.js"];
  const raw = matches.flatMap((m) => m.files);
  return [...new Set(raw)].slice(0, 6);
}

function buildCodeConcepts(matches) {
  if (matches.length === 0) return ["utility functions", "module exports", "data processing"];
  const raw = matches.flatMap((m) => m.concepts);
  return [...new Set(raw)].slice(0, 6);
}

function buildSearchQueries(query, matches, tokens) {
  const queries = [];

  // Always include the refined original
  queries.push(query.trim());

  if (matches.length > 0) {
    // Concept-driven query
    queries.push(`${matches[0].concepts[0]} implementation`);
    if (matches[0].files.length > 0) {
      const basename = matches[0].files[0].split("/").pop();
      queries.push(`${basename} function definition`);
    }
    if (matches.length > 1) {
      queries.push(`${matches[0].concepts[0]} ${matches[1].concepts[0]} integration`);
    }
  }

  // Token-based fallback
  if (tokens.length > 0) {
    queries.push(`${tokens.slice(0, 3).join(" ")} handler`);
  }

  return [...new Set(queries)].slice(0, 5);
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Parse a natural language developer query into a structured search intent.
 * @param {string} query - Raw user query string
 * @returns {object} Structured intent JSON
 */
export function parseQuery(query) {
  if (!query || !query.trim()) {
    return {
      intent: "No query provided",
      keywords: [],
      possible_filenames: [],
      code_concepts: [],
      search_queries: [],
    };
  }

  const tokens = tokenize(query);
  const matches = matchedConcepts(query);

  return {
    intent: buildIntent(query, matches),
    keywords: buildKeywords(query, tokens, matches),
    possible_filenames: buildFilenames(matches),
    code_concepts: buildCodeConcepts(matches),
    search_queries: buildSearchQueries(query, matches, tokens),
  };
}
