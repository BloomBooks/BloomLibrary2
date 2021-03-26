import { doesNameMatchPattern } from "./EmbeddingHost";

const trueCases: string[][] = [
    ["one", "one"],
    ["one*", "one"],
    ["one*", "one two"],
    ["one", "ONE"],
    ["ONE", "one"],
    ["*", "one"],
];
test.each(trueCases)(
    "doesNameMatchPattern returns true for valid patterns: #%# (%s, %s)",
    (pattern, collectionName) => {
        const result = doesNameMatchPattern(collectionName, pattern);

        expect(result).toBeTruthy();
    }
);

const falseCases: string[][] = [
    ["two*", "one two"],
    ["one", "one two"],
];
test.each(falseCases)(
    "doesNameMatchPattern returns false for non-matching patterns: : #%# (%s, %s)",
    (caseInput) => {
        const pattern = caseInput[0];
        const collectionName = caseInput[1];

        const result = doesNameMatchPattern(collectionName, pattern);

        expect(result).toBeFalsy();
    }
);
