import { requireAuth } from "../../features/auth/actions";


export default async function ProtectedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	await requireAuth()
	return (
		<div className="flex min-h-screen flex-1 flex-col items-center justify-center bg-muted/40 px-4 py-12">
			<div className="w-full max-w-sm">{children}</div>
		</div>
	);
}