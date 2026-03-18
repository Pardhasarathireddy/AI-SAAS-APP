import { analyzeDataWithGroq } from './src/services/groq.service.js';

const dummyData = [
  { Date: '2023-01-01', Sales: 100, Revenue: 150, Category: 'Tech' },
  { Date: '2023-02-01', Sales: 120, Revenue: 180, Category: 'Home' },
  { Date: '2023-03-01', Sales: 90, Revenue: 130, Category: 'Tech' }
];

async function run() {
  try {
    const result = await analyzeDataWithGroq(
      dummyData, 
      Object.keys(dummyData[0]), 
      "Compare Tech vs Home category sales trends", 
      { totalRows: 3, totalColumns: 4, missingValues: 0 }
    );
    console.log("SUCCESS:");
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("FAILED:", err);
  }
}

run();
