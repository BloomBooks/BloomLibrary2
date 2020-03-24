import { Bookshelf } from "./Bookshelf";
import { IBookshelfResult } from "../connection/LibraryQueryHooks";

function getTestBookshelfRecord(key: string, englishName: string) {
    return {
        key,
        englishName,
        objectId: "",
        normallyVisible: false,
        category: ""
    };
}

const testBookshelfRecords: IBookshelfResult[] = [
    getTestBookshelfRecord("myKey", "My Shelf"),
    getTestBookshelfRecord("country_key", "Country_Shelf"),
    getTestBookshelfRecord("parentKey/childKey", "Parent/Child"),
    getTestBookshelfRecord(
        "parentKey/country_childKey",
        "Parent/Country_Child"
    ),
    getTestBookshelfRecord(
        "parentKey/parentKey2/childKey",
        "Parent/Parent2/Child"
    ),
    getTestBookshelfRecord(
        "parentKey/parentKey2/country_childKey",
        "Parent/Parent2/Country_Child"
    )
];
const cases: Array<Array<string | Bookshelf>> = [
    [
        testBookshelfRecords[0].key,
        {
            key: testBookshelfRecords[0].key,
            displayName: "My Shelf",
            displayNameWithParent: "My Shelf",
            countryDisplayName: undefined
        }
    ],
    [
        testBookshelfRecords[1].key,
        {
            key: testBookshelfRecords[1].key,
            displayName: "Shelf",
            displayNameWithParent: "Shelf",
            countryDisplayName: "Country"
        }
    ],
    [
        testBookshelfRecords[2].key,
        {
            key: testBookshelfRecords[2].key,
            displayName: "Child",
            displayNameWithParent: "Parent - Child",
            countryDisplayName: undefined
        }
    ],
    [
        testBookshelfRecords[3].key,
        {
            key: testBookshelfRecords[3].key,
            displayName: "Child",
            displayNameWithParent: "Parent - Child",
            countryDisplayName: "Country"
        }
    ],
    [
        testBookshelfRecords[4].key,
        {
            key: testBookshelfRecords[4].key,
            displayName: "Child",
            displayNameWithParent: "Parent - Parent2 - Child",
            countryDisplayName: undefined
        }
    ],
    [
        testBookshelfRecords[5].key,
        {
            key: testBookshelfRecords[5].key,
            displayName: "Child",
            displayNameWithParent: "Parent - Parent2 - Child",
            countryDisplayName: "Country"
        }
    ],
    [
        "keyNotFound",
        {
            key: "keyNotFound",
            displayName: "keyNotFound",
            displayNameWithParent: "keyNotFound",
            countryDisplayName: undefined
        }
    ]
];
test.each(cases)("parseBookshelfKey", (inputRaw, expectedRaw) => {
    expect(inputRaw).not.toBeUndefined();
    expect(inputRaw as string).not.toBeUndefined();
    const input = inputRaw as string;

    expect(expectedRaw as Bookshelf).not.toBeUndefined();
    const expected = expectedRaw as Bookshelf;

    const bookshelf = Bookshelf.parseBookshelfKey(input!, testBookshelfRecords);
    expect(bookshelf.key).toBe(expected.key);
    expect(bookshelf.displayName).toBe(expected.displayName);
    expect(bookshelf.displayNameWithParent).toBe(
        expected.displayNameWithParent
    );
    expect(bookshelf.countryDisplayName).toBe(expected.countryDisplayName);
});
