// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useState, FunctionComponent } from "react";
import {
    Column as DevExpressColumn,
    TableFilterRow,
} from "@devexpress/dx-react-grid";

import { Checkbox, TableCell, Select, MenuItem } from "@material-ui/core";
import { Book } from "../../model/Book";
import QueryString from "qs";
import titleCase from "title-case";
import { IFilter, InCirculationOptions } from "../../IFilter";
import { CachedTables } from "../../model/CacheProvider";
import { BlorgLink } from "../BlorgLink";

export interface IGridColumn extends DevExpressColumn {
    moderatorOnly?: boolean;
    defaultVisible?: boolean;
    // A column definition specifies this if it needs a custom filter control
    getCustomFilterComponent?: FunctionComponent<TableFilterRow.CellProps>;
    // Given a BloomLibrary filter, modify it to include the value the user has set while using this column's filter control.
    // This happens regardless of whether the column uses a default (text box) filter or a custom filter control.
    addToFilter?: (filter: IFilter, value: string) => void;
    sortingEnabled?: boolean;
    l10nId?: string; // the id to use for localization if it's a common one that we don't want to just fabricate for this context
}

// For some tags, we want to give them their own column. So we don't want to show them in the tags column.
const kTagsToFilterOutOfTagsList = [
    "bookshelf:",
    "topic:",
    "system:Incoming",
    "level:",
    "computedLevel", // added this one only because it gets in the way
];

export function getBookGridColumnsDefinitions(): IGridColumn[] {
    // Note, the order here is also the default order in the table
    const definitions: IGridColumn[] = [
        {
            name: "title",
            title: "Title",
            defaultVisible: true,
            sortingEnabled: true,
            getCellValue: (b: Book) => (
                <BlorgLink
                    href={`/book/${b.id}`}
                    css={css`
                        color: ${b.inCirculation
                            ? "black !important"
                            : "grey !important"};
                        text-decoration: ${!b.inCirculation
                            ? "line-through !important"
                            : ""};
                    `}
                    target="_blank"
                >
                    {b.title}
                </BlorgLink>
            ),
            addToFilter: (filter: IFilter, value: string) => {
                // enhance: at the moment we don't have a "title:" search axis, so this will search other fields as well
                filter.search += ` ${value}`;
            },
        },
        {
            name: "languages",
            title: "Languages",
            defaultVisible: true,
            getCellValue: (b: Book) =>
                b.languages.map((l) => l.name).join(", "),
            addToFilter: (filter: IFilter, value: string) => {
                filter.language = value;
            },
        },
        {
            name: "tags",
            title: "Other Tags",
            getCellValue: (b: Book) =>
                b.tags
                    .filter(
                        (t) =>
                            !kTagsToFilterOutOfTagsList.find((tagToFilterOut) =>
                                t.startsWith(tagToFilterOut)
                            )
                    )
                    .join(", "),
            addToFilter: (filter: IFilter, value: string) => {
                filter.otherTags = value;
            },
            getCustomFilterComponent: (props: TableFilterRow.CellProps) => (
                <ChoicesFilterCell
                    choices={[
                        "", // Clear
                        ...CachedTables.tags.filter(
                            (t) =>
                                !kTagsToFilterOutOfTagsList.find(
                                    (tagToFilterOut) =>
                                        t.startsWith(tagToFilterOut)
                                )
                        ),
                    ]}
                    {...props}
                />
            ),
        },
        {
            name: "bookshelves",
            title: "Bookshelves",
            defaultVisible: true,
            sortingEnabled: true,
            getCellValue: (b: Book) => b.bookshelves.join(","),
            addToFilter: (filter: IFilter, value: string) => {
                filter.bookshelf = value;
            },
        },
        {
            name: "features",
            title: "Features",
            defaultVisible: false,
            getCellValue: (b: Book) => b.features.join(","),
            addToFilter: (filter: IFilter, value: string) => {
                filter.search += ` feature:${value}`;
            },
        },
        {
            name: "country",
            title: "Country",
            defaultVisible: false,
            sortingEnabled: true,
            addToFilter: (filter: IFilter, value: string) => {
                filter.search += ` country:${value}`;
            },
        },
        {
            name: "incoming",
            moderatorOnly: true,
            defaultVisible: true,
            getCellValue: (b: Book) => (
                <TagCheckbox book={b} tag={"system:Incoming"} />
            ),
            getCustomFilterComponent: (props: TableFilterRow.CellProps) => (
                <TagExistsFilterCell {...props} />
            ),
            addToFilter: (filter: IFilter, value: string) =>
                updateFilterForExistenceOfTag("system:Incoming", filter, value),
        },
        {
            name: "level",
            defaultVisible: true,
            getCellValue: (b: Book) => b.level,
            getCustomFilterComponent: (props: TableFilterRow.CellProps) => (
                <ChoicesFilterCell
                    choices={["", "1", "2", "3", "4"]}
                    {...props}
                />
            ),
            // TODO: we need a way to query to for a missing level indicator
            addToFilter: (filter: IFilter, value: string) => {
                filter.search += ` level:${titleCase(value)}`;
            },
        },
        {
            name: "topic",
            defaultVisible: true,
            getCellValue: (b: Book) =>
                b.tags
                    .filter((t) => t.startsWith("topic:"))
                    .map((t) => (
                        <GridSearchLink key={t} search={t}>
                            {t.replace(/topic:/, "")}
                        </GridSearchLink>
                    )),
            addToFilter: (filter: IFilter, value: string) => {
                filter.topic = titleCase(value);
            },
        },
        {
            name: "harvestState",
            sortingEnabled: true,
            addToFilter: (filter: IFilter, value: string) => {
                filter.search += ` harvestState:${value}`;
            },
            getCustomFilterComponent: (props: TableFilterRow.CellProps) => (
                <ChoicesFilterCell
                    choices={[
                        "",
                        "Done",
                        "Failed",
                        "New",
                        "Updated",
                        "Requested",
                    ]}
                    {...props}
                />
            ),
        },
        {
            name: "harvestLog",
            defaultVisible: false,
        },
        {
            name: "harvestStartedAt",
            getCellValue: (b: Book) => b.harvestStartedAt?.iso,
            defaultVisible: false,
        },
        {
            name: "summary",
            defaultVisible: false,
            sortingEnabled: true,
        },
        {
            name: "inCirculation",
            sortingEnabled: false, // parse server doesn't seem to be able to sort on booleans?
            getCellValue: (b: Book) => (b.inCirculation ? "Yes" : "No"),
            getCustomFilterComponent: (props: TableFilterRow.CellProps) => (
                <ChoicesFilterCell choices={["All", "Yes", "No"]} {...props} />
            ),
            addToFilter: (filter: IFilter, value: string) => {
                if (value === "No")
                    filter.inCirculation = InCirculationOptions.No;
                if (value === "Yes")
                    filter.inCirculation = InCirculationOptions.Yes;
                // otherwise don't mention it
            },
        },
        { name: "license", sortingEnabled: true },
        {
            name: "copyright",
            sortingEnabled: true,

            addToFilter: (filter: IFilter, value: string) => {
                filter.search += ` copyright:${value} `;
            },
        },
        { name: "pageCount", sortingEnabled: true },
        { name: "phashOfFirstContentImage", sortingEnabled: true },
        { name: "createdAt", sortingEnabled: true },
        { name: "updatedAt", sortingEnabled: true },
        {
            name: "publisher",
            sortingEnabled: true,
            addToFilter: (filter: IFilter, value: string) => {
                filter.search += ` publisher:${value} `;
            },
        },
        {
            name: "originalPublisher",
            sortingEnabled: true,
            addToFilter: (filter: IFilter, value: string) => {
                filter.search += ` originalPublisher:${value} `;
            },
        },
        {
            name: "uploader",
            sortingEnabled: true,
            defaultVisible: true,
            moderatorOnly: true,
            getCellValue: (b: Book) => (
                <GridSearchLink
                    key={b.id}
                    search={`uploader:${b.uploader?.username}`}
                >
                    {b.uploader?.username}
                </GridSearchLink>
            ),
            addToFilter: (filter: IFilter, value: string) => {
                filter.search += ` uploader:${value} `;
            },
        },
        {
            name: "keywords",
            sortingEnabled: true,
            getCellValue: (b: Book) => b.getKeywordsText(),
            addToFilter: (filter: IFilter, value: string) => {
                filter.keywordsText = value;
            },
        },
        {
            // cannot be used for sorting or filtering until we have only one database source
            name: "reads",
            sortingEnabled: false,
            getCellValue: (b: Book) => b.stats.finishedCount,
            defaultVisible: false,
        },
        {
            // cannot be used for sorting or filtering until we have only one database source
            name: "downloadsForTranslation",
            sortingEnabled: false,
            getCellValue: (b: Book) => b.stats.shellDownloads,
            defaultVisible: false,
        },
    ];

    // generate the capitalized column names since the grid doesn't do that.
    return (
        definitions
            //.sort((a, b) => a.name.localeCompare(b.name))
            .map((c) => {
                const x = { ...c };
                if (c.title === undefined) {
                    x.title = titleCase(c.name);
                }
                return x;
            })
    );
}

export const GridSearchLink: React.FunctionComponent<{
    search: string;
}> = (props) => {
    const location = {
        title: props.search,
        pageType: "grid",
        filter: {
            search: props.search,
        },
    };
    const url = "/grid/?" + QueryString.stringify(location);
    return (
        <BlorgLink
            css={css`
                color: black !important;
            `}
            href={url}
        >
            {props.children}
        </BlorgLink>
    );
};

const TagCheckbox: React.FunctionComponent<{
    book: Book;
    tag: string;
}> = (props) => {
    const [present, setPresent] = useState(props.book.tags.includes(props.tag));
    return (
        <Checkbox
            checked={present}
            onChange={(e) => {
                props.book.setBooleanTagAndSave(props.tag, e.target.checked);
                setPresent(e.target.checked);
            }}
        />
    );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ChoicesFilterCell: React.FunctionComponent<
    TableFilterRow.CellProps & {
        choices: string[];
    }
> = (props) => {
    const [value, setValue] = useState(props.filter?.value || "");
    return (
        <TableCell
            css={css`
                padding-left: 9px !important; // make it line up like the built-in filter cells do
            `}
        >
            {/* <Checkbox
            //value={props.filter ? props.filter.value : ""}
            checked={props.filter ? props.filter.value==="true" : false}
            onChange={e =>
                props.onFilter({
                    columnName: props.column.name,
                    operation: "contains",
                    value: e.target.value ? "true" : "false"
                })
            }
        /> */}
            <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                color="secondary" //<--- doesn't work
                displayEmpty={true}
                renderValue={(v) => {
                    const x = v as string;
                    return <div>{x ? x : "All"}</div>;
                }}
                value={value}
                css={css`
                    font-size: 0.875rem !important;
                    width: 100%;
                `}
                onChange={(e) => {
                    setValue(e.target.value as string);
                    props.onFilter({
                        columnName: props.column.name,
                        operation: "contains",
                        value: e.target.value as string,
                    });
                }}
            >
                {props.choices.map((c) => (
                    <MenuItem key={c} value={c}>
                        {c.length === 0 ? "All" : c}
                    </MenuItem>
                ))}
            </Select>
        </TableCell>
    );
};

// shows a checkbox in the filter row; ticking the box leads to a call to the gridColumn definition `addToFilter()`
const TagExistsFilterCell: React.FunctionComponent<TableFilterRow.CellProps> = (
    props
) => {
    const [checked, setChecked] = useState(
        props.filter?.value === "true" || false
    );
    return (
        <TableCell padding="checkbox">
            <Checkbox
                css={css`
                    padding-left: 0;
                `}
                checked={checked}
                onChange={(e) => {
                    props.onFilter({
                        columnName: props.column.name,
                        operation: "contains",
                        // we're switching to the opposite of what `checked` was
                        value: !checked ? "true" : "false",
                    });
                    setChecked(!checked);
                }}
            />
        </TableCell>
    );
};

function updateFilterForExistenceOfTag(
    tag: string,
    filter: IFilter,
    value: string
) {
    // note, this can't search for *not* incoming, but that seems ok for the actual task for which this is used
    if (value === "true") {
        filter.search = ((filter.search || "") + ` ${tag}`).trim();
    }
}
