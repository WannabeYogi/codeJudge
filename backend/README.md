# Shodh-a-Code

A prototype coding-contest backend and live code judge.
Submissions are executed **safely inside Docker containers**, judged against testcases stored in MongoDB, and results are persisted.

---

## Table of contents

* [Tech stack](#tech-stack)
* [What’s included](#whats-included)
* [Prerequisites](#prerequisites)
* [Quick start (local)](#quick-start-local)

  * [1) Build the judge Docker image](#1-build-the-judge-docker-image)
  * [2) Start MongoDB](#2-start-mongodb)
  * [3) Run backend](#3-run-backend)
  * [4) (Optional) Start frontend demo](#4-optional-start-frontend-demo)
* [API (important endpoints)](#api-important-endpoints)
* [Sample IDs (seed data)](#sample-ids-seed-data)
* [Testing — quick ways](#testing--quick-ways)
* [What the judge does (short)](#what-the-judge-does-short)
* [Troubleshooting (common issues)](#troubleshooting-common-issues)
* [Security notes & limitations](#security-notes--limitations)
* [Deliverables in this repo](#deliverables-in-this-repo)
* [Next steps / improvements](#next-steps--improvements)
* [Contact & final notes](#contact--final-notes)

---

## Tech stack

* **Backend:** Spring Boot 3 (Java 21)
* **Database:** MongoDB
* **Sandbox:** Docker (`judge-image`)
* **Frontend:** Minimal Next.js + TypeScript (optional demo)
* **Tools:** Maven, Docker Desktop, Postman

---

## What’s included

* `backend/` — Spring Boot project with:

  * Models: `Contest`, `Problem`, `TestCase`, `Submission`, `User`
  * REST endpoints: contests, submissions, leaderboard
  * `JudgeService` — compiles & runs code in Docker, compares output, updates verdicts
  * `DataInitializer` — creates 1 sample contest, 3 problems, sample user and testcases on startup
* `postman/` — Postman collection with AC/WA/CE/RE/TLE/MLE tests
* `docker-compose.yml` (optional) — quick local compose for Mongo + backend (if present)
* `frontend/` — minimal Next.js demo (optional)

---

## Prerequisites (local)

* Java 21 (JDK)
* Maven
* Docker Desktop (WSL2 backend on Windows recommended)
* MongoDB (local or Atlas)
* Node.js & npm (if you run the frontend demo)

> **Security:** Do not commit credentials. If you use Atlas, set the URI in `application.yml` or via environment variables.

---

## Quick start — local (recommended)

> All commands assume default ports and that you run from the repo root or the `backend` folder as noted.

### 1) Build the judge Docker image

From backend project root (where `Dockerfile` is):

```bash
cd D:/codeJudge/codeJudge   # adjust path to your backend
docker build -t judge-image:latest .
```

If your network blocks Docker Hub, update the `Dockerfile` base line:

```dockerfile
FROM mirror.gcr.io/library/openjdk:21-slim
```

then rebuild:

```bash
docker build -t judge-image:latest .
```

(Optionally export the image for reviewers)

```bash
docker save judge-image:latest -o judge-image.tar
```

---

### 2) Start MongoDB

**Option A — local Mongo (docker-compose)**:

```bash
# If docker-compose.yml includes a mongo service
docker compose up -d mongo
```

**Option B — MongoDB Atlas**:

* Create cluster and user, copy connection string.
* Edit `src/main/resources/application.yml` and set:

```yaml
spring:
  data:
    mongodb:
      uri: mongodb+srv://<user>:<password>@cluster0.xxx.mongodb.net/shodhdb
```

> Use environment variables or a local override for real credentials.

---

### 3) Run backend

```bash
cd D:/codeJudge/codeJudge
./mvnw spring-boot:run
```

Wait for logs similar to:

```
Started ShodhCodeApplication
Data initialization completed successfully!
```

Check health:

```bash
curl http://localhost:8080/ping
# expected: pong
```

---

### 4) (Optional) Start frontend demo

```bash
cd frontend
npm install
npm run dev
# open http://localhost:3000
```

---

## API (important endpoints)

> Base: `http://localhost:8080`

* **Health**

  ```
  GET /ping
  ```

* **Get contest details**

  ```
  GET /api/contests/{contestId}
  ```

* **Submit code**

  ```
  POST /api/submissions
  Content-Type: application/json

  {
    "userId": "<userId>",
    "contestId": "<contestId>",
    "problemId": "<problemId>",
    "language": "java",
    "code": "public class Main { ... }"
  }
  ```

  Response:

  ```json
  { "submissionId": "<id>" }
  ```

* **Get submission status/result**

  ```
  GET /api/submissions/{submissionId}
  ```

* **Get leaderboard**

  ```
  GET /api/contests/{contestId}/leaderboard
  ```

---

## Sample IDs (seed data)

Use these for quick testing (if your `DataInitializer` produced the same IDs):

* **contestId**: `68fdb9efd102435f3b037f7a`
* **problemId**: `68fdb9efd102435f3b037f7c`
* **userId**: `68fdb9efd102435f3b037f79`

(If different, check backend logs at startup to read the created IDs.)

---

## Testing — quick ways

### Postman

* Import: `postman/shodh-a-code-tests.postman_collection.json`
* Run AC / WA / CE / RE / TLE / MLE requests and poll `/api/submissions/{id}`.

### curl (example)

Submit (AC):

```bash
curl -s -X POST http://localhost:8080/api/submissions \
  -H "Content-Type: application/json" \
  -d '{"userId":"68fdb9efd102435f3b037f79","contestId":"68fdb9efd102435f3b037f7a","problemId":"68fdb9efd102435f3b037f7c","language":"java","code":"public class Main { public static void main(String[] args){java.util.Scanner sc=new java.util.Scanner(System.in);int a=sc.nextInt();int b=sc.nextInt();System.out.println(a+b);} }"}'
```

Poll:

```bash
curl http://localhost:8080/api/submissions/<submissionId>
```

### Automated PowerShell sweep

Run: `run_all_verdict_tests.ps1` (included) to auto-submit and poll AC/WA/CE/RE/TLE/MLE.

---

## What the judge does (short)

For each submission:

1. `JudgeService` picks `PENDING` submissions and sets status to `RUNNING`.
2. Writes `Main.java` and `input.txt` into a temp folder.
3. Mounts the folder into the container as `/sandbox` and executes:

   * `javac Main.java`
   * `cat input.txt | java -cp /sandbox Main`
4. Captures `stdout` / `stderr`, enforces time & memory limits via Docker flags.
5. Compares output with expected testcases and updates submission status & verdict in MongoDB.

---

## Troubleshooting (common issues)

### Docker cannot pull images / DNS errors

* Restart Docker Desktop.
* If Docker cannot resolve registry, add DNS in Docker → **Settings → Docker Engine** JSON:

```json
{
  "dns": ["8.8.8.8", "1.1.1.1"]
}
```

Click **Apply & Restart**.

* If Docker Hub is blocked, use mirror:

```dockerfile
FROM mirror.gcr.io/library/openjdk:21-slim
```

### Docker Desktop won’t start on Windows

* Make sure **WSL2** is installed and you launched Ubuntu once.
* Reboot after installing WSL2 and start Docker Desktop; wait for **Engine running**.

### Java source encoding errors when writing files from PowerShell

PowerShell here-strings may produce UTF-16. Use UTF-8 write:

```powershell
[System.IO.File]::WriteAllText("$testDir\Main.java", $src, (New-Object System.Text.UTF8Encoding($false)))
```

### Submissions stuck `PENDING`

* Confirm scheduler is running (check backend logs).
* Check backend logs for exceptions.
* Inspect `submissions` document in MongoDB for `errorLog`.

---

## Security notes & limitations

* **Prototype only.** Not hardened for running arbitrary untrusted code at scale.
* For production, consider stronger isolation (gVisor, VM-based sandboxes), per-submission resource accounting, container pools, authentication, rate limits.
* **Do not** commit secrets (Mongo credentials). Use environment variables.

---

## Deliverables in this repo

* `backend/` — Spring Boot source
* `postman/shodh-a-code-tests.postman_collection.json` — tests
* `frontend/` — minimal demo (optional)
* `docker-compose.yml` — optional local compose

---

## Next steps / improvements

* WebSocket for live leaderboard & real-time submission updates
* Multi-language support (toolchain per language)
* Hardened sandboxing & container pooling
* Authentication & persistent user accounts

---

## Contact & final notes

If you encounter issues while running the steps above, copy the relevant backend logs and Docker output and paste them here — I’ll help troubleshoot quickly.

When you’re ready, commit and push:

```bash
git add README.md
git commit -m "docs: polished README"
git push origin main
```

---
