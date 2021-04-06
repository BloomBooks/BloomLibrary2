import { trySpecialSearch, noPushCode } from "./SpecialSearch";

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
    ["grid", "grid"],
];

test.each(cases)("test search options", (input, expected) => {
    const result = trySpecialSearch(input);
    expect(result.length).toBe(1);
    expect(result[0]).toBe(expected);
});

it("test uilang case", () => {
    const result = trySpecialSearch("uilang=fr");
    expect(result.length).toBe(2);
    expect(result[0]).toBe(noPushCode);
    expect(result[1]).toBe("fr");
});
