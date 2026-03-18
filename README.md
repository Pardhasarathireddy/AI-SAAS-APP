# AI-SAAS-APP

This project is a full-stack AI SaaS application providing multiple AI-powered tools such as Code Reviewer, Script Generator, Resume Builder, and more.

## Prerequisites & Installation

### 1. NPM Dependencies
This is a monorepo. Install dependencies for all workspaces from the root:
```bash
npm install
```

### 2. Local AI Engine (Ollama)
The Multi-Agent Code Reviewer relies on an open-source local LLM runner called Ollama to run 7 parallel agents cost-effectively.

Start the Ollama Docker container in the root directory:
```bash
docker compose up -d
```

Pull the required AI Model (`qwen2.5-coder:1.5b`) into the container. This model is small enough to run on 2.1GB of RAM:
```bash
docker exec ollama ollama pull qwen2.5-coder:1.5b
```

*(You can verify the download progress by adding the `-it` flag: `docker exec -it ollama ollama pull qwen2.5-coder:1.5b`)*

### 3. Environment Variables
In the `backend/.env` file, ensure you have a GitHub Personal Access Token (PAT) to prevent API rate-limiting during code reviews:
```env
GITHUB_TOKEN=your_github_classic_pat_here
```

## Running the Application

### Start Both Frontend and Backend
```bash
npm run dev
```

### Start Individually
```bash
npm run dev --workspace=backend
npm run dev --workspace=frontend
```

## API Testing (Code Reviewer)
To test the LangChain Multi-Agent Code Reviewer locally, send a POST request with a valid GitHub repository URL:

**Endpoint:** `POST http://localhost:5000/api/code-review/analyze`

**Body (JSON):**
```json
{
  "repoUrl": "https://github.com/Pardhasarathireddy/GroupAX-Pardha"
}
```