import { ILanguage } from "./Language";
import { trySpecialSearch, noPushCode } from "./SpecialSearch";

const testLanguageData: ILanguage[] = [
    { isoCode: "de", name: "German", objectId: "fakeId_de", usageCount: 10 },
    { isoCode: "es", name: "Spanish", objectId: "fakeId_es", usageCount: 10 },
    { isoCode: "swh", name: "Swahili", objectId: "fakeId_swh", usageCount: 10 },
];

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
    ["motion book", "motion"],
    ["sign language", "sign-language"],
    ["german", "language:de"],
    ["swahili", "language:swh"],
    ["spanish", "language:es"],
];

test.each(cases)("test search options", (input, expected) => {
    const result = trySpecialSearch(input, testLanguageData);
    expect(result.length).toBe(1);
    expect(result[0]).toBe(expected);
});

it("test uilang case", () => {
    const dummy: ILanguage[] = [];
    const result = trySpecialSearch("uilang=fr", dummy);
    expect(result.length).toBe(1);
    expect(result[0]).toBe(noPushCode);
});
