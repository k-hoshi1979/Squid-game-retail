import { createClient } from "@/lib/supabase/server";
import { ActionSidebar } from "@/components/layout/ActionSidebar";

async function getUserDisplay() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .single();

    return {
      name: profile?.full_name ?? "",
      email: profile?.email ?? user.email ?? "",
    };
  } catch {
    return null;
  }
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserDisplay();

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-[var(--background)]">
      <ActionSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {user && (
          <div className="hidden md:flex items-center justify-end px-4 py-2 text-xs text-[var(--muted-foreground)] border-b border-[var(--border)] bg-[var(--card)]">
            {user.name || user.email}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
