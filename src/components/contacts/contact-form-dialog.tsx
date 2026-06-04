"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { Pencil, Plus } from "lucide-react";
import { saveContact, deleteContact } from "@/app/dashboard/contacts/actions";
import { withSubmitErrorHandling, type FormState } from "@/lib/forms";
import { FieldError } from "@/components/field-error";
import { DeleteConfirm } from "@/components/delete-confirm";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type CompanyOption = { id: string; name: string };

export type ContactRow = {
  id: string;
  name: string;
  email: string | null;
  role: string | null;
  company_id: string;
};

export function ContactFormDialog({
  contact,
  companies,
}: {
  contact?: ContactRow;
  companies: CompanyOption[];
}) {
  const [open, setOpen] = useState(false);
  const isEdit = Boolean(contact);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          isEdit ? (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Edit ${contact!.name}`}
            />
          ) : (
            <Button disabled={companies.length === 0} />
          )
        }
      >
        {isEdit ? (
          <Pencil />
        ) : (
          <>
            <Plus /> Add contact
          </>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit contact" : "Add contact"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the contact details."
              : "Create a new contact at a company."}
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <ContactForm
            contact={contact}
            companies={companies}
            onDone={() => setOpen(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function ContactForm({
  contact,
  companies,
  onDone,
}: {
  contact?: ContactRow;
  companies: CompanyOption[];
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    withSubmitErrorHandling(saveContact),
    null,
  );
  const [companyId, setCompanyId] = useState(contact?.company_id ?? "");
  const [name, setName] = useState(contact?.name ?? "");
  const [role, setRole] = useState(contact?.role ?? "");
  const [email, setEmail] = useState(contact?.email ?? "");
  const [deletePending, startDelete] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (state?.ok) onDone();
  }, [state, onDone]);

  const companyItems = companies.map((c) => ({ label: c.name, value: c.id }));

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {contact ? <input type="hidden" name="id" value={contact.id} /> : null}
      <input type="hidden" name="company_id" value={companyId} />

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
        <Label>Company</Label>
        <Select
          items={companyItems}
          value={companyId}
          onValueChange={(value) => setCompanyId(String(value ?? ""))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a company" />
          </SelectTrigger>
          <SelectContent>
            {companies.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError errors={state?.fieldErrors?.company_id} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="role">Role</Label>
        <Input
          id="role"
          name="role"
          placeholder="e.g. Ops Manager"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <FieldError errors={state?.fieldErrors?.email} />
      </div>

      {state?.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      {deleteError ? (
        <p className="text-sm text-destructive">{deleteError}</p>
      ) : null}

      <DialogFooter className="sm:justify-between">
        {contact ? (
          <DeleteConfirm
            title={`Delete ${contact.name}?`}
            description="This permanently deletes the contact. Inquiries linked to them will keep the company but lose the contact. This cannot be undone."
            pending={deletePending}
            onConfirm={() =>
              startDelete(async () => {
                try {
                  const res = await deleteContact(contact.id);
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
