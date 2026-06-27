import { requireAuth } from "@/features/auth/actions";
import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";
import { GithubConnectCard } from "@/features/github/components/github-connect-card";
import { getInstallationStatus } from "@/features/github/server/installation";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
	title: "Github App | Dashboard",
};

const DashboardGithubPage = async () => {
	const sessinon = await requireAuth();
	const installation = await getInstallationStatus(sessinon.user.id);

	return (
		<>
			<DashboardHeader
				title="Github App"
				description="Install or disconnect the reviewer on your Github account."
			/>

			<GithubConnectCard
				userId={sessinon.user.id}
				installation={installation}
			/>
		</>
	);
};

export default DashboardGithubPage;
