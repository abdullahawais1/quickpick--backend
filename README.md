# CI/CD with GitHub Actions – Intern Assignment

## Project Overview
This is a simple Node.js application used to demonstrate a full **CI/CD pipeline** with GitHub Actions.  
The repository includes two workflows:

1. **CI Pipeline (Continuous Integration)** – Runs on every push  
2. **CD Pipeline (Continuous Deployment)** – Runs automatically after CI succeeds on a self-hosted runner

---

## CI Pipeline
The **CI pipeline** is defined in `.github/workflows/ci.yml` and performs the following steps:

-  Checkout the code  
-  Setup Node.js (v18)  
-  Install dependencies (`npm install`)  
-  Run linter (`npm run lint --if-present`)  
-  Run tests (skipped for now, no tests defined)  
-  Build the project (`npm run build`)  
-  Upload build artifact (`dist/`, `package.json`, `package-lock.json`)  

---

##  CD Pipeline
The **CD pipeline** is defined in `.github/workflows/cd.yml` and is triggered automatically after CI passes.  
It runs on a **self-hosted Windows runner** and performs the following steps:

-  Downloads the artifact produced by CI  
-  Sets environment variables (`PORT`, `NODE_ENV`)  
-  Installs production dependencies (`npm install --production`)  
-  Starts the application using `node dist/index.js`  

---

## Running Locally
To run this project locally:

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start the application
node dist/index.js
