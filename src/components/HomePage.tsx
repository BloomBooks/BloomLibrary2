import React from "react";
import { BookGroup } from "./BookGroup";
import { css } from "emotion";
import { LanguageGroup } from "./LanguageGroup";
import { BookCount } from "./BookCount";
import { BookshelfGroup } from "./BookShelfGroup";
const homePage = css`
    background-color: lightgreen;
    height: 100%;
    & h1 {
        color: black;
    }
    padding-left: 20px;
    padding-top: 20px;
`;

export const HomePage: React.FunctionComponent = () => {
    return (
        <>
            <BookCount filter={{}} />
            <ul className={homePage}>
                <BookGroup
                    title="Featured Shell Books You Can Translate"
                    filter={{ otherTags: "bookshelf:Featured" }}
                />
                <LanguageGroup title="Languages" />
                <BookGroup
                    title="New Arrivals"
                    filter={{}}
                    order={"-createdAt"}
                />
                <BookGroup title="Math Books" filter={{ topic: "Math" }} />
                <BookshelfGroup
                    title="Publishers"
                    bookShelfCategory="publisher"
                />
                <BookGroup
                    title="Sign Language Books"
                    filter={{ feature: "signLanguage" }}
                />

                <BookGroup
                    title="Accessible to the Visually Impaired"
                    filter={{ feature: "visuallyImpaired" }}
                />
                <BookshelfGroup
                    title="Enabling Writers"
                    bookShelfCategory="project"
                    parentBookshelf="Enabling Writers Workshops"
                />

                <BookshelfGroup title="Projects" bookShelfCategory="project" />

                <BookshelfGroup
                    title="Organizations & Governments"
                    bookShelfCategory="org"
                />
            </ul>
        </>
    );
};
