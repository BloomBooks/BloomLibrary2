/// <reference types="vite/client" />

interface ImportMetaEnv {
    // Which data layer implementation to boot with. Defaults to ParseServer
    // when unset; set to "supabase" to use the Supabase read-path instead.
    readonly VITE_DATA_LAYER_IMPL?: string;
    readonly VITE_SUPABASE_URL?: string;
    readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
