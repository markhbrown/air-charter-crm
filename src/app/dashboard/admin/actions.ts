"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Grant or revoke the admin role on another user. Security is enforced in the
// database: the set_user_admin function checks the caller is an admin and
// refuses to change the caller's own role.
export async function setUserAdmin(formData: FormData) {
  const userId = String(formData.get("userId") ?? "");
  const makeAdmin = formData.get("makeAdmin") === "true";

  const supabase = await createClient();
  const { error } = await supabase.rpc("set_user_admin", {
    _user_id: userId,
    _is_admin: makeAdmin,
  });

  if (error) {
    redirect(`/dashboard/admin?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard/admin");
}
