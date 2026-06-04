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

export default async function InquiriesPage() {
  const supabase = await createClient();
  const { data: inquiries } = await supabase
    .from("inquiries")
    .select(
      "id, origin_airport, destination_airport, flight_date, status, company:companies(name), contact:contacts(name)",
    )
    .order("flight_date", { ascending: true });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Inquiries</h1>
        <p className="text-muted-foreground">Charter quote requests.</p>
      </div>

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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No inquiries yet.</p>
      )}
    </div>
  );
}
