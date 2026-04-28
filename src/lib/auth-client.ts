import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
    baseURL: import.meta.env.VITE_API_URL,
    user: {
        additionalFields: {
            role: {
                type: "string",
            },
            department: {
                type: "string",
            }
        }
    }
})

export const { useSession, signIn, signUp, signOut } = authClient
