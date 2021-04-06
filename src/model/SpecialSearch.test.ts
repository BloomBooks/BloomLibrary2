import { ILanguage } from "./Language";
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
    ["comic book", "comics"],
    ["german", "language:de"],
    ["motion book", "motion"],
    ["swahili", "language:swh"],
    ["spanish", "language:es"],
];

test.each(cases)("test search options", (input, expected) => {
    const dummy: ILanguage[] = [];
    const result = trySpecialSearch(input, dummy);
    expect(result.length).toBe(1);
    expect(result[0]).toBe(expected);
});

it("test uilang case", () => {
    const dummy: ILanguage[] = [];
    const result = trySpecialSearch("uilang=fr", dummy);
    expect(result.length).toBe(1);
    expect(result[0]).toBe(noPushCode);
});
