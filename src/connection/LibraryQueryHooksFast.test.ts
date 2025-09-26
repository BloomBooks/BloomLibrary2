import { IFilter } from "../IFilter";
import {
    constructParseBookQuery,
    kNameOfNoTopicCollection,
} from "./BookQueryBuilder";

// Test code in LibraryQueryHooks.ts that doesn't need to use axios (ie, hit the internet)

it("builds proper parse query for simplest filter", () => {
    const inputFilter: IFilter = {};
    const result = constructParseBookQuery(
        { count: 1, limit: 0 },
        inputFilter,
        []
    );
    const resultString = JSON.stringify(result);
    expect(resultString).toBe(
        '{"count":1,"limit":0,"where":{"inCirculation":true,"draft":false,"baseUrl":{"$exists":true}},"order":"-createdAt"}'
    );
});

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
    expect(resultString).toContain(
        '"$or":[{"tags":"bookshelf:first"},{"tags":"bookshelf:second"},{"tags":"bookshelf:third"}]'
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
    expect(resultString).toContain('"tags":"bookshelf:first",');
    expect(resultString).toContain(
        '"$or":[{"tags":"bookshelf:second"},{"$or":[{"tags":"bookshelf:third"}]}]},'
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
    expect(resultString).toContain('"tags":{"$regex":"^list:Bible"},');
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
    expect(resultString).toContain('"tags":{"$regex":"Bible$"},');
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
    expect(resultString).toContain('"tags":{"$regex":"Bible"},');
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
    expect(resultString).toContain(
        '"tags":{"$all":[{"$regex":"^list:Bible"},"topic:Animal Stories"]},'
    );
});

it("build proper parse query for no topic and tag field ending with *", () => {
    const inputFilter: IFilter = {
        otherTags: "bookshelf:Resources for the Blind*",
        topic: kNameOfNoTopicCollection,
    };
    const result = constructParseBookQuery(
        { count: 1, limit: 0 },
        inputFilter,
        []
    );
    const resultString = JSON.stringify(result);
    expect(resultString).toContain(
        '"$and":[{"tags":{"$nin":["topic:Agriculture","topic:Animal Stories","topic:Bible","topic:Business","topic:Community Living","topic:Culture","topic:Dictionary","topic:Environment","topic:Fiction","topic:Health","topic:How To","topic:Math","topic:Non Fiction","topic:Personal Development","topic:Primer","topic:Science","topic:Story Book","topic:Traditional Story"]}},{"tags":{"$regex":"^bookshelf:Resources for the Blind"}}],'
    );
});

it("build proper parse query for derivedFrom", () => {
    const inputFilter: IFilter = {
        derivedFrom: {
            otherTags: "bookshelf:African Storybook",
        },
    };
    const result = constructParseBookQuery(
        { count: 1, limit: 0 },
        inputFilter,
        []
    );
    const resultString = JSON.stringify(result);
    expect(resultString).toContain(
        '"$and":[{"bookLineageArray":{"$select":{"query":{"className":"books","where":{"tags":"bookshelf:African Storybook"}},"key":"bookInstanceId"}}},{"tags":{"$ne":"bookshelf:African Storybook"}}],'
    );
});

it("build proper parse query for derivedFrom with topic and 'search':'level:1'", () => {
    const inputFilter: IFilter = {
        topic: "Animal Stories",
        derivedFrom: { otherTags: "bookshelf:African Storybook" },
        search: "level:1",
    };
    const result = constructParseBookQuery(
        { count: 1, limit: 0 },
        inputFilter,
        []
    );
    const resultString = JSON.stringify(result);
    expect(resultString).toContain(
        '"$and":[{"tags":{"$in":["computedLevel:1","level:1"]}},{"tags":{"$nin":["level:2","level:3","level:4"]}},{"tags":"topic:Animal Stories"},{"bookLineageArray":{"$select":{"query":{"className":"books","where":{"tags":"bookshelf:African Storybook"}},"key":"bookInstanceId"}}},{"tags":{"$ne":"bookshelf:African Storybook"}}],'
    );
});

it("build proper parse query for derivedFrom with topic and 'search':'level:empty'", () => {
    const inputFilter: IFilter = {
        topic: "Animal Stories",
        derivedFrom: { otherTags: "bookshelf:African Storybook" },
        search: "level:empty",
    };
    const result = constructParseBookQuery(
        { count: 1, limit: 0 },
        inputFilter,
        []
    );
    const resultString = JSON.stringify(result);
    expect(resultString).toContain(
        '"$and":[{"tags":{"$nin":["level:1","level:2","level:3","level:4","computedLevel:1","computedLevel:2","computedLevel:3","computedLevel:4"]}},{"tags":"topic:Animal Stories"},{"bookLineageArray":{"$select":{"query":{"className":"books","where":{"tags":"bookshelf:African Storybook"}},"key":"bookInstanceId"}}},{"tags":{"$ne":"bookshelf:African Storybook"}}],'
    );
});
