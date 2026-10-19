import { requireUser } from "@/lib/auth";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import { Card } from "@/components/ui";
export const dynamic = "force-dynamic";
export default function OnboardingPage() {
  const user = requireUser();
  return (
    <main className="mx-auto max-w-md px-4 py-10 min-h-screen">
      <Card>
        <OnboardingFlow username={user.username} ageBand={user.ageBand} />
      </Card>
    </main>
  );
}
