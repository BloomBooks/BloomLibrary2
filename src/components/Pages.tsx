// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import React from "react";
import { useGetTopicList } from "../connection/LibraryQueryHooks";
import { IFilter } from "../IFilter";
import {
    BannerContents,
    ProjectBanner,
    SearchBanner,
    LanguageBanner
} from "./Banners";
import { BookGroup } from "./BookGroup";
import { Breadcrumbs } from "./Breadcrumbs";
import { CustomizableBanner } from "./banners/CustomizableBanner";
import { getLanguageBannerSpec } from "./banners/LanguageCustomizations";
import { getProjectBannerSpec } from "./banners/ProjectCustomizations";
import { PublisherBanner } from "./banners/PublisherBanner";

export const SearchResultsPage: React.FunctionComponent<{
    filter: IFilter;
}> = props => (
    <React.Fragment>
        <SearchBanner filter={props.filter} />
        <ul className={"pageResults"}>
            <BookGroup
                title={`Books matching "${props.filter.search!}"`}
                filter={props.filter}
                rows={20}
            />
        </ul>
    </React.Fragment>
);

// I don't know if we'll stick with this... but for now this is what you get
// if there are lots of books and you scroll to the end of the 20 or so that
// we put in a row, and then you click on the MoreCard there to see the rest
export const AllResultsPage: React.FunctionComponent<{
    filter: IFilter;
    title: string;
}> = props => (
    <React.Fragment>
        <div
            css={css`
                background-color: black;
            `}
        >
            <Breadcrumbs />
        </div>
        {/* <SearchBanner filter={props.filter} /> */}
        <ul className={"pageResults"}>
            <BookGroup title={props.title} filter={props.filter} rows={20} />
            {/* TODO: we need a way to say "OK, more rows, and more rows" etc. */}
        </ul>
    </React.Fragment>
);

export const DefaultOrganizationPage: React.FunctionComponent<{
    title: string;
    filter: IFilter;
}> = props => (
    <React.Fragment>
        <PublisherBanner
            title={props.title}
            filter={props.filter}
            collectionDescription={<div />}
            // logoUrl={`https://share.bloomlibrary.org/category-images/African Storybook.png`}
        />

        <ul className={"pageResults"}>
            <BookGroup title={`All books`} filter={props.filter} />
        </ul>
    </React.Fragment>
);

export const LanguagePage: React.FunctionComponent<{
    title: string;
    filter: IFilter;
}> = props => (
    <div>
        <CustomizableBanner
            filter={props.filter}
            title={props.title}
            spec={getLanguageBannerSpec(props.filter.language!)}
        />
        <ul className={"pageResults"}>
            <BookGroup
                title={`Featured ${props.filter.language} books.`}
                filter={{
                    ...props.filter,
                    ...{ otherTags: "bookshelf:Featured" }
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
        </ul>
    </div>
);
export const ProjectPage: React.FunctionComponent<{
    title: string;
    filter: IFilter;
}> = props => {
    console.log("Project Page " + JSON.stringify(props));
    return (
        <React.Fragment>
            <CustomizableBanner
                filter={props.filter}
                title={props.title}
                spec={getProjectBannerSpec(props.filter.bookshelf!)}
            />
            <ul className={"pageResults"}>
                <BookGroup filter={props.filter} title={"All books"} />
                {/* <BookGroupForEachTopic filter={props.filter} /> */}
            </ul>
        </React.Fragment>
    );
};
export const BookGroupForEachTopic: React.FunctionComponent<{
    filter: IFilter;
}> = props => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { response, loading, error, reFetch } = useGetTopicList();
    if (response) {
        console.log(response);
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
                                    ...{ topic }
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
