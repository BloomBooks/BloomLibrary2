import { splitString } from "./LibraryQueryHooks";

it("simple keywords", () => {
    const { otherSearchTerms: keywords, specialParts } = splitString(
        "dogs cats"
    );
    expect(keywords).toBe("dogs cats");
    expect(specialParts.length).toBe(0);
});

it("a mixture of keywords and special parts", () => {
    const {
        otherSearchTerms: keywords,
        specialParts
    } = splitString("dogs topic:Animals cats", [
        "topic:Animals",
        "bookshelf:rubbish"
    ]);
    expect(keywords).toEqual("dogs cats");
    expect(specialParts.length).toBe(1);
    expect(specialParts[0]).toBe("topic:Animals");
});

it("topic at start", () => {
    const {
        otherSearchTerms: keywords,
        specialParts
    } = splitString("topic:animals dogs cats", [
        "system:Incoming",
        "topic:Animals",
        "bookshelf:rubbish"
    ]);
    expect(keywords).toEqual("dogs cats");
    expect(specialParts.length).toBe(1);
    expect(specialParts[0]).toBe("topic:Animals");
});

it("topic at end", () => {
    const {
        otherSearchTerms: keywords,
        specialParts
    } = splitString("dogs cats topic:Animals", [
        "system:Incoming",
        "topic:Animals",
        "bookshelf:rubbish"
    ]);
    expect(keywords).toEqual("dogs cats");
    expect(specialParts.length).toBe(1);
    expect(specialParts[0]).toBe("topic:Animals");
});

it("topic and bookshelf name and keywords in quotes", () => {
    const {
        otherSearchTerms: keywords,
        specialParts
    } = splitString(
        'dogs bookshelf:enabling writers workshop "black birds" topic:Animal stories',
        [
            "system:Incoming",
            "topic:Animal stories",
            "bookshelf:enabling writers workshop"
        ]
    );
    expect(keywords).toEqual('dogs "black birds"');
    expect(specialParts.length).toBe(2);
    expect(specialParts[0]).toBe("topic:Animal stories");
    expect(specialParts[1]).toBe("bookshelf:enabling writers workshop");
});

it("ignores various unhelpful spaces", () => {
    const {
        otherSearchTerms: keywords,
        specialParts
    } = splitString(
        ' dogs  bookshelf: enabling writers  workshop "black birds" topic: Math ',
        ["system:Incoming", "topic:Math", "bookshelf:enabling writers workshop"]
    );
    expect(keywords).toEqual('dogs "black birds"');
    expect(specialParts.length).toBe(2);
    // Note that the order in which the parts are extracted depends on their order
    // in the topic list, not in the input string.
    expect(specialParts[0]).toBe("topic:Math");
    expect(specialParts[1]).toBe("bookshelf:enabling writers workshop");
});

it("finds uploader and copyright", () => {
    const {
        otherSearchTerms: keywords,
        specialParts
    } = splitString("uploader:fred@example dogs copyright:sil.org", [
        "system:Incoming",
        "topic:Math",
        "bookshelf:enabling writers workshop"
    ]);
    expect(keywords).toEqual("dogs");
    expect(specialParts.length).toBe(2);
    // Note that the order in which the parts are extracted depends on their order
    // in the topic list, not in the input string.
    expect(specialParts[0]).toBe("uploader:fred@example");
    expect(specialParts[1]).toBe("copyright:sil.org");
});

it("corrects case, but not if both cases are valid", () => {
    const {
        otherSearchTerms: keywords,
        specialParts
    } = splitString("topic:health cats topic:math topic:Math", [
        "topic:Health",
        "something irrelevant",
        "topic:Math",
        "topic:math",
        "something else"
    ]);
    expect(keywords).toEqual("cats");
    expect(specialParts.length).toBe(3);
    expect(specialParts[0]).toBe("topic:Health");
    expect(specialParts[1]).toBe("topic:math");
    expect(specialParts[2]).toBe("topic:Math");
});
