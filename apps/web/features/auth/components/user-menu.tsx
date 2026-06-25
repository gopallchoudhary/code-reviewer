import { authClient } from "@repo/auth/client";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@repo/ui/components/ui/avatar";
import { Badge } from "@repo/ui/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	DropdownMenuLabel,
	DropdownMenuGroup,
} from "@repo/ui/components/ui/dropdown-menu";
import { Button } from "@repo/ui/components/ui/button";
import { LogOutIcon, CircleChevronUpIcon } from "@repo/ui/icons/index";
import { useRouter } from "next/navigation";
import { SIGN_IN_PATH } from "../utils";
import { cn } from "@repo/ui/lib/utils";

const DEFAULT_PLAN = "Free";

export type UserMenuUser = {
	name?: string | null;
	email?: string | null;
	image?: string | null;
};

export type UserMenuTriggerVariatnt = "compact" | "profile";

export type UserMenuProps = {
	user: UserMenuUser;
	variant?: UserMenuTriggerVariatnt;
	plan?: string;
	className?: string;
};

export function getDisplayName(user: UserMenuUser) {
	return user.name?.trim() || user.email?.split("@")[0] || "User";
}

export function getInitials(user: UserMenuUser) {
	const source = user.name?.trim() || user.email || "U";
	const parts = source.split(/\s+/).filter(Boolean);

	if (parts.length >= 2) {
		const first = parts[0]?.[0] ?? "";
		const second = parts[1]?.[0] ?? "";
		return `${first}${second}`.toUpperCase();
	}

	return source.slice(0, 2).toUpperCase();
}

function UserAvatar({
	user,
	size = "default",
}: {
	user: UserMenuUser;
	size?: "default" | "sm" | "lg";
}) {
	return (
		<Avatar size={size}>
			{user.image ? (
				<AvatarImage src={user.image} alt={getDisplayName(user)} />
			) : null}
			<AvatarFallback>{getInitials(user)}</AvatarFallback>
		</Avatar>
	);
}

export function UserMenu({
	user,
	variant = "profile",
	plan = DEFAULT_PLAN,
	className,
}: UserMenuProps) {
	const router = useRouter();
	const displayName = getDisplayName(user);

	const handleSignOut = async () => {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					router.push(SIGN_IN_PATH);
				},
			},
		});
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild className={cn(className)}>
				{variant === "compact" ? (
					<Button
						variant="ghost"
						size="icon"
						className="rounded-full"
						aria-label="Open account menu"
					>
						<UserAvatar
							user={user}
							size="default"
						/>
					</Button>
				) : (
					<Button
						variant="ghost"
						className="h-9 gap-2 px-2"
						aria-label="Open account menu"
					>
						<UserAvatar
							user={user}
							size="sm"
						/>
						<span className="max-w-32 truncate text-left text-xs font-medium">
							{displayName}
						</span>
						<CircleChevronUpIcon className="size-4 text-muted-foreground" />
					</Button>
				)}
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuGroup>
					<DropdownMenuLabel className="p-0 font-normal">
						<div className="flex items-start gap-2 px-2 py-2">
							<UserAvatar user={user} />
							<div className="flex min-w-0 flex-1 flex-col gap-1">
								<p className="truncate text-xs font-medium">{displayName}</p>
								{user.email ? (
									<p className="truncate text-xs text-muted-foreground">
										{user.email}
									</p>
								) : null}
								<Badge variant="secondary" className="w-fit">
									{plan} plan
								</Badge>
							</div>
						</div>
					</DropdownMenuLabel>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem variant="destructive" onClick={handleSignOut}>
						<LogOutIcon />
						Log out
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

type UserMenuWithSessionProps = Omit<UserMenuProps, "user">;

export function UserMenuWithSession(props: UserMenuWithSessionProps) {
	const { data: session, isPending } = authClient.useSession();

	if (isPending || !session?.user) {
		return null;
	}

	return <UserMenu user={session.user} {...props} />;
}
