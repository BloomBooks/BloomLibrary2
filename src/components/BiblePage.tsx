import React from "react";
import { PublisherBanner } from "./banners/PublisherBanner";
import { BookshelfGroup } from "./BookShelfGroup";
import { ListOfBookGroups } from "./ListOfBookGroups";
import CategoryCard from "./CategoryCard";
import { CategoryCardGroup } from "./CategoryCardGroup";
import { ByLanguageGroups } from "./ByLanguageGroups";

export const BiblePage: React.FunctionComponent = () => {
    const filter = { bookshelf: "Bible" };
    const description = (
        <React.Fragment>
            <p></p>
        </React.Fragment>
    );
    const divisions = [
        "Creation and The Patriarchs",
        "Joshua, Judges, Kings, and Exile",
        "Prophets and Poetry",
        "The Messiah Comes",
        "The Early Church",
        "The Time to Come",
    ];
    const divisionCards = divisions.map((d) => (
        <CategoryCard
            title={d}
            img="books.svg"
            href={"/category/" + d}
            filter={{ bookshelf: "Bible/" + d }}
        />
    ));
    const topics = [
        "Bible Study Resources",
        "Books for Beginning Readers",
        "Christian Living",
        "Sunday School Resources",
    ];
    const topicCards = topics.map((d) => (
        <CategoryCard
            title={d}
            img=""
            href={"/category/" + d}
            filter={{ bookshelf: "Bible/" + d }}
        />
    ));

    return (
        <div>
            <PublisherBanner
                title="Bible Books"
                showTitle={true}
                filter={filter}
                collectionDescription={description}
            />
            <ListOfBookGroups>
                <BookshelfGroup
                    title="Published Collections"
                    bookShelfCategory=""
                    pathToTheCurrentLevel="Bible/"
                    excludeTheseChildBookshelves={divisions.concat(topics)}
                />
                <CategoryCardGroup title={"Divisions"}>
                    {divisionCards}
                </CategoryCardGroup>
                <CategoryCardGroup title={"Other Resources"}>
                    {topicCards}
                </CategoryCardGroup>
                {/* <BookGroup title="All" filter={{ ...filter }} rows={99} /> */}
                <ByLanguageGroups
                    filter={{ ...filter }}
                    titlePrefix=""
                    rowsPerLanguage={1}
                ></ByLanguageGroups>
            </ListOfBookGroups>
        </div>
    );
};
