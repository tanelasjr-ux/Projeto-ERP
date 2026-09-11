// PLACEHOLDER — substituir pelo arquivo real gerado com:
//   supabase gen types typescript --project-id wgflppavupmjchkvudkp --schema public
// Enquanto o schema real não é fornecido, este tipo fica VAZIO de propósito:
// qualquer supabase.from('tabela') vai falhar na compilação, forçando o uso dos
// tipos reais antes de construir telas que tocam o banco. Auth não usa tabelas.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Tables<
  T extends keyof Database["public"]["Tables"],
> = Database["public"]["Tables"][T] extends { Row: infer R } ? R : never;
