# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Monorepo-wide (using Turbo)
- `pnpm dev` - Start all applications in development mode
- `pnpm --filter @adscrush/tracking dev` - Start tracking service (defaults to port 3002)
- `pnpm deploy:web-sdk:pages` - Build and deploy web SDK to Cloudflare Pages
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
- `pnpm --filter @adscrush/web dev` - Start Next.js dev server on port 3000 (uses Turbopack)
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

### Package-specific Development
- `pnpm --filter @adscrush/shared dev` - Start shared package in development mode (if applicable)
- `pnpm --filter @adscrush/ui dev` - Start UI package in development mode
- `pnpm --filter @adscrush/auth dev` - Start auth package in development mode

## Architecture Overview

### Monorepo Structure
- **apps/** - Contains deployable applications
  - `api/` - Bun/Elysia REST API server
  - `web/` - Next.js dashboard application (uses Turbopack for fast refresh)
  - `tracking/` - Bun/Elysia click/pixel/S2S tracking service (runs on `TRACKING_PORT`, defaults to 3002)
- **packages/** - Shared libraries and utilities
  - `auth/` - Authentication utilities (client/server) built on Better Auth
  - `db/` - Database schema and Drizzle ORM configuration
  - `shared/` - Common types, constants, validators, and utilities
  - `ui/` - Shared UI components (shadcn/ui based)
  - `email/` - Email templating service (React Email)
  - `web-sdk/` - Browser SDK with Cloudflare Pages deploy for client-side tracking
  - `eslint-config/` - Shared ESLint configuration
  - `typescript-config/` - Shared TypeScript configuration

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
- **TanStack React Table** for data tables (v8)
- **Framer Motion** for animations
- **Next-themes** for dark/light mode support
- **@t3-oss/env-nextjs** for environment variable validation
- **TanStack React Query** for server state management

### Shared Packages
- **@adscrush/db**: Drizzle ORM schema definitions for:
  - Advertisers, Affiliates, Employees, Offers
  - Auth tables (users, sessions, etc.)
  - Conversions, Clicks, Landing Pages
  - Relations tables (offer-affiliates, etc.)
- **@adscrush/shared**:
  - Constants (roles, permissions)
  - ID generation utilities (nanoid-based)
  - Validator schemas (using Zod)
  - Shared types and interfaces
  - Date/time utilities (date-fns)
  - Email utilities (nodemailer)
- **@adscrush/auth**:
  - Built on **Better Auth**
  - Client and server authentication utilities
  - Session and user management
  - Integration with API routes via `@elysiajs/eden`
- **@adscrush/ui**: Shared React components (buttons, forms, modals, etc.) built with shadcn/ui
- **@adscrush/email**: Email templating system (React Email)
- **@adscrush/web-sdk**: Browser SDK for client-side tracking, deployed to Cloudflare Pages

### Key Technologies
- **Runtime**: Bun (API, tracking), Node.js (Web)
- **Framework**: Elysia (API, tracking), Next.js (Web)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth
- **Validation**: Zod (schema validation)
- **Styling**: Tailwind CSS
- **UI Components**: Custom UI package (@adscrush/ui) + Tabler Icons
- **State Management**: React hooks/context (no external state lib) + TanStack React Query
- **Form Handling**: React Hook Form with Zod resolvers
- **Data Tables**: TanStack React Table
- **Monorepo Manager**: Turbo + PNPM
- **Build Tool**: Turbopack (for Next.js dev server)

### Environment Variables
Critical variables referenced in code:
- `PORT` - API server port (default 9999)
- `DASHBOARD_URL` - CORS origin for web app
- `PUBLIC_API_URL` - Publicly accessible API URL
- Database connection (via Drizzle, likely in .env)
- Better Auth configuration (secret, etc.)
- `TRACKING_PORT` - Tracking service port (defaults to 3002)
- `WEB_SDK_TOKEN` - Token for web SDK authentication
- `POSTHOG_KEY` - PostHog analytics key
- `RESEND_API_KEY` - Resend API key for email service

### Development Practices
- TypeScript strict mode enforced
- ESLint with custom @adscrush/eslint-config (includes Tailwind CSS plugin)
- Prettier with tailwindcss plugin
- Database migrations managed through Drizzle
- Feature separation by domain (advertisers, affiliates, offers, etc.)
- API-first development with Elysia and Eden typesafe clients
- Component-driven development with shared UI package
- Environment variable validation using @t3-oss/env-nextjs (web) and manual validation (API)

### Common Development Tasks
- Adding UI components: `pnpm dlx shadcn@latest add <component> -c apps/web`
  - Components are stored in `packages/ui/src/components`
  - Used in web app via `@adscrush/ui/components/<component>`
- Database workflow:
  1. Modify schema in `packages/db/src/schema.ts`
  2. Run `pnpm db:generate` to update Drizzle client
  3. Run `pnpm db:migrate` to apply changes to database
  4. Use `pnpm db:studio` to inspect database contents
- API development:
  - Routes are defined in `apps/api/src/routes/`
  - OpenAPI documentation is generated automatically
  - Use `@elysiajs/eden` in web app for typesafe API clients
- Web development:
  - Pages/components in `apps/web/app/`
  - Authentication routes in `apps/web/app/(auth)/`
  - Dashboard routes in `apps/web/app/(app)/`
  - Client components use "use client" directive