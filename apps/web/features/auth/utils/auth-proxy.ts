import { auth } from "@repo/auth"
import { NextRequest, NextResponse } from "next/server";
import { getSafeCallbackPath, SIGN_IN_PATH } from ".";


function redirectToSignIn(request: NextRequest, pathname: string) {
    const signInUrl = new URL(SIGN_IN_PATH, request.url)

    signInUrl.searchParams.set('callbackUrl', `${pathname}${request.nextUrl.search}`)

    return NextResponse.redirect(signInUrl)
}


function getPostAuthRedirectPath(request: NextRequest) {
    const callbackUrl = request.nextUrl.searchParams.get('callbackUrl')
    return getSafeCallbackPath(callbackUrl)
}

// '/' is always public
// '/sign-in': logged in users redirect away, only guests can access

export async function handleAuthProxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    if (pathname === '/') {
        return NextResponse.next()
    }

    const session = await auth.api.getSession({
        headers: request.headers
    })

    if (pathname === SIGN_IN_PATH) {
        if (session) {
            const redirectPath = getPostAuthRedirectPath(request)
            return NextResponse.redirect(new URL(redirectPath, request.url))
        }

        return NextResponse.next()
    }

    if (!session) {
        return redirectToSignIn(request, pathname)
    }

    return NextResponse.next()
}