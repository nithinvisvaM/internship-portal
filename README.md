# Resume Screening System - React + TypeScript UI

A modern web application for domain-specific resume screening using AI-powered analysis with Google's Gemini API.

## Features

✨ **Key Features:**
- 🎯 Select from 4 specialized domains: Full Stack, Networking, IoT, Data Science
- 📤 Drag-and-drop resume upload (supports multiple PDFs)
- 🤖 AI-powered resume analysis using Google Gemini API
- 📊 Detailed analysis with match scores, strengths, and gaps
- 📄 Generate professional DOCX reports
- 📱 Fully responsive design
- ⚡ Real-time processing feedback

## Project Structure

```
chatbot/
├── src/
│   ├── components/
│   │   ├── DomainSelector.tsx      # Domain selection component
│   │   ├── FileUploader.tsx        # File upload component
│   │   ├── AnalysisResults.tsx     # Results display component
│   │   └── LoadingSpinner.tsx      # Loading indicator
│   ├── services/
│   │   └── api.ts                  # API client
│   ├── types/
│   │   └── index.ts                # TypeScript type definitions
│   ├── styles/
│   │   ├── App.css                 # Main styles
│   │   └── index.css               # Global styles
│   ├── main.tsx                    # React entry point
│   └── App.tsx                     # Main application component
├── server.js                       # Express backend API
├── index.html                      # HTML entry point
├── vite.config.ts                  # Vite configuration
├── tsconfig.json                   # TypeScript configuration
├── tsconfig.node.json              # TS config for node
├── package.json                    # Dependencies
└── README.md                       # This file
```

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Environment Variables

Create a `.env` file in the root directory:

```env
GEMINI_API_KEY=YOUR_GOOGLE_GEMINI_API_KEY_HERE
```

Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

## Running the Application

### Development Mode

**Terminal 1 - Start Backend Server:**
```bash
npm run server
```

The API will run on `http://localhost:3001`

**Terminal 2 - Start Frontend Dev Server:**
```bash
npm run dev
```

The React app will run on `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

## Domains & Skills

### 1. Full Stack Development
React, Node.js, REST API, MongoDB, Express, HTML, CSS, JavaScript

### 2. Networking & Infrastructure
Cisco, Routing, Switching, Packet Tracer, Firewall, Load Balancing

### 3. IoT & Embedded Systems
Sensors, Embedded Systems, Arduino, STM32, IoT Monitoring

### 4. Data Science & ML
Python, Machine Learning, Pandas, Data Analysis, Deep Learning

## Usage

1. **Select Domain**: Choose from 4 specialized domains
2. **Upload Resumes**: Drag & drop or click to upload PDF files
3. **Analyze**: Click "Analyze Resumes" to process
4. **Review Results**: View detailed analysis for each resume
5. **Generate Reports**: Create professional DOCX reports

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/domain-skills` | Get domain skills |
| POST | `/api/analyze` | Analyze resumes |
| POST | `/api/generate-report` | Generate DOCX report |

## Component Overview

### DomainSelector
Displays selectable domain cards with required skills for each domain.

**Props:**
- `selectedDomain`: Currently selected domain
- `onDomainSelect`: Callback for domain selection
- `disabled`: Disable selection

### FileUploader
Handles PDF file upload with drag-and-drop support.

**Props:**
- `onFilesSelected`: Callback with selected files
- `disabled`: Disable uploading
- `uploading`: Show uploading state

### AnalysisResults
Displays detailed analysis results for each resume.

**Props:**
- `results`: Array of analysis results
- `onBack`: Callback for back button

### LoadingSpinner
Shows loading state with progress indicator.

**Props:**
- `message`: Loading message
- `progress`: Progress percentage (0-100)

## TypeScript Types

### Main Types in `src/types/index.ts`

```typescript
type Domain = 'fullstack' | 'networking' | 'iot' | 'datasci';

interface AnalysisResult {
  fileName: string;
  domain: Domain;
  matchScore: number;
  selected: boolean;
  keyStrengths: string[];
  missingSkills: string[];
  fullAnalysis: string;
  timestamp: string;
}

interface ScreeningResponse {
  success: boolean;
  message: string;
  results?: AnalysisResult[];
  error?: string;
}
```

## Styling

The application uses modern CSS with:
- Linear gradients for backgrounds
- Smooth transitions and animations
- Responsive grid layouts
- Mobile-first design
- Dark and light mode support

## API Service

The `api.ts` service provides:
- Resume analysis
- Report generation
- Domain skills retrieval
- Error handling with Axios

## Error Handling

- Form validation with user feedback
- Error messages for failed uploads
- API error handling and retries
- User-friendly error display

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Optimizations

- Code splitting with Vite
- CSS module optimization
- Image optimization
- Request debouncing

## Future Enhancements

- [ ] Batch resume processing with progress tracking
- [ ] Resume comparison feature
- [ ] Custom domain creation
- [ ] Integration with ATS systems
- [ ] Resume storage and history
- [ ] Advanced filtering options
- [ ] Export to multiple formats
- [ ] Real-time collaboration

## Troubleshooting

### API Connection Error
- Ensure backend server is running on port 3001
- Check GEMINI_API_KEY environment variable
- Verify API key is valid

### File Upload Issues
- Only PDF files are supported
- Maximum file size depends on server configuration
- Check browser console for detailed errors

### Build Issues
- Clear node_modules and reinstall
- Delete dist folder and rebuild
- Check Node.js version compatibility

## License

MIT License

## Support

For issues and questions, please check:
1. Browser console for error messages
2. Server logs for API errors
3. Network tab in DevTools for request/response details

---

Built with React 18, TypeScript, Vite, and Google Generative AI 🚀
DONT FORGET TO PASTE API KEYS IN .ENV FILES AND SERVER.JS FILES

