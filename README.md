# Shodh-a-Code: Online Coding Judge Platform

A full-stack online coding judge platform that allows users to solve programming problems, submit solutions, and participate in coding contests. The system safely executes user code inside Docker containers and provides real-time feedback.

## 🚀 Project Overview

Shodh-a-Code is a complete coding platform consisting of:

- **Spring Boot Backend**: A robust REST API with MongoDB database and Docker-based code execution
- **Next.js Frontend**: A modern, responsive UI built with TypeScript, TailwindCSS, and Shadcn UI

The platform provides a safe environment for executing user-submitted code inside Docker containers, evaluating solutions against test cases, and displaying real-time results.

## 📋 Features

- **Problem Solving**: Browse and solve coding problems with various difficulty levels
- **Code Editor**: Write and submit code in Java (extensible to other languages)
- **Live Judge**: Real-time code evaluation with detailed feedback
- **Contests**: Participate in coding contests with leaderboards
- **Secure Execution**: Run user code safely in isolated Docker containers
- **Dark Mode**: Toggle between light and dark themes

## 🛠️ Technology Stack

### Backend
- Java 21
- Spring Boot 3.x
- MongoDB
- Docker (for code execution sandbox)

### Frontend
- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- Shadcn UI components
- Monaco Editor for code editing
- Axios for API calls
- Recharts for data visualization

## 🏗️ Project Structure

```
/
├── backend/                 # Spring Boot backend
│   ├── src/                 # Source code
│   │   ├── main/java/com/shodh/
│   │   │   ├── config/      # Configuration classes
│   │   │   ├── controller/  # REST controllers
│   │   │   ├── model/       # Entity models
│   │   │   ├── repository/  # MongoDB repositories
│   │   │   └── service/     # Business logic
│   │   └── resources/       # Configuration files
│   ├── judge-image/         # Docker image for code execution
│   └── README.md            # Backend documentation
│
├── frontend/                # Next.js frontend
│   ├── src/                 # Source code
│   │   ├── app/             # Next.js app router pages
│   │   ├── components/      # React components
│   │   └── lib/             # Utilities and API services
│   └── README.md            # Frontend documentation
│
└── docker-compose.yml       # Docker Compose configuration
```

## 🚀 Setup Instructions

### Prerequisites
- Java 21 (JDK)
- Node.js 18+
- Docker Desktop (WSL2 backend on Windows recommended)
- MongoDB (local or Atlas)

### Option 1: Using Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/shodh-a-code.git
   cd shodh-a-code
   ```

2. **Build the judge Docker image**
   ```bash
   cd backend
   docker build -t judge-image:latest .
   cd ..
   ```

3. **Create a `.env` file in the root directory**
   ```
   MONGO_PORT=27017
   BACKEND_PORT=8080
   FRONTEND_PORT=3000
   ```

4. **Run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080

### Option 2: Manual Setup

1. **Start MongoDB**
   - **Option A — local MongoDB**:
     ```bash
     docker run -d -p 27017:27017 --name mongodb mongo:6.0
     ```
   - **Option B — MongoDB Atlas**:
     - Create cluster and user, copy connection string
     - Edit `backend/src/main/resources/application.yml` and set your MongoDB URI

2. **Run Backend**
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

3. **Run Frontend**
   ```bash
   cd frontend
   npm install
   # Create .env.local with NEXT_PUBLIC_API_BASE=http://localhost:8080
   npm run dev
   ```

4. **Verify Setup**
   - Check backend health: `curl http://localhost:8080/ping` (should return "pong")
   - Open frontend: http://localhost:3000

## 📊 API Design

### Base URL
`http://localhost:8080`

### Endpoints

#### Health Check
```
GET /ping
Response: "pong"
```

#### Get Contest Details
```
GET /api/contests/{contestId}

Response:
{
  "id": "string",
  "name": "string",
  "problems": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "timeLimitMs": number,
      "memoryLimitMb": number
    }
  ]
}
```

#### Submit Code
```
POST /api/submissions
Content-Type: application/json

Request:
{
  "userId": "string",
  "contestId": "string",
  "problemId": "string",
  "language": "java",
  "code": "public class Main { ... }"
}

Response:
{
  "submissionId": "string"
}
```

#### Get Submission Status
```
GET /api/submissions/{submissionId}

Response:
{
  "id": "string",
  "userId": "string",
  "problemId": "string",
  "status": "PENDING|RUNNING|ACCEPTED|WRONG_ANSWER|TLE|RE|CE|MLE",
  "verdict": "string",
  "runtimeMs": number,
  "memoryUsedMb": number,
  "output": "string",
  "errorLog": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

#### Get Leaderboard
```
GET /api/contests/{contestId}/leaderboard

Response:
[
  {
    "username": "string",
    "solvedCount": number,
    "totalPenalty": number
  }
]
```

### Sample IDs (Seed Data)
Use these for quick testing:
- **contestId**: `68fdb9efd102435f3b037f7a`
- **problemId**: `68fdb9efd102435f3b037f7c`
- **userId**: `68fdb9efd102435f3b037f79`

## 🏛️ Design Choices & Justification

### Backend Architecture

1. **Service-Oriented Design**
   - **Controller Layer**: Handles HTTP requests and responses
   - **Service Layer**: Contains business logic and orchestrates operations
   - **Repository Layer**: Interfaces with MongoDB for data access
   - **Model Layer**: Defines entity models with MongoDB annotations

2. **Judge Service Implementation**
   - We chose to implement a polling-based judge service that periodically checks for pending submissions rather than a queue-based system for simplicity.
   - The judge service uses Docker containers for code execution, providing security through isolation.
   - Each submission runs in its own container with resource limits (memory, CPU) to prevent resource exhaustion.

3. **Data Modeling**
   - MongoDB was chosen for its flexibility in storing complex documents and ease of setup.
   - Document-based models allow for efficient storage of problems with their test cases.
   - We use MongoDB's `@Document` annotation and Spring Data MongoDB repositories for clean data access.

### Frontend Architecture

1. **Next.js App Router**
   - We chose Next.js App Router for its file-based routing system and server components.
   - This architecture provides better performance through server-side rendering and easier route management.

2. **State Management**
   - We used React's built-in hooks (useState, useEffect) for local component state.
   - For API calls, we created a centralized API service using Axios to maintain consistency.
   - This approach was chosen over more complex state management libraries (Redux, Zustand) to keep the codebase simple for this specific use case.

3. **UI Component Strategy**
   - We used Shadcn UI components for a consistent design language across the application.
   - These components are highly customizable with Tailwind CSS and provide accessibility features out of the box.
   - The Monaco Editor was integrated for a professional code editing experience with syntax highlighting and other IDE features.

### Docker Orchestration Challenges

1. **Cross-Platform Compatibility**
   - **Challenge**: Path handling differences between Windows and Unix systems when mounting volumes.
   - **Solution**: We implemented platform-specific path conversion in the JudgeService to ensure Docker volume mounts work correctly on both systems.

2. **Resource Limitations**
   - **Challenge**: Setting appropriate memory and CPU limits for code execution.
   - **Trade-off**: We chose conservative limits (128MB memory, 0.5 CPU) to prevent resource exhaustion, potentially limiting some valid but resource-intensive solutions.

3. **Timeout Handling**
   - **Challenge**: Detecting infinite loops and properly timing out code execution.
   - **Solution**: We implemented a dual timeout mechanism using both the Linux `timeout` command inside the container and Java's process timeout to ensure reliable detection of time limit exceeded errors.

4. **Security vs. Flexibility**
   - **Challenge**: Balancing security with the ability to execute arbitrary code.
   - **Trade-off**: We disabled network access in containers and limited resource usage, but this is still a prototype-level implementation not suitable for production without additional hardening.

## 🔒 Security Considerations

- User code runs in isolated Docker containers with resource limits
- Network access is disabled in containers
- Memory and CPU usage are restricted
- For production, consider stronger isolation (gVisor, VM-based sandboxes), per-submission resource accounting, container pools, authentication, rate limits

## 🧪 Testing

### Backend
```bash
cd backend
./mvnw test
```

### Frontend
```bash
cd frontend
npm test
```

### Manual Testing with Postman
Import the Postman collection from `backend/postman/shodh-a-code-tests.postman_collection.json` to test different submission scenarios (AC, WA, CE, RE, TLE, MLE).

## 🔍 Troubleshooting

### Docker Issues
- **DNS errors**: Add DNS servers in Docker settings: `"dns": ["8.8.8.8", "1.1.1.1"]`
- **Docker Hub blocked**: Use mirror: `FROM mirror.gcr.io/library/openjdk:21-slim`
- **Windows Docker Desktop**: Ensure WSL2 is properly installed

### Submissions Issues
- **Stuck in PENDING**: Check backend logs for exceptions
- **Compilation errors**: Verify Java version compatibility
- **CORS errors**: Ensure WebConfig is properly set up in the backend

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.