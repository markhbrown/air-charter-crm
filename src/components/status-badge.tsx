import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/database.types";

type InquiryStatus = Database["public"]["Enums"]["inquiry_status"];

const styles: Record<InquiryStatus, string> = {
  New: "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  Quoting:
    "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  Won: "border-transparent bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  Lost: "border-transparent bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
};

export function StatusBadge({ status }: { status: InquiryStatus }) {
  return (
    <Badge variant="outline" className={cn(styles[status])}>
      {status}
    </Badge>
  );
}
