import { createAuth } from "@adscrush/auth";
import { db } from "../db";
import { env } from "@/env";

export const auth = createAuth({
    db: db,
    basePath: "/api/v1/auth",
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: [
        "http://localhost:3000",
        "http://localhost:8989",
        "https://app.adscrush.local",
        "https://api.adscrush.local",
    ]
})
