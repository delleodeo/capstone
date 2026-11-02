# AgriDrone - Dalandan Leaf Disease Detection

A production-ready MVP web application for citrus disease and pest detection using a server-side Roboflow model and LLM-powered recommendations.

## Features

- **Disease & Pest Detection**: Upload or capture dalandan images for Roboflow object detection with bounding boxes
- **AI-Powered Recommendations**: Structured treatment and prevention guidance 
- **LLM Chatbot**: Ask questions and get personalized agricultural advice
- **Mobile-Friendly**: Responsive design optimized for field use
- **Secure API Integration**: The Roboflow key stays on the Express server; uploads are validated and kept in memory

## Tech Stack

- **Frontend**: Vue 3 + Vite + Pure CSS
- **Backend**: Node.js + Express + MongoDB
- **AI**: Roboflow hosted object detection + Groq-powered agricultural guidance
- **Database**: MongoDB with Mongoose ODM

## Quick Start

### Prerequisites

1. **Node.js** (v18+ recommended)
2. **MongoDB** running locally or connection string
3. **Roboflow API key** with access to the configured model

### Installation

```bash
# Clone and install dependencies
git clone <repository>
cd AgriDrone
npm run install:all

# Set up environment
cd server
cp .env.example .env
# Edit .env and set ROBOFLOW_API_KEY plus your MongoDB/Groq settings
```

### Development

```bash
# Start both server and client in development mode
npm run dev

# Or run individually:
npm run dev:server  # Server at http://localhost:3000
npm run dev:client  # Client at http://localhost:5173
```

### Production

```bash
# Build client
npm run build

# Start server
npm start
```

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/detection` - Analyze one multipart image using Roboflow (`image` field)
- `GET /api/recommendations/:diseaseKey` - Get disease recommendations
- `POST /api/recommendations/seed` - Seed initial recommendations (dev only)
- `POST /api/chat` - Chat with LLM assistant
- `POST /api/llm/recommend` - Generate AI recommendations

## Supported Roboflow Labels

The homepage displays the authoritative 40-label catalog used by the active
pretrained model: 15 diseases and conditions, 18 pests, and 7 other classes.
The catalog is shared by the frontend and backend in `shared/classCatalog.js`.
Citrus Mealybug is not an explicit class and is not reported as supported.
Unknown provider labels remain visible as `unknown` rather than being mapped to
another pest.

## Project Structure

```
AgriDrone/
├── server/          # Express API backend
├── client/          # Vue 3 frontend
└── README.md
```

## Environment Variables

See `server/.env.example` for all required environment variables.

Roboflow settings are server-only:

```env
ROBOFLOW_API_KEY=
ROBOFLOW_MODEL_ID=citrus-disease-detection-yoydc-ygw6l/1
ROBOFLOW_API_URL=https://serverless.roboflow.com/citrus-disease-detection-yoydc-ygw6l/1
ROBOFLOW_CONFIDENCE_THRESHOLD=0
ROBOFLOW_REQUEST_TIMEOUT_MS=20000
ROBOFLOW_MAX_IMAGE_BYTES=3670016
```

The `0` threshold exposes all returned predictions for evaluation. If a
confidence filter is used, it must be validated on representative local
dalandan images and does not guarantee diagnostic accuracy.

The model is hosted by Roboflow and requires internet access, a Roboflow
account/API key with model access, and compliance with any applicable usage
quotas, billing, and rate limits. The model page and its CC BY 4.0 attribution
are available at
https://universe.roboflow.com/myproject-dgrxa/citrus-disease-detection-yoydc-ygw6l.

### Live smoke test

After setting `ROBOFLOW_API_KEY` and starting the server:

```powershell
curl.exe -X POST http://localhost:3000/api/detection -F "image=@C:\path\to\citrus-image.jpg"
```

The repository retains the previous TensorFlow.js/Teachable Machine files for
compatibility, but the active detection flow uses only the hosted Roboflow
provider and does not silently fall back when it fails. Roboflow publisher
metrics are not SinDrone-local accuracy measurements.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Disclaimer

This application provides guidance only. The Roboflow integration uses a third-party pretrained model whose accuracy must be evaluated on representative local dalandan images. Always confirm results with agricultural experts.
