# 🧙‍♂️ CodeSage AI

CodeSage AI is an intelligent, multi-agent repository analyzer designed to help developers inspect, search, and understand large codebases effortlessly. By orchestrating generative AI frameworks with live GitHub workspace mapping, CodeSage AI acts as an interactive tutor and engineering copilot right inside your browser.

🌐 **[Live Deployment Link](https://code-sage-qe9xyev2p-codsage.vercel.app/)**

---

## ✨ Features

* **⚡ Live Repository Ingestion:** Input any public GitHub repository URL to dynamically fetch and map its entire tree structure.
* **🤖 Multi-Agent Orchestration:** Utilizes advanced parsing frameworks to split complex engineering questions into focused agent operations.
* **🎨 Intelligent Code Highlighting:** Displays file contents alongside an interactive panel utilizing context-aware code block highlighting for clear codebase readability.
* **🏎️ Token-Optimized Delivery:** Built with highly optimized raw text-byte data request protocols (`application/vnd.github.v3.raw`) to dramatically reduce API payload bottlenecks and eliminate base64 encoding limits.

---

## 🛠️ Tech Stack

* **Frontend Ecosystem:** React, Vite, Tailwind CSS
* **Generative AI Models:** Gemini API Orchestration
* **Version Control & Mapping:** GitHub REST API integration

---

## 🚀 Getting Started Locally

Follow these steps to spin up the project in a local environment:

### 1. Clone the Repository
```bash
git clone [https://github.com/Pooja-CG/CodeSage-AI.git](https://github.com/Pooja-CG/CodeSage-AI.git)
cd CodeSage-AI


### 2. Install Dependencies
Bash
npm install
3. Setup Environment Variables
Create a .env file in the root directory and insert your application tokens safely:

Code snippet
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_GITHUB_TOKEN=your_github_personal_access_token_here
4. Boot Up the Development Server
Bash
npm run dev
🛡️ License
Distributed under the MIT License. See LICENSE for more information.


---

### 🚀 To push this to your repository:
Save the code inside your local `README.md` file in VS Code, then update your repo:

```bash
git add README.md
git commit -m "docs: add comprehensive project README with live deployment url"
git push origin main
