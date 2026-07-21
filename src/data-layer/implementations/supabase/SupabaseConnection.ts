// Supabase connection logic, parallel to ParseConnection.ts.
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Defaults point at the local Supabase stack used during the ParseServer ->
// Supabase migration. Override with VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
// (e.g. in a .env file) to point at a different environment.
const DEFAULT_SUPABASE_URL = "http://127.0.0.1:44321";
const DEFAULT_SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

export class SupabaseConnection {
    private static client: SupabaseClient | null = null;

    public static getClient(): SupabaseClient {
        if (!this.client) {
            // Optional chaining because import.meta.env may not have these
            // keys populated (e.g. no .env file present) in every environment
            // that evaluates this module, including some test runs.
            const url =
                import.meta.env?.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
            const anonKey =
                import.meta.env?.VITE_SUPABASE_ANON_KEY ||
                DEFAULT_SUPABASE_ANON_KEY;

            this.client = createClient(url, anonKey);
        }
        return this.client;
    }

    // Reset connection (useful for testing)
    public static reset(): void {
        this.client = null;
    }
}
