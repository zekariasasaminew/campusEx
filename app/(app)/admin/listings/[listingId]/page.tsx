import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkIsAdmin } from "@/lib/admin/queries";
import { getAdminListing } from "@/lib/admin/actions";
import ListingDetailClient from "./ListingDetailClient";

export const metadata = {
  title: "Manage Listing - Admin",
  description: "Edit or delete marketplace listing",
};

interface PageProps {
  params: Promise<{ listingId: string }>;
}

export default async function AdminListingDetailPage({ params }: PageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const isAdmin = await checkIsAdmin(user.id);
  if (!isAdmin) {
    redirect("/marketplace");
  }

  const { listingId } = await params;
  const result = await getAdminListing(listingId);

  if (!result.success || !result.data) {
    redirect("/admin/listings");
  }

  return <ListingDetailClient listing={result.data} />;
}
