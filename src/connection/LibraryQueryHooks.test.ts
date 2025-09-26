import { IFilter } from "../IFilter";
import axios from "axios";
import { constructParseBookQuery } from "./BookQueryBuilder";

// for unit test database.
const headers = {
    "Content-Type": "application/json",
    "X-Parse-Application-Id": "r1H3zle1Iopm1IB30S4qEtycvM4xYjZ85kRChjkM",
};

const unitTestBaseUrl =
    "https://bloom-parse-server-unittest.azurewebsites.net/parse/";

async function getBook(filter: IFilter) {
    return axios.get(`${unitTestBaseUrl}classes/books`, {
        headers,
        params: constructParseBookQuery({ keys: "title", count: 5 }, filter, [
            "region:Pacific",
            "topic:Math",
            "bookshelf:Enabling writers workshops",
        ]),
    });
}
async function createBook(book: any) {
    // We have a rule on the server which says all books must have a title, bookInstanceId, and uploader
    book.title = book.title || "test title";
    book.bookInstanceId = book.bookInstanceId || book.title;

    const result = await axios.post(`${unitTestBaseUrl}classes/books`, book, {
        headers,
    });
    return result.data.objectId;
}

async function createUser(username: string, password: string) {
    const result = await axios.post(
        `${unitTestBaseUrl}users`,
        { username, password, email: username },
        {
            headers,
        }
    );
    return [result.data.objectId, result.data.sessionToken];
}

async function loginUser(username: string, password: string) {
    try {
        const result = await axios.get(`${unitTestBaseUrl}login`, {
            headers,
            params: { username, password },
        });
        return [result.data.objectId, result.data.sessionToken];
    } catch (error) {
        return undefined;
    }
}

async function deleteBook(id: string) {
    return axios.delete(`${unitTestBaseUrl}classes/books/${id}`, {
        headers,
    });
}

// Even though the unit test database is about as wide open as it can be,
// parse only allows us to delete a user if logged in as that user.
async function deleteUser(id: string, sessionToken: string) {
    return axios.delete(`${unitTestBaseUrl}users/${id}`, {
        headers: { ...headers, "X-Parse-Session-Token": sessionToken },
    });
}

const testUserName = "Fred_XYZ@example.com";
const testUserPassword = "nonsense";

async function getFred(createIfMissing = true) {
    let result = await loginUser(testUserName, testUserPassword);
    if (!result) {
        if (createIfMissing) {
            result = await createUser(testUserName, testUserPassword);
            if (!result) {
                throw new Error("failed to create test user");
            }
        } else {
            return undefined;
        }
    }
    return result;
}

async function cleanup() {
    const fredData = await getFred(false);
    if (!fredData) {
        return;
    }
    const [fredId, sessionToken] = fredData;
    const books = await axios.get(`${unitTestBaseUrl}classes/books`, {
        headers,
        params: {
            where: {
                uploader: {
                    __type: "Pointer",
                    className: "_User",
                    objectId: fredId,
                },
            },
        },
    });
    for (const book of books.data.results) {
        await deleteBook(book.objectId);
    }
    await deleteUser(fredId, sessionToken);
}

const title1 = "Bloom library 2 test about 1 anunlikelykeyword title";
const title2 =
    " test Enabling writers workshops book about topic:Math in the Pacific from bookdash.org";
const title3 = "Another book with anunlikelykeyword";

beforeAll(async () => {
    // In case of anything left over from a previous failed run
    try {
        await cleanup();
        const fredData = await getFred();
        const [fredId] = fredData!;
        await createBook({
            title: title1,
            search: title1,
            uploader: {
                __type: "Pointer",
                className: "_User",
                objectId: fredId,
            },
            tags: [
                "topic:Math",
                "region:Pacific",
                "bookshelf:Enabling writers workshops",
            ],
            copyright: "Copyright © 2014, Nicole and bookdash.org",
            publisher: "Unlikely Publisher",
            baseUrl: "non-empty",
        });
        // This is there specifically to NOT be found by tag searches or the copyright search
        // It SHOULD be found by the uploader search, however.
        // In particular it has the bookshelf tag but not the unlikely keyword.
        await createBook({
            title: title2,
            search: title2,
            uploader: {
                __type: "Pointer",
                className: "_User",
                objectId: fredId,
            },
            tags: ["bookshelf:Enabling writers workshops"],
            baseUrl: "non-empty",
        });
        // This one has the unlikely keyword but not the bookshelf tag.
        await createBook({
            title: title3,
            search: title3,
            uploader: {
                __type: "Pointer",
                className: "_User",
                objectId: fredId,
            },
            publisher: "Unlikely Publisher",
            originalPublisher: "Unlikely Original Publisher",
            baseUrl: "non-empty",
        });
    } catch (error) {
        console.log(JSON.stringify(error));
        throw error;
    }
}, 60000); // This function can take a while to run, give it up to 60s

afterAll(async () => {
    await cleanup();
}, 60000); // This function can take a while to run, give it up to 60s

it("retrieves a parse book using full-text search", async () => {
    try {
        const result = await getBook({ search: "anunlikelykeyword" });
        expect(result.data.results.length).toBe(2);
        const titles = result.data.results.map(
            (x: { title: string }) => x.title
        );
        expect(titles).toEqual(expect.arrayContaining([title1, title3]));
    } catch (error) {
        console.log("full-text error: " + JSON.stringify(error));
        throw error;
    }
});

it("retrieves a parse book using case-insensitive RE on uploader", async () => {
    const result = await getBook({ search: "uploader:fred_xyz@example" });
    expect(result.data.results.length).toBe(3);
    const titles = result.data.results.map((x: { title: string }) => x.title);
    expect(titles).toEqual(expect.arrayContaining([title1, title2, title3]));
});

it("retrieves a parse book using case-insensitive RE on copyright", async () => {
    const result = await getBook({ search: "copyright:bookdash.org" });
    expect(result.data.results.length).toBe(1);
    expect(result.data.results[0].title).toBe(title1);
});

it("retrieves a book with region:Pacific, but not the word Pacific in title", async () => {
    const result = await getBook({ search: "region:Pacific" });
    expect(result.data.results.length).toBe(1);
    expect(result.data.results[0].title).toBe(title1);
});

it("retrieves a book with topic:Math in tags, but not one with that string in title", async () => {
    const result = await getBook({ search: "topic:Math" });
    expect(result.data.results.length).toBe(1);
    expect(result.data.results[0].title).toBe(title1);
});

// Previously this test failed because one of the two words was "book", which gets removed.
it("retrieves a book with a quoted string, but not one with the two words separately", async () => {
    const result = await getBook({ search: '"test about"' });
    expect(result.data.results.length).toBe(1);
    expect(result.data.results[0].title).toBe(title1);
});

it("retrieves a book with quoted tag value", async () => {
    const result = await getBook({
        search: "bookshelf:Enabling writers workshops anunlikelykeyword",
    });
    expect(result.data.results.length).toBe(1);
    expect(result.data.results[0].title).toBe(title1);
});

it("retrieves a book with quoted publisher value", async () => {
    const result = await getBook({
        search: 'publisher: "Unlikely Publisher"',
    });
    expect(result.data.results.length).toBe(2);
    // we're not specifying an order
    expect(
        result.data.results.some((x: { title: string }) => x.title === title1)
    );
    expect(
        result.data.results.some((x: { title: string }) => x.title === title3)
    );
});

it("retrieves a book with quoted originalPublisher value", async () => {
    const result = await getBook({
        search: 'originalPublisher: "Unlikely Original Publisher"',
    });
    expect(result.data.results.length).toBe(1);
    expect(result.data.results[0].title).toBe(title3);
});

it("doesn't crash with a facet non-value", async () => {
    const result = await getBook({
        search: "publisher:",
    });
    expect(result.data.results.length).toBe(2);
    expect(
        result.data.results.some((x: { title: string }) => x.title === title1)
    );
    expect(
        result.data.results.some((x: { title: string }) => x.title === title3)
    );
});

// Unit tests that don't use axios have been moved to LibraryQueryHooksFast.test.ts
