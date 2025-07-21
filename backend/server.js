import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));
app.use(express.json());

// Add request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
  next();
});

// Merriam-Webster API configuration
const MW_API_KEY = process.env.MERRIAM_WEBSTER_API_KEY;
const MW_BASE_URL = 'https://www.dictionaryapi.com/api/v3/references/collegiate/json';

// Helper function to extract relevant data from Merriam-Webster response
const extractWordData = (data, word) => {
  if (!data || data.length === 0) {
    return null;
  }

  const entry = data[0];
  
  // Handle case where API returns suggestions instead of definitions
  if (typeof entry === 'string') {
    return {
      word: word,
      meaning: 'Word not found',
      example: '',
      synonyms: data.slice(0, 5) // Return first 5 suggestions
    };
  }

  // Extract main definition
  const shortDef = entry.shortdef || [];
  const meaning = shortDef.length > 0 ? shortDef[0] : 'No definition available';

  // Extract example sentence
  let example = '';
  if (entry.def && entry.def[0] && entry.def[0].sseq) {
    const senseSequence = entry.def[0].sseq;
    for (const sense of senseSequence) {
      if (sense[0] && sense[0][1] && sense[0][1].dt) {
        const defText = sense[0][1].dt;
        for (const item of defText) {
          if (item[0] === 'vis' && item[1] && item[1][0] && item[1][0].t) {
            example = item[1][0].t.replace(/\{[^}]*\}/g, ''); // Remove markup
            break;
          }
        }
        if (example) break;
      }
    }
  }

  // Extract synonyms (if available)
  let synonyms = [];
  if (entry.meta && entry.meta.syns && entry.meta.syns[0]) {
    synonyms = entry.meta.syns[0].slice(0, 5); // Get first 5 synonyms
  }

  return {
    word: entry.meta ? entry.meta.id.split(':')[0] : word,
    meaning: meaning,
    example: example || 'No example available',
    synonyms: synonyms
  };
};

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Dictionary API Server',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      word: '/api/word/:word'
    },
    example: 'GET /api/word/hello'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Dictionary API is running' });
});

app.get('/api/word/:word', async (req, res) => {
  try {
    const { word } = req.params;
    
    if (!word || word.trim() === '') {
      return res.status(400).json({ error: 'Word parameter is required' });
    }

    if (!MW_API_KEY) {
      return res.status(500).json({ error: 'Merriam-Webster API key not configured' });
    }

    const response = await axios.get(`${MW_BASE_URL}/${word.toLowerCase()}`, {
      params: {
        key: MW_API_KEY
      }
    });

    const wordData = extractWordData(response.data, word);
    
    if (!wordData) {
      return res.status(404).json({ error: 'Word not found' });
    }

    res.json(wordData);

  } catch (error) {
    console.error('Error fetching word data:', error.message);
    
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ error: 'Word not found' });
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch word data',
      details: error.message 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Dictionary API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
