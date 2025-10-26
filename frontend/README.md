# Shodh-a-Code Frontend

This is the frontend for the Shodh-a-Code platform, a coding contest system built with Next.js.

## Features

- View coding contests and problems
- Submit solutions in Java
- Real-time submission status updates
- Leaderboard with visualizations
- Dark mode support

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- Shadcn UI components
- Monaco Editor for code editing
- Axios for API calls
- Recharts for data visualization

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend server running at http://localhost:8080

### Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_API_BASE=http://localhost:8080
```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

- `/src/app` - Next.js App Router pages
- `/src/components` - Reusable UI components
  - `/ui` - Shadcn UI components
  - `/layout` - Layout components like Navbar
- `/src/lib` - Utility functions and API services

## API Integration

The frontend connects to the Spring Boot backend running at http://localhost:8080. The API endpoints used are:

- `GET /api/contests/{contestId}` - Get contest details with problems
- `POST /api/submissions` - Submit code for evaluation
- `GET /api/submissions/{submissionId}` - Get submission status
- `GET /api/contests/{contestId}/leaderboard` - Get contest leaderboard

## Features

### Code Editor

The code editor supports:
- Syntax highlighting
- Auto-indentation
- Error highlighting
- Dark mode

### Submission Status

Real-time updates for submission status:
- PENDING
- RUNNING
- ACCEPTED
- WRONG_ANSWER
- TLE (Time Limit Exceeded)
- RE (Runtime Error)
- CE (Compilation Error)
- MLE (Memory Limit Exceeded)

### Leaderboard

The leaderboard shows:
- User rankings
- Number of problems solved
- Total penalty time
- Visual representation of results