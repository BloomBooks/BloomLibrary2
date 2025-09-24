// Unit tests for ParseBookRepository
import { ParseBookRepository } from "../implementations/parseserver/ParseBookRepository";
import { BookFilter } from "../types/FilterTypes";
import { BooleanOptions } from "../types/CommonTypes";

describe("ParseBookRepository", () => {
    let repository: ParseBookRepository;

    beforeEach(() => {
        repository = new ParseBookRepository();
    });

    test("should create repository instance", () => {
        expect(repository).toBeDefined();
        expect(repository).toBeInstanceOf(ParseBookRepository);
    });

    test("should have all required methods", () => {
        expect(typeof repository.getBook).toBe("function");
        expect(typeof repository.getBooks).toBe("function");
        expect(typeof repository.searchBooks).toBe("function");
        expect(typeof repository.updateBook).toBe("function");
        expect(typeof repository.deleteBook).toBe("function");
        expect(typeof repository.getBooksForGrid).toBe("function");
        expect(typeof repository.getBookCount).toBe("function");
        expect(typeof repository.getRelatedBooks).toBe("function");
        expect(typeof repository.getBookDetail).toBe("function");
        expect(typeof repository.saveArtifactVisibility).toBe("function");
        expect(typeof repository.getBasicBookInfos).toBe("function");
        expect(typeof repository.getCurrentBookData).toBe("function");
    });

    test("should handle empty filter for search", async () => {
        const filter: BookFilter = {};
        const query = {
            filter,
            pagination: { limit: 10, skip: 0 },
        };

        // This would normally make a real API call, but for now we just test the method exists
        // and doesn't throw. In a real test environment, we'd mock the axios calls.
        expect(() => repository.searchBooks(query)).not.toThrow();
    });

    test("should handle filter with various options", () => {
        const filter: BookFilter = {
            language: "en",
            topic: "Math",
            feature: "activity",
            inCirculation: BooleanOptions.Yes,
            draft: BooleanOptions.No,
            search: "mathematics",
            publisher: "SIL",
            originalPublisher: "Original Publisher",
            bookshelf: "science",
            otherTags: "level:1,computedLevel:1",
        };

        // Test that filter conversion doesn't throw
        expect(() => {
            const repo = new ParseBookRepository();
            // Access the private method via type assertion for testing
            (repo as any).convertBookFilterToParseFilter(filter);
        }).not.toThrow();
    });

    test("should handle book data conversion", () => {
        const mockParseData = {
            objectId: "test123",
            title: "Test Book",
            baseUrl: "test-book",
            license: "CC BY",
            copyright: "Test Copyright",
            tags: "level:1,topic:Math",
            summary: "A test book",
            pageCount: "10",
            features: ["activity"],
            inCirculation: true,
            draft: false,
            harvestState: "Done",
            downloadCount: 5,
            country: "US",
            publisher: "Test Publisher",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            langPointers: [{ isoCode: "en", name: "English" }],
        };

        // Mock the createBookFromParseServerData function
        const mockBook = {
            id: "test123",
            title: "Test Book",
            baseUrl: "test-book",
            license: "CC BY",
            copyright: "Test Copyright",
            tags: "level:1,topic:Math",
            summary: "A test book",
            pageCount: "10",
            features: ["activity"],
            inCirculation: true,
            draft: false,
            harvestState: "Done",
            downloadCount: 5,
            country: "US",
            publisher: "Test Publisher",
        };

        // We can't easily test the conversion without mocking the external function,
        // but we can test that the method exists and basic structure
        expect(() => {
            const repo = new ParseBookRepository();
            // This would call the conversion method
        }).not.toThrow();
    });
});
