"use client";
import { Button } from "@repo/ui/components/ui/button";
import { ModeToggle } from "@repo/ui/components/ui/mode-toggle";
import { authClient, useSession } from "@repo/auth/client";
import { UserMenuWithSession } from "../features/auth/components/user-menu";
export default function Home() {
	const { data: session } = useSession();
	console.log(session);
	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
			<h1 className="text-4xl font-extrabold tracking-tight">Code Reviewer</h1>
			<p className="text-muted-foreground">
				Welcome to the code reviewer application built with Turborepo, Next.js,
				and Shadcn UI.
			</p>
			<div className="flex gap-2">
				<UserMenuWithSession variant="compact" />
				<ModeToggle />
			</div>
		</div>
	);
}
