// Converts snake_case Supabase `books` rows (plus embedded `languages` and
// `users` rows) back into the camelCase, Parse-Server-shaped POJO that
// `createBookFromParseServerData` (src/model/Book.ts) already knows how to
// consume. This lets us reuse that mapper instead of writing/maintaining a
// second one for Supabase.

export interface SupabaseLanguageRow {
    id: string;
    iso_code?: string | null;
    name?: string | null;
    english_name?: string | null;
    usage_count?: number | null;
    banner_image_url?: string | null;
}

export interface SupabaseUserRow {
    id: string;
    email?: string | null;
}

// The subset of the `books` row shape we read. Supabase/PostgREST returns
// snake_case columns; `[key: string]: unknown` covers columns we don't
// otherwise care about (e.g. analytics_* fields not listed explicitly).
export interface SupabaseBookRow {
    id: string;
    created_at?: string | null;
    updated_at?: string | null;
    [key: string]: unknown;
}

function toParseDate(
    value: string | null | undefined
): { iso: string } | undefined {
    if (!value) {
        return undefined;
    }
    return { iso: new Date(value).toISOString() };
}

// Converts one embedded `languages` row into the shape Book.ts expects for
// entries in `langPointers` (see ILanguage in src/model/Language.ts).
function languageRowToLangPointer(language: SupabaseLanguageRow) {
    return {
        objectId: language.id,
        isoCode: language.iso_code ?? "",
        name: language.name ?? "",
        englishName: language.english_name ?? undefined,
        usageCount: language.usage_count ?? 0,
        bannerImageUrl: language.banner_image_url ?? undefined,
    };
}

/**
 * Build the Parse-shaped POJO for a single book row.
 *
 * @param row The raw `books` row from Supabase (snake_case columns).
 * @param embeddedLanguages The `languages` rows embedded via the
 *   `book_languages` join table (aliased in the select as `embeddedLanguages`
 *   to avoid colliding with the (unused) raw `languages` column on `books`).
 * @param embeddedUser The `users` row embedded via the `uploader_id` foreign
 *   key (aliased as `embeddedUser`), or null/undefined if there is none.
 */
export function supabaseRowToParseShape(
    row: SupabaseBookRow,
    embeddedLanguages?: SupabaseLanguageRow[] | null,
    embeddedUser?: SupabaseUserRow | null
): Record<string, unknown> {
    return {
        objectId: row.id,
        createdAt: row.created_at ?? new Date().toISOString(),
        updatedAt: row.updated_at ?? new Date().toISOString(),

        title: row.title ?? "",
        allTitles: row.all_titles ?? "",
        originalTitle: row.original_title ?? "",
        baseUrl: row.base_url ?? "",
        bookOrder: row.book_order ?? "",

        inCirculation: row.in_circulation !== false,
        draft: row.draft === true,
        rebrand: row.rebrand === true,

        license: row.license ?? "",
        licenseNotes: row.license_notes ?? "",
        summary: row.summary ?? "",
        copyright: row.copyright ?? "",

        harvestState: row.harvest_state ?? "",
        harvestLog: row.harvest_log ?? [],
        harvestStartedAt: toParseDate(row.harvest_started_at as string),

        tags: row.tags ?? [],
        pageCount: row.page_count != null ? String(row.page_count) : "",
        phashOfFirstContentImage: row.phash_of_first_content_image ?? "",
        bookHashFromImages: row.book_hash_from_images ?? "",

        // jsonb column; passed through as-is. ArtifactVisibilitySettingsGroup
        // .createFromParseServerData() knows how to read this shape.
        show: row.show ?? undefined,

        credits: row.credits ?? "",
        country: row.country ?? "",
        features: row.features ?? [],
        internetLimits: row.internet_limits ?? {},

        librarianNote: row.librarian_note ?? "",

        uploader: embeddedUser
            ? { objectId: embeddedUser.id, username: embeddedUser.email ?? "" }
            : undefined,
        langPointers: (embeddedLanguages ?? []).map(languageRowToLangPointer),

        importedBookSourceUrl: row.imported_book_source_url ?? undefined,
        downloadCount: row.download_count ?? -1,
        suitableForMakingShells: row.suitable_for_making_shells === true,
        lastUploaded: toParseDate(row.last_uploaded as string),

        publisher: row.publisher ?? "",
        originalPublisher: row.original_publisher ?? "",
        keywords: row.keywords ?? [],
        keywordStems: row.keyword_stems ?? [],
        bookInstanceId: row.book_instance_id ?? "",
        brandingProjectName: row.branding_project_name ?? "",
        edition: row.edition ?? "",
        // Note the deliberate case: Parse's field is `bloomPUBVersion`, not the
        // generic snake->camel conversion of `bloom_pub_version`.
        bloomPUBVersion: row.bloom_pub_version ?? undefined,
        leveledReaderLevel: row.leveled_reader_level ?? undefined,

        // Book.ts reads these three fields using this exact
        // "analytics_" + camelCase naming (carried over from Parse Server),
        // not a fully camelCased key.
        analytics_startedCount: row.analytics_started_count ?? 0,
        analytics_finishedCount: row.analytics_finished_count ?? 0,
        analytics_shellDownloads: row.analytics_shell_downloads ?? 0,
    };
}
