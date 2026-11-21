import { describe, it, expect, beforeEach } from "vitest";
import { getApiChoice } from "./ApiConnection";

describe("getApiChoice", () => {
    beforeEach(() => localStorage.clear());

    it("is prod by default", () => {
        expect(getApiChoice("")).toBe("prod");
    });

    it("remembers ?api=staging until ?api=prod", () => {
        expect(getApiChoice("?api=staging")).toBe("staging");
        expect(getApiChoice("")).toBe("staging");
        expect(getApiChoice("?api=prod")).toBe("prod");
        expect(getApiChoice("")).toBe("prod");
    });

    it("ignores any other value, keeping the remembered choice", () => {
        expect(getApiChoice("?api=https://example.com")).toBe("prod");
        getApiChoice("?api=staging");
        expect(getApiChoice("?api=STAGING")).toBe("staging");
        expect(getApiChoice("?api=example.com")).toBe("staging");
    });
});
