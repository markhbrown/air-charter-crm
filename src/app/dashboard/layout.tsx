import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/auth/actions";
import { DashboardNav } from "@/components/dashboard-nav";
import { Button } from "@/components/ui/button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Belt-and-braces: the proxy already redirects, but guard here too so data
  // access never runs without a user.
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-full flex-1">
      <aside className="flex w-64 shrink-0 flex-col border-r bg-background p-4">
        <div className="px-3 py-2">
          <p className="text-lg font-semibold">Air Charter CRM</p>
        </div>
        <div className="mt-4 flex-1">
          <DashboardNav />
        </div>
        <div className="border-t pt-4">
          <p className="px-3 pb-2 text-xs text-muted-foreground truncate">
            {user.email}
          </p>
          <form action={signOut}>
            <Button type="submit" variant="outline" size="sm" className="w-full">
              Sign out
            </Button>
          </form>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
