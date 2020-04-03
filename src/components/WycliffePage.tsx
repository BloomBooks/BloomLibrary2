import React from "react";
import { PublisherBanner } from "./banners/PublisherBanner";
import { BookshelfGroup } from "./BookShelfGroup";
import { ListOfBookGroups } from "./ListOfBookGroups";
import { BookGroup } from "./BookGroup";

export const WycliffePage: React.FunctionComponent = () => {
    const filter = { bookshelf: "Wycliffe" };
    const description = (
        <React.Fragment>
            <p>
                Wycliffe Global Alliance is an alliance of organisations with
                the common objective of translating the Bible for every language
                group that needs
            </p>
            <p>
                Note: Wycliffe organizations are not the original publishers for
                many of the following books. Instead, this page serves as a
                place to gather materials related to the Bible.
            </p>
        </React.Fragment>
    );
    return (
        <div>
            <PublisherBanner
                title="Wycliffe"
                showTitle={false}
                filter={filter}
                logoUrl={`https://share.bloomlibrary.org/bookshelf-images/Wycliffe.png`}
                collectionDescription={description}
            />
            <ListOfBookGroups>
                <BookshelfGroup
                    title="Collections"
                    bookShelfCategory="org"
                    pathToTheCurrentLevel="Wycliffe/"
                />
                <BookGroup
                    title="Level 2"
                    filter={{ otherTags: "level:2", ...filter }}
                />
                <BookGroup title="All books" rows={99} filter={{ ...filter }} />
            </ListOfBookGroups>
        </div>
    );
};
