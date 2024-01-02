import { getFileSizeForUI } from "./AppHostedUtils";

const cases: string[][] = [
    ["1", "0KB"],
    ["499", "0KB"],
    ["500", "1KB"],
    ["800", "1KB"],
    ["1000", "1KB"],
    ["2000", "2KB"],
    ["2500", "3KB"],
    ["500000", "500KB"],
    ["556677", "557KB"],
    ["1000000", "1MB"],
    ["1200000", "1.2MB"],
    ["1234567", "1.2MB"],
    ["2000000", "2MB"],
    ["2500000", "2.5MB"],
    ["25000000", "25MB"],
    ["1000000000", "1000MB"],

    // pathological:
    ["", ""],
    ["abc", ""],
    ["12.3", "0KB"],
    ["1234.56", "1KB"],
    ["12345678.90", "12.3MB"],
];
test.each(cases)(
    "getFileSizeForUI returns expected result: %s => %s", // %# is the index. The first %s consumes the 1st argument, and the 2nd %s consumes the 2nd argument
    (sizeString, expectedResult) => {
        const result = getFileSizeForUI(sizeString);

        expect(result).toEqual(expectedResult);
    }
);
