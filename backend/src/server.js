import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.routes.js';

import { removeWatermark } from './utils/image-processor.js';
import multer from 'multer';
import { protect } from './middleware/auth.middleware.js';
import User from './models/user.model.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Multer configuration for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // Increased to 20MB limit
  },
});

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// AI Tool endpoints
app.post('/api/watermark/remove', (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size too large. Max limit is 20MB.' });
      }
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(500).json({ error: `Unknown upload error: ${err.message}` });
    }
    next();
  });
}, protect, async (req, res) => {
  try {
    if (!req.file) {
      console.log('No file received in request');
      return res.status(400).json({ error: 'No image file provided' });
    }

    console.log(`Processing file: ${req.file.originalname}, size: ${req.file.size} bytes`);
    const result = await removeWatermark(req.file.buffer);

    // Save to history
    try {
      await User.findByIdAndUpdate(req.user.id, {
        $push: {
          history: {
            model: 'watermark-remover',
            userInputs: {
              filename: req.file.originalname,
              size: req.file.size,
              url: result.originalUrl
            },
            response: {
              success: true,
              url: result.processedUrl
            },
            createdAt: new Date()
          }
        }
      });
    } catch (historyError) {
      console.error('Failed to save history:', historyError);
    }

    res.set('Content-Type', 'image/png');
    res.send(result.buffer);
    console.log('File processed and sent successfully');
  } catch (error) {
    console.error('Watermark removal error:', error.message);
    res.status(500).json({ error: error.message || 'Failed to process image' });
  }
});

app.post('/api/data-analyst/analyze', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Simulate analysis (since we don't have a real data engine yet)
    const result = {
      summary: {
        totalRows: 1000,
        totalColumns: 5,
        missingValues: 23,
      },
      insights: [
        "Sales show an upward trend over the period",
        "Revenue peaked in March with a 450% increase",
        "Strong correlation between sales and revenue (0.85)",
      ],
    };

    // Save to history
    await User.findByIdAndUpdate(req.user.id, {
      $push: {
        history: {
          model: 'data-analyst',
          userInputs: { filename: req.file.originalname, size: req.file.size },
          response: result,
          createdAt: new Date()
        }
      }
    });

    res.json(result);
  } catch (error) {
    console.error('Data analyst error:', error);
    res.status(500).json({ error: 'Failed to analyze data' });
  }
});

app.post('/api/resume/generate', protect, upload.single('resume'), async (req, res) => {
  try {
    const { jobDescription, skills, summary } = req.body;

    // Simulate generation
    const result = {
      name: "John Doe",
      title: "Senior Software Engineer",
      email: "john.doe@email.com",
      phone: "+1 (555) 123-4567",
      summary: summary || "Experienced software engineer with 5+ years of expertise in full-stack development.",
      skills: (skills || "").split(",").map(s => s.trim()),
      experience: [
        {
          company: "Tech Corp",
          position: "Senior Developer",
          period: "2021 - Present",
          achievements: ["Led team of 5 developers", "Reduced load time by 40%"],
        },
      ],
    };

    // Save to history
    await User.findByIdAndUpdate(req.user.id, {
      $push: {
        history: {
          model: 'resume-builder',
          userInputs: { jobDescription, skills, hasFile: !!req.file },
          response: result,
          createdAt: new Date()
        }
      }
    });

    res.json(result);
  } catch (error) {
    console.error('Resume generation error:', error);
    res.status(500).json({ error: 'Failed to generate resume' });
  }
});

app.post('/api/code-review/analyze', protect, async (req, res) => {
  try {
    const { repoUrl } = req.body;

    const result = {
      issues: [
        { severity: "high", file: "src/server.js", line: 45, message: "Potential security vulnerability in image processing" },
        { severity: "medium", file: "package.json", line: 12, message: "Outdated dependency: lodash" },
        { severity: "low", file: "src/App.tsx", line: 5, message: "Unused import statement" },
      ],
      suggestions: [
        "Add input validation in API endpoints",
        "Implement comprehensive error handling",
        "Remove unused imports and dead code",
      ],
    };

    await User.findByIdAndUpdate(req.user.id, {
      $push: {
        history: {
          model: 'code-reviewer',
          userInputs: { repoUrl },
          response: result,
          createdAt: new Date()
        }
      }
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to analyze code' });
  }
});

app.post('/api/grammar/check', protect, async (req, res) => {
  try {
    const { text } = req.body;

    const result = {
      correctedText: "This is a corrected version of your text with improved grammar and flow.",
      errors: [
        { original: "is", correction: "are", type: "grammar", position: 10 },
      ],
      score: 95,
    };

    await User.findByIdAndUpdate(req.user.id, {
      $push: {
        history: {
          model: 'grammar-checker',
          userInputs: { textLength: text?.length },
          response: result,
          createdAt: new Date()
        }
      }
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to check grammar' });
  }
});

app.post('/api/script/generate', protect, async (req, res) => {
  try {
    const { prompt, language } = req.body;

    const result = `// Generated ${language} script\nconsole.log("Hello from AI!");`;

    await User.findByIdAndUpdate(req.user.id, {
      $push: {
        history: {
          model: 'script-generator',
          userInputs: { prompt, language },
          response: { scriptLength: result.length },
          createdAt: new Date()
        }
      }
    });

    res.json({ script: result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate script' });
  }
});

app.post('/api/scrape/extract', protect, async (req, res) => {
  try {
    const { url, selectors } = req.body;

    const result = {
      title: "Extracted Page Title",
      data: [
        { label: "Price", value: "$99.99" },
      ]
    };

    await User.findByIdAndUpdate(req.user.id, {
      $push: {
        history: {
          model: 'web-scraper',
          userInputs: { url, selectors },
          response: result,
          createdAt: new Date()
        }
      }
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to scrape website' });
  }
});

app.get('/api/auth/history', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('history');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user.history || []);
  } catch (error) {
    console.error('Fetch history error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

app.delete('/api/auth/history/:id', protect, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { history: { _id: req.params.id } } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'History item deleted successfully' });
  } catch (error) {
    console.error('Delete history error:', error);
    res.status(500).json({ error: 'Failed to delete history item' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
