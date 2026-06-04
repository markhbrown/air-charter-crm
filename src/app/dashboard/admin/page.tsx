import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { setUserAdmin } from "./actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Admin-only route — non-admins are redirected away.
  if (user?.app_metadata?.role !== "admin") {
    redirect("/dashboard");
  }

  const { data: users } = await supabase.rpc("list_app_users");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">User management</h1>
        <p className="text-muted-foreground">
          Grant or revoke admin access. Admins can see and manage every account&apos;s
          data. You can&apos;t change your own role.
        </p>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="w-40" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {(users ?? []).map((u) => {
              const isSelf = u.id === user.id;
              return (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">
                    {u.email}
                    {isSelf ? (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (you)
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    {u.is_admin ? (
                      <Badge>Admin</Badge>
                    ) : (
                      <Badge variant="outline">Member</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {isSelf ? (
                      <span className="text-sm text-muted-foreground">—</span>
                    ) : (
                      <form action={setUserAdmin}>
                        <input type="hidden" name="userId" value={u.id} />
                        <input
                          type="hidden"
                          name="makeAdmin"
                          value={(!u.is_admin).toString()}
                        />
                        <Button
                          type="submit"
                          size="sm"
                          variant={u.is_admin ? "outline" : "default"}
                        >
                          {u.is_admin ? "Revoke admin" : "Make admin"}
                        </Button>
                      </form>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">
        Role changes take effect for the affected user on their next sign-in.
      </p>
    </div>
  );
}
