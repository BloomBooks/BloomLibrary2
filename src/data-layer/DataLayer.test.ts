// Test for data layer setup
import {
    DataLayerFactory,
    DataLayerImplementation,
} from "./factory/DataLayerFactory";
import { BookModel, UserModel, LanguageModel, TagModel } from "./models";
import { BooleanOptions, BookOrderingScheme } from "./types/CommonTypes";

describe("Data Layer Setup", () => {
    test("DataLayerFactory should be singleton", () => {
        const factory1 = DataLayerFactory.getInstance();
        const factory2 = DataLayerFactory.getInstance();
        expect(factory1).toBe(factory2);
    });

    test("Factory should default to ParseServer implementation", () => {
        const factory = DataLayerFactory.getInstance();
        expect(factory.getCurrentImplementation()).toBe(
            DataLayerImplementation.ParseServer
        );
    });

    test("Factory should allow changing implementation", () => {
        const factory = DataLayerFactory.getInstance();
        factory.setImplementation(DataLayerImplementation.Mock);
        expect(factory.getCurrentImplementation()).toBe(
            DataLayerImplementation.Mock
        );

        // Reset to default
        factory.setImplementation(DataLayerImplementation.ParseServer);
    });

    test("BookModel should have correct default values", () => {
        const book = new BookModel();
        expect(book.id).toBe("");
        expect(book.title).toBe("");
        expect(book.inCirculation).toBe(true);
        expect(book.draft).toBe(false);
        expect(book.tags).toEqual([]);
        expect(book.features).toEqual([]);
        expect(book.allTitles).toBeInstanceOf(Map);
    });

    test("BookModel should have working business methods", () => {
        const book = new BookModel();

        // Test setBooleanTag
        book.setBooleanTag("system:incoming", true);
        expect(book.tags).toContain("system:incoming");

        book.setBooleanTag("system:incoming", false);
        expect(book.tags).not.toContain("system:incoming");

        // Test getTagValue
        book.tags = ["level:2", "topic:math"];
        expect(book.getTagValue("level")).toBe("2");
        expect(book.getTagValue("topic")).toBe("math");
        expect(book.getTagValue("nonexistent")).toBeUndefined();
    });

    test("BookModel static methods should work", () => {
        // Test sanitizeFeaturesArray
        const features1 = ["quiz"];
        BookModel.sanitizeFeaturesArray(features1);
        expect(features1).toContain("activity");

        const features2 = ["widgets"];
        BookModel.sanitizeFeaturesArray(features2);
        expect(features2).toContain("activity");

        const features3 = ["activity"];
        BookModel.sanitizeFeaturesArray(features3);
        expect(features3).toEqual(["activity"]);
    });

    test("UserModel should work correctly", () => {
        const user = new UserModel({
            email: "test@example.com",
            username: "testuser",
            moderator: true,
        });

        expect(user.email).toBe("test@example.com");
        expect(user.isModerator()).toBe(true);
        expect(user.getDisplayName()).toBe("testuser");
    });

    test("LanguageModel should work correctly", () => {
        const lang = new LanguageModel({
            name: "English",
            isoCode: "en",
            englishName: "English",
            usageCount: 100,
        });

        expect(lang.getDisplayName()).toBe("English");
        expect(lang.hasBannerImage()).toBe(false);
    });

    test("TagModel should work correctly", () => {
        const tag = new TagModel({ name: "topic:math" });
        expect(tag.isTopicTag()).toBe(true);
        expect(tag.getTagValue()).toBe("math");

        const systemTag = new TagModel({ name: "system:incoming" });
        expect(systemTag.isSystemTag()).toBe(true);
        expect(systemTag.getTagValue()).toBe("incoming");
    });

    test("Enums should be properly defined", () => {
        expect(BooleanOptions.Yes).toBe("Yes");
        expect(BooleanOptions.No).toBe("No");
        expect(BooleanOptions.All).toBe("All");

        expect(BookOrderingScheme.Default).toBe("default");
        expect(BookOrderingScheme.TitleAlphabetical).toBe("title");
    });
});
