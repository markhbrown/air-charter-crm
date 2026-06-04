"use client";

import { useActionState, useEffect, useMemo, useState, useTransition } from "react";
import { Pencil, Plus } from "lucide-react";
import { saveInquiry, deleteInquiry } from "@/app/dashboard/inquiries/actions";
import type { FormState } from "@/lib/forms";
import type { Database } from "@/lib/database.types";
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

type InquiryStatus = Database["public"]["Enums"]["inquiry_status"];
const STATUSES: InquiryStatus[] = ["New", "Quoting", "Won", "Lost"];
const NO_CONTACT = "__none__";

export type CompanyOption = { id: string; name: string };
export type ContactOption = { id: string; name: string; company_id: string };

export type InquiryRow = {
  id: string;
  company_id: string;
  contact_id: string | null;
  origin_airport: string;
  destination_airport: string;
  flight_date: string;
  status: InquiryStatus;
};

export function InquiryFormDialog({
  inquiry,
  companies,
  contacts,
}: {
  inquiry?: InquiryRow;
  companies: CompanyOption[];
  contacts: ContactOption[];
}) {
  const [open, setOpen] = useState(false);
  const isEdit = Boolean(inquiry);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          isEdit ? (
            <Button variant="ghost" size="icon-sm" aria-label="Edit inquiry" />
          ) : (
            <Button disabled={companies.length === 0} />
          )
        }
      >
        {isEdit ? (
          <Pencil />
        ) : (
          <>
            <Plus /> Add inquiry
          </>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit inquiry" : "Add inquiry"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the charter inquiry."
              : "Log a new charter quote request."}
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <InquiryForm
            inquiry={inquiry}
            companies={companies}
            contacts={contacts}
            onDone={() => setOpen(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function InquiryForm({
  inquiry,
  companies,
  contacts,
  onDone,
}: {
  inquiry?: InquiryRow;
  companies: CompanyOption[];
  contacts: ContactOption[];
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    saveInquiry,
    null,
  );
  const [companyId, setCompanyId] = useState(inquiry?.company_id ?? "");
  const [contactId, setContactId] = useState(inquiry?.contact_id ?? NO_CONTACT);
  const [status, setStatus] = useState<InquiryStatus>(inquiry?.status ?? "New");
  const [deletePending, startDelete] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (state?.ok) onDone();
  }, [state, onDone]);

  // Contacts are filtered to the selected company.
  const availableContacts = useMemo(
    () => contacts.filter((c) => c.company_id === companyId),
    [contacts, companyId],
  );

  function onCompanyChange(value: string) {
    setCompanyId(value);
    // Reset the contact if it no longer belongs to the chosen company.
    if (!contacts.some((c) => c.id === contactId && c.company_id === value)) {
      setContactId(NO_CONTACT);
    }
  }

  const companyItems = companies.map((c) => ({ label: c.name, value: c.id }));
  const contactItems = [
    { label: "No contact", value: NO_CONTACT },
    ...availableContacts.map((c) => ({ label: c.name, value: c.id })),
  ];

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {inquiry ? <input type="hidden" name="id" value={inquiry.id} /> : null}
      <input type="hidden" name="company_id" value={companyId} />
      <input
        type="hidden"
        name="contact_id"
        value={contactId === NO_CONTACT ? "" : contactId}
      />
      <input type="hidden" name="status" value={status} />

      <div className="flex flex-col gap-2">
        <Label>Company</Label>
        <Select
          items={companyItems}
          value={companyId}
          onValueChange={(value) => onCompanyChange(String(value ?? ""))}
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
        <Label>Contact (optional)</Label>
        <Select
          items={contactItems}
          value={contactId}
          onValueChange={(value) => setContactId(String(value ?? NO_CONTACT))}
          disabled={!companyId}
        >
          <SelectTrigger>
            <SelectValue placeholder="No contact" />
          </SelectTrigger>
          <SelectContent>
            {contactItems.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="origin_airport">Origin</Label>
          <Input
            id="origin_airport"
            name="origin_airport"
            placeholder="LHR"
            defaultValue={
              state?.values?.origin_airport ?? inquiry?.origin_airport ?? ""
            }
            required
          />
          <FieldError errors={state?.fieldErrors?.origin_airport} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="destination_airport">Destination</Label>
          <Input
            id="destination_airport"
            name="destination_airport"
            placeholder="GVA"
            defaultValue={
              state?.values?.destination_airport ??
              inquiry?.destination_airport ??
              ""
            }
            required
          />
          <FieldError errors={state?.fieldErrors?.destination_airport} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="flight_date">Flight date</Label>
          <Input
            id="flight_date"
            name="flight_date"
            type="date"
            defaultValue={
              state?.values?.flight_date ?? inquiry?.flight_date ?? ""
            }
            required
          />
          <FieldError errors={state?.fieldErrors?.flight_date} />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Status</Label>
          <Select
            items={STATUSES.map((s) => ({ label: s, value: s }))}
            value={status}
            onValueChange={(value) => setStatus(value as InquiryStatus)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {state?.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      {deleteError ? (
        <p className="text-sm text-destructive">{deleteError}</p>
      ) : null}

      <DialogFooter className="sm:justify-between">
        {inquiry ? (
          <DeleteConfirm
            title="Delete this inquiry?"
            description="This permanently deletes the charter inquiry. This cannot be undone."
            pending={deletePending}
            onConfirm={() =>
              startDelete(async () => {
                const res = await deleteInquiry(inquiry.id);
                if (res?.error) setDeleteError(res.error);
                else onDone();
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
