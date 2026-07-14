import { AuthView } from "@neondatabase/auth/react/ui";

export const dynamicParams = true;

export function generateStaticParams() {
  return [
    { path: "sign-in" },
    { path: "sign-up" },
    { path: "forgot-password" },
    { path: "reset-password" },
    { path: "sign-out" },
    { path: "callback" },
  ];
}

export default async function AuthPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;

  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-center font-display text-5xl text-ink">
          bStruct
        </h1>
        <AuthView path={path} />
      </div>
    </main>
  );
}
