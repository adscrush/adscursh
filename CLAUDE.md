# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Monorepo-wide (using Turbo)
- `pnpm dev` - Start all applications in development mode
- `pnpm build` - Build all applications
- `pnpm lint` - Run ESLint across the codebase
- `pnpm format` - Format code with Prettier
- `pnpm typecheck` - Run TypeScript type checking across all packages

### API Server (Bun/Elysia)
- `pnpm --filter @adscrush/api dev` - Start API server in development mode
- `pnpm --filter @adscrush/api build` - Build API for production
- `pnpm --filter @adscrush/api start` - Start built API server
- `pnpm --filter @adscrush/api typecheck` - Type check API code

### Web Application (Next.js)
- `pnpm --filter @adscrush/web dev` - Start Next.js dev server on port 3000
- `pnpm --filter @adscrush/web build` - Build Next.js application
- `pnpm --filter @adscrush/web start` - Start built Next.js application
- `pnpm --filter @adscrush/web lint` - Run ESLint on web app
- `pnpm --filter @adscrush/web format` - Format web app code

### Database Operations
- `pnpm db:push` - Push Drizzle schema to database
- `pnpm db:generate` - Generate Drizzle client
- `pnpm db:migrate` - Run database migrations
- `pnpm db:studio` - Open Drizzle Studio UI

### Docker
- `pnpm docker:up` - Start all Docker containers
- `pnpm docker:down` - Stop all Docker containers

### Email Service
- `pnpm email:dev` - Start email development server
- `pnpm email:build` - Build email templates
- `pnpm email:export` - Export email templates

## Architecture Overview

### Monorepo Structure
- **apps/** - Contains deployable applications
  - `api/` - Bun/Elysia REST API server
  - `web/` - Next.js dashboard application
- **packages/** - Shared libraries and utilities
  - `auth/` - Authentication utilities (client/server)
  - `db/` - Database schema and Drizzle ORM configuration
  - `shared/` - Common types, constants, validators, and utilities
  - `ui/` - Shared UI components
  - `email/` - Email templating service

### API Layer (@adscrush/api)
- Built with **Elysia** (Bun-based web framework)
- Modular route organization:
  - `/api/v1/auth` - Authentication endpoints
  - `/api/v1/employees` - Employee management
  - `/api/v1/advertisers` - Advertiser management
  - `/api/v1/affiliates` - Affiliate management
  - `/api/v1/offers` - Offer management
  - `/api/v1/reports` - Reporting endpoints
- Uses **OpenAPI** (@elysiajs/openapi) for automatic documentation
- Authentication middleware protects routes
- Centralized error handling middleware

### Web Application (@adscrush/web)
- Built with **Next.js 16** (App Router, Turbopack)
- Authentication routes: `/app/(auth)/` (sign-in, sign-up)
- Dashboard routes: `/app/(app)/` (main application)
- Layout components:
  - `app-header.tsx` - Top navigation
  - `app-sidebar.tsx` - Side navigation
- Uses **React Hook Form** with **Zod** validators for form handling
- **TanStack React Table** for data tables
- **Framer Motion** for animations
- **Next-themes** for dark/light mode support

### Shared Packages
- **@adscrush/db**: Drizzle ORM schema definitions for:
  - Advertisers, Affiliates, Employees, Offers
  - Auth tables (users, sessions, etc.)
  - Conversions, Clicks, Landing Pages
  - Relations tables (offer-affiliates, etc.)
- **@adscrush/shared**:
  - Constants (roles, permissions)
  - ID generation utilities
  - Validator schemas (using Zod)
  - Shared types and interfaces
- **@adscrush/auth**:
  - Built on **Better Auth**
  - Client and server authentication utilities
  - Session and user management
- **@adscrush/ui**: Shared React components (buttons, forms, modals, etc.)
- **@adscrush/email**: Email templating system (React Email)

### Key Technologies
- **Runtime**: Bun (API), Node.js (Web)
- **Framework**: Elysia (API), Next.js (Web)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth
- **Validation**: Zod (schema validation)
- **Styling**: Tailwind CSS
- **UI Components**: Custom UI package + Tabler Icons
- **State Management**: React hooks/context (no external state lib)
- **Form Handling**: React Hook Form
- **Data Tables**: TanStack React Table
- **Monorepo Manager**: Turbo + PNPM

### Environment Variables
Critical variables referenced in code:
- `PORT` - API server port (default 9999)
- `DASHBOARD_URL` - CORS origin for web app
- `PUBLIC_API_URL` - Publicly accessible API URL
- Database connection (via Drizzle, likely in .env)
- Better Auth configuration (secret, etc.)

### Development Practices
- TypeScript strict mode enforced
- ESLint with custom @adscrush/eslint-config
- Prettier with tailwindcss plugin
- Database migrations managed through Drizzle
- Feature separation by domain (advertisers, affiliates, offers, etc.)