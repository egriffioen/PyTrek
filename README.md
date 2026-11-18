# PyTrek

A gamified, puzzle-based way to learn Python: think a simpler, more playful zyBooks.
Learners trek through a map of short lessons, solve coding puzzles to unlock the next
stop, and earn progress along the way.

Final project for C S 452: Database Modeling Concepts (BYU).

## Status

Early development. Design docs are in [docs/](docs/) (start with
[initial-design.md](docs/initial-design.md)); work hours are in
[PROJECT_LOG.md](PROJECT_LOG.md).

## Tech stack

Next.js (React, TypeScript, Tailwind CSS) · MongoDB Atlas · Pyodide (Python in
the browser) · Better Auth · Docker on Google Cloud Run.

## Running locally

Requires Node.js 22 and (for the container) Docker.

```bash
npm install
```

```bash
npm run dev
```

Then open http://localhost:3000.

To run the production Docker image:

```bash
docker build -t pytrek .
```

```bash
docker run --rm -p 8080:8080 pytrek
```

Then open http://localhost:8080.

## Deploying

Live (pilot): https://pytrek-102065497723.us-central1.run.app
(health check: `/api/health`)

Deploy to Google Cloud Run (project `pytrek`, region `us-central1`). Cloud Build
builds the Dockerfile; the database URI comes from Secret Manager:

```bash
gcloud run deploy pytrek --source . --region us-central1 --allow-unauthenticated --set-secrets "MONGODB_URI=mongodb-uri:latest" --set-env-vars "MONGODB_DB=pytrek"
```
