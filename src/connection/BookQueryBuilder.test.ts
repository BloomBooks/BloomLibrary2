import { describe, expect, it, vi } from "vitest";
import {
    constructParseBookQuery,
    kNameOfNoTopicCollection,
} from "./BookQueryBuilder";
import { IFilter } from "FilterTypes";
import { kTopicList } from "../model/ClosedVocabularies";

vi.mock("../components/appHosted/AppHostedUtils", () => ({
    isAppHosted: () => false,
}));

describe("constructParseBookQuery topic normalization", () => {
    it("normalizes topic casing to match canonical topic names", () => {
        const params: any = {};
        const filter: IFilter = { topic: "bible" };

        const result = constructParseBookQuery(params, filter, []) as any;

        expect(result.where.tags).toBe("topic:Bible");
    });

    it("recognizes the no-topic collection regardless of casing", () => {
        const params: any = {};
        const filter: IFilter = {
            topic: kNameOfNoTopicCollection.toLowerCase(),
        };

        const result = constructParseBookQuery(params, filter, []) as any;

        expect(result.where.tags).toEqual({
            $nin: kTopicList.map((topic) => `topic:${topic}`),
        });
    });
});
