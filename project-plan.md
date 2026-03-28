# Adscrush Platform — Project Plan

> **Version:** 1.0
> **Author:** Tech Lead
> **Created:** March 2025
> **Status:** In Progress

---

## Table of Contents

1. [Overview](#1-overview)
2. [Tech Stack](#2-tech-stack)
3. [Monorepo Structure](#3-monorepo-structure)
4. [Roles & Access Model](#4-roles--access-model)
5. [Database Schema](#5-database-schema)
6. [Core Features (MVP)](#6-core-features-mvp)
7. [System Architecture](#7-system-architecture)
8. [API Design](#8-api-design)
9. [Dashboard Pages](#9-dashboard-pages)
10. [SDK Specification](#10-sdk-specification)
11. [Development Phases](#11-development-phases)
12. [Environment & Infrastructure](#12-environment--infrastructure)
13. [Conventions](#13-conventions)
14. [Future Enhancements](#14-future-enhancements)

---

## 1. Overview

### 1.1 What We're Building

An in-house performance marketing tracking platform to replace our Offer18
dependency. The platform manages advertisers, affiliates, offers, and tracks
clicks and conversions in real-time.

### 1.2 MVP Goal

Replicate the core daily workflow:

Employee logs in
→ Creates advertiser & affiliate accounts
→ Creates offer with landing pages
→ Assigns affiliates to offer
→ Generates tracking URL for affiliate
→ Affiliate drives traffic → clicks tracked
→ Advertiser site has SDK → conversions tracked
→ Postback fired to affiliate
→ Reports show clicks, conversions, payout, revenue


When these 9 steps work end-to-end, we have a usable product.

### 1.3 Design Principles

- **Simple now, scalable later** — build for today's needs with hooks for tomorrow
- **Fast tracking** — click redirects < 20ms, everything non-critical is async
- **Type-safe everywhere** — shared types between all services
- **No premature optimization** — PostgreSQL first, ClickHouse later
- **Feature-flag mindset** — build features behind clean interfaces so we can add
  targeting, fraud detection, automation later without rewriting

---

## 2. Tech Stack

| Layer              | Technology              | Why                                           |
| ------------------ | ----------------------- | --------------------------------------------- |
| Monorepo           | Turborepo + pnpm        | Fast builds, caching, shared packages         |
| Tracking Server    | Elysia (Bun)            | Sub-ms routing, perfect for redirect workload |
| Conversion Server  | Elysia (Bun)            | Same runtime, consistent codebase             |
| API Server         | Elysia (Bun)            | CRUD backend for dashboard                    |
| Dashboard          | Next.js (App Router)    | SSR, Server Components, Server Actions        |
| Database           | PostgreSQL 16           | Partitioning, JSONB, rock-solid               |
| ORM                | Drizzle                 | Native Bun support, great raw SQL, type-safe  |
| Cache / Queue      | Redis 7 + BullMQ        | Click caching, rate limiting, job queues      |
| Auth               | Better Auth             | Elysia + Next.js support, Drizzle adapter     |
| Web SDK            | Vanilla TypeScript      | Zero deps, <5KB gzipped                       |
| GeoIP              | MaxMind GeoLite2        | Local lookup, no external API in hot path     |
| Object Storage     | S3 / R2 (later)         | SDK hosting, exports                          |
| CDN                | Cloudflare (later)      | SDK distribution                              |

### Runtime Versions

Bun >= 1.1
Node.js >= 22 (for Next.js)
pnpm >= 9.15
PostgreSQL 16
Redis 7


---

## 3. Monorepo Structure

adscrush/
│
├── apps/
│ ├── tracking/ # Elysia — click & impression redirects
│ │ ├── src/
│ │ │ ├── index.ts
│ │ │ ├── routes/
│ │ │ │ ├── click.route.ts
│ │ │ │ ├── impression.route.ts
│ │ │ │ └── health.route.ts
│ │ │ ├── services/
│ │ │ │ ├── click.service.ts
│ │ │ │ ├── redirect.service.ts
│ │ │ │ └── cap.service.ts
│ │ │ └── cache/
│ │ │ └── offer-cache.ts
│ │ ├── package.json
│ │ └── tsconfig.json
│ │
│ ├── conversion/ # Elysia — conversion endpoints
│ │ ├── src/
│ │ │ ├── index.ts
│ │ │ ├── routes/
│ │ │ │ ├── track.route.ts # POST /conversion/track (SDK)
│ │ │ │ ├── pixel.route.ts # GET /conversion/pixel
│ │ │ │ ├── postback.route.ts # GET /postback (S2S inbound)
│ │ │ │ └── health.route.ts
│ │ │ └── services/
│ │ │ ├── conversion.service.ts
│ │ │ └── dedup.service.ts
│ │ ├── package.json
│ │ └── tsconfig.json
│ │
│ ├── api/ # Elysia — CRUD + business logic
│ │ ├── src/
│ │ │ ├── index.ts
│ │ │ ├── modules/
│ │ │ │ ├── auth/
│ │ │ │ │ └── auth.routes.ts
│ │ │ │ ├── employees/
│ │ │ │ │ ├── employees.routes.ts
│ │ │ │ │ └── employees.service.ts
│ │ │ │ ├── advertisers/
│ │ │ │ │ ├── advertisers.routes.ts
│ │ │ │ │ └── advertisers.service.ts
│ │ │ │ ├── affiliates/
│ │ │ │ │ ├── affiliates.routes.ts
│ │ │ │ │ └── affiliates.service.ts
│ │ │ │ ├── offers/
│ │ │ │ │ ├── offers.routes.ts
│ │ │ │ │ ├── offers.service.ts
│ │ │ │ │ ├── landing-pages.routes.ts
│ │ │ │ │ └── offer-affiliates.routes.ts
│ │ │ │ ├── postbacks/
│ │ │ │ │ ├── postbacks.routes.ts
│ │ │ │ │ └── postbacks.service.ts
│ │ │ │ └── reports/
│ │ │ │ ├── reports.routes.ts
│ │ │ │ └── reports.service.ts
│ │ │ └── middleware/
│ │ │ ├── auth.middleware.ts
│ │ │ ├── role.middleware.ts
│ │ │ └── scope.middleware.ts # data scoping per role
│ │ ├── package.json
│ │ └── tsconfig.json
│ │
│ ├── dashboard/ # Next.js — frontend
│ │ ├── src/
│ │ │ ├── app/
│ │ │ │ ├── (auth)/
│ │ │ │ │ └── login/page.tsx
│ │ │ │ ├── (dashboard)/
│ │ │ │ │ ├── layout.tsx
│ │ │ │ │ ├── page.tsx # Overview
│ │ │ │ │ ├── offers/
│ │ │ │ │ │ ├── page.tsx # List
│ │ │ │ │ │ ├── create/page.tsx
│ │ │ │ │ │ └── [id]/
│ │ │ │ │ │ ├── page.tsx # Detail
│ │ │ │ │ │ ├── affiliates/page.tsx
│ │ │ │ │ │ └── settings/page.tsx
│ │ │ │ │ ├── affiliates/
│ │ │ │ │ │ ├── page.tsx
│ │ │ │ │ │ └── [id]/page.tsx
│ │ │ │ │ ├── advertisers/
│ │ │ │ │ │ ├── page.tsx
│ │ │ │ │ │ └── [id]/page.tsx
│ │ │ │ │ ├── employees/
│ │ │ │ │ │ ├── page.tsx
│ │ │ │ │ │ └── [id]/page.tsx
│ │ │ │ │ ├── reports/
│ │ │ │ │ │ ├── page.tsx
│ │ │ │ │ │ └── conversions/page.tsx
│ │ │ │ │ ├── postbacks/
│ │ │ │ │ │ └── page.tsx
│ │ │ │ │ └── settings/
│ │ │ │ │ └── page.tsx
│ │ │ │ └── api/ # BFF routes if needed
│ │ │ ├── components/
│ │ │ │ ├── layout/
│ │ │ │ │ ├── sidebar.tsx
│ │ │ │ │ ├── header.tsx
│ │ │ │ │ └── breadcrumb.tsx
│ │ │ │ ├── offers/
│ │ │ │ ├── affiliates/
│ │ │ │ ├── reports/
│ │ │ │ └── common/
│ │ │ │ ├── data-table.tsx
│ │ │ │ ├── stat-card.tsx
│ │ │ │ └── tracking-url-modal.tsx
│ │ │ ├── hooks/
│ │ │ ├── lib/
│ │ │ │ ├── api-client.ts
│ │ │ │ └── auth-client.ts
│ │ │ └── stores/
│ │ ├── public/
│ │ ├── next.config.ts
│ │ ├── middleware.ts # Route protection
│ │ ├── package.json
│ │ └── tsconfig.json
│ │
│ └── worker/ # Bun — background jobs
│ ├── src/
│ │ ├── index.ts
│ │ ├── processors/
│ │ │ ├── click.processor.ts
│ │ │ ├── conversion.processor.ts
│ │ │ ├── postback.processor.ts
│ │ │ └── cap-reset.processor.ts
│ │ └── utils/
│ │ ├── geo.ts
│ │ └── ua-parser.ts
│ ├── package.json
│ └── tsconfig.json
│
├── packages/
│ ├── database/ # Drizzle schema + client
│ │ ├── src/
│ │ │ ├── index.ts
│ │ │ ├── client.ts
│ │ │ ├── schema/
│ │ │ │ ├── index.ts
│ │ │ │ ├── auth.ts # Better Auth tables
│ │ │ │ ├── employees.ts
│ │ │ │ ├── permissions.ts
│ │ │ │ ├── advertisers.ts
│ │ │ │ ├── affiliates.ts
│ │ │ │ ├── offers.ts
│ │ │ │ ├── landing-pages.ts
│ │ │ │ ├── offer-affiliates.ts
│ │ │ │ ├── postback-urls.ts
│ │ │ │ └── tracking-domains.ts
│ │ │ ├── enums.ts
│ │ │ └── types.ts # Inferred types from schema
│ │ ├── drizzle/
│ │ │ └── migrations/
│ │ ├── scripts/
│ │ │ ├── seed.ts
│ │ │ ├── create-partitions.sql
│ │ │ └── migrate.ts
│ │ ├── drizzle.config.ts
│ │ ├── package.json
│ │ └── tsconfig.json
│ │
│ ├── auth/ # Better Auth config
│ │ ├── src/
│ │ │ ├── index.ts
│ │ │ ├── auth.ts # Better Auth instance
│ │ │ ├── permissions.ts # Permission definitions
│ │ │ └── types.ts
│ │ ├── package.json
│ │ └── tsconfig.json
│ │
│ ├── shared/ # Types, validators, constants
│ │ ├── src/
│ │ │ ├── index.ts
│ │ │ ├── types/
│ │ │ │ ├── offer.types.ts
│ │ │ │ ├── affiliate.types.ts
│ │ │ │ ├── click.types.ts
│ │ │ │ ├── conversion.types.ts
│ │ │ │ └── index.ts
│ │ │ ├── validators/
│ │ │ │ ├── offer.validator.ts
│ │ │ │ ├── affiliate.validator.ts
│ │ │ │ └── auth.validator.ts
│ │ │ ├── constants/
│ │ │ │ ├── roles.ts
│ │ │ │ ├── status.ts
│ │ │ │ └── events.ts
│ │ │ └── utils/
│ │ │ ├── url.ts
│ │ │ └── date.ts
│ │ ├── package.json
│ │ └── tsconfig.json
│ │
│ ├── sdk-web/ # Web SDK
│ │ ├── src/
│ │ │ ├── index.ts
│ │ │ ├── tracker.ts
│ │ │ ├── conversion.ts
│ │ │ ├── storage.ts
│ │ │ ├── transport.ts
│ │ │ └── types.ts
│ │ ├── rollup.config.mjs
│ │ ├── tests/
│ │ ├── package.json
│ │ └── tsconfig.json
│ │
│ ├── ui/ # Shared React components
│ │ ├── src/
│ │ │ ├── index.ts
│ │ │ └── components/
│ │ ├── package.json
│ │ └── tsconfig.json
│ │
│ └── config/ # Shared configs
│ ├── typescript/
│ │ ├── base.json
│ │ ├── bun.json
│ │ └── nextjs.json
│ ├── eslint/
│ │ └── base.js
│ └── package.json
│
├── infrastructure/
│ ├── docker/
│ │ └── docker-compose.dev.yml
│ └── scripts/
│ ├── create-partitions.sql
│ └── setup.sh
│
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
├── .env.example
├── .gitignore
└── README.md


### Package Dependency Graph

@adscrush/config ← no deps (leaf)
↑
@adscrush/shared ← depends on: config
↑
@adscrush/database ← depends on: shared
↑
@adscrush/auth ← depends on: database, shared
↑
┌───┼──────────┬────────────────┬───────────┐
│ │ │ │ │
api │ dashboard tracking conversion
│ │ │ │
│ ↑ │ │
│ @adscrush/ui │ │
│ │ │
└──────────────────────────┼───────────┘
│
worker

@adscrush/sdk-web ← STANDALONE (no internal deps)


### Package Scope

@adscrush/tracking apps/tracking
@adscrush/conversion apps/conversion
@adscrush/api apps/api
@adscrush/dashboard apps/dashboard
@adscrush/worker apps/worker
@adscrush/database packages/database
@adscrush/auth packages/auth
@adscrush/shared packages/shared
@adscrush/sdk-web packages/sdk-web
@adscrush/ui packages/ui
@adscrush/config packages/config


---

## 4. Roles & Access Model

### 4.1 Role Hierarchy

ADMIN
└── Full access to everything. Creates employees.
Only 1-2 people (founders/owners).

EMPLOYEE (internal team)
├── Assigned to specific affiliates and/or advertisers
├── Has a set of permissions (scalable permission system)
├── Can manage assigned entities (create offers, assign affiliates, etc.)
└── Cannot see unassigned entities

ADVERTISER (external — future portal)
├── Sees only their offers and related data
├── Can view reports scoped to their offers
└── For now: admin/employee manages on their behalf

AFFILIATE (external — future portal)
├── Sees only offers assigned to them
├── Can view their own clicks, conversions, reports
├── Can see their tracking URLs
└── For now: admin/employee manages on their behalf


### 4.2 Permission System (Simple but Scalable)

Permissions are stored as a simple key-value system. Each permission is a
string key. When we add new features later, we just add new permission keys.

PERMISSION KEY FORMAT:
{module}:{action}

INITIAL PERMISSIONS (MVP):

Offers
offers:view
offers:create
offers:edit
offers:delete
offers:manage_affiliates # assign/reject affiliates on offer

Affiliates
affiliates:view
affiliates:create
affiliates:edit

Advertisers
advertisers:view
advertisers:create
advertisers:edit

Reports
reports:view
reports:export

Postbacks
postbacks:view
postbacks:manage

Employees (admin only typically)
employees:view
employees:manage

Settings
settings:view
settings:edit


**How it scales:** When we add targeting, we add `offers:manage_targeting`.
When we add fraud detection, we add `fraud:view`, `fraud:manage`. When we add
billing, we add `billing:view`, `billing:manage`. No schema changes needed —
just insert new permission rows.

### 4.3 Data Scoping

Every API query goes through a scope filter:

ADMIN
→ No filter (sees everything)

EMPLOYEE
→ Affiliates: WHERE affiliate_id IN (employee's assigned affiliates)
→ Advertisers: WHERE advertiser_id IN (employee's assigned advertisers)
→ Offers: WHERE advertiser_id IN (employee's assigned advertisers)
→ Reports: scoped to assigned affiliates + advertisers

ADVERTISER (future)
→ WHERE advertiser_id = current_user.advertiser_id

AFFILIATE (future)
→ WHERE affiliate_id = current_user.affiliate_id
→ Offers: only where offer_affiliates.status = 'approved'


### 4.4 Onboarding Flow (Current)

MVP flow (admin-driven):

Admin/Employee creates Advertiser account (email + generated password)
Admin/Employee creates Affiliate account (email + generated password)
Optionally: "Send credentials to user" sends email
Advertiser/Affiliate can log in to their portal (future)
For now:

Admin/Employee does everything through the dashboard
Advertiser portal = Phase 2+
Affiliate portal = Phase 2+
But auth system supports their login from day 1


---

## 5. Database Schema

### 5.1 Entity Tables (Drizzle-managed)

┌──────────────────────────────────────────────────────────────┐
│ ENTITY TABLES │
├──────────────────────────────────────────────────────────────┤
│ │
│ ── AUTH (Better Auth managed) ── │
│ │
│ users │
│ ├── id varchar PK (Better Auth format) │
│ ├── name varchar │
│ ├── email varchar UNIQUE │
│ ├── email_verified boolean │
│ ├── image varchar │
│ ├── role varchar (admin|employee| │
│ │ advertiser|affiliate) │
│ ├── banned boolean │
│ ├── banned_reason varchar │
│ ├── created_at timestamp │
│ └── updated_at timestamp │
│ │
│ sessions (Better Auth managed) │
│ accounts (Better Auth managed) │
│ verifications (Better Auth managed) │
│ │
│ ── EMPLOYEES ── │
│ │
│ employees │
│ ├── id uuid PK │
│ ├── user_id varchar FK → users, UNIQUE │
│ ├── department varchar nullable │
│ ├── status varchar active|inactive|suspended │
│ ├── created_at timestamp │
│ └── updated_at timestamp │
│ │
│ employee_permissions │
│ ├── id uuid PK │
│ ├── employee_id uuid FK → employees │
│ ├── permission varchar e.g. "offers:create" │
│ ├── granted boolean default true │
│ └── created_at timestamp │
│ UNIQUE(employee_id, permission) │
│ │
│ employee_affiliate_access │
│ ├── employee_id uuid FK → employees │
│ ├── affiliate_id uuid FK → affiliates │
│ PRIMARY KEY (employee_id, affiliate_id) │
│ │
│ employee_advertiser_access │
│ ├── employee_id uuid FK → employees │
│ ├── advertiser_id uuid FK → advertisers │
│ PRIMARY KEY (employee_id, advertiser_id) │
│ │
│ ── ADVERTISERS ── │
│ │
│ advertisers │
│ ├── id uuid PK │
│ ├── user_id varchar FK → users, UNIQUE │
│ ├── company_name varchar │
│ ├── website varchar nullable │
│ ├── account_manager_id uuid FK → employees, nullable │
│ ├── country varchar nullable │
│ ├── status varchar active|inactive|pending │
│ ├── created_at timestamp │
│ └── updated_at timestamp │
│ │
│ ── AFFILIATES ── │
│ │
│ affiliates │
│ ├── id uuid PK │
│ ├── user_id varchar FK → users, UNIQUE │
│ ├── company_name varchar nullable │
│ ├── phone varchar nullable │
│ ├── traffic_sources text nullable │
│ ├── account_manager_id uuid FK → employees, nullable │
│ ├── payment_method varchar nullable │
│ ├── payment_details jsonb nullable │
│ ├── country varchar nullable │
│ ├── status varchar active|pending|suspended │
│ ├── created_at timestamp │
│ └── updated_at timestamp │
│ │
│ ── OFFERS ── │
│ │
│ offers │
│ ├── id uuid PK │
│ ├── advertiser_id uuid FK → advertisers │
│ ├── name varchar │
│ ├── description text nullable │
│ ├── preview_url varchar nullable │
│ ├── status varchar active|paused|pending| │
│ │ expired|archived │
│ │ │
│ │ ── Payout ── │
│ ├── payout_type varchar CPA|CPC|CPL|CPS │
│ ├── default_payout decimal(10,4) │
│ ├── default_revenue decimal(10,4) nullable │
│ ├── currency varchar(3) default 'USD' │
│ │ │
│ │ ── Capping ── │
│ ├── cap_daily int nullable │
│ ├── cap_total int nullable │
│ │ │
│ │ ── Conversion settings ── │
│ ├── allow_multi_conversion boolean default false │
│ ├── conversion_hold_period int default 0 (days) │
│ │ │
│ │ ── Fallback ── │
│ ├── fallback_url varchar nullable │
│ ├── fallback_offer_id uuid FK → offers, nullable │
│ │ │
│ │ ── Integration ── │
│ ├── postback_type varchar pixel|s2s|iframe │
│ │ │
│ │ ── Schedule ── │
│ ├── start_date timestamp nullable │
│ ├── end_date timestamp nullable │
│ ├── created_at timestamp │
│ └── updated_at timestamp │
│ │
│ ── LANDING PAGES ── │
│ │
│ landing_pages │
│ ├── id uuid PK │
│ ├── offer_id uuid FK → offers │
│ ├── name varchar │
│ ├── url varchar │
│ ├── weight int default 1 │
│ ├── status varchar active|inactive │
│ └── created_at timestamp │
│ │
│ ── OFFER ↔ AFFILIATE ── │
│ │
│ offer_affiliates │
│ ├── id uuid PK │
│ ├── offer_id uuid FK → offers │
│ ├── affiliate_id uuid FK → affiliates │
│ ├── status varchar pending|approved|rejected │
│ ├── custom_payout decimal nullable │
│ ├── custom_revenue decimal nullable │
│ ├── approved_at timestamp nullable │
│ ├── approved_by varchar FK → users, nullable │
│ └── created_at timestamp │
│ UNIQUE(offer_id, affiliate_id) │
│ │
│ ── POSTBACK URLs ── │
│ │
│ postback_urls │
│ ├── id uuid PK │
│ ├── affiliate_id uuid FK → affiliates │
│ ├── offer_id uuid FK → offers, nullable │
│ │ (null = global for aff) │
│ ├── url text (with macros) │
│ ├── method varchar GET|POST │
│ ├── events jsonb nullable │
│ ├── status varchar active|inactive │
│ └── created_at timestamp │
│ │
│ ── TRACKING DOMAINS ── │
│ │
│ tracking_domains │
│ ├── id uuid PK │
│ ├── domain varchar UNIQUE │
│ ├── advertiser_id uuid FK → advertisers, nullable│
│ ├── ssl_enabled boolean default true │
│ ├── dns_verified boolean default false │
│ └── created_at timestamp │
│ │
└──────────────────────────────────────────────────────────────┘


### 5.2 High-Volume Tables (Raw SQL, Partitioned)

┌──────────────────────────────────────────────────────────────┐
│ PARTITIONED TABLES (Monthly) │
├──────────────────────────────────────────────────────────────┤
│ │
│ clicks │
│ ├── id bigserial │
│ ├── click_id uuid NOT NULL (UUID v7) │
│ ├── offer_id uuid NOT NULL │
│ ├── affiliate_id uuid NOT NULL │
│ ├── advertiser_id uuid NOT NULL │
│ ├── landing_page_id uuid nullable │
│ │ │
│ │ ── Request data ── │
│ ├── ip_address inet │
│ ├── user_agent text │
│ ├── referer text │
│ │ │
│ │ ── Geo (enriched by worker) ── │
│ ├── country_code varchar(2) │
│ ├── region varchar(100) │
│ ├── city varchar(100) │
│ │ │
│ │ ── Device (parsed by worker) ── │
│ ├── device_type varchar(20) │
│ ├── os varchar(50) │
│ ├── os_version varchar(20) │
│ ├── browser varchar(50) │
│ ├── browser_version varchar(20) │
│ │ │
│ │ ── Sub params (from affiliate) ── │
│ ├── aff_click_id varchar(255) │
│ ├── sub_aff_id varchar(255) │
│ ├── aff_sub1 - aff_sub10 varchar(255) each │
│ ├── source varchar(255) │
│ │ │
│ │ ── Flags ── │
│ ├── is_unique boolean default true │
│ ├── is_bot boolean default false │
│ │ │
│ ├── redirect_url text │
│ ├── created_at timestamptz NOT NULL │
│ │ │
│ PRIMARY KEY (id, created_at) │
│ PARTITION BY RANGE (created_at) │
│ INDEX: click_id, offer_id+created_at, │
│ affiliate_id+created_at, country_code │
│ │
│ ───────────────────────────────────────────── │
│ │
│ conversions │
│ ├── id bigserial │
│ ├── conversion_id uuid NOT NULL (UUID v7) │
│ ├── click_id uuid NOT NULL │
│ ├── offer_id uuid NOT NULL │
│ ├── affiliate_id uuid NOT NULL │
│ ├── advertiser_id uuid NOT NULL │
│ │ │
│ │ ── Conversion data ── │
│ ├── event varchar(100) default 'conversion' │
│ ├── payout decimal(10,4) │
│ ├── revenue decimal(10,4) │
│ ├── sale_amount decimal(10,4) │
│ ├── currency varchar(3) │
│ ├── status varchar(20) approved|pending| │
│ │ rejected|hold │
│ │ │
│ │ ── Advertiser sub params ── │
│ ├── adv_sub1 - adv_sub5 varchar(255) each │
│ │ │
│ │ ── Meta ── │
│ ├── ip_address inet │
│ ├── user_agent text │
│ ├── conversion_type varchar(20) sdk|pixel|s2s|iframe │
│ ├── is_duplicate boolean default false │
│ ├── postback_sent boolean default false │
│ ├── postback_sent_at timestamptz │
│ ├── created_at timestamptz NOT NULL │
│ │ │
│ PRIMARY KEY (id, created_at) │
│ PARTITION BY RANGE (created_at) │
│ INDEX: click_id, offer_id+created_at, │
│ affiliate_id+created_at, status │
│ │
│ ───────────────────────────────────────────── │
│ │
│ postback_logs │
│ ├── id bigserial PK │
│ ├── conversion_id uuid │
│ ├── postback_url_id uuid │
│ ├── affiliate_id uuid │
│ ├── request_url text │
│ ├── response_code int │
│ ├── response_body text │
│ ├── status varchar pending|success|failed │
│ ├── attempts int default 0 │
│ ├── last_attempt_at timestamptz │
│ └── created_at timestamptz │
│ │
└──────────────────────────────────────────────────────────────┘


### 5.3 Redis Key Schema

Offer cache (hot path — used during click redirect)
offer:{offer_id} → JSON TTL: 5min
lps:{offer_id} → JSON TTL: 5min
aff_approval:{offer_id}:{affiliate_id} → JSON TTL: 5min

Click data (for conversion lookup)
click:{click_id} → JSON TTL: 30d

Cap counters
cap:daily:{offer_id}:{YYYY-MM-DD} → INT TTL: 25h
cap:total:{offer_id} → INT no TTL

Deduplication
conv:dedup:{click_id}:{event} → "1" TTL: 30d


---

## 6. Core Features (MVP)

### 6.1 Authentication & User Management

AUTH-01 Employee login (email + password) P0
AUTH-02 Admin can create employee accounts P0
AUTH-03 Admin can create advertiser accounts P0
AUTH-04 Admin can create affiliate accounts P0
AUTH-05 "Generate password" button on create forms P0
AUTH-06 Role stored on user (admin|employee|advertiser|aff) P0
AUTH-07 Session-based auth via Better Auth P0
AUTH-08 Next.js middleware protects dashboard routes P0
AUTH-09 Elysia middleware protects API routes P0
AUTH-10 Advertiser/affiliate can log in (basic portal) P1
AUTH-11 Password reset P1
AUTH-12 Email verification P2


### 6.2 Employee Management

EMP-01 CRUD employees (admin only) P0
EMP-02 Assign affiliates to employee P0
EMP-03 Assign advertisers to employee P0
EMP-04 Permission system (key-value, see 4.2) P0
EMP-05 Employee sees only assigned affiliates/advertisers P0
EMP-06 Employee list page with status P0
EMP-07 Employee detail page (profile + assignments) P0
EMP-08 Permission presets (Full, Read-Only, Custom) P1
EMP-09 Clone permissions from another employee P2


### 6.3 Advertiser Management
ADV-01 Create advertiser (name, email, password, company) P0
ADV-02 Assign account manager (employee) P0
ADV-03 Advertiser list page (searchable, filterable) P0
ADV-04 Advertiser detail page P0
ADV-05 Advertiser status (active/inactive/pending) P0
ADV-06 Edit advertiser profile P0
ADV-07 "Send credentials to user" toggle on create P1


### 6.4 Affiliate Management

AFF-01 Create affiliate (name, email, password, company) P0
AFF-02 Assign account manager (employee) P0
AFF-03 Affiliate list page (searchable, filterable) P0
AFF-04 Affiliate detail page P0
AFF-05 Affiliate status (active/pending/suspended) P0
AFF-06 Pending affiliates view P0
AFF-07 Edit affiliate profile P0
AFF-08 "Send credentials to user" toggle on create P1
AFF-09 Affiliate postback URL management P0


### 6.5 Offer Management

OFR-01 Create offer (name, advertiser, payout type, amounts) P0
OFR-02 Offer status management P0
OFR-03 Multiple landing pages per offer P0
OFR-04 Landing page weight for rotation P0
OFR-05 Named landing page mode (random, lp1, lp2, lp3...) P0
OFR-06 Offer list page (with filters: status, advertiser) P0
OFR-07 Offer detail page (tabbed: Home, General, Affiliates) P0
OFR-08 Manage affiliates tab (assign/reject, bulk actions) P0
OFR-09 Daily cap + total cap P0
OFR-10 Fallback URL or fallback offer when cap hit P1
OFR-11 Offer scheduling (start/end dates) P1
OFR-12 Allow multi-conversion toggle P0
OFR-13 Conversion hold period P1
OFR-14 Postback type setting (pixel/s2s/iframe) P0
OFR-15 Custom payout per affiliate per offer P0


### 6.6 Tracking URL Generator
TRK-01 Modal: select offer + affiliate → generate URL P0
TRK-02 Click URL with all parameters P0
TRK-03 Landing page mode selector (Random, lp1, lp2...) P0
TRK-04 Sub-parameter toggles (aff_click_id, sub_aff_id, P0
aff_sub1-10, source)
TRK-05 Copy-to-clipboard button P0
TRK-06 Show multiple URLs if multiple landing pages P0
TRK-07 Impression URL toggle P1
TRK-08 QR Code toggle P2


### 6.7 Click Tracking
CLK-01 GET /c endpoint — click tracking with 302 redirect P0
CLK-02 Generate click_id (UUID v7) P0
CLK-03 Validate offer active + affiliate approved P0
CLK-04 Check daily/total caps P0
CLK-05 Weighted landing page rotation P0
CLK-06 Named landing page selection (?mo=lp2) P0
CLK-07 Store click_id in Redis (30d TTL) P0
CLK-08 Queue click for async DB write P0
CLK-09 Capture: IP, UA, Referer, all sub params P0
CLK-10 Async enrichment: GeoIP + UA parsing (in worker) P0
CLK-11 Uniqueness detection (same IP + offer in 24h) P1
CLK-12 Response time < 20ms (p99) P0
CLK-13 GET /i endpoint — impression tracking (1x1 pixel) P1


### 6.8 Conversion Tracking
CNV-01 POST /conversion/track (SDK) P0
CNV-02 GET /conversion/pixel (1x1 image) P0
CNV-03 GET /postback (S2S inbound) P0
CNV-04 click_id-based attribution P0
CNV-05 Deduplication (same click_id + event) P0
CNV-06 Allow multi-conversion per offer setting P0
CNV-07 Custom events (purchase, lead, install, etc.) P0
CNV-08 Payout/revenue/sale amount tracking P0
CNV-09 Advertiser sub-params (adv_sub1-5) P0
CNV-10 Conversion status (approved, pending, rejected, hold) P0
CNV-11 Queue conversion for async DB write P0
CNV-12 Response time < 50ms P0


### 6.9 Web SDK
SDK-01 initializeUrlParam(paramName) — capture click_id P0
SDK-02 Persist click_id in cookie + localStorage P0
SDK-03 Configurable cookie domain and expiry P0
SDK-04 trackConversion(config) — fire conversion P0
SDK-05 Support postbackType: api, pixel, iframe P0
SDK-06 Client-side dedup check P1
SDK-07 Zero dependencies, <5KB gzipped P0
SDK-08 UMD + ESM + IIFE builds P0
SDK-09 Debug mode P1
SDK-10 Never break host page (all errors caught) P0
SDK-11 Auto-generated integration snippets in dashboard P0


### 6.10 Postback System
PBK-01 CRUD postback URLs per affiliate P0
PBK-02 Global (all offers) or per-offer postback P0
PBK-03 Macro replacement ({click_id}, {payout}, {aff_click_id},P0
{sub1}-{sub10}, {offer_id}, {event}, etc.)
PBK-04 Async postback firing (via worker queue) P0
PBK-05 Retry with exponential backoff (max 5 attempts) P0
PBK-06 Postback log (URL, response code, status, attempts) P0
PBK-07 Postback log viewer in dashboard P0
PBK-08 Manual re-fire from dashboard P1


### 6.11 Reports
RPT-01 Dashboard overview page (MTD stats with sparklines) P0
RPT-02 Stats: clicks, conversions, revenue, payout, profit P0
RPT-03 Performance report — group by: date, offer, affiliate P0
RPT-04 Date range filter P0
RPT-05 Filter by offer, affiliate, advertiser, status P0
RPT-06 Conversion log (raw data, paginated, filterable) P0
RPT-07 Metrics: CR, EPC in reports P0
RPT-08 Click log P1
RPT-09 Postback log P0
RPT-10 CSV export P1
RPT-11 Scoped reports per role (see section 4.3) P0
RPT-12 Report query < 500ms for 30-day range P0


---

## 7. System Architecture

### 7.1 Request Flow
AFFILIATE CLICK FLOW:
─────────────────────

Affiliate shares:
https://track.adscrush.com/c?o={offer_id}&m={merchant_id}&a={affiliate_id}
&aff_click_id={replace_it}&sub_aff_id={replace_it}&mo=r

→ Elysia tracking server receives GET /c
→ Validates: offer active? affiliate approved? cap ok?
→ Generates click_id (UUID v7)
→ Selects landing page (weighted random or named)
→ Stores click_id + metadata in Redis (30d TTL)
→ Queues click data to BullMQ
→ Increments cap counters in Redis
→ 302 redirect → landing_page_url?click_id=xxx
→ Total time: < 20ms

SDK INIT (all pages on advertiser site):
────────────────────────────────────────

→ SDK reads click_id from URL param
→ Stores in cookie + localStorage
→ Done. No network call.

CONVERSION (thank you page):
────────────────────────────

→ SDK retrieves click_id from cookie/localStorage
→ POST to conversion server with click_id + event data
→ Conversion server looks up click from Redis
→ Validates: not duplicate, offer allows conversion
→ Queues conversion to BullMQ
→ Returns 200 OK
→ Total time: < 50ms

WORKER (async background):
──────────────────────────

Click processor:
→ Reads from click queue
→ GeoIP lookup (MaxMind local DB)
→ UA parsing (ua-parser-js or similar)
→ Uniqueness check (same IP + offer in 24h)
→ Writes to PostgreSQL clicks table

Conversion processor:
→ Reads from conversion queue
→ Writes to PostgreSQL conversions table
→ Queues postback job

Postback processor:
→ Reads from postback queue
→ Looks up affiliate's postback URLs
→ Replaces macros in URL template
→ Fires HTTP request to affiliate's server
→ Logs result in postback_logs
→ On failure: retries with exponential backoff


### 7.2 Service Communication
┌─────────────────────────────────────────────────────────────┐
│ │
│ Dashboard (Next.js) │
│ │ │
│ │ → API calls to Elysia API server │
│ │ → Auth via Better Auth (session cookie) │
│ │ │
│ ├── Reads: All entity CRUD, reports │
│ └── Writes: Create/update entities, change statuses │
│ │
│ │
│ API (Elysia) │
│ │ │
│ │ → Direct DB access via @adscrush/database │
│ │ → Redis for cache invalidation │
│ │ → Auth middleware validates session │
│ │ → Scope middleware filters data by role │
│ │ │
│ ├── Reads: PostgreSQL (entity tables) │
│ └── Writes: PostgreSQL (entity tables) │
│ │
│ │
│ Tracking Server (Elysia) │
│ │ │
│ │ → Redis for offer/affiliate cache + click storage │
│ │ → BullMQ to queue click events │
│ │ → NO direct DB writes in hot path │
│ │ │
│ ├── Reads: Redis cache (offer, affiliate, landing pages) │
│ └── Writes: Redis (click_id cache) + BullMQ (click event) │
│ │
│ │
│ Conversion Server (Elysia) │
│ │ │
│ │ → Redis for click lookup + dedup │
│ │ → BullMQ to queue conversion events │
│ │ → NO direct DB writes in hot path │
│ │ │
│ ├── Reads: Redis (click data, dedup flag) │
│ └── Writes: Redis (dedup flag) + BullMQ (conv event) │
│ │
│ │
│ Worker (Bun) │
│ │ │
│ │ → Consumes from BullMQ │
│ │ → Direct DB writes via raw SQL (pg driver) │
│ │ → Fires outbound HTTP for postbacks │
│ │ │
│ ├── Reads: BullMQ queues + PostgreSQL │
│ └── Writes: PostgreSQL (clicks, conversions, postback_logs)│
│ │
└─────────────────────────────────────────────────────────────┘


---

## 8. API Design

### 8.1 Auth Endpoints
POST /api/auth/sign-in → email + password login
POST /api/auth/sign-out → logout
GET /api/auth/session → get current session
POST /api/auth/forget-password → send reset email (P1)
POST /api/auth/reset-password → reset with token (P1)


### 8.2 Employee Endpoints (admin only)
GET /api/employees → list employees
POST /api/employees → create employee
GET /api/employees/:id → get employee detail
PUT /api/employees/:id → update employee
DELETE /api/employees/:id → deactivate employee

GET /api/employees/:id/permissions → get permissions
PUT /api/employees/:id/permissions → set permissions

GET /api/employees/:id/affiliates → get assigned affiliates
PUT /api/employees/:id/affiliates → set assigned affiliates

GET /api/employees/:id/advertisers → get assigned advertisers
PUT /api/employees/:id/advertisers → set assigned advertisers


### 8.3 Advertiser Endpoints
GET /api/advertisers → list (scoped by role)
POST /api/advertisers → create (admin/employee)
GET /api/advertisers/:id → detail
PUT /api/advertisers/:id → update


### 8.4 Affiliate Endpoints
GET /api/affiliates → list (scoped by role)
POST /api/affiliates → create (admin/employee)
GET /api/affiliates/:id → detail
PUT /api/affiliates/:id → update
GET /api/affiliates/pending → pending affiliates


### 8.5 Offer Endpoints
GET /api/offers → list (scoped by role)
POST /api/offers → create
GET /api/offers/:id → detail
PUT /api/offers/:id → update
DELETE /api/offers/:id → archive offer

Landing Pages
GET /api/offers/:id/landing-pages → list
POST /api/offers/:id/landing-pages → create
PUT /api/offers/:id/landing-pages/:lpId → update
DELETE /api/offers/:id/landing-pages/:lpId → delete

Offer Affiliates
GET /api/offers/:id/affiliates → list assigned affiliates
POST /api/offers/:id/affiliates/assign → assign affiliate(s)
POST /api/offers/:id/affiliates/reject → reject affiliate(s)
POST /api/offers/:id/affiliates/bulk → bulk assign/reject
PUT /api/offers/:id/affiliates/:affId → update (custom payout)

Tracking URL
GET /api/offers/:id/tracking-url → generate tracking URL
?affiliate_id=X&mode=random&params[]=aff_click_id&params[]=sub_aff_id


### 8.6 Postback Endpoints
GET /api/postback-urls → list (scoped)
POST /api/postback-urls → create
PUT /api/postback-urls/:id → update
DELETE /api/postback-urls/:id → delete

GET /api/postback-logs → list logs (filterable)
POST /api/postback-logs/:id/retry → manual re-fire


### 8.7 Report Endpoints
GET /api/reports/overview → dashboard stats (MTD)
GET /api/reports/performance → grouped report
?date_from=X&date_to=X&group_by=date,offer&offer_id=X&affiliate_id=X
GET /api/reports/clicks → click log (paginated)
GET /api/reports/conversions → conversion log (paginated)
GET /api/reports/export → CSV download (P1)


### 8.9 Tracking Endpoints (public, no auth)
GET /c → click redirect
?o={offer_id}&m={merchant_id}&a={affiliate_id}
&aff_click_id=X&sub_aff_id=X&aff_sub1=X...&mo=r

GET /s → smart link redirect
?sl={smart_link_id}&a={affiliate_id}&...

GET /i → impression pixel (P1)
?o={offer_id}&a={affiliate_id}


### 8.10 Conversion Endpoints (public, no user auth)

POST /conversion/track → SDK conversion (JSON body)
GET /conversion/pixel → pixel tracking (1x1 gif)
GET /postback → S2S inbound postback



---

## 9. Dashboard Pages

### 9.1 Sidebar Navigation
ADMIN/EMPLOYEE VIEW:
──────────────────────────
📊 Dashboard → /
📋 Offers
├── All Offers → /offers
├── Create Offer → /offers/create
└── Approve Requests → /offers/requests
👥 Affiliates
├── All Affiliates → /affiliates
└── Pending → /affiliates/pending
🏢 Advertisers → /advertisers
📈 Reports
├── Performance Report → /reports
├── Conversion Logs → /reports/conversions
└── Postback Logs → /reports/postbacks
🔗 Smart Links → /smart-links
👤 Employees (admin only) → /employees
⚙️ Settings → /settings

AFFILIATE VIEW (future):
──────────────────────────
📊 Dashboard → /
📋 My Offers → /offers
📈 Reports → /reports
🔗 My Smart Links → /smart-links
🔔 Postback URLs → /postbacks
👤 Profile → /profile

ADVERTISER VIEW (future):
──────────────────────────
📊 Dashboard → /
📋 My Offers → /offers
📈 Reports → /reports
🔌 Integration / SDK → /integration
👤 Profile → /profile


### 9.2 Page Specifications
DASHBOARD OVERVIEW (/)
──────────────────────
Top row: MTD stat cards with sparkline charts
├── Clicks (MTD)
├── Conversions (MTD)
├── Revenue (MTD)
├── Payout (MTD)
├── Profit (MTD)
└── CR% (MTD)

Below: Daily trend chart (last 30 days)
Below: Top 5 offers table (by conversions)
Below: Recent conversions list

OFFERS LIST (/offers)
─────────────────────
Top: "Create Offer" button + search bar + filters
Filters: Status, Advertiser, Date range
Table columns: OfferID, Name, Advertiser, Status, Clicks,
Conversions, Payout, Revenue, Actions
Actions: Edit, View Affiliates, Tracking URL, Pause/Activate

OFFER DETAIL (/offers/:id)
──────────────────────────
Tab: HOME
├── Offer stats (clicks, conversions, CR, payout)
├── Quick info card
└── Recent conversions

Tab: GENERAL
├── Name, Description, Preview URL
├── Advertiser (read-only, set on create)
├── Payout type + default payout + revenue
├── Currency
├── Daily cap + Total cap
├── Conversion settings (multi-conv, hold period)
├── Postback type
├── Fallback URL / Fallback offer
├── Start date / End date
└── Status

Tab: LANDING PAGES
├── List of landing pages (name, URL, weight, status)
├── Add landing page
├── Edit/delete landing page
└── Weight explanation

Tab: AFFILIATES
├── Assigned affiliates list (search + filter)
├── Unassigned affiliates (with Assign/Reject buttons)
├── Bulk Assign All / Reject All
├── Custom payout per affiliate
├── Stats sidebar: Total, Pending, Approved, Rejected
└── "Send Alert to Affiliate" checkbox

Tab: INTEGRATION
├── SDK code snippets (auto-generated for this offer)
│ ├── Header snippet (all pages)
│ └── Thank you page snippet
├── S2S postback URL format
└── Copy buttons

TRACKING URL MODAL (accessible from offer detail + affiliate detail)
────────────────────────────────────────────────────────────────────
├── Select Offer (searchable dropdown)
├── Select Affiliate (searchable dropdown)
├── Landing Page mode: Random | lp1 | lp2 | lp3...
├── Generated Click URL (with copy button)
├── Toggle: sub parameters
│ ├── ☑ aff_click_id {replace_it}
│ ├── ☑ sub_aff_id {replace_it}
│ ├── ☐ aff_sub1 - aff_sub10
│ ├── ☐ source
│ └── Each has editable default value field
└── If multiple landing pages: show URL for each

AFFILIATES LIST (/affiliates)
─────────────────────────────
Top: "Add Affiliate" button + Search + Filter
Columns: AffiliateID, Name, Email, Contact, Company,
Country, Manager, Status, Options
Actions: Edit, View Detail, View Postback

CREATE AFFILIATE MODAL
──────────────────────
├── First Name + Last Name
├── Company (Brand)
├── Email
├── Password + "Generate Password" button
├── Account Manager (dropdown, select employee)
├── Status (dropdown)
└── ☑ Send Credentials to User

AFFILIATE DETAIL (/affiliates/:id)
───────────────────────────────────
├── Profile info (name, email, company, contact, status)
├── Assigned offers table
├── Performance stats
├── Postback URLs
└── Recent conversions

ADVERTISERS LIST (/advertisers)
───────────────────────────────
Same pattern as affiliates list
Columns: AdvID, Name, Email, Company, Country, Manager, Status

CREATE ADVERTISER MODAL
───────────────────────
Same fields as affiliate creation

REPORTS (/reports)
──────────────────
Top: Report type tabs (Basic, Offer, Affiliate, Country)
Date range picker
Results count selector (Show 20/50/100)
Filter button → advanced filters panel
Submit button

Stats cards row (same as dashboard but for selected period)

Report table (columns vary by report type):
├── Basic: Date, Clicks, Conversions, Revenue, Payout, Profit, CR
├── Offer: OfferID, Offer Name, Clicks, Conv, Revenue, Payout
├── Affiliate: AffID, Aff Name, Clicks, Conv, Revenue, Payout
└── Country: Country, Clicks, Conv, Revenue, Payout

CONVERSION LOGS (/reports/conversions)
──────────────────────────────────────
Columns: ConvID, ClickID, Offer, Affiliate, Event, Payout,
Revenue, Sale, Status, Type, Created
Filters: Date range, Offer, Affiliate, Status, Event
Actions: Approve/Reject (if status is hold/pending)

EMPLOYEES (/employees) — admin only
────────────────────────────────────
List: EmployeeID, Name, Email, Department, Status
Detail page:
├── Profile info
├── Assigned Affiliates (multi-select tag chips)
├── Assigned Advertisers (multi-select tag chips)
└── Permissions
├── Preset selector (Full Access / Read Only / Custom)
├── Permission categories (expandable sections)
└── Individual permission checkboxes


---

## 10. SDK Specification

### 10.1 Integration Code (Auto-Generated)

Header (all pages):
```html
<script src="https://cdn.adscrush.com/sdk/v1/tracker.min.js"></script>
<script>
    window.AdscrushSDK.initializeUrlParam('click_id');
</script>
```

Thank you page:

```html
<script src="https://cdn.adscrush.com/sdk/v1/tracker.min.js"></script>
<script>
    window.AdscrushSDK.trackConversion({
        domain: 'conv.adscrush.com',
        accountId: '{auto_filled}',
        offerId: '{auto_filled}',
        postbackType: 'api',
        allowMultiConversion: false,
        conversionData: {
            event: 'purchase',
            payout: '',
            sale: '',
            currency: 'USD',
            adv_sub1: '',
            adv_sub2: '',
            adv_sub3: '',
            adv_sub4: '',
            adv_sub5: '',
        }
    });
</script>
```

10.2 SDK Behavior

initializeUrlParam(paramName):
  1. Read paramName from current URL query string
  2. If found:
     → Store in cookie (_ac_cid, 30 days, configurable domain)
     → Store in localStorage (_ac_cid)
  3. If not found:
     → Try to recover from cookie
     → Try to recover from localStorage
  4. Store in memory for trackConversion call

trackConversion(config):
  1. Get click_id from memory / cookie / localStorage
  2. Client-side dedup check (localStorage flag)
  3. Fire conversion via configured method:
     → 'api':    POST to domain/conversion/track
     → 'pixel':  Image request to domain/conversion/pixel
     → 'iframe': Hidden iframe to domain/conversion/iframe
  4. Mark conversion as sent (localStorage)
  5. Return promise with result
  6. All errors caught — never breaks host page


# 10.3 Build Output

packages/sdk-web/dist/
├── tracker.js           ← IIFE (for <script> tag)
├── tracker.min.js       ← IIFE minified (<5KB gzipped)
├── tracker.esm.js       ← ESM (for bundlers)
├── tracker.cjs.js       ← CommonJS (for Node)
└── types/
    └── index.d.ts       ← TypeScript declarations