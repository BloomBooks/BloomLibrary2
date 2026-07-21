import {
    DataLayerFactory,
    DataLayerImplementation,
} from "./factory/DataLayerFactory";
import { registerParseServerImplementations } from "./implementations/parseserver";
import { registerSupabaseImplementations } from "./implementations/supabase";

registerParseServerImplementations();
registerSupabaseImplementations();

const factory = DataLayerFactory.getInstance();

// Defaults to ParseServer; set VITE_DATA_LAYER_IMPL=supabase (e.g. in a .env
// file) to switch to the Supabase read-path instead. Optional chaining
// because import.meta.env may not have this key defined in every environment
// that evaluates this module, including some test runs.
if (import.meta.env?.VITE_DATA_LAYER_IMPL === "supabase") {
    factory.setImplementation(DataLayerImplementation.Supabase);
}

export function getBookRepository() {
    return factory.createBookRepository();
}

export function getUserRepository() {
    return factory.createUserRepository();
}

export function getLanguageRepository() {
    return factory.createLanguageRepository();
}

export function getTagRepository() {
    return factory.createTagRepository();
}

export function getAuthenticationService() {
    return factory.createAuthenticationService();
}

export function getAnalyticsService() {
    return factory.createAnalyticsService();
}
