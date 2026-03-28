import { createAuthClient as createBetterAuthClient } from "better-auth/client";
import { customSessionClient, inferAdditionalFields } from "better-auth/client/plugins";
import type { Auth } from "./server";


export const createAuthClient = (options: { baseURL: string }) => createBetterAuthClient({
    baseURL: options.baseURL,
    plugins: [
        inferAdditionalFields<Auth>(),
        customSessionClient<Auth>(),
    ],
});
