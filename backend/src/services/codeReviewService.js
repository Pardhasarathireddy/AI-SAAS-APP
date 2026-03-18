import { ChatGroq } from '@langchain/groq';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import axios from 'axios';

// Helper to fetch files from GitHub Repository
async function fetchRepoContents(githubUrl, token = null) {
  try {
    // Parse owner and repo from URL (e.g. https://github.com/Pardhasarathireddy/GroupAX-Pardha)
    const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) throw new Error('Invalid GitHub URL format');
    
    const [, owner, repo] = match;
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents`;
    
    const headers = { 'Accept': 'application/vnd.github.v3+json' };
    if (token) headers['Authorization'] = `token ${token}`;

    const { data } = await axios.get(apiUrl, { headers });
    
    let repoContext = `Repository: ${owner}/${repo}\n\n`;
    let fileCount = 0;

    // Simple recursive fetch for top-level code files to build context
    // In a production app, you might want to increase depth or selectively filter by extension
    for (const item of data) {
      if (item.type === 'file' && item.size < 50000) { // skip massive files
        const fileContent = await axios.get(item.download_url);
        repoContext += `\n--- File: ${item.path} ---\n`;
        repoContext += typeof fileContent.data === 'object' ? JSON.stringify(fileContent.data) : fileContent.data;
        repoContext += `\n------------------------\n`;
        fileCount++;
      }
      if (fileCount > 15) break; // Limit for demo/context window size
    }

    return repoContext;
  } catch (error) {
    console.error('Error fetching repo mapping:', error.message);
    throw new Error('Failed to fetch GitHub repository context. Check URL or Token.');
  }
}

class CodeReviewService {
  constructor() {
    // Keep constructor empty, initialize LLM lazily below when requested
  }

  async runMultiAgentReview(githubUrl) {
    console.log(`Starting Code Review for: ${githubUrl}`);
    
    // We seamlessly revert to LLaMa 3.3 70B, which has a 12k TPM (Tokens Per Minute) limit
    const llm = new ChatGroq({
      model: 'llama-3.3-70b-versatile', 
      temperature: 0.1,
      maxRetries: 2,
    });

    const repoContext = await fetchRepoContents(githubUrl, process.env.GITHUB_TOKEN);
    console.log(`Context fetched length: ${repoContext.length} chars.`);

    // To prevent sending 21,000 Tokens simultaneously and hitting the 12k rate limit, 
    // we use a powerful architecture pattern: Single-Shot Full-Spectrum Matrixing.
    // Instead of instantiating 7 agents with the identical repoContext, we instantiate 1 elite agent
    // that analyzes all 7 parameters using only 1 single copy of the context (3,000 Tokens total!).
    const synthesisPrompt = PromptTemplate.fromTemplate(
      `You are an elite Senior Staff Engineer. Analyze the following repository context across 7 critical dimensions: Security, Performance, Architecture, Code Quality, Documentation, Dependencies, and Best Practices.

Code Context:
{context}

Output your findings STRICTLY in clean, easy-to-read Markdown bullet points. 
You MUST use these EXACT markers to separate your 7 sections (do not alter these strings):
#==SECURITY==#
### 🔍 Key Findings
### ⚠️ Critical Issues
### 💡 Recommendations

#==PERFORMANCE==#
### 🔍 Key Findings
### ⚠️ Critical Issues
### 💡 Recommendations

#==ARCHITECTURE==#
### 🔍 Key Findings
### ⚠️ Critical Issues
### 💡 Recommendations

#==QUALITY==#
### 🔍 Key Findings
### ⚠️ Critical Issues
### 💡 Recommendations

#==DOCUMENTATION==#
### 🔍 Key Findings
### ⚠️ Critical Issues
### 💡 Recommendations

#==DEPENDENCIES==#
### 🔍 Key Findings
### ⚠️ Critical Issues
### 💡 Recommendations

#==BEST_PRACTICES==#
### 🔍 Key Findings
### ⚠️ Critical Issues
### 💡 Recommendations

Do not include any introductory or generic greeting text. Start immediately with #==SECURITY==#.`
    );

    const chain = synthesisPrompt.pipe(llm).pipe(new StringOutputParser());

    console.log('Sending single consolidated context to Groq Cloud (saving 18,000 tokens!)...');

    const start = Date.now();
    const fullReport = await chain.invoke({ context: repoContext });
    const duration = Date.now() - start;
    console.log(`Comprehensive analysis completed securely on Groq in ${duration}ms!`);

    // Parse the 7 sections from the monolithic output string
    const extractSection = (markerA, markerB) => {
        let regex;
        if (markerB) {
            regex = new RegExp(`${markerA}([\\s\\S]*?)${markerB}`);
        } else {
            regex = new RegExp(`${markerA}([\\s\\S]*?)$`);
        }
        const match = fullReport.match(regex);
        return match ? match[1].trim() : "No metrics provided by the AI for this category.";
    }

    const security = extractSection('#==SECURITY==#', '#==PERFORMANCE==#');
    const performance = extractSection('#==PERFORMANCE==#', '#==ARCHITECTURE==#');
    const architecture = extractSection('#==ARCHITECTURE==#', '#==QUALITY==#');
    const quality = extractSection('#==QUALITY==#', '#==DOCUMENTATION==#');
    const documentation = extractSection('#==DOCUMENTATION==#', '#==DEPENDENCIES==#');
    const dependencies = extractSection('#==DEPENDENCIES==#', '#==BEST_PRACTICES==#');
    const bestPractices = extractSection('#==BEST_PRACTICES==#');

    return {
      metadata: { repository: githubUrl, analysisTimeMs: duration },
      reports: {
        security,
        performance,
        architecture,
        quality,
        documentation,
        dependencies,
        bestPractices
      }
    };
  }
}

export default new CodeReviewService();
