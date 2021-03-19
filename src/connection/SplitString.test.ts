import { splitString } from "./LibraryQueryHooks";

it("simple otherSearchTerms", () => {
    const { otherSearchTerms, specialParts } = splitString("dogs cats", []);
    expect(otherSearchTerms).toBe("dogs cats");
    expect(specialParts.length).toBe(0);
});

it("a mixture of otherSearchTerms and special parts", () => {
    const {
        otherSearchTerms,
        specialParts,
    } = splitString("dogs topic:Animals cats", [
        "topic:Animals",
        "bookshelf:rubbish",
    ]);
    expect(otherSearchTerms).toEqual("dogs cats");
    expect(specialParts.length).toBe(1);
    expect(specialParts[0]).toBe("topic:Animals");
});

it("topic at start", () => {
    const {
        otherSearchTerms,
        specialParts,
    } = splitString("topic:animals dogs cats", [
        "system:Incoming",
        "topic:Animals",
        "bookshelf:rubbish",
    ]);
    expect(otherSearchTerms).toEqual("dogs cats");
    expect(specialParts.length).toBe(1);
    expect(specialParts[0]).toBe("topic:Animals");
});

it("topic at end", () => {
    const {
        otherSearchTerms,
        specialParts,
    } = splitString("dogs cats topic:Animals", [
        "system:Incoming",
        "topic:Animals",
        "bookshelf:rubbish",
    ]);
    expect(otherSearchTerms).toEqual("dogs cats");
    expect(specialParts.length).toBe(1);
    expect(specialParts[0]).toBe("topic:Animals");
});

it("topic and bookshelf name and otherSearchTerms in quotes", () => {
    const {
        otherSearchTerms,
        specialParts,
    } = splitString(
        'dogs bookshelf:enabling writers workshop "black birds" topic:Animal stories',
        [
            "system:Incoming",
            "topic:Animal stories",
            "bookshelf:enabling writers workshop",
        ]
    );
    expect(otherSearchTerms).toEqual('dogs "black birds"');
    expect(specialParts.length).toBe(2);
    expect(specialParts[0]).toBe("topic:Animal stories");
    expect(specialParts[1]).toBe("bookshelf:enabling writers workshop");
});

it("ignores various unhelpful spaces", () => {
    const {
        otherSearchTerms,
        specialParts,
    } = splitString(
        ' dogs  bookshelf: enabling writers  workshop "black birds" topic: Math ',
        ["system:Incoming", "topic:Math", "bookshelf:enabling writers workshop"]
    );
    expect(otherSearchTerms).toEqual('dogs "black birds"');
    expect(specialParts.length).toBe(2);
    // Note that the order in which the parts are extracted depends on their order
    // in the topic list, not in the input string.
    expect(specialParts[0]).toBe("topic:Math");
    expect(specialParts[1]).toBe("bookshelf:enabling writers workshop");
});

it("finds uploader and copyright", () => {
    const {
        otherSearchTerms,
        specialParts,
    } = splitString("uploader:fred@example dogs copyright:sil.org", [
        "system:Incoming",
        "topic:Math",
        "bookshelf:enabling writers workshop",
    ]);
    expect(otherSearchTerms).toEqual("dogs");
    expect(specialParts.length).toBe(2);
    // Note that the order in which the parts are extracted depends on their order
    // in the topic list, not in the input string.
    expect(specialParts[0]).toBe("uploader:fred@example");
    expect(specialParts[1]).toBe("copyright:sil.org");
});

it("corrects case, but not if both cases are valid", () => {
    const {
        otherSearchTerms,
        specialParts,
    } = splitString("topic:health cats topic:math topic:Math", [
        "topic:Health",
        "something irrelevant",
        "topic:Math",
        "topic:math",
        "something else",
    ]);
    expect(otherSearchTerms).toEqual("cats");
    expect(specialParts.length).toBe(3);
    expect(specialParts[0]).toBe("topic:Health");
    expect(specialParts[1]).toBe("topic:math");
    expect(specialParts[2]).toBe("topic:Math");
});

it("handles publisher and original publisher", () => {
    const {
        otherSearchTerms,
        specialParts,
    } = splitString("frogs publisher:Pratham originalPublisher:Bob", [
        "something irrelevant",
        "topic:Math",
    ]);
    expect(otherSearchTerms).toEqual("frogs");
    expect(specialParts.length).toBe(2);
    // The order for facets is in the order of their appearance in the facet array.
    // originalPublisher needs to be matched before publisher, since the first contains the second.
    expect(specialParts[0]).toBe("originalPublisher:Bob");
    expect(specialParts[1]).toBe("publisher:Pratham");
});

it("handles publisher and original publisher with spaces", () => {
    const {
        otherSearchTerms,
        specialParts,
    } = splitString(
        'frogs publisher: "African Storybook Project" originalPublisher:"Book Dash"',
        ["something irrelevant", "topic:Math"]
    );
    expect(otherSearchTerms).toEqual("frogs");
    expect(specialParts.length).toBe(2);
    expect(specialParts[0]).toBe("originalPublisher:Book Dash");
    expect(specialParts[1]).toBe("publisher:African Storybook Project");
});

it("handles corner case of facet with no content", () => {
    const { otherSearchTerms, specialParts } = splitString("frogs publisher:", [
        "something irrelevant",
        "topic:Math",
    ]);
    expect(otherSearchTerms).toEqual("frogs");
    expect(specialParts.length).toBe(1);
    expect(specialParts[0]).toBe("publisher:");
});
