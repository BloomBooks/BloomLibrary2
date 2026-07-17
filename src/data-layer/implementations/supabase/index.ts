import { DataLayerFactory } from "../../factory/DataLayerFactory";
import { SupabaseBookRepository } from "./SupabaseBookRepository";
import { SupabaseUserRepository } from "./SupabaseUserRepository";
import { SupabaseLanguageRepository } from "./SupabaseLanguageRepository";
import { SupabaseTagRepository } from "./SupabaseTagRepository";
import { SupabaseAuthenticationService } from "./SupabaseAuthenticationService";
import { SupabaseAnalyticsService } from "./SupabaseAnalyticsService";

export function registerSupabaseImplementations(): void {
    DataLayerFactory.getInstance().registerImplementations({
        SupabaseBookRepository,
        SupabaseUserRepository,
        SupabaseLanguageRepository,
        SupabaseTagRepository,
        SupabaseAuthenticationService,
        SupabaseAnalyticsService,
    });
}
