import { createClient } from "@/lib/supabase/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function ContactsPage() {
  const supabase = await createClient();
  const { data: contacts } = await supabase
    .from("contacts")
    .select("id, name, email, role, company:companies(name)")
    .order("name");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Contacts</h1>
        <p className="text-muted-foreground">People at the companies you work with.</p>
      </div>

      {contacts && contacts.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Email</TableHead>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No contacts yet.</p>
      )}
    </div>
  );
}
