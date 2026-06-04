import { ListPageSkeleton } from "@/components/list-page-skeleton";

export default function Loading() {
  // Email / Role / action — and no "Add" button on this page.
  return <ListPageSkeleton columns={3} rows={3} withAction={false} />;
}
