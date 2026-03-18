import Groq from "groq-sdk";
import dotenv from 'dotenv';
dotenv.config();

let groq;

export const analyzeDataWithGroq = async (dataSample, columns, userQuery, summary) => {
    if (!groq) {
        groq = new Groq({
            apiKey: process.env.GROQ_API_KEY
        });
    }
    try {
        const prompt = `
You are an expert AI Data Analyst. 
Here is a summary of the dataset:
- Total Rows: ${summary.totalRows}
- Total Columns: ${summary.totalColumns}
- Missing Values: ${summary.missingValues}

Here are the columns: ${columns.join(', ')}

Here is a small sample of the data (up to 50 rows, JSON array):
${JSON.stringify(dataSample)}

${userQuery ? `CRITICAL USER QUERY: "${userQuery}"\nYour analysis, insights, and chart data MUST be specifically tailored to answer this query as a top priority.` : "The user wants a general analysis, including key trends, performance insights, and pattern detection."}

Based on the dataset and the user's query, I need you to respond with ONLY a raw JSON object string (do not use markdown formatting) that matches this EXACT structure:

{
  "insights": [
    "string: 1st highly specific insight based on the dataset (e.g., 'Sales spiked by 24% in Q3...', or 'Humidity negatively correlates with temperature...')",
    "string: 2nd insight...",
    "string: (Include as many insights as necessary to fully answer the query or capture trends...)"
  ],
  "charts": {
    "xAxisKey": "string: The most logical X-axis dimension name based on the dataset (e.g., 'Month', 'Date', 'Department', 'Region')",
    "metrics": [
      "string: First numerical metric (e.g., 'Target', 'Temperature', 'Budget')",
      "string: Second numerical metric (e.g., 'Actual', 'Humidity', 'Spend')"
    ],
    "mockData": [
      {
         "[xAxisKey]": "string: label",
         "[metrics[0]]": "number",
         "[metrics[1]]": "number"
      }
    ],
    "pieData": [
      {
         "name": "string: category name",
         "value": "number"
      }
    ]
  }
}

Important Rules:
1. ONLY return the valid JSON, nothing else. Do not add explanations outside the JSON block.
2. The "mockData" array MUST contain AT LEAST 5 elements representing a trend or comparison. Instead of hardcoding 'sales' and 'revenue', you MUST intelligently pick an \`xAxisKey\` and exactly TWO \`metrics\` strings based on the dataset context and use them exactly as the keys in the "mockData" objects.
3. The "pieData" array MUST contain AT LEAST 3 elements representing a categorical breakdown based on the dataset context.
4. Provide highly actionable, sophisticated, and data-driven insights. If the user provided a query, your insights MUST explicitly answer it.
5. Provide a VARIABLE NUMBER of insights. Do not arbitrarily stop at 2. If the user query is complex, output 4-8 insights.
6. Do not leave the arrays empty. You MUST generate charts.
`;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.1,
            max_tokens: 2000,
        });

        let jsonString = completion.choices[0]?.message?.content || "{}";
        
        // Sometimes LLMs wrap in markdown block despite instructions
        if (jsonString.startsWith('```json')) jsonString = jsonString.replace(/```json\n?/, '');
        if (jsonString.startsWith('```')) jsonString = jsonString.replace(/```\n?/, '');
        if (jsonString.endsWith('```')) jsonString = jsonString.replace(/```$/, '');

        return JSON.parse(jsonString.trim());
    } catch (error) {
        console.error("Groq Analysis Error:", error);
        throw new Error("Failed to process data with Groq AI");
    }
};
