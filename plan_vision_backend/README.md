# PlanVision Backend

A robust NestJS backend service for the PlanVision application, designed to manage architectural plans, projects, and style-based image rendering jobs.

## Overview

This repository hosts the server-side logic for PlanVision. It handles user authentication, project management, image uploads to Google Cloud Storage, and configuration for rendering processes.

## Features

-   **Authentication**: Secure authentication using [Better Auth](https://better-auth.com) with support for Email/Password and Google OAuth.
-   **User Management**: User data synchronization between Better Auth and a local PostgreSQL database via Prisma.
-   **Project Management**: CRUD operations for managing user projects and architectural plans.
-   **Image Handling**: Secure image uploads to Google Cloud Storage (GCS) with signed URL generation for private access.
-   **Render Configuration**: Management of render styles, image types, and configuration parameters for the rendering engine.

## Tech Stack

-   **Framework**: [NestJS](https://nestjs.com/) (Node.js)
-   **Language**: TypeScript
-   **Database**: PostgreSQL
-   **ORM**: [Prisma](https://www.prisma.io/) & Kysely (for Auth)
-   **Authentication**: Better Auth
-   **Storage**: Google Cloud Storage
-   **Package Manager**: pnpm

## Prerequisites

Ensure you have the following installed:

-   [Node.js](https://nodejs.org/) (v20+ recommended)
-   [pnpm](https://pnpm.io/)
-   [PostgreSQL](https://www.postgresql.org/)
-   Google Cloud Platform project with Storage enabled

## Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd plan_vision_backend
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

3.  **Environment Configuration:**
    Create a `.env` file in the root directory (copy from `.env.example` if available) and configure the following variables:
    -   `DATABASE_URL`: Connection string for PostgreSQL.
    -   `BETTER_AUTH_SECRET`: Secret key for authentication.
    -   `BETTER_AUTH_BASE_PATH`: Base path for auth routes (e.g., `/api/auth`).
    -   `GCS_BUCKET`: Name of the GCS bucket (`planvision-uploads`).
    -   `GCS_SERVICE_ACCOUNT_KEY`: Base64 encoded service account key.
    -   `GCP_PROJECT_ID`: Your Google Cloud Project ID.

4.  **Database Setup:**
    ```bash
    pnpm prisma:generate
    pnpm prisma:migrate
    ```

## Running the Application

### Development
Run the application in watch mode (hot-reload):
```bash
pnpm start:dev
```
The API will be available at `http://localhost:3000` (default).
Swagger documentation is available at `http://localhost:3000/docs`.

### Debugging
Run with the debugger attached (configured for VS Code):
```bash
pnpm start:debug
```

### Production
Build and run the production bundle:
```bash
pnpm build
pnpm start:prod
```

## Testing

### Unit Tests
Run unit tests for services and controllers:
```bash
pnpm test
```

### E2E Tests
Run end-to-end tests:
```bash
pnpm test:e2e
```

### Test Coverage
Generate a test coverage report:
```bash
pnpm test:cov
```

## Project Structure

-   `src/auth/`: Better Auth configuration and integration.
-   `src/user/`: User profile management and sync logic.
-   `src/project/`: Project CRUD logic.
-   `src/input-image/`: Image upload and GCS handling.
-   `src/render-config/`: Configuration for render jobs.
-   `src/storage/`: GCS storage service.

## License

Private / UNLICENSED
