import { LogoutButton } from "@/components/auth/logout-button";

export default function OnboardingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-white">
          Onboarding
        </h1>

        <p className="mt-3 text-zinc-400">
          E-mail confirmado. O onboarding será construído aqui.
        </p>

        <div className="mt-8 flex justify-center">
          <LogoutButton />
        </div>
      </div>
    </main>
  );
}