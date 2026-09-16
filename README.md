# Competency Evaluator (Tool di Valutazione delle Competenze)

[![Nx](https://img.shields.io/badge/monorepo-Nx-blue.svg)](https://nx.dev)
[![NestJS](https://img.shields.io/badge/backend-NestJS-red.svg)](https://nestjs.com)
[![React](https://img.shields.io/badge/frontend-React_19-blue.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/language-TypeScript-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A modern full-stack web application designed for managing, structuring, and evaluating competencies and sub-competencies through observation objects, indicators, evaluation rubrics, and tests.

This project was developed as an **academic university project** at the **University of Brescia (UniBS)** by **Simone Rinaldi** and **Matteo Legati**.

---

## User Roles & Features

The application provides dedicated features tailored to four distinct personas:

- **Administrator (`ADMIN`)**

  - **Competencies & Sub-competencies Management**: Comprehensive visualization, step-by-step creation wizard, association of observation objects with their corresponding indicators (at least one) and rubrics, editing, and deletion.
  - **Evaluation Rubrics Management**: Creation and configuration of custom evaluation rubrics with 2 or 5 proficiency levels.
  - **User Management**: User creation, editing, role assignment (`ADMIN`, `TEST_DESIGNER`, `EVALUATOR`, `USER`), credential management, and password updates.
  - **Global Tests Overview**: Read-only monitoring of all active tests in the system, with details on assessment situations, users to evaluate, and assigned evaluators.

- **Test Designer (`TEST_DESIGNER`)**

  - **Test Creation & Configuration**: Definition of the assessment situation, duration, instructions, and objectives.
  - **Competencies & Indicators Association**: Linking tests to specific competencies and sub-competencies with their observation objects, indicators, and rubrics.
  - **Participant Assignment**: Selection and assignment of users to evaluate and the pool of evaluators responsible for evaluation.
  - **Observation Objects Management**: Dedicated interface to modify observation objects and their associated indicators.

- **Evaluator (`EVALUATOR`)**

  - Dashboard of tests assigned for evaluation (pending / completed).
  - Guided evaluation interface.

- **Evaluated User (`USER`)**
  - Personal test dashboard (tests to take and completed tests).
  - Score history and mastery tracking (_Best Scores_ across competencies and sub-competencies).

---

## Architecture & Tech Stack

The system is organized as an **Nx Monorepo**:

- **Backend (`apps/api`)**:

  - **Framework**: [NestJS](https://nestjs.com/).
  - **Database & ORM**: [PostgreSQL](https://www.postgresql.org/) with [TypeORM](https://typeorm.io/).
  - **Authentication**: JWT (JSON Web Tokens) with Passport strategies and bcrypt password hashing.
  - **API Documentation**: Automated OpenAPI specification via [Swagger UI](https://swagger.io/).
  - **Modular Server Libraries (`libs/server/*`)**: Clean separation between `auth`, `users`, `competencies-management`, `tests-management`, `tests-execution`, `tests-evaluation`, and `best-scores`.

- **Frontend (`apps/ui`)**:

  - **Framework**: [React](https://react.dev/) bundled with [Vite](https://vitejs.dev/).
  - **UI & Styling**: [TailwindCSS](https://tailwindcss.com/) and [shadcn/ui](https://ui.shadcn.com/) components with [Lucide React](https://lucide.dev/) icons.

- **DevOps**:
  - **Docker Compose**: Containerized PostgreSQL database for local development.

---

## Getting Started

### Prerequisites

Make sure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (v20 or later recommended)
- [npm](https://www.npmjs.com/)
- [Docker](https://www.docker.com/) & Docker Compose

### 1. Clone the repository

```bash
git clone https://github.com/SimoRinaldi/competency-evaluator.git
cd competency-evaluator
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

Copy the template `.env.example` file to `.env`:

- **Linux / macOS / Git Bash**:
  ```bash
  cp .env.example .env
  ```
- **Windows (PowerShell)**:
  ```powershell
  Copy-Item .env.example .env
  ```

Review `.env` and fill in the database credentials and a secure `SECRET_KEY`.

### 4. Start the database (Docker)

Start the PostgreSQL container:

```bash
npm run start:docker-db
```

### 5. Run the applications

Start the **Backend API**:

```bash
npm run start:api
```

The API will be available at `http://localhost:3333`.  
You can view the interactive **Swagger API Documentation** at: `http://localhost:3333/api/docs`

Start the **Frontend UI**:

```bash
npm run start:ui
```

The web application will open at `http://localhost:4200`.

---

## Default Credentials

On initial startup, if the database is empty, an initial administrator account is automatically seeded:

- **Email**: `admin@coeva.local`
- **Password**: `Password!`

_(These can be customized in `.env` before starting the application via `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`)._

---

## Useful Commands

Using the workspace's Nx tooling:

- **Lint workspace**:
  ```bash
  npx nx run-many -t lint
  ```
- **Build production bundles**:
  ```bash
  npx nx run-many -t build
  ```
- **Inspect project dependency graph**:
  ```bash
  npx nx graph
  ```

---

## Authors

Developed as a university academic project by:

- **Simone Rinaldi** - [@SimoRinaldi](https://github.com/SimoRinaldi)
- **Matteo Legati** - [@MatteoLegati](https://github.com/MatteoLegati)

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
