import { ListPageSkeleton } from "@/components/list-page-skeleton";

export default function Loading() {
  return <ListPageSkeleton columns={6} withFilters />;
}
