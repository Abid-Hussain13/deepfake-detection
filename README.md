# Deepfake Detector AI

An advanced forensic analysis platform for detecting digital manipulations in images and videos. This system utilizes a multi-layered analytical pipeline to identify inconsistencies in facial topology, lighting models, and temporal continuity.

## Features

- **Multi-Modal Analysis**: Supports both high-resolution images and video sequences.
- **Forensic Pipeline**:
  - **Facial Topology**: Analyzes geometric landmarks and symmetry.
  - **Signal Integrity**: Detects noise discrepancies and compression artifacts.
  - **Lighting Consistency**: Validates specular highlights and environmental lighting.
  - **Temporal Continuity**: Tracks pixel-level consistency across video frames.
- **Interactive Reports**: Detailed diagnostic overlays with localized anomaly detection.
- **History Management**: Secure local storage of previous analysis results.
- **Responsive Interface**: Modern dashboard with dual-theme support (Dark/Light).

## Getting Started

### Prerequisites

- Node.js 18 or higher

### Installation

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables. Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY="your_api_key_here"
   ```

### Running the Application

To start the application in development mode:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Production Build

To create a production build and start the server:
```bash
npm run build
npm run start
```

## Technical Architecture

- **Frontend**: React, TypeScript, Tailwind CSS, Framer Motion.
- **Backend**: Node.js, Express, Google GenAI SDK.
- **Video Processing**: Client-side keyframe extraction using Offscreen Canvas.

## License

This project is licensed under the MIT License.

## project contributors

        MUHAMMAD ABID (2149)
        ABDUL SAMAD (2208)
        MUHAMMAD ABDULLAH (2134)


        
