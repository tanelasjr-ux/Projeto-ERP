import { createClient } from "@/lib/supabase/server";

export type Branding = {
  accentColor: string;
  logoPath: string | null;
  logoDarkPath: string | null;
};

export async function getBranding(
  tenantId: string,
): Promise<Branding | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tenant_branding")
    .select("accent_color, logo_path, logo_dark_path")
    .eq("tenant_id", tenantId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return {
    accentColor: data.accent_color,
    logoPath: data.logo_path,
    logoDarkPath: data.logo_dark_path,
  };
}
