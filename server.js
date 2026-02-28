import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import pdf from 'pdf-parse';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import cors from 'cors';
import { fileURLToPath } from 'url';

// __dirname equivalent in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
});

// Domain Skills
const domainSkills = {
  fullstack: 'React, Node.js, REST API, MongoDB, Express, HTML, CSS, JavaScript',
  networking: 'Cisco, Routing, Switching, Packet Tracer, Firewall, Load Balancing',
  iot: 'Sensors, Embedded Systems, Arduino, STM32, IoT Monitoring',
  datasci: 'Python, Machine Learning, Pandas, Data Analysis, Deep Learning',
};

// Helper function to parse analysis response
function parseAnalysisResponse(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  
  let matchScore = 0;
  let selected = false;
  const keyStrengths = [];
  const missingSkills = [];

  let section = '';

  for (const line of lines) {
    if (line.toLowerCase().includes('match score')) {
      const scoreMatch = line.match(/(\d+)/);
      if (scoreMatch) {
        matchScore = parseInt(scoreMatch[1]);
      }
    } else if (line.toLowerCase().includes('selected')) {
      selected = line.toLowerCase().includes('yes');
    } else if (line.toLowerCase().includes('key strengths')) {
      section = 'strengths';
    } else if (line.toLowerCase().includes('missing skills')) {
      section = 'missing';
    } else if (line.startsWith('-') || line.startsWith('•')) {
      const item = line.replace(/^[-•]\s*/, '').trim();
      if (section === 'strengths' && item) {
        keyStrengths.push(item);
      } else if (section === 'missing' && item) {
        missingSkills.push(item);
      }
    }
  }

  return {
    matchScore: matchScore || 50,
    selected,
    keyStrengths: keyStrengths.length > 0 ? keyStrengths : ['Technical background', 'Professional experience'],
    missingSkills: missingSkills.length > 0 ? missingSkills : ['Advanced specialization', 'Specific tools'],
  };
}

// Routes

// Get domain skills
app.get('/api/domain-skills', (req, res) => {
  res.json(domainSkills);
});

// Analyze resumes
app.post('/api/analyze', upload.array('files'), async (req, res) => {
  try {
    const { domain } = req.body;

    if (!domain || !domainSkills[domain]) {
      return res.status(400).json({
        success: false,
        error: 'Invalid domain selected',
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded',
      });
    }

    const results = [];

    for (const file of req.files) {
      try {
        const dataBuffer = fs.readFileSync(file.path);
        const data = await pdf(dataBuffer);
        const resumeText = data.text;

        const prompt = `
You are an HR Resume Screening System.

Screen the resume for ${domain} domain.

Required Skills for ${domain}:
${domainSkills[domain]}

Return ONLY this short format:

Match Score: XX/100

Selected: YES or NO

Key Strengths:
- ...

Missing Skills:
- ...

Resume:
${resumeText}
`;

        const result = await model.generateContent(prompt);
        const analysisText = await result.response.text();
        const parsed = parseAnalysisResponse(analysisText);

        results.push({
          fileName: file.originalname,
          domain,
          matchScore: parsed.matchScore,
          selected: parsed.selected,
          keyStrengths: parsed.keyStrengths,
          missingSkills: parsed.missingSkills,
          fullAnalysis: analysisText,
          timestamp: new Date().toISOString(),
        });

        // Clean up uploaded file
        fs.unlinkSync(file.path);
      } catch (error) {
        console.error(`Error processing file ${file.originalname}:`, error);
        results.push({
          fileName: file.originalname,
          domain,
          matchScore: 0,
          selected: false,
          keyStrengths: [],
          missingSkills: ['Processing error'],
          fullAnalysis: `Error: ${error.message}`,
          timestamp: new Date().toISOString(),
        });
      }
    }

    res.json({
      success: true,
      message: `Analyzed ${results.length} resume(s)`,
      results,
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Analysis failed',
    });
  }
});

// Generate DOCX report
app.post('/api/generate-report', express.json(), async (req, res) => {
  try {
    const { fileName, matchScore, selected, keyStrengths, missingSkills, fullAnalysis, domain } = req.body;

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Domain Resume Screening Report',
                  bold: true,
                  size: 32,
                }),
              ],
            }),
            new Paragraph(''),
            new Paragraph({
              children: [
                new TextRun({
                  text: `File: ${fileName}`,
                  bold: true,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Domain: ${domain}`,
                  bold: true,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Match Score: ${matchScore}/100`,
                  bold: true,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Selected: ${selected ? 'YES' : 'NO'}`,
                  bold: true,
                }),
              ],
            }),
            new Paragraph(''),
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Key Strengths',
                  bold: true,
                }),
              ],
            }),
            ...keyStrengths.map(
              (strength) =>
                new Paragraph({
                  text: `• ${strength}`,
                  style: 'List Bullet',
                })
            ),
            new Paragraph(''),
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Missing Skills',
                  bold: true,
                }),
              ],
            }),
            ...missingSkills.map(
              (skill) =>
                new Paragraph({
                  text: `• ${skill}`,
                  style: 'List Bullet',
                })
            ),
            new Paragraph(''),
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Full Analysis',
                  bold: true,
                }),
              ],
            }),
            new Paragraph(fullAnalysis),
            new Paragraph(''),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Generated: ${new Date().toLocaleString()}`,
                  italics: true,
                  size: 18,
                }),
              ],
            }),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    const reportsDir = path.join(__dirname, 'reports');
    
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const reportName = `Report_${Date.now()}_${fileName.replace('.pdf', '')}.docx`;
    const reportPath = path.join(reportsDir, reportName);

    fs.writeFileSync(reportPath, buffer);

    res.json({
      success: true,
      message: 'Report generated successfully',
      filePath: reportPath,
    });
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Report generation failed',
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve frontend index if present (useful when serving built app)
app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }

  // If no index.html, return a helpful message
  res.send('Resume Screening API is running. Use /api endpoints or start the frontend dev server.');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Resume Screening API running on http://localhost:${PORT}`);
  console.log(`📝 API endpoints:`);
  console.log(`   POST /api/analyze - Analyze resumes`);
  console.log(`   POST /api/generate-report - Generate DOCX report`);
  console.log(`   GET /api/domain-skills - Get domain skills`);
  console.log(`   GET /api/health - Health check`);
});

