import { describe, expect, it } from "vitest";
import { constructParseBookQuery } from "../BookQueryBuilder";
import { BooleanOptions } from "FilterTypes";

const defaultFilter = {
    inCirculation: BooleanOptions.All,
    draft: BooleanOptions.All,
} as const;

describe("constructParseBookQuery", () => {
    it("normalizes single topic filters to canonical tag", () => {
        const filter = {
            ...defaultFilter,
            topic: "bible",
        };

        const query = constructParseBookQuery({}, filter, [], undefined) as any;

        expect(query.where.tags).toBe("topic:Bible");
    });

    it("normalizes multi-topic filters to canonical tags", () => {
        const filter = {
            ...defaultFilter,
            topic: "Bible,Health",
        };

        const query = constructParseBookQuery({}, filter, [], undefined) as any;

        expect(query.where.tags).toEqual({
            $all: ["topic:Bible", "topic:Health"],
        });
    });

    it("falls back to regex when topic is unknown", () => {
        const filter = {
            ...defaultFilter,
            topic: "NewTopic",
        };

        const query = constructParseBookQuery({}, filter, [], undefined) as any;

        expect(query.where.tags).toEqual({
            $regex: "^topic:NewTopic$",
            $options: "i",
        });
    });
});
