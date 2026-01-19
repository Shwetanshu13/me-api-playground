import { PortfolioExplorer } from "../components";
import { fetchBackendJson } from "../lib/backend";

export default async function Home() {
  const profileId = Number.parseInt(process.env.PROFILE_ID ?? "4", 4);
  const safeProfileId = Number.isNaN(profileId) ? 1 : profileId;

  const [profileBundle, topSkills, projects] = await Promise.all([
    fetchBackendJson("/profile").catch(() => null),
    fetchBackendJson("/skills/top", {
      searchParams: new URLSearchParams({ limit: "12" }),
    }).catch(() => []),
    fetchBackendJson("/projects").catch(() => []),
  ]);

  // console.log(profileBundle);

  return (
    <PortfolioExplorer
      profileBundle={profileBundle}
      topSkills={topSkills}
      initialProjects={projects}
    />
  );
}
