"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "@/lib/forms";

// user_id is omitted on insert — the column defaults to auth.uid(), and the
// RLS insert policy enforces auth.uid() = user_id.
const companySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  country: z.string().trim().max(100).optional(),
  notes: z.string().trim().max(2000).optional(),
});

function revalidate() {
  revalidatePath("/dashboard/companies");
  revalidatePath("/dashboard");
}

export async function saveCompany(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const id = formData.get("id")?.toString() || null;

  const parsed = companySchema.safeParse({
    name: formData.get("name"),
    country: formData.get("country") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const values = {
    name: parsed.data.name,
    country: parsed.data.country ?? null,
    notes: parsed.data.notes ?? null,
  };

  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("companies").update(values).eq("id", id)
    : await supabase.from("companies").insert(values);

  if (error) return { error: error.message };

  revalidate();
  return { ok: true };
}

export async function deleteCompany(id: string): Promise<FormState> {
  const supabase = await createClient();
  const { error } = await supabase.from("companies").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidate();
  return { ok: true };
}
