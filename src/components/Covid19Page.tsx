import React from "react";
import { PublisherBanner } from "./banners/PublisherBanner";
import { ListOfBookGroups } from "./ListOfBookGroups";
import { BookGroup } from "./BookGroup";

export const Covid19Page: React.FunctionComponent = () => {
    const filter = { topic: "Health" };
    const description = (
        <React.Fragment>
            <p></p>
        </React.Fragment>
    );
    return (
        <div>
            <PublisherBanner
                title="COVID-19 and Other Health Books"
                showTitle={true}
                filter={filter}
                collectionDescription={description}
            />
            <ListOfBookGroups>
                <BookGroup
                    title="COVID-19 books"
                    filter={{ topic: "COVID-19" }}
                />
                <BookGroup title="All Health books" filter={{ ...filter }} />
            </ListOfBookGroups>
        </div>
    );
};
