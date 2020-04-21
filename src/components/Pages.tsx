// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import React, { useContext } from "react";
import { useGetTopicList } from "../connection/LibraryQueryHooks";
import { IFilter } from "../IFilter";
import { BookGroup } from "./BookGroup";
import { Breadcrumbs } from "./Breadcrumbs";
import { CustomizableBanner } from "./banners/CustomizableBanner";
import { getLanguageBannerSpec } from "./banners/LanguageCustomizations";
import { getProjectBannerSpec } from "./banners/ProjectCustomizations";
import { PublisherBanner } from "./banners/PublisherBanner";
import { SearchBanner } from "./banners/Banners";
import { ListOfBookGroups } from "./ListOfBookGroups";
import { CachedTablesContext } from "../App";
import { getLanguageNamesFromCode } from "../model/Language";

export const SearchResultsPage: React.FunctionComponent<{
    filter: IFilter;
}> = (props) => {
    let title = `Books matching "${props.filter.search!}"`;
    if (props.filter.search!.indexOf("phash") > -1) {
        title = "Matching Books";
    }
    return (
        <React.Fragment>
            <SearchBanner filter={props.filter} />
            <ListOfBookGroups>
                <BookGroup title={title} filter={props.filter} rows={20} />
            </ListOfBookGroups>
        </React.Fragment>
    );
};

// I don't know if we'll stick with this... but for now this is what you get
// if there are lots of books and you scroll to the end of the 20 or so that
// we put in a row, and then you click on the MoreCard there to see the rest
export const AllResultsPage: React.FunctionComponent<{
    filter: IFilter;
    title: string;
}> = (props) => (
    <React.Fragment>
        <div
            css={css`
                background-color: black;
            `}
        >
            <Breadcrumbs />
        </div>
        {/* <SearchBanner filter={props.filter} /> */}
        <ListOfBookGroups>
            <BookGroup title={props.title} filter={props.filter} rows={20} />
            {/* TODO: we need a way to say "OK, more rows, and more rows" etc. */}
        </ListOfBookGroups>
    </React.Fragment>
);

export const DefaultOrganizationPage: React.FunctionComponent<{
    title: string;
    filter: IFilter;
}> = (props) => (
    <React.Fragment>
        <PublisherBanner
            title={props.title}
            showTitle={true}
            filter={props.filter}
            collectionDescription={<div />}
            // logoUrl={`https://share.bloomlibrary.org/bookshelf-images/African Storybook.png`}
        />

        <ListOfBookGroups>
            <BookGroup title={`All books`} filter={props.filter} />
        </ListOfBookGroups>
    </React.Fragment>
);

export const LanguagePage: React.FunctionComponent<{
    title: string;
    filter: IFilter;
}> = (props) => {
    console.assert(
        props.filter.language,
        "LanguagePage must have language set in the filter"
    );

    const { languagesByBookCount: languages } = useContext(CachedTablesContext);
    let languageDisplayName = getLanguageNamesFromCode(
        props.filter.language!,
        languages
    )?.displayNameWithAutonym;
    if (!languageDisplayName) languageDisplayName = props.filter.language;

    return (
        <div>
            <CustomizableBanner
                filter={props.filter}
                title={props.title}
                spec={getLanguageBannerSpec(props.filter.language!)}
            />
            <ListOfBookGroups>
                <BookGroup
                    title={`Featured ${languageDisplayName} books.`}
                    filter={{
                        ...props.filter,
                        ...{ bookshelf: "Featured" },
                    }}
                    key={"featured"}
                />
                <BookGroup
                    title="Most Recent"
                    filter={props.filter}
                    order={"-createdAt"}
                    key={"recent"}
                />
                <BookGroupForEachTopic filter={props.filter} />
                <BookGroup
                    title={`All ${props.filter.language} books.`}
                    filter={props.filter}
                    key={"all filtered"}
                />
            </ListOfBookGroups>
        </div>
    );
};
export const ProjectPageWithDefaultLayout: React.FunctionComponent<{
    title: string;
    filter: IFilter;
}> = (props) => {
    //console.log("Project Page " + JSON.stringify(props));
    return (
        <React.Fragment>
            <CustomizableBanner
                filter={props.filter}
                title={props.title}
                spec={getProjectBannerSpec(props.filter.bookshelf!)}
            />
            <ListOfBookGroups>
                <BookGroup
                    filter={props.filter}
                    title={"All books"}
                    rows={999}
                />
                {/* <BookGroupForEachTopic filter={props.filter} /> */}
            </ListOfBookGroups>
        </React.Fragment>
    );
};
export const CategoryPageWithDefaultLayout: React.FunctionComponent<{
    title: string;
    filter: IFilter;
}> = (props) => {
    return (
        <React.Fragment>
            <PublisherBanner
                filter={props.filter}
                title={props.title}
                showTitle={true}
                collectionDescription={<React.Fragment />}
            />
            <ListOfBookGroups>
                <BookGroup filter={props.filter} title={"All"} rows={20} />
            </ListOfBookGroups>
        </React.Fragment>
    );
};
export const BookGroupForEachTopic: React.FunctionComponent<{
    filter: IFilter;
}> = (props) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { response, loading, error, reFetch } = useGetTopicList();
    if (response) {
        //console.log(response);
        return (
            <div key={props.filter.topic}>
                {response.data["results"].map((tag: any, index: number) => {
                    if (tag.name.split(":")[0] === "topic") {
                        const topic = tag.name.split(":")[1];
                        return (
                            <BookGroup
                                key={index}
                                title={`${topic} books`}
                                filter={{
                                    ...props.filter,
                                    ...{ topic },
                                }}
                            />
                        );
                    } else return null; //<></>;
                })}

                {/* TODO: currently the above will show some books as "NoTopic" books. But the vast majority of books without a topic
             do not have topic:NoTopic. There isn't an obvious way of writing a ParseServer query to get a subset of
             books (e.g. workshop) that also do not have any topics. We could a) do that on client b) custom function on server
             or c) walk the Library and insert "NoTopic" wherever it is missing.
            */}
            </div>
        );
    } else return null;
    // <React.Fragment key={"waiting"}>
    //     "waiting for topics"
    // </React.Fragment>
};
