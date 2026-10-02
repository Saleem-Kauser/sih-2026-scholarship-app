# JAGO

JAGO is an Expo + React Native prototype for a scholarship assistant used by a student and a Ministry/Admin persona. The app combines a role-aware mobile interface with a Node/Express backend that exposes a JAGO chat API, synthetic scholarship data, and admin coverage-summary tooling.

## Overview

- Student dashboard for application status, scholarships, and document guidance
- Ministry/Admin dashboard with synthetic coverage and review summaries
- Shared JAGO Assistant screen that switches between student and admin behavior
- Role-aware backend requests so the visible JAGO role matches the role sent to the server
- Local deterministic fallback and Gemini-backed AI flow for chat responses

## Tech stack

- Expo SDK / React Native / Expo Router
- TypeScript
- Express.js backend under `server/`
- Google Gemini integration via `@google/genai`
- Synthetic prototype data for scholarship flows and coverage-gap scenarios

## Repository structure

- `src/app/` — Expo Router screens and layouts
- `src/components/` — shared UI components
- `src/data/` — mock scholarship and application data
- `src/utils/` — role store, application store, and app utilities
- `src/services/` — JAGO chat adapter and benefit-gap adapters
- `server/` — Express routes, backend services, and tests
- `docs/` — implementation notes and summaries

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Start the app:

```bash
npx expo start
```

3. Start the backend server:

```bash
npm run server
```

4. Optional: run the backend test suite:

```bash
npm run test:server
```

## Environment notes

The backend expects a Gemini API key in the environment for AI-backed classification/answer generation. If the key is absent, the app falls back to a deterministic local prototype flow.

Typical variables include:

```bash
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-3.5-flash-lite
```

## Role behavior

This app is prototype-only and intentionally does not use real authentication.

- Student dashboard routes to the Student JAGO assistant profile
- Ministry/Admin dashboard routes to the Admin JAGO assistant profile
- The role store is updated before navigation so the screen, quick prompts, and backend payload remain consistent
- Admin JAGO uses admin tools and admin quick prompts
- Student JAGO uses student tools and student quick prompts

## JAGO chat API

The backend provides a chat endpoint at:

```text
POST /api/jago/chat
```

Request body:

```json
{
  "message": "What is my application status?",
  "role": "student",
  "language": "en",
  "sessionId": "demo-session",
  "studentContext": {
    "application": {},
    "scholarships": []
  }
}
```

The backend returns structured fields such as:

```json
{
  "answer": "...",
  "intent": "APPLICATION_STATUS",
  "tool": "getApplicationStatus",
  "language": "en",
  "source": "backend-tool+gemini",
  "prototypeRole": true
}
```

## Scripts

```bash
npm run server
npm run test:server
npm run lint
```

## Validation

The project includes server-side tests for:

- benefit-gap matcher logic
- JAGO chat role allowlists
- deterministic fallback behavior
- Gemini request/response flow and failure handling
- role navigation behavior and backend role consistency

## Notes

This project is a prototype designed to demonstrate scholarship assistance UX and role-aware AI behavior. It intentionally avoids live government integrations and real authentication, and instead uses synthetic/mock data for a safe demo experience.
