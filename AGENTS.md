# AI-SAAS-APP – Project Instructions

## Project Overview

This project is a full-stack AI SaaS application organized as a monorepo using **npm workspaces**.

The platform provides multiple AI-powered tools accessible from a web interface.
The repository contains two main applications:

* **frontend** → Client application (React / Next.js)
* **backend** → Node.js REST API server built with Express

Both apps live in the same repository and are managed using npm workspaces.

---

# Repository Structure

```
ai-saas-app/
│
├── frontend/                # Frontend application
│   └── package.json
│
├── backend/                 # Backend API
│   └── src/
│       ├── controllers/
│       ├── services/
│       ├── repositories/
│       ├── models/
│       ├── routes/
│       └── server.js
│
├── package.json             # Root workspace configuration
└── .github/
    └── copilot-instructions.md
```

---

# Backend Architecture

The backend follows a **layered architecture**:

Route → Controller → Service → Repository → Model

### Controllers

Handle HTTP requests and responses.

### Services

Contain business logic and AI model interaction.

### Repositories

Handle database access and persistence.

### Models

Define database schemas and structures.

---

# Development Commands

Install dependencies:

```
npm install
```

Run both applications:

```
npm run dev
```

Run backend only:

```
npm run dev --workspace=backend
```

Run frontend only:

```
npm run dev --workspace=frontend
```

---

# Coding Guidelines

* Use **ES Modules (import/export)**
* Keep controllers thin
* Place business logic inside services
* Database queries should live in repositories
* Follow REST API design patterns
* Use clear and descriptive file names

---

# Backend Stack

* Node.js
* Express
* dotenv
* nodemon
* REST API architecture

---

# AI Modules

The platform provides several AI-powered tools. Each tool accepts specific user inputs and generates AI-driven outputs.

---

## Code Reviewer

**Description:**
Analyzes a GitHub repository and provides feedback about code quality, bugs, and improvements.

**User Input**

* GitHub repository URL

**Output**

* Code quality report
* Security issues
* Suggested improvements

---

## Script Generator

**Description:**
Generates automation scripts based on a user description.

**User Input**

* Brief description of the script

Example:

```
Create a script that renames all files in a folder to lowercase.
```

**Output**

* Generated script (Python, Bash, or Node.js)

---

## Grammar Checker

**Description:**
Improves grammar and readability of human-written text.

**User Input**

* Human-written paragraph

**Output**

* Grammar corrected text
* Improved sentence structure

---

## AI Data Analyst

**Description:**
Analyzes datasets and answers analytical questions.

**User Input**

* CSV file
* TSV file
* Excel file
* Analysis query

Example query:

```
Identify monthly sales trends and top performing products.
```

**Output**

* Data insights
* Summary of patterns
* Analytical results

---

## Watermark Remover

**Description:**
Removes watermarks from images using AI image processing.

**User Input**

* Watermarked image

**Output**

* Image with watermark removed

---

## AI Resume Builder

**Description:**
Generates or improves resumes tailored to job descriptions.

**User Input**

* Job description
* User skills
* Professional summary
* Previous resume (optional)

**Output**

* Optimized resume
* ATS-friendly formatting
* Highlighted skills

---

## AI Web Scraper

**Description:**
Extracts structured data from websites.

**User Input**

* Website URL

**Output**

* Extracted data
* Structured JSON or table format

---

# Goal of the Platform

The goal of this project is to provide a **single AI SaaS platform** that allows users to access multiple AI tools such as:

* code analysis
* content generation
* data analysis
* document processing
* automation tools

All tools are accessible through a unified frontend and backend architecture.
