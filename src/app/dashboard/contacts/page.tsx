import { createClient } from "@/lib/supabase/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ContactFormDialog } from "@/components/contacts/contact-form-dialog";

export default async function ContactsPage() {
  const supabase = await createClient();

  const [{ data: contacts }, { data: companies }] = await Promise.all([
    supabase
      .from("contacts")
      .select("id, name, email, role, company_id, company:companies(name)")
      .order("name"),
    supabase.from("companies").select("id, name").order("name"),
  ]);

  const companyOptions = companies ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground">
            People at the companies you work with.
          </p>
        </div>
        <ContactFormDialog companies={companyOptions} />
      </div>

      {companyOptions.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Add a company first — contacts must belong to a company.
        </p>
      ) : null}

      {contacts && contacts.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell className="font-medium">{contact.name}</TableCell>
                  <TableCell>{contact.company?.name ?? "—"}</TableCell>
                  <TableCell>{contact.role ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {contact.email ?? "—"}
                  </TableCell>
                  <TableCell>
                    <ContactFormDialog
                      contact={{
                        id: contact.id,
                        name: contact.name,
                        email: contact.email,
                        role: contact.role,
                        company_id: contact.company_id,
                      }}
                      companies={companyOptions}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : companyOptions.length > 0 ? (
        <p className="text-sm text-muted-foreground">No contacts yet.</p>
      ) : null}
    </div>
  );
}
