import React from "react";

import { storiesOf } from "@storybook/react";

import { BookCard } from "../components/BookCard";
import { BookGroup } from "../components/BookGroup";
import { IFilter } from "../IFilter";
import { LanguageGroup } from "../components/LanguageGroup";
import { LanguagePage, BookGroupForEachTopic } from "../components/Pages";
import { HomePage } from "../components/HomePage";
import { BookshelfGroup } from "../components/BookShelfGroup";

const sampleUrl =
    "https://s3.amazonaws.com/BloomLibraryBooks/librarian%40bloomlibrary.org%2f32916f6b-02bd-4e0b-9b2b-d971096259b7%2fGrandpa+Fish+and+the+Radio%2f";

storiesOf("BookCard", module).add("simple", () => (
    <BookCard title="Grandpa Fish and the Radio" baseUrl={sampleUrl} />
));
storiesOf("BookGroup", module)
    .add("Featured", () => (
        <BookGroup
            title="Featured Shell Books You Can Translate"
            filter={{ otherTags: "bookshelf:Featured" }}
        />
    ))
    .add("All Topics", () => (
        <BookGroupForEachTopic filter={{ language: "th" }} />
    ))

    .add("Sign Language", () => (
        <BookGroup title="Sign Language" filter={{ feature: "signLanguage" }} />
    ))
    .add("Accessible", () => (
        <BookGroup
            title="Visually Impaired"
            filter={{ feature: "visuallyImpaired" }}
        />
    ))
    .add("All Bookshelves", () => (
        <BookshelfGroup title="All Bookshelves" bookShelfCategory="" />
    ))
    .add("All books by date", () => (
        <BookGroup title="All books by date" filter={{}} order={"-createdAt"} />
    ))
    .add("Math books", () => (
        <BookGroup title="Math Books" filter={{ topic: "Math" }} />
    ))

    .add("Thai books", () => (
        <BookGroup title="Thai books" filter={{ language: "th" }} />
    ));
storiesOf("LanguageGroup", module).add("By book count", () => (
    <LanguageGroup />
));
storiesOf("BookShelfGroup", module)
    .add("Publishers", () => (
        <BookshelfGroup title="Publishers" bookShelfCategory="publisher" />
    ))
    .add("A specific project with multiple workshops: Enabling Writers", () => (
        <BookshelfGroup
            title="Enabling Writers"
            bookShelfCategory="project"
            parentBookshelf="Enabling Writers Workshops"
        />
    ))
    .add("Projects", () => (
        <BookshelfGroup title="Projects" bookShelfCategory="project" />
    ))
    .add("Organizations & Governments", () => (
        <BookshelfGroup
            title="Organizations & Governments"
            bookShelfCategory="org"
        />
    ));
storiesOf("Pages", module)
    .add("Home Page", () => <HomePage />)
    .add("Thai Book Page", () => (
        <LanguagePage title="some title" filter={{ language: "th" }} />
    ));
