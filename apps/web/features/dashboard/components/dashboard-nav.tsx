import { GithubIcon } from "../../auth/components/github-sign-in-form";

("use client");

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GitBranch, Settings, PanelsTopLeft } from "@repo/ui/icons/index";

import { DASHBOARD_NAV_ITEMS, type DashboardRoute } from "../lib/routes";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@repo/ui/components/ui/sidebar";

const NAV_ICONS = {
	"layout-dashboard": PanelsTopLeft,
	"folder-git-2": GitBranch,
	github: GithubIcon,
	settings: Settings,
} as const;

function isNavActive(pathname: string, href: DashboardRoute) {
	if (href === "/dashboard") {
		return pathname === href;
	}
	return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardNav() {
	const pathname = usePathname();

	return (
		<SidebarGroup>
			<SidebarGroupLabel>Workspace</SidebarGroupLabel>
			<SidebarGroupContent>
				<SidebarMenu>
					{DASHBOARD_NAV_ITEMS.map((item) => {
						const Icon = NAV_ICONS[item.icon];
						const active = isNavActive(pathname, item.href);

						return (
							<SidebarMenuItem key={item.href}>
								<SidebarMenuButton
									asChild
									isActive={active}
									tooltip={item.title}
								>
									<Link href={item.href}>
										<Icon />
										<span>{item.title}</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						);
					})}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
