// Unit tests for SupabaseBookMapper.ts -- pure row -> Parse-shaped POJO
// mapping, with no network involved.
import { describe, it, expect } from "vitest";
import {
    supabaseRowToParseShape,
    SupabaseBookRow,
    SupabaseLanguageRow,
    SupabaseUserRow,
} from "../implementations/supabase/SupabaseBookMapper";

function makeRow(overrides: Partial<SupabaseBookRow> = {}): SupabaseBookRow {
    return {
        id: "book-1",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-02-01T00:00:00Z",
        title: "A Title",
        all_titles: "en:A Title",
        original_title: "Original",
        base_url: "https://example.org/book-1",
        book_order: "1",
        in_circulation: true,
        draft: false,
        rebrand: false,
        license: "cc-by",
        license_notes: "notes",
        summary: "a summary",
        copyright: "2020",
        harvest_state: "Done",
        harvest_log: ["step1"],
        harvest_started_at: "2024-01-02T00:00:00Z",
        tags: ["topic:Health", "level:2"],
        page_count: 24,
        phash_of_first_content_image: "abc123",
        book_hash_from_images: "deadbeef",
        show: { pdf: { langTag: "en" } },
        credits: "Jane Doe",
        country: "US",
        features: ["talkingBook"],
        internet_limits: {},
        librarian_note: "a note",
        imported_book_source_url: "https://source.example.org",
        download_count: 5,
        suitable_for_making_shells: true,
        last_uploaded: "2024-03-01T00:00:00Z",
        publisher: "Acme",
        original_publisher: "Acme Prior",
        keywords: ["cat"],
        keyword_stems: ["cat"],
        book_instance_id: "inst-1",
        branding_project_name: "Acme Brand",
        edition: "2nd",
        bloom_pub_version: "5.0",
        leveled_reader_level: 3,
        analytics_started_count: 10,
        analytics_finished_count: 4,
        analytics_shell_downloads: 2,
        ...overrides,
    };
}

const language: SupabaseLanguageRow = {
    id: "lang-1",
    iso_code: "en",
    name: "English",
    english_name: "English",
    usage_count: 42,
    banner_image_url: "https://example.org/banner.png",
};

const user: SupabaseUserRow = {
    id: "user-1",
    email: "jane@example.org",
};

describe("supabaseRowToParseShape", () => {
    it("maps a fully-populated row, including embedded languages and uploader", () => {
        const pojo = supabaseRowToParseShape(makeRow(), [language], user);

        expect(pojo).toMatchObject({
            objectId: "book-1",
            // createdAt/updatedAt are passed through as-is (raw column
            // value), unlike harvestStartedAt/lastUploaded below which go
            // through toParseDate() and get re-serialized via `new Date()`.
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-02-01T00:00:00Z",
            title: "A Title",
            allTitles: "en:A Title",
            originalTitle: "Original",
            baseUrl: "https://example.org/book-1",
            bookOrder: "1",
            inCirculation: true,
            draft: false,
            rebrand: false,
            license: "cc-by",
            licenseNotes: "notes",
            summary: "a summary",
            copyright: "2020",
            harvestState: "Done",
            harvestLog: ["step1"],
            tags: ["topic:Health", "level:2"],
            pageCount: "24",
            phashOfFirstContentImage: "abc123",
            bookHashFromImages: "deadbeef",
            show: { pdf: { langTag: "en" } },
            credits: "Jane Doe",
            country: "US",
            features: ["talkingBook"],
            internetLimits: {},
            librarianNote: "a note",
            importedBookSourceUrl: "https://source.example.org",
            downloadCount: 5,
            suitableForMakingShells: true,
            publisher: "Acme",
            originalPublisher: "Acme Prior",
            keywords: ["cat"],
            keywordStems: ["cat"],
            bookInstanceId: "inst-1",
            brandingProjectName: "Acme Brand",
            edition: "2nd",
            bloomPUBVersion: "5.0",
            leveledReaderLevel: 3,
            analytics_startedCount: 10,
            analytics_finishedCount: 4,
            analytics_shellDownloads: 2,
        });

        expect(pojo.harvestStartedAt).toEqual({
            iso: "2024-01-02T00:00:00.000Z",
        });
        expect(pojo.lastUploaded).toEqual({ iso: "2024-03-01T00:00:00.000Z" });

        expect(pojo.uploader).toEqual({
            objectId: "user-1",
            username: "jane@example.org",
        });

        expect(pojo.langPointers).toEqual([
            {
                objectId: "lang-1",
                isoCode: "en",
                name: "English",
                englishName: "English",
                usageCount: 42,
                bannerImageUrl: "https://example.org/banner.png",
            },
        ]);
    });

    it("defaults embedded languages/uploader to empty/undefined when omitted", () => {
        const pojo = supabaseRowToParseShape(makeRow());
        expect(pojo.langPointers).toEqual([]);
        expect(pojo.uploader).toBeUndefined();
    });

    it("defaults embedded languages/uploader to empty/undefined when explicitly null", () => {
        const pojo = supabaseRowToParseShape(makeRow(), null, null);
        expect(pojo.langPointers).toEqual([]);
        expect(pojo.uploader).toBeUndefined();
    });

    it("is null-tolerant across every optional column, falling back to the documented defaults", () => {
        const minimalRow: SupabaseBookRow = { id: "book-2" };
        const pojo = supabaseRowToParseShape(minimalRow);

        expect(pojo.objectId).toBe("book-2");
        // createdAt/updatedAt fall back to "now" rather than being empty --
        // just assert they parse as valid ISO dates rather than pinning the
        // exact value (the mapper uses `new Date().toISOString()`).
        expect(() => new Date(pojo.createdAt as string)).not.toThrow();
        expect(new Date(pojo.createdAt as string).toString()).not.toBe(
            "Invalid Date"
        );

        expect(pojo).toMatchObject({
            title: "",
            allTitles: "",
            originalTitle: "",
            baseUrl: "",
            bookOrder: "",
            license: "",
            licenseNotes: "",
            summary: "",
            copyright: "",
            harvestState: "",
            harvestLog: [],
            tags: [],
            pageCount: "",
            phashOfFirstContentImage: "",
            bookHashFromImages: "",
            show: undefined,
            credits: "",
            country: "",
            features: [],
            internetLimits: {},
            librarianNote: "",
            importedBookSourceUrl: undefined,
            downloadCount: -1,
            suitableForMakingShells: false,
            publisher: "",
            originalPublisher: "",
            keywords: [],
            keywordStems: [],
            bookInstanceId: "",
            brandingProjectName: "",
            edition: "",
            bloomPUBVersion: undefined,
            leveledReaderLevel: undefined,
            analytics_startedCount: 0,
            analytics_finishedCount: 0,
            analytics_shellDownloads: 0,
        });
        expect(pojo.harvestStartedAt).toBeUndefined();
        expect(pojo.lastUploaded).toBeUndefined();
        expect(pojo.langPointers).toEqual([]);
        expect(pojo.uploader).toBeUndefined();
    });

    it("treats in_circulation as true unless it is exactly false (tri-state-ish default)", () => {
        expect(
            supabaseRowToParseShape(makeRow({ in_circulation: undefined }))
                .inCirculation
        ).toBe(true);
        expect(
            supabaseRowToParseShape(makeRow({ in_circulation: null }))
                .inCirculation
        ).toBe(true);
        expect(
            supabaseRowToParseShape(makeRow({ in_circulation: false }))
                .inCirculation
        ).toBe(false);
    });

    it("treats draft/rebrand as false unless exactly true", () => {
        expect(
            supabaseRowToParseShape(makeRow({ draft: undefined })).draft
        ).toBe(false);
        expect(supabaseRowToParseShape(makeRow({ draft: true })).draft).toBe(
            true
        );
        expect(
            supabaseRowToParseShape(makeRow({ rebrand: undefined })).rebrand
        ).toBe(false);
        expect(
            supabaseRowToParseShape(makeRow({ rebrand: true })).rebrand
        ).toBe(true);
    });

    it("stringifies page_count but leaves other numeric fields as numbers", () => {
        const pojo = supabaseRowToParseShape(makeRow({ page_count: 0 }));
        expect(pojo.pageCount).toBe("0");
        expect(typeof pojo.downloadCount).toBe("number");
        expect(typeof pojo.leveledReaderLevel).toBe("number");
    });

    it("maps multiple embedded languages in order", () => {
        const secondLanguage: SupabaseLanguageRow = {
            id: "lang-2",
            iso_code: "fr",
            name: "French",
        };
        const pojo = supabaseRowToParseShape(makeRow(), [
            language,
            secondLanguage,
        ]);
        expect(pojo.langPointers).toEqual([
            expect.objectContaining({ objectId: "lang-1", isoCode: "en" }),
            expect.objectContaining({
                objectId: "lang-2",
                isoCode: "fr",
                name: "French",
                englishName: undefined,
                usageCount: 0,
                bannerImageUrl: undefined,
            }),
        ]);
    });

    it("maps an uploader with a missing email to an empty username rather than dropping the field", () => {
        const pojo = supabaseRowToParseShape(makeRow(), [], {
            id: "user-2",
            email: null,
        });
        expect(pojo.uploader).toEqual({ objectId: "user-2", username: "" });
    });
});
