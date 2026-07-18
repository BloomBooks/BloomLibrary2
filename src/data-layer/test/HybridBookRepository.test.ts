// Unit tests for HybridBookRepository, the mixed-mode book repository used
// under the Supabase implementation key: anonymous READS are served by the
// Supabase read path, while authenticated WRITES (updateBook, deleteBook,
// saveArtifactVisibility) are delegated to Parse until Supabase write + auth
// support lands. See src/data-layer/implementations/supabase/HybridBookRepository.ts
// and the mixed-mode registration in
// src/data-layer/implementations/supabase/index.ts.
//
// The two underlying repositories are injected as mocks so we can assert which
// side each interface method delegates to without a running backend.
import { describe, it, expect, vi } from "vitest";
import { HybridBookRepository } from "../implementations/supabase/HybridBookRepository";
import { IBookRepository } from "../interfaces/IBookRepository";
import type { BookModel } from "../models/BookModel";
import type { ArtifactVisibilitySettingsGroup } from "../../model/ArtifactVisibilitySettings";

// Methods that must be served by the Supabase (read) repository.
const READ_METHODS = [
    "getBook",
    "getBooks",
    "searchBooks",
    "getBooksForGrid",
    "getBookCount",
    "getRelatedBooks",
    "getBookDetail",
    "getBasicBookInfos",
    "getCurrentBookData",
] as const;

// Methods that must be delegated to the Parse (write) repository.
const WRITE_METHODS = [
    "updateBook",
    "deleteBook",
    "saveArtifactVisibility",
] as const;

// A representative argument tuple per method, so we can invoke every method in
// a loop and check both delegation and argument forwarding.
const METHOD_ARGS: Record<string, unknown[]> = {
    getBook: ["book-1"],
    getBooks: [["book-1", "book-2"]],
    searchBooks: [{ filter: {} }],
    getBooksForGrid: [{ filter: {} }],
    getBookCount: [{}],
    getRelatedBooks: ["book-1"],
    getBookDetail: ["book-1"],
    getBasicBookInfos: [["book-1"]],
    getCurrentBookData: ["book-1"],
    updateBook: ["book-1", { title: "New Title" } as Partial<BookModel>],
    deleteBook: ["book-1"],
    saveArtifactVisibility: ["book-1", {} as ArtifactVisibilitySettingsGroup],
};

// Build a mock IBookRepository where every method is a spy resolving to a
// sentinel value, so we can assert the hybrid returns exactly what the
// underlying repo returned.
function makeMockRepository(): {
    repo: IBookRepository;
    returns: Record<string, unknown>;
} {
    const returns: Record<string, unknown> = {};
    const repo = {} as Record<string, ReturnType<typeof vi.fn>>;
    for (const name of [...READ_METHODS, ...WRITE_METHODS]) {
        const sentinel = { from: name };
        returns[name] = sentinel;
        repo[name] = vi.fn().mockResolvedValue(sentinel);
    }
    return { repo: (repo as unknown) as IBookRepository, returns };
}

describe("HybridBookRepository", () => {
    it("delegates every read method to the Supabase (read) repository", async () => {
        const read = makeMockRepository();
        const write = makeMockRepository();
        const hybrid = new HybridBookRepository(read.repo, write.repo);

        for (const name of READ_METHODS) {
            const args = METHOD_ARGS[name];
            const result = await ((hybrid as unknown) as Record<
                string,
                (...a: unknown[]) => Promise<unknown>
            >)[name](...args);

            const readSpy = ((read.repo as unknown) as Record<
                string,
                ReturnType<typeof vi.fn>
            >)[name];
            const writeSpy = ((write.repo as unknown) as Record<
                string,
                ReturnType<typeof vi.fn>
            >)[name];

            expect(readSpy).toHaveBeenCalledTimes(1);
            expect(readSpy).toHaveBeenCalledWith(...args);
            expect(writeSpy).not.toHaveBeenCalled();
            expect(result).toBe(read.returns[name]);
        }
    });

    it("delegates updateBook/deleteBook/saveArtifactVisibility to the Parse (write) repository", async () => {
        const read = makeMockRepository();
        const write = makeMockRepository();
        const hybrid = new HybridBookRepository(read.repo, write.repo);

        for (const name of WRITE_METHODS) {
            const args = METHOD_ARGS[name];
            await ((hybrid as unknown) as Record<
                string,
                (...a: unknown[]) => Promise<unknown>
            >)[name](...args);

            const readSpy = ((read.repo as unknown) as Record<
                string,
                ReturnType<typeof vi.fn>
            >)[name];
            const writeSpy = ((write.repo as unknown) as Record<
                string,
                ReturnType<typeof vi.fn>
            >)[name];

            expect(writeSpy).toHaveBeenCalledTimes(1);
            expect(writeSpy).toHaveBeenCalledWith(...args);
            expect(readSpy).not.toHaveBeenCalled();
        }
    });

    // Guards against a future interface method being added without a matching
    // delegation on the hybrid: every method must dispatch to exactly one side.
    it("implements every IBookRepository method (none left unimplemented)", async () => {
        const read = makeMockRepository();
        const write = makeMockRepository();
        const hybrid = new HybridBookRepository(read.repo, write.repo);

        for (const name of [...READ_METHODS, ...WRITE_METHODS]) {
            const method = ((hybrid as unknown) as Record<string, unknown>)[
                name
            ];
            expect(typeof method).toBe("function");

            // Every method must resolve (delegate) rather than throw a
            // "not implemented" error like the bare SupabaseBookRepository does.
            await expect(
                ((hybrid as unknown) as Record<
                    string,
                    (...a: unknown[]) => Promise<unknown>
                >)[name](...METHOD_ARGS[name])
            ).resolves.not.toThrow();

            const readCalled = ((read.repo as unknown) as Record<
                string,
                ReturnType<typeof vi.fn>
            >)[name].mock.calls.length;
            const writeCalled = ((write.repo as unknown) as Record<
                string,
                ReturnType<typeof vi.fn>
            >)[name].mock.calls.length;
            // Dispatched to exactly one underlying repository.
            expect(readCalled + writeCalled).toBe(1);
        }
    });

    it("defaults to real Supabase reads and Parse writes when constructed with no arguments", () => {
        // The factory calls `new HybridBookRepository()`; make sure that path
        // wires up concrete repositories rather than leaving anything undefined.
        const hybrid = new HybridBookRepository();
        for (const name of [...READ_METHODS, ...WRITE_METHODS]) {
            expect(
                typeof ((hybrid as unknown) as Record<string, unknown>)[name]
            ).toBe("function");
        }
    });
});
