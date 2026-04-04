import {
  users,
  sessions,
  accounts,
  verifications,
} from "@adscrush/db/schema/auth"
import { MagicLinkEmail, PasswordResetEmail, render } from "@adscrush/email"
import { ROLES } from "@adscrush/shared/constants/roles"
import type { BetterAuthOptions } from "better-auth"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { magicLink, openAPI } from "better-auth/plugins"
import { randomInt } from "node:crypto"
import nodemailer from "nodemailer"

const ALL_ROLES = Object.values(ROLES)
type Role = (typeof ROLES)[keyof typeof ROLES]

export interface AuthConfig {
  db: Parameters<typeof drizzleAdapter>[0]
  secret?: string
  port?: number
}

export function createAuth(config: AuthConfig) {
  const nodeEnv = process.env.NODE_ENV ?? "development"
  const isProd = nodeEnv === "production"
  const isDev = nodeEnv === "development"

  const port = config.port ?? 9999

  const baseURL = isProd
    ? "https://api.adscrush.com"
    : isDev
      ? "http://localhost:9999"
      : `http://localhost:${port}`

  const appURL = isProd
    ? "https://app.adscrush.com"
    : isDev
      ? "http://localhost:3000"
      : "http://localhost:3000"

  const cookieDomain = isProd ? ".adscrush.com" : ""

  const secret =
    config.secret ??
    process.env["BETTER_AUTH_SECRET"] ??
    "please-change-this-secret"

  const transporter = nodemailer.createTransport({
    host: process.env["SMTP_HOST"] ?? "smtp.mailtrap.io",
    port: parseInt(process.env["SMTP_PORT"] ?? "2525", 10),
    auth: {
      user: process.env["SMTP_USER"],
      pass: process.env["SMTP_PASS"],
    },
  })

  const smtpFrom = process.env["SMTP_FROM"] ?? "noreply@adscrush.local"

  const sendEmail = async (
    to: string,
    subject: string,
    emailComponent: any
  ) => {
    const html = await render(emailComponent)
    await transporter.sendMail({
      from: smtpFrom,
      to,
      subject,
      html,
    })
  }

  return betterAuth({
    baseURL,
    basePath: "/api/v1/auth",
    secret,
    trustedOrigins: [appURL, "http://localhost:3000"],
    advanced: {
      crossSubDomainCookies: {
        enabled: true,
        domain: cookieDomain,
      },
    },
    database: drizzleAdapter(config.db, {
      provider: "pg",
      schema: {
        user: users,
        session: sessions,
        account: accounts,
        verification: verifications,
      },
    }),
    user: {
      additionalFields: {
        role: {
          type: [...ALL_ROLES],
          defaultValue: "employee" satisfies Role,
          input: false,
        },
      },
    },
    session: {
      expiresIn: 30 * 24 * 60 * 60,
      updateAge: 24 * 60 * 60,
      cookieCache: {
        enabled: true,
        maxAge: 24 * 60 * 60,
      },
      additionalFields: {
        role: {
          type: [...ALL_ROLES],
          defaultValue: "employee" satisfies Role,
          input: false,
        },
      },
    },
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      sendResetPassword: async ({ user, url, token }) => {
        setImmediate(() => {
          sendEmail(
            user.email,
            "Reset your Adscrush password",
            PasswordResetEmail({ url, token })
          ).catch(console.error)
        })
      },
    },
    socialProviders: {
      google: {
        clientId: process.env["GOOGLE_CLIENT_ID"] ?? "",
        clientSecret: process.env["GOOGLE_CLIENT_SECRET"] ?? "",
      },
    },
    plugins: [
      magicLink({
        expiresIn: 15 * 60 * 1000,
        disableSignUp: true,
        generateToken: async () => {
          const letters = "abcdefghijklmnopqrstuvwxyz"
          const getRandomLetter = () => letters[randomInt(0, 26)]!
          const prefix = getRandomLetter() + getRandomLetter()
          const part1 = randomInt(100, 1000)
          const part2 = randomInt(1000, 10000)
          const suffix = getRandomLetter()
          return `${prefix}${part1}-${part2}${suffix}`
        },
        sendMagicLink: async ({ email, url, token }) => {
          setImmediate(() => {
            sendEmail(
              email,
              "Sign in to Adscrush",
              MagicLinkEmail({ url, token })
            ).catch(console.error)
          })
        },
      }),
      openAPI(),
    ],
  } satisfies BetterAuthOptions)
}

export type Auth = ReturnType<typeof createAuth>
