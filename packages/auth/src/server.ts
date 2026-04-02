import * as schema from "@adscrush/db/schema"
import { ALL_ROLES, Role } from "@adscrush/shared/constants"
import type { BetterAuthOptions } from "better-auth"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { magicLink, openAPI } from "better-auth/plugins"
import { randomInt } from "node:crypto"
import type nodemailer from "nodemailer"

export interface AuthConfig {
  db: Parameters<typeof drizzleAdapter>[0]  // drizzle instance type
  baseURL: string
  basePath: string
  secret: string
  trustedOrigins?: string[]
  cookieDomain?: string
  transporter: nodemailer.Transporter
  mailOptions: nodemailer.SendMailOptions
}


export function createAuth(config: AuthConfig) {
  const baseURL =
    config.baseURL ?? process.env["BETTER_AUTH_URL"] ?? "http://localhost:8989"
  const cookieDomain = config.cookieDomain ?? process.env["COOKIE_DOMAIN"] ?? ".adscrush.local"

  const transporter = config.transporter
  return betterAuth({

    // ── Core ──────────────────────────────────
    baseURL,
    secret: config.secret ?? process.env["BETTER_AUTH_SECRET"] ?? "please-change-this-secret",
    basePath: config.basePath,

    trustedOrigins: config.trustedOrigins ?? [
      process.env["DASHBOARD_URL"] ?? "http://localhost:3000",
      "http://localhost:3000",
      "http://localhost:8989",
      "https://app.adscrush.local",
      "https://api.adscrush.local",
    ],

    // ── Advance ───────────────────────────────
    advanced: {
      database: {
        // generateId: false,

      },
      crossSubDomainCookies: {
        enabled: true,
        "domain": cookieDomain

      }
    },
    // ── Database ──────────────────────────────
    database: drizzleAdapter(config.db, {
      provider: "pg",
      schema: {
        user: schema.users,
        session: schema.sessions,
        account: schema.accounts,
        verification: schema.verifications,
      },
    }),
    // ── User ──────────────────────────────────
    user: {
      additionalFields: {
        role: {
          type: [...ALL_ROLES],
          defaultValue: "employee" satisfies Role,
          input: false,
        },
      },
    },

    // ── Session ───────────────────────────────
    session: {
      expiresIn: 30 * 24 * 60 * 60,  // 30 days
      updateAge: 24 * 60 * 60,        // update session every 24h
      cookieCache: {
        enabled: true,
        maxAge: 24 * 60 * 60,  // increase to 24h
      },
      additionalFields: {
        role: {
          type: [...ALL_ROLES],
          defaultValue: "employee" satisfies Role,
          input: false,
        },
      }
    },

    // ── Email + Password ──────────────────────
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
    },

    logger: {
      log(level, message, ...args) {
        console.log(level, message, ...args)
      },
      level: "debug",
    },

    // ── Plugins ───────────────────────────────

    plugins: [

       magicLink({
            expiresIn: 15 * 60 * 1000,
            disableSignUp: true,
            generateToken: async () => {
                const letters = 'abcdefghijklmnopqrstuvwxyz';
                const getRandomLetter = () => letters[randomInt(0, 26)]!;
                const prefix = getRandomLetter() + getRandomLetter();
                const part1 = randomInt(100, 1000); // 100-999
                const part2 = randomInt(1000, 10000); // 1000-9999
                const suffix = getRandomLetter();
                return `${prefix}${part1}-${part2}${suffix}`;
            },
            sendMagicLink: async ({ email, url, token }) => {
                // TODO: Import render and MagicLinkEmail if needed.
                // For now, providing a simple text fallback to avoid errors.
                // const html = await render(MagicLinkEmail({ url, token }));

                await transporter.sendMail({
                    from: process.env["SMTP_FROM"] ?? "noreply@adscrush.local",
                    to: email,
                    subject: "Sign in to Adscrush",
                    text: `Sign in to Adscrush by clicking here: ${url}\n\nYour code: ${token}`,
                });
            }
        }),
      openAPI(),
    ],

  } satisfies BetterAuthOptions)
}

export type Auth = ReturnType<typeof createAuth>
