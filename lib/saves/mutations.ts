/**
 * Saves mutations
 * Database mutations for listing saves
 */

import { createClient } from "@/lib/supabase/server";

export async function toggleListingSave(
  listingId: string,
  userId: string,
): Promise<boolean> {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("listing_saves")
    .select("id")
    .eq("listing_id", listingId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("listing_saves")
      .delete()
      .eq("id", existing.id);

    if (error) throw error;
    return false;
  } else {
    const { error } = await supabase
      .from("listing_saves")
      .insert({ listing_id: listingId, user_id: userId });

    if (error) throw error;
    return true;
  }
}
