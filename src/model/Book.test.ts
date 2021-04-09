import { Book } from "./Book";

let cases: string[][][] = [
    [["quiz"]],
    [["quiz", "other"]],
    [["other", "quiz"]],
    [["quiz", "activity"]],
    [["quiz", "activity", "other"]],
    [["quiz", "other", "activity"]],
    [["other", "quiz", "activity"]],
];
test.each(cases)(
    "sanitizeFeaturesArray, if given quiz, adds activity if necessary",
    (features) => {
        expect(features).not.toBeUndefined();

        Book.sanitizeFeaturesArray(features);

        expect(features.filter((f) => f === "activity").length).toBe(1);
        expect(features.includes("quiz")).toBeTruthy();
    }
);

cases = [
    [[]],
    [["other"]],
    [["activity"]],
    [["activity", "other"]],
    [["other", "activity"]],
];
test.each(cases)(
    "sanitizeFeaturesArray leaves well enough alone",
    (features) => {
        expect(features).not.toBeUndefined();

        const original = features.slice();

        Book.sanitizeFeaturesArray(features);

        expect(features).toEqual(original);
    }
);
