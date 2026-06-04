"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "@/lib/forms";

const inquirySchema = z.object({
  // FK ids come from our own pickers; the uuid columns reject malformed input.
  company_id: z.string().min(1, "Select a company"),
  contact_id: z.string().min(1).optional(),
  origin_airport: z
    .string()
    .trim()
    .min(1, "Origin is required")
    .max(10)
    .transform((s) => s.toUpperCase()),
  destination_airport: z
    .string()
    .trim()
    .min(1, "Destination is required")
    .max(10)
    .transform((s) => s.toUpperCase()),
  flight_date: z.string().min(1, "Flight date is required"),
  status: z.enum(["New", "Quoting", "Won", "Lost"]),
});

function revalidate() {
  revalidatePath("/dashboard/inquiries");
  revalidatePath("/dashboard");
}

export async function saveInquiry(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const id = formData.get("id")?.toString() || null;

  const parsed = inquirySchema.safeParse({
    company_id: formData.get("company_id") || "",
    contact_id: formData.get("contact_id") || undefined,
    origin_airport: formData.get("origin_airport"),
    destination_airport: formData.get("destination_airport"),
    flight_date: formData.get("flight_date"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      values: {
        origin_airport: String(formData.get("origin_airport") ?? ""),
        destination_airport: String(formData.get("destination_airport") ?? ""),
        flight_date: String(formData.get("flight_date") ?? ""),
      },
    };
  }

  const values = {
    company_id: parsed.data.company_id,
    contact_id: parsed.data.contact_id ?? null,
    origin_airport: parsed.data.origin_airport,
    destination_airport: parsed.data.destination_airport,
    flight_date: parsed.data.flight_date,
    status: parsed.data.status,
  };

  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("inquiries").update(values).eq("id", id)
    : await supabase.from("inquiries").insert(values);

  if (error) return { error: error.message };

  revalidate();
  return { ok: true };
}

export async function deleteInquiry(id: string): Promise<FormState> {
  const supabase = await createClient();
  const { error } = await supabase.from("inquiries").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidate();
  return { ok: true };
}
