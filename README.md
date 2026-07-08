# CodeSage AI

CodeSage AI is an advanced, client-side multi-agent codebase analyzer engineered to streamline repository navigation, code comprehension, and architectural auditing. 
By combining generative AI orchestration with direct workspace file tree mapping, CodeSage AI serves as an interactive technical tutor and context-aware development assistant directly within the browser ecosystem.

🚀 **[Explore the Live Deployment](https://code-sage-qe9xyev2p-codsage.vercel.app/)**

---

## ⚡ Core Engineering Features

* **Real-Time Remote Ingestion:** Dynamic resolution of public GitHub repository URLs to generate absolute virtual maps of project structures natively on the client.
* **Multi-Agent Intent Disambiguation:** Hierarchical processing pipelines that decompose complex codebase inquiries into isolated sub-agent lookups.
* **Token-Optimized Streamlining:** Implements a direct byte-stream extraction protocol via `application/vnd.github.v3.raw` to mitigate large-file parsing thresholds, escape Base64 encoding limits, and manage LLM token overhead efficiently.
* **Contextual UI Workspace:** Dual-panel architecture rendering isolated code views with custom tokenized syntax highlighting adjacent to a responsive AI dialogue terminal.

---

## 🏗️ System Architecture & Data Pipeline

CodeSage AI operates completely serverless, optimizing memory footprints and performance overhead by conducting ingestion stages directly on the user's thread:

1. **Parameter Extraction:** Validates entry URLs via targeted Regular Expressions to split explicit workspace identifiers (`{owner}`, `{repo}`).
2. **Recursive Structural Mapping:** Evaluates target file trees via recursive endpoints, filtering asset formats (binaries, compression archives, system fonts) to establish a clean structural layout.
3. **Optimized Content Delivery:** Bypasses conventional nested JSON packages by utilizing raw character byte transfer, preventing memory execution spikes and character distortion during extraction.
4. **Targeted Ingestion (Map-Reduce):** Rather than dispatching absolute source files to the generative model, the orchestrator cross-references the lightweight tree map, fetching code snippets matching the precise structural intent of the prompt.

---

## 🛠️ Technology Stack

* **Frontend Architecture:** React (Functional State Patterns, Hook Compositions), Vite
* **Styling Framework:** Tailwind CSS (Utility-First Responsive Composability)
* **AI Orchestration Framework:** Gemini API Engine
* **Version Control Interface:** GitHub REST API v3

---

## 🚀 Local Installation & Deployment

Follow these parameters to configure and spin up a localized copy of the environment:

### Prerequisites
* Node.js (v18.x or higher recommended)
* npm or yarn package manager

2. Dependency Resolution
Bash
npm install
3. Environment Configurations
Construct a secure .env file within the base execution directory and populate the required integration keys:

Code snippet
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_GITHUB_TOKEN=your_github_personal_access_token_here
4. Initialize Local Server
Bash
npm run dev
📈 Engineering Roadmap
[ ] Web File System Access API Integration: Enable drag-and-drop ingestion of local offline workspaces directly into the application instance without remote repository dependencies.

[ ] Visual Component Dependency Graphs: Render interactive topology diagrams using Reactflow to visualize import linkages and context inheritance paths between components.

[ ] Semantic Code Embeddings: Implement browser-based vector database integration (e.g., Orama) to handle native semantic querying over source blocks.

🛡️ License
This project is licensed under the terms of the MIT License. See the LICENSE file for extensive details.
