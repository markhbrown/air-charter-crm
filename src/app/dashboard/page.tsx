import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import type { Database } from "@/lib/database.types";

type InquiryStatus = Database["public"]["Enums"]["inquiry_status"];
const STATUSES: InquiryStatus[] = ["New", "Quoting", "Won", "Lost"];

export default async function OverviewPage() {
  const supabase = await createClient();

  const [companies, contacts, inquiries, statusRows, recent] = await Promise.all([
    supabase.from("companies").select("*", { count: "exact", head: true }),
    supabase.from("contacts").select("*", { count: "exact", head: true }),
    supabase.from("inquiries").select("*", { count: "exact", head: true }),
    supabase.from("inquiries").select("status"),
    supabase
      .from("inquiries")
      .select("id, origin_airport, destination_airport, flight_date, status, company:companies(name)")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const statusCounts = STATUSES.map((status) => ({
    status,
    count: (statusRows.data ?? []).filter((r) => r.status === status).length,
  }));

  const stats = [
    { label: "Companies", value: companies.count ?? 0 },
    { label: "Contacts", value: contacts.count ?? 0 },
    { label: "Inquiries", value: inquiries.count ?? 0 },
    {
      label: "Open",
      value: statusCounts
        .filter((s) => s.status === "New" || s.status === "Quoting")
        .reduce((sum, s) => sum + s.count, 0),
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="text-muted-foreground">Your sales activity at a glance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Inquiries by status</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {statusCounts.map(({ status, count }) => (
              <div key={status} className="flex items-center justify-between">
                <StatusBadge status={status} />
                <span className="text-sm font-medium">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent inquiries</CardTitle>
          </CardHeader>
          <CardContent>
            {recent.data && recent.data.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recent.data.map((inq) => (
                    <TableRow key={inq.id}>
                      <TableCell className="font-medium">
                        {inq.company?.name ?? "—"}
                      </TableCell>
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
            ) : (
              <p className="text-sm text-muted-foreground">
                No inquiries yet.{" "}
                <Link href="/dashboard/inquiries" className="underline">
                  View inquiries
                </Link>
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
