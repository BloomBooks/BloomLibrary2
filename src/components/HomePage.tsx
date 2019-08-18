import React from "react";
import { BookGroup } from "./BookGroup";
import { css } from "emotion";
import { LanguageGroup } from "./LanguageGroup";
import { BookCount } from "./BookCount";
import { BookshelfGroup } from "./BookShelfGroup";
import { HomeBanner } from "./Banners";
import { IFilter } from "../Router";

export const HomePage: React.FunctionComponent = () => {
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
