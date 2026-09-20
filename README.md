# Sovereign AI — Sovereign On-Premise AI Workbench
## Project Name and Brief Description

**Sovereign AI** is a private, fully local AI assistant built for organizations that handle
confidential operational data — refineries, hospitals, defence contractors, and similar
regulated environments — where sending data to public cloud AI services (ChatGPT, Claude,
Copilot) is not an option.
It runs entirely on a local machine or server with **zero external network calls**, allowing
staff to upload documents, ask questions in plain language, run real calculations, and
generate deliverable files — all while proving, live, that no data ever leaves the device.

Built for **Morrow 1.0** (Makers Need More) — Round 2 Submission.

## Problem Statement

Industrial and regulated organizations generate large amounts of routine but sensitive
knowledge work — inspection reports, maintenance records, engineering drawings, internal
correspondence — but cannot use public AI tools without risking confidential data leaving
their network. Today, staff either do this work manually (slow, inconsistent), or risk
pasting confidential material into public AI tools anyway (a real, ongoing data leakage risk).
There is currently no accessible, deployable AI assistant that gives organizations the
convenience of tools like Claude or ChatGPT while guaranteeing their data never leaves their
own infrastructure.

## Key Features

- **Role-based access control** — Admin, Engineer, Reviewer, and Viewer roles, each with
  genuinely different document access, enforced at the database query level (not just hidden
  in the UI)
- **Multi-format document ingestion** — supports PDF, DOCX, XLSX/CSV, and scanned documents
- **Sensitive information detection & individual approval** — automatically scans uploaded
  documents for sensitive content (financial figures, personal names, ID numbers, confidential
  keywords) and requires the user to individually approve or skip each flagged item before it
  is used in any task
- **Sandboxed calculation engine** — runs real Python code in an isolated subprocess for
  engineering calculations, rather than relying on an AI model to guess numeric answers
- **Task-based model routing** — routes different task types (text reasoning, calculations,
  document analysis) to the appropriate engine
- **Live Sovereignty Monitor** — a real-time dashboard and test button that proves zero
  external network calls are made, backed by a genuine process-level socket interceptor that
  blocks any real outbound connection attempt
- **Tamper-evident audit ledger** — every action (upload, approval decision, task run) is
  logged with timestamps to a local, append-only database

## Tech Stack

Technology

Frontend - React + Vite, Tailwind CSS 
Backend - Node.js, Express
Database - SQLite (local, file-based) 
Sandboxed Execution - Native Python subprocess (isolated, network-disabled) 
Network Security - Custom Node.js socket-level interception 

## How to Run / Use the Project
### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- [Python](https://python.org/) v3.10 or higher (required for the sandboxed calculation engine)

### Installation & Setup
# Clone the repository
git clone https://github.com/MakersNeedMore-MnM/Round2-Codexion.git
cd Round2-Codexion

# Install dependencies
npm install

# Build the frontend
npm run build

# Start the application
node server/index.js

The application will be available at **http://127.0.0.1:5000**

### Using the Application
1. Open `http://127.0.0.1:5000` in your browser
2. Log in by selecting a role (Admin, Engineer, Reviewer, or Viewer)
3. Upload a document, or use a pre-loaded sample from the Document Library
4. If sensitive information is detected, review and approve/skip each flagged item
   individually
5. Ask a question or run a task on the document in plain language
6. Review the generated result, then approve and download the final report

### Verifying Offline Operation
To confirm the application runs without internet access:
1. Disconnect your device from the internet (turn off Wi-Fi / unplug ethernet)
2. Use the application normally — every feature works identically
3. Open the built-in **Sovereignty Check** page to run a live test confirming zero external
   connections are made, with real logged results

## Team Members

Name 
Kashmira Sarode 
Shreya Nanekar 
Parth Dumbre 
Sakshi Madkar 

## Honest Disclosures

- **Fully implemented:** Sandboxed Python execution, network-level air-gap enforcement,
  role-based access filtering, sensitive information detection, audit ledger, and the document
  processing pipeline.
- **Simulated for this prototype:** The natural-language reasoning step is currently generated
  using structured domain heuristics rather than a live local LLM, since this build
  environment lacks the GPU hardware needed to run a production-scale open-weight model. The
  routing logic and model-provider interface are fully built and ready for a real local model
  (via Ollama or llama.cpp) to be connected with no changes to the UI or database.
- **Sample data:** All documents in the Document Library are synthetic demo records, not real
  organizational data.

## Project Structure
├── server/
│ ├── index.js # Main Express server entry point
│ ├── airgapInterception.js # Network-level air-gap enforcement (loads first)
│ ├── sandbox.js # Sandboxed Python execution engine
│ ├── sovereignty.js # Sovereignty monitor / telemetry
│ ├── modelRouter.js # Task-based model routing logic
│ ├── ingestion.js # Document processing pipeline
│ ├── db.js # SQLite database layer
│ └── seedData.js # Sample demo data
├── src/ # React frontend
├── package.json
└── README.md
