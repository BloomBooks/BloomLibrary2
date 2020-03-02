import { getLanguageFeatures } from "./FeatureHelper";
it("getLanguageFeatures finds no features when passed empty list", () => {
    const result = getLanguageFeatures(undefined, "en");
    expect(result.length).toBe(0);
});

it("getLanguageFeatures finds expected features", () => {
    const result = getLanguageFeatures(
        [
            "motion", // not matched, no lang code (and not a language feature)
            "blind", // not matched, no lang code
            "blind:fr", // not matched, wrong language
            "blind:tpi", // match!
            "talkingBook", // not matched, no lang code
            "talkingBook:en", // not matched, wrong language
            "talkingBook:tpi", // match!
            "signLanguage:fr" // not matched, wrong language
        ],
        "tpi"
    );
    expect(result.length).toBe(2);
    expect(result[0].featureKey).toBe("blind");
    expect(result[1].featureKey).toBe("talkingBook");
});
