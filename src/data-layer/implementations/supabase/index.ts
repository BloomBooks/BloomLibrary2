import { DataLayerFactory } from "../../factory/DataLayerFactory";
import { HybridBookRepository } from "./HybridBookRepository";
import { SupabaseLanguageRepository } from "./SupabaseLanguageRepository";
import { SupabaseTagRepository } from "./SupabaseTagRepository";
import { SupabaseAnalyticsService } from "./SupabaseAnalyticsService";
// Mixed mode (see below): under the Supabase impl we deliberately register the
// Parse-backed authentication service and user repository, imported from the
// parseserver folder, in place of the Supabase stubs. Book writes are handled
// the same way, via HybridBookRepository (reads Supabase, writes Parse).
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
// Book WRITES are mixed-mode for the same reason: SupabaseBookRepository's
// write methods are unimplemented (they throw) and safe writes need the
// Supabase auth milestone. So instead of the bare SupabaseBookRepository we
// register HybridBookRepository under the Supabase impl key — it serves reads
// from Supabase and delegates updateBook/deleteBook/saveArtifactVisibility to
// ParseBookRepository (authenticated by the same Parse session token as above).
//
// The Supabase stub files are intentionally left in place — they are the
// eventual real implementations. Only this registration wiring changes. When
// the Supabase auth (and book write) milestone lands, swap the auth/user lines
// back to SupabaseAuthenticationService / SupabaseUserRepository and register
// the bare SupabaseBookRepository in place of HybridBookRepository.
// ---------------------------------------------------------------------------
export function registerSupabaseImplementations(): void {
    DataLayerFactory.getInstance().registerImplementations({
        // Mixed mode: Supabase reads, Parse writes (see HybridBookRepository).
        SupabaseBookRepository: HybridBookRepository,
        SupabaseLanguageRepository,
        SupabaseTagRepository,
        SupabaseAnalyticsService,
        // Mixed mode: Parse-backed auth/user under the Supabase impl key.
        SupabaseAuthenticationService: ParseAuthenticationService,
        SupabaseUserRepository: ParseUserRepository,
    });
}
