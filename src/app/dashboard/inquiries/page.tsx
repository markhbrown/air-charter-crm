import { createClient } from "@/lib/supabase/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { InquiryFormDialog } from "@/components/inquiries/inquiry-form-dialog";

export default async function InquiriesPage() {
  const supabase = await createClient();

  const [{ data: inquiries }, { data: companies }, { data: contacts }] =
    await Promise.all([
      supabase
        .from("inquiries")
        .select(
          "id, company_id, contact_id, origin_airport, destination_airport, flight_date, status, company:companies(name), contact:contacts(name)",
        )
        .order("flight_date", { ascending: true }),
      supabase.from("companies").select("id, name").order("name"),
      supabase.from("contacts").select("id, name, company_id").order("name"),
    ]);

  const companyOptions = companies ?? [];
  const contactOptions = contacts ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Inquiries</h1>
          <p className="text-muted-foreground">Charter quote requests.</p>
        </div>
        <InquiryFormDialog
          companies={companyOptions}
          contacts={contactOptions}
        />
      </div>

      {companyOptions.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Add a company first — inquiries must be linked to a company.
        </p>
      ) : null}

      {inquiries && inquiries.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Flight date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {inquiries.map((inq) => (
                <TableRow key={inq.id}>
                  <TableCell className="font-medium">
                    {inq.company?.name ?? "—"}
                  </TableCell>
                  <TableCell>{inq.contact?.name ?? "—"}</TableCell>
                  <TableCell>
                    {inq.origin_airport} → {inq.destination_airport}
                  </TableCell>
                  <TableCell>{inq.flight_date}</TableCell>
                  <TableCell>
                    <StatusBadge status={inq.status} />
                  </TableCell>
                  <TableCell>
                    <InquiryFormDialog
                      inquiry={{
                        id: inq.id,
                        company_id: inq.company_id,
                        contact_id: inq.contact_id,
                        origin_airport: inq.origin_airport,
                        destination_airport: inq.destination_airport,
                        flight_date: inq.flight_date,
                        status: inq.status,
                      }}
                      companies={companyOptions}
                      contacts={contactOptions}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : companyOptions.length > 0 ? (
        <p className="text-sm text-muted-foreground">No inquiries yet.</p>
      ) : null}
    </div>
  );
}
