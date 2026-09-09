# AI-SAAS-APP

AI-SAAS-APP is a full-stack AI SaaS application that provides authenticated access to a collection of AI-oriented productivity and development tools. It includes a React dashboard, an Express REST API, MongoDB-backed user accounts and history, and integrations with services including Groq, GitHub, LangChain, and Pixelbin.

## Overview

The application provides a dashboard-style interface for:

- Reviewing GitHub repositories
- Generating scripts
- Checking grammar
- Analyzing CSV and Excel files
- Removing image watermarks
- Generating resumes
- Extracting web data
- Managing user profiles and passwords
- Viewing and deleting per-user interaction history

Some tools are currently demonstrations or simulated implementations. Resume generation, grammar checking, script generation, and web extraction currently return fixed or example-style responses.

## Features

- JWT-based authentication
- Password hashing with bcrypt
- Password peppering using `SECRET_KEY`
- Protected frontend routes
- User registration and login
- Profile updates
- Password changes
- Per-user tool history
- History retrieval and deletion
- GitHub repository code analysis
- Groq-powered code review and data analysis
- CSV and Excel file parsing
- Missing-value counting for uploaded datasets
- AI-generated data insights and chart configuration
- Image uploads with Pixelbin watermark removal
- Dark-themed dashboard interface
- Responsive sidebar navigation
- Theme provider
- Local Ollama Docker service configuration

### Code Review Categories

The code review workflow covers:

- Security
- Performance
- Architecture
- Quality
- Documentation
- Dependencies
- Best practices

## Tech Stack

### Frontend

- React `18.3.1`
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Radix UI
- React Hook Form
- Zod
- Recharts
- React Markdown
- Lucide React
- Sonner
- Axios
- ESLint

### Backend

- Node.js
- Express
- Mongoose
- MongoDB
- JSON Web Tokens
- bcrypt
- Multer
- CORS
- dotenv
- Axios
- `csv-parser`
- `xlsx`
- `node-fetch`
- Groq SDK
- LangChain Core
- LangChain Groq
- LangChain Ollama
- Pixelbin Admin SDK
- Nodemon

### Infrastructure

- npm workspaces
- Docker Compose
- Ollama Docker image

## Project Structure

```text
.
├── package.json
├── README.md
├── docker-compose.yml
├── frontend/
│   ├── package.json
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   ├── eslint.config.js
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── main.tsx
│       ├── app/
│       │   ├── App.tsx
│       │   ├── routes.tsx
│       │   ├── components/
│       │   └── pages/
│       ├── context/
│       └── styles/
└── backend/
    ├── package.json
    ├── .env.example
    ├── test-groq.js
    ├── test-login.js
    └── src/
        ├── server.js
        ├── controllers/
        ├── middleware/
        ├── models/
        ├── repositories/
        ├── routes/
        ├── services/
        └── utils/
```

### Key Frontend Files

- `frontend/src/main.tsx` — React application entry point
- `frontend/src/app/App.tsx` — application providers and router
- `frontend/src/app/routes.tsx` — route definitions
- `frontend/src/app/components/main-layout.tsx` — authenticated application layout
- `frontend/src/app/components/app-sidebar.tsx` — navigation and history sidebar
- `frontend/src/app/components/auth/ProtectedRoute.tsx` — authentication guard
- `frontend/src/styles/` — global styles, Tailwind configuration, themes, and fonts

### Key Backend Files

- `backend/src/server.js` — Express server, database connection, route registration, and tool endpoints
- `backend/src/routes/auth.routes.js` — authentication routes
- `backend/src/controllers/auth.controller.js` — authentication request handlers
- `backend/src/services/auth.service.js` — registration, login, profile, and password logic
- `backend/src/middleware/auth.middleware.js` — JWT authentication middleware
- `backend/src/models/user.model.js` — Mongoose user schema
- `backend/src/repositories/user.repository.js` — user persistence abstraction
- `backend/src/services/codeReviewService.js` — GitHub repository retrieval and Groq/LangChain code review
- `backend/src/services/groq.service.js` — Groq-based data analysis
- `backend/src/utils/image-processor.js` — Pixelbin image processing

## Prerequisites

The repository requires:

- Node.js and npm
- MongoDB
- Docker and Docker Compose if using the local Ollama service
- Credentials for the external services used by the configured tools

## Installation

Install dependencies from the repository root:

```bash
npm install
```

The repository also provides an npm workspace installation command:

```bash
npm run install-all
```

This runs:

```bash
npm install --workspaces
```

Create the backend environment file from the provided example:

```text
backend/.env.example
```

The backend expects environment configuration in `backend/.env`.

## Environment Variables

The available backend variables are:

| Variable | Description |
|---|---|
| `PORT` | Backend HTTP port. Defaults to `5000` when unset. |
| `MONGODB_URI` | MongoDB connection string. |
| `SECRET_KEY` | JWT signing key and password pepper. |
| `PIXELBIN_CLOUD_NAME` | Pixelbin cloud name. |
| `PIXELBIN_API_TOKEN` | Pixelbin API token. |
| `GITHUB_TOKEN` | Optional GitHub API token for repository access. |
| `GROQ_API_KEY` | Groq API key. |

## Running the Application

### Run Frontend and Backend Together

From the repository root:

```bash
npm run dev
```

This runs both workspace development commands using `concurrently`.

### Run the Frontend Only

```bash
npm run dev --workspace=frontend
```

Alternatively:

```bash
cd frontend
npm run dev
```

### Run the Backend Only

```bash
npm run dev --workspace=backend
```

Alternatively:

```bash
cd backend
npm run dev
```

### Start the Backend Without Nodemon

```bash
cd backend
npm start
```

The backend listens on port `5000` by default unless `PORT` is configured.

## Ollama

The repository includes an Ollama Docker Compose configuration. Start the local Ollama container with:

```bash
docker compose up -d
```

Pull the configured model:

```bash
docker exec ollama ollama pull qwen2.5-coder:1.5b
```

Ollama is exposed on port `11434` and stores model data in the `ollama_data` volume.

The supplied code-review implementation currently instantiates `ChatGroq` and does not visibly call the Ollama integration.

## Build and Lint

### Build the Frontend

```bash
npm run build --workspace=frontend
```

The frontend build runs TypeScript compilation followed by the Vite production build.

### Preview the Frontend Build

```bash
npm run preview
```

### Lint the Frontend

```bash
npm run lint --workspace=frontend
```

### Root Build

```bash
npm run build
```

The root build currently attempts to build both workspaces. The backend package does not define a `build` script, so the root build is expected to fail during the backend build step unless an external script is added.

## Usage

After starting the application, the frontend provides routes for:

- Dashboard
- Code Reviewer
- Script Generator
- Grammar Checker
- Data Analyst
- Watermark Remover
- Resume Builder
- Web Scraper
- Settings
- Login
- Registration
- History
- Not Found

Users must authenticate before accessing protected tools and account functionality.

## API

The backend normally runs on:

```text
http://localhost:5000
```

### Health Check

```http
GET /api/health
```

Returns the server status and timestamp.

### Authentication

#### Register

```http
POST /api/auth/register
```

Request fields:

```json
{
  "firstName": "First",
  "lastName": "Last",
  "email": "user@example.com",
  "password": "password"
}
```

#### Login

```http
POST /api/auth/login
```

Request fields:

```json
{
  "email": "user@example.com",
  "password": "password"
}
```

Successful login returns a JWT token.

Protected routes require:

```http
Authorization: Bearer <token>
```

### Account and History

```http
PUT /api/auth/profile
PUT /api/auth/change-password
GET /api/auth/history
DELETE /api/auth/history/:id
```

Password changes expect:

```json
{
  "currentPassword": "current-password",
  "newPassword": "new-password"
}
```

### AI and Tool Routes

#### Remove an Image Watermark

```http
POST /api/watermark/remove
```

- Requires multipart form data
- File field: `image`
- Maximum file size: 20 MB
- Returns processed image data with an `image/png` content type

#### Analyze CSV or Excel Data

```http
POST /api/data-analyst/analyze
```

- Requires multipart form data
- File field: `file`
- Optional field: `query`
- Supports CSV and Excel files

The response includes a dataset summary, insights, and chart data.

#### Generate a Resume

```http
POST /api/resume/generate
```

Supported form fields include:

- `jobDescription`
- `skills`
- `summary`
- Optional file field: `resume`

The current implementation returns a hardcoded example-style resume structure.

#### Analyze a GitHub Repository

```http
POST /api/code-review/analyze
```

Request body:

```json
{
  "repoUrl": "https://github.com/owner/repository"
}
```

The backend retrieves repository contents using the GitHub Contents API and sends them to the Groq/LangChain review service.

#### Check Grammar

```http
POST /api/grammar/check
```

Request body field:

```json
{
  "text": "Text to check"
}
```

The current implementation returns a fixed example response.

#### Generate a Script

```http
POST /api/script/generate
```

Request body:

```json
{
  "prompt": "Create a script",
  "language": "JavaScript"
}
```

The current implementation returns a simple generated string template.

#### Extract Web Data

```http
POST /api/scrape/extract
```

Request body fields:

- `url`
- `selectors`

The current implementation returns fixed example data and does not visibly perform a real scrape.

## Data Storage

MongoDB is accessed through Mongoose using `MONGODB_URI`.

The primary model is `User`. User documents contain:

- First name
- Last name
- Email
- Hashed password
- Embedded tool history
- Creation and update timestamps

Each history item stores:

- Tool or model identifier
- User inputs
- Tool response
- Creation date

## External Integrations

### GitHub

The code review service uses the GitHub Contents API:

```text
https://api.github.com/repos/{owner}/{repo}/contents
```

It retrieves repository contents and downloads individual files using their `download_url` values.

### Groq

Groq is used for:

- Code review through LangChain's `ChatGroq`
- CSV and Excel data analysis through the Groq SDK

The configured model is:

```text
llama-3.3-70b-versatile
```

### Pixelbin

Pixelbin is used to:

1. Upload an image
2. Apply the `wm.remove` transformation
3. Download the processed image

## Testing

No integrated test framework or `test` script is configured.

Two standalone test utilities are available:

```bash
node backend/test-login.js
```

Tests registration and login against a running backend.

```bash
node backend/test-groq.js
```

Calls the Groq data-analysis service using sample data.

## Known Issues and Limitations

- Resume generation currently returns fixed example data.
- Grammar checking currently returns a fixed example response.
- Script generation currently returns a simple template string.
- Web extraction currently returns fixed example data and does not visibly perform a real scrape.
- The supplied code-review implementation uses one consolidated Groq request rather than the seven parallel Ollama agents described by the repository documentation.
- `@langchain/ollama` is installed, but no supplied source file visibly imports or uses it.
- The root `build` script references a backend `build` script that does not exist.
- No automated frontend or backend test framework is configured.
- MongoDB configuration is not included in the repository.
- CORS is enabled globally without visible origin restrictions.
- At least one frontend request uses a hardcoded backend URL:
  `http://localhost:5000/api/auth/history`
- Complete frontend page implementations were not available for full verification, so some UI behavior and request handling may require further review.
