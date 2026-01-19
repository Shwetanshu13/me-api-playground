import PortfolioExplorer from "./components/PortfolioExplorer";
import { fetchBackendJson } from "../lib/backend";

export default async function Home() {
  const profileId = Number.parseInt(process.env.PROFILE_ID ?? "1", 10);
  const safeProfileId = Number.isNaN(profileId) ? 1 : profileId;

  const [profileBundle, topSkills, projects] = await Promise.all([
    fetchBackendJson(`/profiles/${safeProfileId}`).catch(() => null),
    fetchBackendJson("/skills/top", {
      searchParams: new URLSearchParams({ limit: "12" }),
    }).catch(() => []),
    fetchBackendJson("/projects").catch(() => []),
  ]);

  return (
    <PortfolioExplorer
      profileBundle={profileBundle}
      topSkills={topSkills}
      initialProjects={projects}
    />
  );
}
