import { createAuthClient } from "better-auth/react"
import { inferAdditionalFields } from "better-auth/client/plugins";
import { auth } from "./auth";


export const authClient = createAuthClient({
    plugins: [inferAdditionalFields<typeof auth>()],
    baseURL: process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
})