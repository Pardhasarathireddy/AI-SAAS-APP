const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'test.csv');
fs.writeFileSync(filePath, 'id,name\n1,john\n2,jane');

async function testUpload() {
  const token = ""; // We might get 401 Unauthorized if not logged in, but let's just observe.

  const formData = new FormData();
  formData.append('file', new Blob([fs.readFileSync(filePath)]), 'test.csv');

  try {
    const res = await fetch('http://localhost:5000/api/data-analyst/analyze', {
      method: 'POST',
      body: formData,
      // We will skip token for a second, let's see if it's hitting auth middleware
    });
    
    console.log("Status:", res.status);
    console.log("Response:", await res.text());
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

testUpload();
