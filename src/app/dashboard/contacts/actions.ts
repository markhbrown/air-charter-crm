"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "@/lib/forms";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  email: z.string().trim().email("Enter a valid email").optional(),
  role: z.string().trim().max(100).optional(),
  // The value comes from our own company picker; the Postgres uuid column
  // rejects anything malformed, so we only require it to be present.
  company_id: z.string().min(1, "Select a company"),
});

function revalidate() {
  revalidatePath("/dashboard/contacts");
  revalidatePath("/dashboard");
}

export async function saveContact(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const id = formData.get("id")?.toString() || null;

  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email") || undefined,
    role: formData.get("role") || undefined,
    company_id: formData.get("company_id") || "",
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const values = {
    name: parsed.data.name,
    email: parsed.data.email ?? null,
    role: parsed.data.role ?? null,
    company_id: parsed.data.company_id,
  };

  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("contacts").update(values).eq("id", id)
    : await supabase.from("contacts").insert(values);

  if (error) return { error: error.message };

  revalidate();
  return { ok: true };
}

export async function deleteContact(id: string): Promise<FormState> {
  const supabase = await createClient();
  const { error } = await supabase.from("contacts").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidate();
  return { ok: true };
}
