"use server"

import { auth } from "@repo/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { DEFAULT_AUTH_CALLBACK, getSafeCallbackPath, SIGN_IN_PATH } from "../utils";



export async function signInWithGithub(formData: FormData) {
    const callback = formData.get('callbackUrl')

    const redirectTo = getSafeCallbackPath(typeof callback === 'string' ? callback : null)

    const result = await auth.api.signInSocial({
        body: {
            provider: 'github',
            callbackURL: redirectTo
        },
        headers: await headers()
    })

    if (result.url) {
        redirect(result.url)
    }


}


export async function getSeverSession() {
    return await auth.api.getSession({
        headers: await headers()
    })
}


export async function requireAuth(redirectTo = SIGN_IN_PATH) {
    const session = await getSeverSession()

    if (!session) {
        redirect(redirectTo)
    }

    return session
}

export async function requireUnAuth(redirectTo = DEFAULT_AUTH_CALLBACK) {
    const session = await getSeverSession()

    if (session) {
        redirect(redirectTo)
    }
}