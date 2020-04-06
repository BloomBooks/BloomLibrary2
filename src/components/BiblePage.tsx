import React from "react";
import { PublisherBanner } from "./banners/PublisherBanner";
import { BookshelfGroup } from "./BookShelfGroup";
import { ListOfBookGroups } from "./ListOfBookGroups";
import { BookGroup } from "./BookGroup";

export const BiblePage: React.FunctionComponent = () => {
    const filter = { bookshelf: "Bible" };
    const description = (
        <React.Fragment>
            <p></p>
        </React.Fragment>
    );
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
                    title="Collections"
                    bookShelfCategory=""
                    pathToTheCurrentLevel="Bible/"
                />
                <BookGroup title="All" filter={{ ...filter }} rows={99} />
            </ListOfBookGroups>
        </div>
    );
};
