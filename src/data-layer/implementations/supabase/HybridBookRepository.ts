// ---------------------------------------------------------------------------
// MIXED MODE for the Book repository (SWITCHOVER-READINESS.md item D1)
//
// When VITE_DATA_LAYER_IMPL=supabase, anonymous book READS are served by the
// Supabase read path, but authenticated book WRITES (updateBook, deleteBook,
// saveArtifactVisibility) still go to Parse: SupabaseBookRepository's write
// methods are not implemented yet (they throw), and writing safely also needs
// the Supabase auth milestone, which is not built. Until Supabase write +
// auth support lands, this hybrid keeps moderator/edit workflows working.
//
// This mirrors the auth mixed-mode registration in
// src/data-layer/implementations/supabase/index.ts, where the Supabase impl
// key registers Parse-backed ParseAuthenticationService / ParseUserRepository.
// Here the Supabase impl key registers this hybrid: reads delegate to
// SupabaseBookRepository, writes delegate to ParseBookRepository. Because Bloom
// API calls carry the real Parse session token (getBloomApiHeaders reads it
// from the Parse-backed authentication service), the Parse write path is
// authenticated the same way it is under the ParseServer impl.
//
// When Supabase write + auth support lands, drop this hybrid and register the
// bare SupabaseBookRepository instead.
// ---------------------------------------------------------------------------
import { IFilter } from "FilterTypes";
import {
    BasicBookInfoRecord,
    IBookRepository,
} from "../../interfaces/IBookRepository";
import type { BookModel } from "../../models/BookModel";
import type { ArtifactVisibilitySettingsGroup } from "../../../model/ArtifactVisibilitySettings";
import type { Book } from "../../../model/Book";
import {
    BookGridQuery,
    BookGridResult,
    BookSearchQuery,
    BookSearchResult,
} from "../../types/QueryTypes";
import { ParseBookRepository } from "../parseserver/ParseBookRepository";
import { SupabaseBookRepository } from "./SupabaseBookRepository";

export class HybridBookRepository implements IBookRepository {
    // Reads are served by Supabase; writes are delegated to Parse. The repos
    // are injectable so tests can substitute spies/mocks; the factory
    // constructs this with no arguments, wiring up the real repositories.
    private readonly readRepository: IBookRepository;
    private readonly writeRepository: IBookRepository;

    constructor(
        readRepository: IBookRepository = new SupabaseBookRepository(),
        writeRepository: IBookRepository = new ParseBookRepository()
    ) {
        this.readRepository = readRepository;
        this.writeRepository = writeRepository;
    }

    // --- Reads: Supabase --------------------------------------------------
    getBook(id: string): Promise<Book | null> {
        return this.readRepository.getBook(id);
    }

    getBooks(ids: string[]): Promise<Book[]> {
        return this.readRepository.getBooks(ids);
    }

    searchBooks(query: BookSearchQuery): Promise<BookSearchResult> {
        return this.readRepository.searchBooks(query);
    }

    getBooksForGrid(query: BookGridQuery): Promise<BookGridResult> {
        return this.readRepository.getBooksForGrid(query);
    }

    getBookCount(filter: IFilter): Promise<number> {
        return this.readRepository.getBookCount(filter);
    }

    getRelatedBooks(bookId: string): Promise<Book[]> {
        return this.readRepository.getRelatedBooks(bookId);
    }

    getBookDetail(id: string): Promise<Book | null> {
        return this.readRepository.getBookDetail(id);
    }

    getBasicBookInfos(ids: string[]): Promise<BasicBookInfoRecord[]> {
        return this.readRepository.getBasicBookInfos(ids);
    }

    getCurrentBookData(bookId: string): Promise<Book | null> {
        return this.readRepository.getCurrentBookData(bookId);
    }

    // --- Writes: Parse ----------------------------------------------------
    updateBook(id: string, updates: Partial<BookModel>): Promise<void> {
        return this.writeRepository.updateBook(id, updates);
    }

    deleteBook(id: string): Promise<void> {
        return this.writeRepository.deleteBook(id);
    }

    saveArtifactVisibility(
        id: string,
        settings: ArtifactVisibilitySettingsGroup
    ): Promise<void> {
        return this.writeRepository.saveArtifactVisibility(id, settings);
    }
}
