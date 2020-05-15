import React from "react";
import { BookGroup } from "./BookGroup";
import { LanguageGroup } from "./LanguageGroup";
import { BookshelfGroup } from "./BookShelfGroup";
import { IFilter, InCirculationOptions } from "../IFilter";
import { HomeBanner } from "./banners/HomeBanner";
import { ListOfBookGroups } from "./ListOfBookGroups";
import { FeatureGroup } from "./FeatureGroup";
import { SpecialInterestGroup } from "./SpecialInterestsGroup";
import { TopicGroup } from "./TopicGroup";
import { RowOfPageCards, RowOfPageCardsForKey } from "./RowOfPageCards";

export const HomePage: React.FunctionComponent = () => {
    const almostAllBooksFilter: IFilter = {
        inCirculation: InCirculationOptions.Yes,
    };
    return (
        <>
            <HomeBanner filter={almostAllBooksFilter} />
            <ListOfBookGroups>
                {/* <BookGroup
                    title="Featured Shell Books You Can Translate"
                    filter={{ bookshelf: "Featured" }}
                /> */}

                <LanguageGroup />

                <BookGroup
                    title="New Arrivals"
                    filter={{}}
                    order={"-createdAt"}
                />
                <SpecialInterestGroup title="Special Interests" />

                <TopicGroup />
                <BookshelfGroup
                    title="Publishers"
                    bookShelfCategory="publisher"
                />

                <FeatureGroup title="Book Features" />

                <RowOfPageCardsForKey urlKey="projects" />
                {/* <BookshelfGroup title="Projects" bookShelfCategory="project" /> */}

                <BookshelfGroup
                    title="Organizations & Governments"
                    bookShelfCategory="org"
                />
            </ListOfBookGroups>
        </>
    );
};
