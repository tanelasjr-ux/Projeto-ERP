import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listMyTenants } from "@/lib/data/tenants";
import { OnboardingWizard } from "./wizard";

export default async function AssistentePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const tenants = await listMyTenants();
  return <OnboardingWizard hasTenants={tenants.length > 0} />;
}
