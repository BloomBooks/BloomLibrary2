import { IFilter } from "../IFilter";
import { constructParseBookQuery } from "./LibraryQueryHooks";

// Test code in LibraryQueryHooks.ts that doesn't need to use axios (ie, hit the internet)

it("builds proper parse query for anyOfThese field", () => {
    const inputFilter: IFilter = {
        anyOfThese: [
            { otherTags: "bookshelf:first" },
            { otherTags: "bookshelf:second" },
            { otherTags: "bookshelf:third" },
        ],
    };
    const result = constructParseBookQuery(
        { count: 1, limit: 0 },
        inputFilter,
        []
    );
    const resultString = JSON.stringify(result);
    expect(resultString).toBe(
        '{"count":1,"limit":0,"where":{"inCirculation":{"$in":[true,null]},"draft":{"$in":[false,null]},"$or":[{"tags":"bookshelf:first"},{"tags":"bookshelf:second"},{"tags":"bookshelf:third"}]}}'
    );
});

it("builds proper parse query for recursive anyOfThese field", () => {
    const inputFilter: IFilter = {
        otherTags: "bookshelf:first",
        anyOfThese: [
            { otherTags: "bookshelf:second" },
            {
                anyOfThese: [{ otherTags: "bookshelf:third" }],
            },
        ],
    };
    const result = constructParseBookQuery(
        { count: 1, limit: 0 },
        inputFilter,
        []
    );
    const resultString = JSON.stringify(result);
    expect(resultString).toBe(
        '{"count":1,"limit":0,"where":{"tags":"bookshelf:first","inCirculation":{"$in":[true,null]},"draft":{"$in":[false,null]},"$or":[{"tags":"bookshelf:second"},{"$or":[{"tags":"bookshelf:third"}]}]}}'
    );
});

it("builds proper parse query for tag field ending with *", () => {
    const inputFilter: IFilter = {
        otherTags: "list:Bible*",
    };
    const result = constructParseBookQuery(
        { count: 1, limit: 0 },
        inputFilter,
        []
    );
    const resultString = JSON.stringify(result);
    expect(resultString).toBe(
        '{"count":1,"limit":0,"where":{"tags":{"$regex":"^list:Bible"},"inCirculation":{"$in":[true,null]},"draft":{"$in":[false,null]}}}'
    );
});

it("build proper parse query for tag file starting with *", () => {
    const inputFilter: IFilter = {
        otherTags: "*Bible",
    };
    const result = constructParseBookQuery(
        { count: 1, limit: 0 },
        inputFilter,
        []
    );
    const resultString = JSON.stringify(result);
    expect(resultString).toBe(
        '{"count":1,"limit":0,"where":{"tags":{"$regex":"Bible$"},"inCirculation":{"$in":[true,null]},"draft":{"$in":[false,null]}}}'
    );
});

it("build proper parse query for tag file starting and ending with *", () => {
    const inputFilter: IFilter = {
        otherTags: "*Bible*",
    };
    const result = constructParseBookQuery(
        { count: 1, limit: 0 },
        inputFilter,
        []
    );
    const resultString = JSON.stringify(result);
    expect(resultString).toBe(
        '{"count":1,"limit":0,"where":{"tags":{"$regex":"Bible"},"inCirculation":{"$in":[true,null]},"draft":{"$in":[false,null]}}}'
    );
});

it("builds proper parse query for topic and tag field ending with *", () => {
    const inputFilter: IFilter = {
        otherTags: "list:Bible*",
        topic: "Animal Stories",
    };
    const result = constructParseBookQuery(
        { count: 1, limit: 0 },
        inputFilter,
        []
    );
    const resultString = JSON.stringify(result);
    expect(resultString).toBe(
        '{"count":1,"limit":0,"where":{"tags":{"$all":[{"$regex":"^list:Bible"},"topic:Animal Stories"]},"inCirculation":{"$in":[true,null]},"draft":{"$in":[false,null]}}}'
    );
});
