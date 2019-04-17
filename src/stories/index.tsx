import React from "react";

import { storiesOf } from "@storybook/react";

import { BookCard } from "../components/BookCard";
import { BookGroup } from "../components/BookGroup";
import { IFilter } from "../Router";
import { LanguageGroup } from "../components/LanguageGroup";
import CategoryGroup from "../components/CategoryGroup";
import { LanguagePage } from "../components/Pages";
import { HomePage } from "../components/HomePage";

const sampleUrl =
    "https://s3.amazonaws.com/BloomLibraryBooks/librarian%40bloomlibrary.org%2f32916f6b-02bd-4e0b-9b2b-d971096259b7%2fGrandpa+Fish+and+the+Radio%2f";

storiesOf("BookCard", module).add("simple", () => (
    <BookCard title="Grandpa Fish and the Radio" baseUrl={sampleUrl} />
));
storiesOf("BookGroup", module)
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
    <LanguageGroup title="Languages" />
));
storiesOf("CategoryGroup", module).add("Publishers", () => (
    <CategoryGroup title="Languages" />
));
storiesOf("Pages", module)
    .add("Home Page", () => <HomePage />)
    .add("Thai Book Page", () => <LanguagePage filter={{ language: "th" }} />);
