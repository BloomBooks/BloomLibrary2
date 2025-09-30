import { describe, expect, it } from "vitest";
import { constructParseBookQuery } from "../BookQueryBuilder";
import { BooleanOptions } from "../../IFilter";

const defaultFilter = {
    inCirculation: BooleanOptions.All,
    draft: BooleanOptions.All,
} as const;

describe("constructParseBookQuery", () => {
    it("builds a case-insensitive regex for single topic filters", () => {
        const filter = {
            ...defaultFilter,
            topic: "bible",
        };

        const query = constructParseBookQuery({}, filter, [], undefined) as any;

        expect(query.where.tags).toEqual({
            $regex: "^topic:bible$",
            $options: "i",
        });
    });

    it("keeps multi-topic filters case-insensitive", () => {
        const filter = {
            ...defaultFilter,
            topic: "Bible,Health",
        };

        const query = constructParseBookQuery({}, filter, [], undefined) as any;

        expect(query.where.tags).toEqual({
            $regex: "topic:Bible|topic:Health",
            $options: "i",
        });
    });
});
