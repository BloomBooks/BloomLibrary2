import axios from "axios";
import type { AxiosStatic } from "axios";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import type { Mocked } from "vitest";
import type { IBookRepository } from "../interfaces/IBookRepository";
import { ParseBookRepository } from "../implementations/parseserver/ParseBookRepository";
import { ParseConnection } from "../implementations/parseserver/ParseConnection";
import type { BookModel } from "../models/BookModel";
import type { IFilter } from "FilterTypes";
import type { BookSearchResult, BookGridResult } from "../types/QueryTypes";

vi.mock("axios");

const constructParseBookQueryMock = vi.hoisted(() => vi.fn());
const createBookFromParseServerDataMock = vi.hoisted(() => vi.fn());

vi.mock("../../connection/BookQueryBuilder", () => ({
    constructParseBookQuery: constructParseBookQueryMock,
    constructParseSortOrder: (
        sortingArray: { columnName: string; descending: boolean }[]
    ) => {
        if (!sortingArray?.length) return "";
        const { columnName, descending } = sortingArray[0];
        return descending ? "-" + columnName : columnName;
    },
}));

vi.mock("../../model/Book", () => ({
    createBookFromParseServerData: createBookFromParseServerDataMock,
    Book: class {},
}));

const mockedAxios = (axios as unknown) as Mocked<AxiosStatic>;

describe("ParseBookRepository", () => {
    let repository: IBookRepository;

    beforeEach(() => {
        vi.clearAllMocks();
        ParseConnection.reset();
        repository = new ParseBookRepository();

        constructParseBookQueryMock.mockImplementation((base) => ({ ...base }));
        createBookFromParseServerDataMock.mockImplementation((data: any) => ({
            id: data.objectId ?? "book-id",
            title: data.title ?? "A Title",
            baseUrl: data.baseUrl ?? "https://example.org",
            license: data.license ?? "cc",
            copyright: data.copyright ?? "copyright",
            tags: data.tags ?? [],
            summary: data.summary ?? "",
            pageCount: data.pageCount ?? "10",
            features: data.features ?? [],
            inCirculation: data.inCirculation ?? true,
            draft: data.draft ?? false,
            harvestState: data.harvestState ?? "",
            uploader: data.uploader,
            downloadCount: data.downloadCount ?? 0,
            country: data.country ?? "",
            publisher: data.publisher ?? "",
            originalPublisher: data.originalPublisher ?? "",
            bookInstanceId: data.bookInstanceId ?? "instance-1",
            brandingProjectName: data.brandingProjectName ?? "",
            edition: data.edition ?? "",
            rebrand: data.rebrand ?? false,
            phashOfFirstContentImage: data.phashOfFirstContentImage ?? "",
            bookHashFromImages: data.bookHashFromImages ?? "",
        }));
    });

    afterEach(() => {
        vi.resetAllMocks();
        ParseConnection.reset();
    });

    it("retrieves a book by id", async () => {
        mockedAxios.get.mockResolvedValueOnce({
            data: {
                results: [
                    {
                        objectId: "book-1",
                        title: "Book One",
                        createdAt: "2024-01-01T00:00:00Z",
                        updatedAt: "2024-02-01T00:00:00Z",
                        tags: ["topic:science"],
                    },
                ],
            },
        });

        const book = await repository.getBook("book-1");

        expect(book?.title).toBe("Book One");
        expect(mockedAxios.get).toHaveBeenCalledWith(
            expect.stringContaining("classes/books"),
            expect.objectContaining({
                params: expect.objectContaining({
                    where: JSON.stringify({ objectId: "book-1" }),
                    include: "uploader,langPointers",
                }),
            })
        );
        expect(createBookFromParseServerDataMock).toHaveBeenCalledWith(
            expect.objectContaining({ objectId: "book-1" })
        );
    });

    it("searches books using constructed query", async () => {
        const queryFilter: IFilter = { search: "science" } as IFilter;
        constructParseBookQueryMock.mockImplementationOnce((base, filter) => ({
            ...base,
            where: filter,
            order: "-createdAt",
        }));

        mockedAxios.get.mockResolvedValueOnce({
            data: {
                results: [
                    { objectId: "book-1", title: "One" },
                    { objectId: "book-2", title: "Two" },
                ],
                count: 7,
            },
        });

        const result = await repository.searchBooks({
            filter: queryFilter,
            pagination: { limit: 2, skip: 0 },
        } as any);

        expect(constructParseBookQueryMock).toHaveBeenCalledWith(
            expect.objectContaining({ limit: 2, skip: 0 }),
            queryFilter,
            [],
            expect.anything()
        );
        expect(result.items).toHaveLength(2);
        expect(result.totalCount).toBe(7);
        expect(mockedAxios.get).toHaveBeenCalledWith(
            expect.stringContaining("classes/books"),
            expect.objectContaining({
                params: expect.objectContaining({
                    where: JSON.stringify(queryFilter),
                    limit: 2,
                    skip: 0,
                    count: 1,
                }),
            })
        );
    });

    it("updates a book and appends update source", async () => {
        mockedAxios.put.mockResolvedValueOnce({ data: {} });

        await repository.updateBook("book-5", {
            title: "Updated",
            tags: ["topic:science", "level:1"],
            pageCount: "32",
        } as Partial<BookModel>);

        expect(mockedAxios.put).toHaveBeenCalledWith(
            expect.stringContaining("classes/books/book-5"),
            expect.objectContaining({
                title: "Updated",
                // Parse stores tags as an array, so it must be sent as an array.
                tags: ["topic:science", "level:1"],
                pageCount: "32",
                updateSource: "libraryUserControl",
            }),
            expect.any(Object)
        );
    });

    it("preserves a caller-supplied update source (e.g. bulk edit)", async () => {
        mockedAxios.put.mockResolvedValueOnce({ data: {} });

        await repository.updateBook("book-9", ({
            harvestState: "Requested",
            updateSource: "bloom-library-bulk-edit",
        } as unknown) as Partial<BookModel>);

        expect(mockedAxios.put).toHaveBeenCalledWith(
            expect.stringContaining("classes/books/book-9"),
            expect.objectContaining({
                harvestState: "Requested",
                updateSource: "bloom-library-bulk-edit",
            }),
            expect.any(Object)
        );
    });

    it("saves artifact visibility under the Parse show column", async () => {
        mockedAxios.put.mockResolvedValueOnce({ data: {} });

        const settings = {
            pdf: { harvester: true, user: false },
            epub: undefined,
        };

        await repository.saveArtifactVisibility("book-7", settings as any);

        expect(mockedAxios.put).toHaveBeenCalledWith(
            expect.stringContaining("classes/books/book-7"),
            expect.objectContaining({
                show: settings,
                updateSource: "libraryUserControl",
            }),
            expect.any(Object)
        );
    });

    it("applies caller-supplied grid sorting to the query order", async () => {
        constructParseBookQueryMock.mockImplementationOnce((base) => ({
            ...base,
            where: {},
            order: "-createdAt",
        }));

        mockedAxios.get.mockResolvedValueOnce({
            data: { results: [], count: 0 },
        });

        await repository.getBooksForGrid({
            filter: {} as IFilter,
            sorting: [{ columnName: "title", descending: true }],
            pagination: { limit: 10, skip: 0 },
        } as any);

        expect(mockedAxios.get).toHaveBeenCalledWith(
            expect.stringContaining("classes/books"),
            expect.objectContaining({
                params: expect.objectContaining({ order: "-title" }),
            })
        );
    });

    it("aggregates grid results from searchBooks", async () => {
        const books: any[] = [{ objectId: "book-1" }];
        const searchResult: BookSearchResult = {
            books,
            totalMatchingRecords: 3,
            errorString: null,
            waiting: false,
            items: books,
            totalCount: 3,
            hasMore: false,
        };

        const searchSpy = vi
            .spyOn(repository, "searchBooks")
            .mockResolvedValueOnce(searchResult);

        const result = await repository.getBooksForGrid({
            filter: {} as IFilter,
            pagination: { limit: 10, skip: 0 },
        } as any);

        expect(searchSpy).toHaveBeenCalled();
        expect(result.totalMatchingBooksCount).toBe(3);
        expect(result.onePageOfMatchingBooks).toEqual(books);
    });

    it("counts books using constructed query", async () => {
        constructParseBookQueryMock.mockImplementationOnce((base, filter) => ({
            ...base,
            where: filter,
            count: 1,
        }));

        mockedAxios.get.mockResolvedValueOnce({
            data: {
                results: [],
                count: 9,
            },
        });

        const count = await repository.getBookCount({
            search: "history",
        } as IFilter);

        expect(count).toBe(9);
        expect(mockedAxios.get).toHaveBeenCalledWith(
            expect.stringContaining("classes/books"),
            expect.objectContaining({
                params: expect.objectContaining({
                    where: JSON.stringify({ search: "history" }),
                    count: 1,
                    limit: 0,
                }),
            })
        );
    });

    it("filters related books to circulating titles", async () => {
        mockedAxios.get.mockResolvedValueOnce({
            data: {
                results: [
                    {
                        books: [
                            { objectId: "book-1", inCirculation: true },
                            { objectId: "book-2", inCirculation: false },
                            { objectId: "book-3", inCirculation: true },
                        ],
                    },
                ],
            },
        });

        const related = await repository.getRelatedBooks("book-1");

        expect(related).toHaveLength(1);
        expect(createBookFromParseServerDataMock).toHaveBeenCalledWith(
            expect.objectContaining({ objectId: "book-3" })
        );
    });

    it("maps basic book infos from parse response", async () => {
        mockedAxios.get.mockResolvedValueOnce({
            data: {
                results: [
                    {
                        objectId: "book-1",
                        title: "Book",
                        langPointers: [{ objectId: "lang-1" }],
                        show: { pdf: { langTag: "en" } },
                    },
                ],
            },
        });

        const infos = await repository.getBasicBookInfos(["book-1"]);

        expect(infos).toHaveLength(1);
        expect(infos[0].languages).toMatchObject([{ objectId: "lang-1" }]);
        expect(infos[0].lang1Tag).toBe("en");
    });
});
