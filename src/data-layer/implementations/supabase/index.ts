import { DataLayerFactory } from "../../factory/DataLayerFactory";
import { SupabaseBookRepository } from "./SupabaseBookRepository";
import { SupabaseLanguageRepository } from "./SupabaseLanguageRepository";
import { SupabaseTagRepository } from "./SupabaseTagRepository";
import { SupabaseAnalyticsService } from "./SupabaseAnalyticsService";
// Mixed mode (see below): under the Supabase impl we deliberately register the
// Parse-backed authentication service and user repository, imported from the
// parseserver folder, in place of the Supabase stubs.
import { ParseAuthenticationService } from "../parseserver/ParseAuthenticationService";
import { ParseUserRepository } from "../parseserver/ParseUserRepository";

// ---------------------------------------------------------------------------
// MIXED MODE (SWITCHOVER-READINESS.md item D1)
//
// When VITE_DATA_LAYER_IMPL=supabase, book/language/tag READS come from
// Supabase, but AUTHENTICATION and USER operations stay Parse-backed so that
// login and moderator workflows keep working during the transition. Supabase
// auth is a later backend milestone; its implementations
// (SupabaseAuthenticationService / SupabaseUserRepository) are still stubs
// (state-query methods return "nobody logged in"; action methods throw).
//
// So under the Supabase implementation key we register the PARSE
// ParseAuthenticationService and ParseUserRepository instead of the Supabase
// stubs. Because getBloomApiHeaders() (src/connection/ApiConnection.ts) reads
// the session token from getAuthenticationService().getSessionToken(), this
// wiring means Bloom API calls carry the real Parse session token even while
// the read path is Supabase.
//
// The Supabase stub files are intentionally left in place — they are the
// eventual real implementations. Only this registration wiring changes. When
// the Supabase auth milestone lands, swap these two lines back to
// SupabaseAuthenticationService / SupabaseUserRepository.
// ---------------------------------------------------------------------------
export function registerSupabaseImplementations(): void {
    DataLayerFactory.getInstance().registerImplementations({
        SupabaseBookRepository,
        SupabaseLanguageRepository,
        SupabaseTagRepository,
        SupabaseAnalyticsService,
        // Mixed mode: Parse-backed auth/user under the Supabase impl key.
        SupabaseAuthenticationService: ParseAuthenticationService,
        SupabaseUserRepository: ParseUserRepository,
    });
}
