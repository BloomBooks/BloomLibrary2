import React from "react";
import { PublisherBanner } from "./banners/PublisherBanner";
import { ListOfBookGroups } from "./ListOfBookGroups";
import { BookGroup } from "./BookGroup";

export const Covid19Page: React.FunctionComponent = () => {
    const filter = { bookshelf: "COVID-19" };
    const description = (
        <React.Fragment>
            <p></p>
        </React.Fragment>
    );
    return (
        <div>
            <PublisherBanner
                title="COVID-19"
                showTitle={true}
                filter={filter}
                collectionDescription={description}
            />
            <ListOfBookGroups>
                <BookGroup title="All" filter={filter} rows={99} />
            </ListOfBookGroups>
        </div>
    );
};
