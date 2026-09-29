import { ListingsView } from "@/components/listings-view";

export default function ListingsPage({
  searchParams,
}: {
  searchParams?: { add?: string };
}) {
  const initialAdd = searchParams?.add === "1";
  return <ListingsView initialAdd={initialAdd} />;
}
