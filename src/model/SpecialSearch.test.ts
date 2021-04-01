import { trySpecialSearch } from "./SpecialSearch";

const cases = [
    ["covid", "covid19"],
    ["kovid", "covid19"],
    ["covid19", "covid19"],
    ["coronavirus", "covid19"],
    ["cov19", "covid19"],
    ["kovid19", "covid19"],
    ["kingstone", "super-bible"],
    ["comic bible", "super-bible"],
    ["bible comic", "super-bible"],
    ["bible comics", "super-bible"],
];

test.each(cases)("test search options", (input, expected) => {
    const result = trySpecialSearch(input);
    expect(result.length).toBe(1);
    expect(result[0]).toBe(expected);
});
