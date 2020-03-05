// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";
import { Column as DevExpressColumn } from "@devexpress/dx-react-grid";

import { Checkbox, Link } from "@material-ui/core";
import { Book } from "../../model/Book";
import { TagsList } from "../Admin/TagsList";
import { Router } from "../../Router";
import QueryString from "qs";
import titleCase from "title-case";

export interface IGridColumn extends DevExpressColumn {
    moderatorOnly?: boolean;
    defaultVisible?: boolean;
    canFilter?: boolean;
}
export function getBookGridColumns(router: Router): IGridColumn[] {
    const columns = [
        {
            name: "title",
            title: "Title",
            defaultVisible: true,
            getCellValue: (b: Book) => (
                <Link
                    href={`/?bookId=${b.id}&pageType=book-detail&title=${b.title}`}
                    css={css`
                        color: black !important;
                    `}
                    target="_blank"
                >
                    {b.title}
                </Link>
            )
        },
        {
            name: "languages",
            title: "Languages",
            defaultVisible: true,
            getCellValue: (b: Book) => b.languages.map(l => l.name).join(", ")
        },
        {
            name: "tags",
            title: "Other Tags",
            getCellValue: (b: Book) => (
                <TagsList
                    book={b}
                    setModified={() => {}}
                    borderColor={"transparent"}
                ></TagsList>
            )
        },
        {
            name: "bookshelves",
            title: "Bookshelves",
            getCellValue: (b: Book) =>
                b.tags
                    .filter(t => t.startsWith("bookshelf:"))
                    .map(t => t.replace(/bookshelf:/, ""))
                    .join(", ")
        },
        {
            name: "incoming",

            defaultVisible: true,
            getCellValue: (b: Book) => (
                <Checkbox checked={b.tags.includes("system:Incoming")} />
            )
        },
        {
            name: "topic",

            defaultVisible: true,
            canFilter: true,
            getCellValue: (b: Book) =>
                b.tags
                    .filter(t => t.startsWith("topic:"))
                    .map(t => t.replace(/topic:/, ""))
                    .join(", ")
        },
        { name: "harvestState" },
        { name: "license" },
        { name: "copyright" },
        { name: "pageCount" },
        { name: "createdAt" },
        {
            name: "uploader",
            defaultVisible: true,
            moderatorOnly: true,
            getCellValue: (b: Book) => (
                <GridSearchLink search={`uploader:${b.uploader?.username}`}>
                    {b.uploader?.username}
                </GridSearchLink>
            )
        }
    ];

    // generate the capitalized column names since the grid doesn't do that.
    return columns.map(c => {
        const x = { ...c };
        if (c.title === undefined) {
            x.title = titleCase(c.name);
        }
        return x;
    });
}

export const GridSearchLink: React.FunctionComponent<{
    search: string;
}> = props => {
    const location = {
        title: props.search,
        pageType: "grid",
        filter: {
            search: props.search
        }
    };
    const url = "/grid/?" + QueryString.stringify(location);
    return (
        <Link
            css={css`
                color: black !important;
            `}
            href={url}
        >
            {props.children}
        </Link>
    );
};
