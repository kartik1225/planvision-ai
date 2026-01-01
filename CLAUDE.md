# PlanVision

AI-powered architectural design and visualization platform. Users upload floor plans or interior photos and see them rendered in different artistic styles using Google's Gemini AI.

## Architecture

```
plan_vision/
├── plan_vision/              # iOS SwiftUI App
└── plan_vision_backend/      # NestJS API Server
```

## Tech Stack

### Backend (plan_vision_backend)
- **Framework**: NestJS 11 + TypeScript 5.7
- **Database**: PostgreSQL + Prisma 7.0
- **Auth**: Better Auth (email/password + Google OAuth)
- **AI**: Google Gemini API via @google/genai
- **Storage**: Google Cloud Storage
- **Package Manager**: pnpm

### iOS App (plan_vision)
- **Framework**: SwiftUI
- **Architecture**: Clean Architecture (Data → Domain → Presentation)
- **Pattern**: MVVM with @StateObject/@EnvironmentObject
- **Networking**: Custom URLSession HTTPClient

## Key Commands

### Backend
```bash
cd plan_vision_backend
pnpm install              # Install dependencies
pnpm start:dev            # Dev server with hot reload (port 3000)
pnpm build                # Build for production
pnpm start:prod           # Run production build
pnpm prisma:generate      # Generate Prisma client
pnpm prisma:migrate       # Run migrations
pnpm prisma:studio        # Open Prisma Studio GUI
pnpm test                 # Run tests
pnpm lint                 # ESLint
```

### iOS
Open `plan_vision/plan_vision.xcodeproj` in Xcode.

## Backend Structure

```
src/
├── auth/                 # Better Auth integration
├── user/                 # User profile (/users/me)
├── project/              # Project CRUD
├── input-image/          # Image upload to GCS
├── render-config/        # Render job configuration
├── generation/           # AI generation orchestration
│   ├── gemini.service.ts
│   └── prompt-builder.service.ts
├── style/                # Artistic styles (Modern, Scandi, etc.)
├── image-type/           # Image categories (Kitchen, Garden, etc.)
├── project-template/     # Home screen templates
├── storage/              # GCS service
├── prisma/               # Prisma client
├── common/
│   ├── guards/           # SessionAuthGuard
│   ├── middleware/       # Auth, Logger
│   └── filters/          # Error handling
└── main.ts               # Bootstrap
```

## iOS Structure

```
src/
├── app/
│   ├── ContentView.swift       # Root navigation
│   └── SessionManager.swift    # Global auth state
├── core/
│   ├── Config.swift            # API configuration
│   ├── design/                 # Design system (colors, modifiers)
│   ├── networking/             # HTTPClient, Endpoint protocol
│   ├── storage/                # TokenManager (Keychain)
│   └── components/             # Glass morphism components
└── features/
    ├── auth/                   # Login/Signup
    └── projects/               # Project management, render flow
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /` | Health check |
| `POST /api/auth/sign-in/email` | Email login |
| `POST /api/auth/sign-up/email` | Email registration |
| `GET /users/me` | Current user profile |
| `POST/GET/PATCH/DELETE /projects` | Project CRUD |
| `POST /input-images/upload` | Upload image (multipart) |
| `GET /input-images/:id/url` | Get signed download URL |
| `POST/GET/PATCH /render-configs` | Render job config |
| `GET /render-configs/:id/generation` | Get generation status |
| `GET /styles` | List artistic styles |
| `GET /image-types` | List image categories |
| `GET /project-templates` | Home screen templates |
| `GET /docs` | Swagger API documentation |

## Database Schema

**Auth Models**: User, Session, Account, Verification

**Domain Models**:
- `Project` - User's design projects
- `InputImage` - Uploaded source images
- `ImageType` - Categories (Floor Plan, Kitchen, Living Room, Garden)
- `Style` - Design styles with AI prompts
- `RenderConfig` - Recipe combining image + style + settings
- `Generation` - AI output with status (pending/processing/completed/failed)

## Core Workflow

1. User uploads image → stored in GCS → `InputImage` record created
2. User selects `ImageType` and `Style`, adds custom instructions
3. `RenderConfig` created → triggers async AI generation
4. `GeminiService` builds prompt → calls Gemini API → uploads result to GCS
5. `Generation` status updated → iOS polls for completion

## Environment Variables (Backend)

```
DATABASE_URL              # PostgreSQL connection
BETTER_AUTH_SECRET        # JWT signing secret
BETTER_AUTH_BASE_URL      # http://localhost:3000
GOOGLE_OAUTH_CLIENT_ID    # Google OAuth
GOOGLE_OAUTH_CLIENT_SECRET
GCS_BUCKET                # planvision-uploads
GCP_PROJECT_ID            # Google Cloud project
GCP_LOCATION              # us-central1
```

## Conventions

### Backend
- One NestJS module per feature
- DTOs with class-validator decorators
- `@Session()` decorator for authenticated user
- `@UseGuards(SessionAuthGuard)` for protected routes
- All IDs are UUIDs
- Swagger documentation via decorators

### iOS
- MVVM pattern (ViewModel + View)
- Services in data layer
- Codable DTOs matching backend
- Glass morphism UI components
- Config.swift for API base URL

## Testing

```bash
# Backend
pnpm test           # Unit tests
pnpm test:e2e       # E2E tests
pnpm test:cov       # Coverage

# iOS
# Run tests via Xcode (Cmd+U)
```
