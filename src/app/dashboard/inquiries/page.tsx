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
import {
  InquiriesFilters,
  DEFAULT_SORT,
} from "@/components/inquiries/inquiries-filters";
import type { Database } from "@/lib/database.types";

type InquiryStatus = Database["public"]["Enums"]["inquiry_status"];
const STATUSES: InquiryStatus[] = ["New", "Quoting", "Won", "Lost"];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function str(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function InquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();

  // Companies/contacts are needed for the filter + form dropdowns regardless of
  // the current filter, so fetch them alongside.
  const [{ data: companies }, { data: contacts }] = await Promise.all([
    supabase.from("companies").select("id, name").order("name"),
    supabase.from("contacts").select("id, name, company_id").order("name"),
  ]);
  const companyOptions = companies ?? [];
  const contactOptions = contacts ?? [];

  // Parse + validate filters (untrusted query string). Invalid values are
  // ignored rather than passed to Postgres, which would error on a bad enum/uuid.
  const status = str(sp.status);
  const company = str(sp.company);
  const from = str(sp.from);
  const sort = str(sp.sort) ?? DEFAULT_SORT;

  let query = supabase
    .from("inquiries")
    .select(
      "id, company_id, contact_id, origin_airport, destination_airport, flight_date, status, company:companies(name), contact:contacts(name)",
    );

  if (status && STATUSES.includes(status as InquiryStatus)) {
    query = query.eq("status", status as InquiryStatus);
  }
  if (company && companyOptions.some((c) => c.id === company)) {
    query = query.eq("company_id", company);
  }
  if (from && DATE_RE.test(from)) {
    query = query.gte("flight_date", from);
  }

  if (sort === "soonest") {
    query = query.order("flight_date", { ascending: true });
  } else if (sort === "latest") {
    query = query.order("flight_date", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data: inquiries } = await query;

  const filtersActive =
    Boolean(status || company || from) || sort !== DEFAULT_SORT;
  const rows = inquiries ?? [];

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
      ) : (
        <>
          <InquiriesFilters companies={companyOptions} />

          {rows.length > 0 ? (
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
                  {rows.map((inq) => (
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
          ) : (
            <p className="text-sm text-muted-foreground">
              {filtersActive
                ? "No inquiries match these filters."
                : "No inquiries yet."}
            </p>
          )}
        </>
      )}
    </div>
  );
}
