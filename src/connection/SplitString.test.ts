import { splitString } from "./BookQueryBuilder";

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
    expect(specialParts.includes("topic:Animals"));
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
    expect(specialParts.includes("topic:Animals"));
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
    expect(specialParts.includes("topic:Animals"));
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
    expect(specialParts.includes("topic:Animal stories"));
    expect(specialParts.includes("bookshelf:enabling writers workshop"));
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
    expect(specialParts.includes("topic:Math"));
    expect(specialParts.includes("bookshelf:enabling writers workshop"));
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
    expect(specialParts.includes("uploader:fred@example"));
    expect(specialParts.includes("copyright:sil.org"));
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
    expect(specialParts.includes("topic:Health"));
    expect(specialParts.includes("topic:math"));
    expect(specialParts.includes("topic:Math"));
});

it("handles publisher and original publisher", () => {
    const {
        otherSearchTerms,
        specialParts,
    } = splitString("frogs publisher: Pratham originalPublisher:Bob", [
        "something irrelevant",
        "topic:Math",
    ]);
    expect(otherSearchTerms).toEqual("frogs");
    expect(specialParts.length).toBe(2);
    expect(specialParts.includes("originalPublisher:Bob"));
    expect(specialParts.includes("publisher:Pratham"));
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
    expect(specialParts.includes("originalPublisher:Book Dash"));
    expect(specialParts.includes("publisher:African Storybook Project"));
});

it("handles brandingProjectName", () => {
    const {
        otherSearchTerms,
        specialParts,
    } = splitString("frogs brandingProjectName:fred topic:Math", [
        "something irrelevant",
        "topic:Math",
    ]);
    expect(otherSearchTerms).toEqual("frogs");
    expect(specialParts.length).toBe(2);
    expect(specialParts.includes("brandingProjectName:fred"));
    expect(specialParts.includes("topic:Math"));
});

it("handles branding alias", () => {
    const {
        otherSearchTerms,
        specialParts,
    } = splitString("frogs branding:Bob topic:Math", [
        "something irrelevant",
        "topic:Math",
    ]);
    expect(otherSearchTerms).toEqual("frogs");
    expect(specialParts.length).toBe(2);
    expect(specialParts.includes("branding:Bob"));
    expect(specialParts.includes("topic:Math"));
});

it("handles corner case of facet with no content", () => {
    const { otherSearchTerms, specialParts } = splitString("frogs publisher:", [
        "something irrelevant",
        "topic:Math",
    ]);
    expect(otherSearchTerms).toEqual("frogs");
    expect(specialParts.length).toBe(1);
    expect(specialParts.includes("publisher:"));
});

it("handles facet corner case with quotes, but no space", () => {
    const {
        otherSearchTerms,
        specialParts,
    } = splitString('frogs publisher:"Pratham"', [
        "something irrelevant",
        "topic:Math",
    ]);
    expect(otherSearchTerms).toEqual("frogs");
    expect(specialParts.length).toBe(1);
    expect(specialParts.includes("publisher:Pratham"));
});

it("doesn't crash on missing facet final quote", () => {
    const {
        otherSearchTerms,
        specialParts,
    } = splitString('frogs publisher: "Book Dash', [
        "something irrelevant",
        "topic:Math",
    ]);
    expect(otherSearchTerms).toEqual("frogs");
    expect(specialParts.length).toBe(1);
    expect(specialParts.includes("publisher:Book Dash"));
});

it("doesn't crash on missing facet leading quote", () => {
    const {
        otherSearchTerms,
        specialParts,
    } = splitString('frogs publisher: Book Dash"', [
        "something irrelevant",
        "topic:Math",
    ]);
    expect(otherSearchTerms).toEqual('frogs Dash"');
    expect(specialParts.length).toBe(1);
    expect(specialParts.includes("publisher:Book"));
});

it("doesn't crash on mismatched facet quotes", () => {
    const {
        otherSearchTerms,
        specialParts,
    } = splitString('frogs publisher: "Book Dash" "another', [
        "something irrelevant",
        "topic:Math",
    ]);
    expect(otherSearchTerms).toEqual('frogs "another');
    expect(specialParts.length).toBe(1);
    expect(specialParts.includes("publisher:Book Dash"));
});

it("doesn't crash with facet empry string search", () => {
    const {
        otherSearchTerms,
        specialParts,
    } = splitString('frogs publisher: ""', [
        "something irrelevant",
        "topic:Math",
    ]);
    expect(otherSearchTerms).toEqual("frogs");
    expect(specialParts.length).toBe(1);
    expect(specialParts.includes("publisher:"));
});
