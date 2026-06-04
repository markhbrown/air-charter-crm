"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import type { Database } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
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

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "soonest", label: "Flight date (soonest)" },
  { value: "latest", label: "Flight date (latest)" },
];

const ALL = "all";
export const DEFAULT_SORT = "newest";

export function InquiriesFilters({
  companies,
}: {
  companies: { id: string; name: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const status = params.get("status") ?? ALL;
  const company = params.get("company") ?? ALL;
  const from = params.get("from") ?? "";
  const sort = params.get("sort") ?? DEFAULT_SORT;

  const hasFilters =
    status !== ALL || company !== ALL || from !== "" || sort !== DEFAULT_SORT;

  function setParam(key: string, value: string, isDefault: boolean) {
    const next = new URLSearchParams(params);
    if (!value || isDefault) next.delete(key);
    else next.set(key, value);
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  const statusItems = [
    { label: "All statuses", value: ALL },
    ...STATUSES.map((s) => ({ label: s, value: s })),
  ];
  const companyItems = [
    { label: "All companies", value: ALL },
    ...companies.map((c) => ({ label: c.name, value: c.id })),
  ];

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">Status</Label>
        <Select
          items={statusItems}
          value={status}
          onValueChange={(v) => setParam("status", String(v), v === ALL)}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusItems.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">Company</Label>
        <Select
          items={companyItems}
          value={company}
          onValueChange={(v) => setParam("company", String(v), v === ALL)}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {companyItems.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">Flights from</Label>
        <Input
          type="date"
          className="w-40"
          value={from}
          onChange={(e) => setParam("from", e.target.value, e.target.value === "")}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">Sort</Label>
        <Select
          items={SORTS}
          value={sort}
          onValueChange={(v) =>
            setParam("sort", String(v), v === DEFAULT_SORT)
          }
        >
          <SelectTrigger className="w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORTS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasFilters ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(pathname)}
        >
          <X /> Clear
        </Button>
      ) : null}
    </div>
  );
}
