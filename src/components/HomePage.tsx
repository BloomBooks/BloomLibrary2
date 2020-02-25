import React from "react";
import { BookGroup } from "./BookGroup";
import { LanguageGroup } from "./LanguageGroup";
import { BookshelfGroup } from "./BookShelfGroup";
import { IFilter } from "../IFilter";
import { HomeBanner } from "./banners/HomeBanner";

export const HomePage: React.FunctionComponent = () => {
    // enhance (probably?) add CC license requirement. But we don't want to lose SB comics.
    const almostAllBooksFilter: IFilter = { inCirculation: true };
    return (
        <>
            <HomeBanner filter={almostAllBooksFilter} />
            <ul className={"pageResults"}>
                <BookGroup
                    title="Featured Shell Books You Can Translate"
                    filter={{ otherTags: "bookshelf:Featured" }}
                />
                <LanguageGroup />
                <BookGroup
                    title="New Arrivals"
                    filter={{}}
                    order={"-createdAt"}
                />
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
                <BookGroup title="Math Books" filter={{ topic: "Math" }} />
            </ul>
        </>
    );
};
