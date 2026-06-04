"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { Pencil, Plus } from "lucide-react";
import { saveCompany, deleteCompany } from "@/app/dashboard/companies/actions";
import { withSubmitErrorHandling, type FormState } from "@/lib/forms";
import { FieldError } from "@/components/field-error";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DeleteConfirm } from "@/components/delete-confirm";

export type CompanyRow = {
  id: string;
  name: string;
  country: string | null;
  notes: string | null;
};

export function CompanyFormDialog({ company }: { company?: CompanyRow }) {
  const [open, setOpen] = useState(false);
  const isEdit = Boolean(company);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* The trigger is built here (inside this Client Component) rather than
          passed in from the server page — passing a Base UI element across the
          RSC boundary misaligns its useId and causes a hydration mismatch. */}
      <DialogTrigger
        render={
          isEdit ? (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Edit ${company!.name}`}
            />
          ) : (
            <Button />
          )
        }
      >
        {isEdit ? (
          <Pencil />
        ) : (
          <>
            <Plus /> Add company
          </>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit company" : "Add company"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the company details."
              : "Create a new company record."}
          </DialogDescription>
        </DialogHeader>
        {/* Keyed so the form (and its action state) remounts fresh each open. */}
        {open ? (
          <CompanyForm company={company} onDone={() => setOpen(false)} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function CompanyForm({
  company,
  onDone,
}: {
  company?: CompanyRow;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    withSubmitErrorHandling(saveCompany),
    null,
  );
  const [deletePending, startDelete] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Controlled fields: their React state survives React 19's post-submit form
  // reset, so input is preserved on a failed submit — without the changing
  // `defaultValue` that makes Base UI's input warn about uncontrolled state.
  const [name, setName] = useState(company?.name ?? "");
  const [country, setCountry] = useState(company?.country ?? "");
  const [notes, setNotes] = useState(company?.notes ?? "");

  useEffect(() => {
    if (state?.ok) onDone();
  }, [state, onDone]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {company ? <input type="hidden" name="id" value={company.id} /> : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <FieldError errors={state?.fieldErrors?.name} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="country">Country</Label>
        <Input
          id="country"
          name="country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {state?.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      {deleteError ? (
        <p className="text-sm text-destructive">{deleteError}</p>
      ) : null}

      <DialogFooter className="sm:justify-between">
        {company ? (
          <DeleteConfirm
            title={`Delete ${company.name}?`}
            description="This permanently deletes the company along with its contacts and inquiries. This cannot be undone."
            pending={deletePending}
            onConfirm={() =>
              startDelete(async () => {
                try {
                  const res = await deleteCompany(company.id);
                  if (res?.error) setDeleteError(res.error);
                  else onDone();
                } catch {
                  setDeleteError(
                    "Couldn't delete — check your connection and try again.",
                  );
                }
              })
            }
          />
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <DialogClose render={<Button type="button" variant="outline" />}>
            Cancel
          </DialogClose>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save"}
          </Button>
        </div>
      </DialogFooter>
    </form>
  );
}
