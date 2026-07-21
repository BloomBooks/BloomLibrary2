// Unit tests for SupabaseBookRepository that don't need a running Supabase
// stack: SupabaseConnection.getClient() is stubbed with the in-memory
// FakeSupabaseClient (fakeSupabaseQuery.ts), so the repository's row->record
// mapping can be asserted directly.
import { describe, it, expect, vi, afterEach } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseBookRepository } from "../implementations/supabase/SupabaseBookRepository";
import { SupabaseConnection } from "../implementations/supabase/SupabaseConnection";
import { FakeSupabaseClient, FakeQueryResolver } from "./fakeSupabaseQuery";

function stubClient(resolver: FakeQueryResolver): FakeSupabaseClient {
    const client = new FakeSupabaseClient(resolver);
    vi.spyOn(SupabaseConnection, "getClient").mockReturnValue(
        (client as unknown) as SupabaseClient
    );
    return client;
}

describe("SupabaseBookRepository.getBasicBookInfos", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    // Parity with ParseBookRepository.convertToBasicBookInfo, which derives
    // lang1Tag from show.pdf.langTag. Consumers (ByLanguageGroups,
    // LanguageFeatureList, DuplicateBookFilter) rely on it, so the Supabase
    // read path must populate it the same way.
    it("populates lang1Tag from show.pdf.langTag", async () => {
        stubClient(() => ({
            data: [
                {
                    id: "book-1",
                    title: "A Title",
                    base_url: "https://example.org/book-1",
                    show: { pdf: { langTag: "mfy" } },
                },
            ],
            error: null,
            count: 1,
        }));

        const repo = new SupabaseBookRepository();
        const infos = await repo.getBasicBookInfos(["book-1"]);

        expect(infos).toHaveLength(1);
        expect(infos[0].lang1Tag).toBe("mfy");
        expect(infos[0].show).toEqual({ pdf: { langTag: "mfy" } });
    });

    it("leaves lang1Tag undefined when show lacks a pdf.langTag", async () => {
        stubClient(() => ({
            data: [
                {
                    id: "book-2",
                    title: "No PDF",
                    base_url: "https://example.org/book-2",
                    show: { epub: { langTag: "en" } },
                },
                {
                    id: "book-3",
                    title: "No Show",
                    base_url: "https://example.org/book-3",
                    show: null,
                },
            ],
            error: null,
            count: 2,
        }));

        const repo = new SupabaseBookRepository();
        const infos = await repo.getBasicBookInfos(["book-2", "book-3"]);

        expect(infos).toHaveLength(2);
        expect(infos[0].lang1Tag).toBeUndefined();
        expect(infos[1].lang1Tag).toBeUndefined();
    });
});
